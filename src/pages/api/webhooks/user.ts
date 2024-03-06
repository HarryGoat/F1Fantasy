// Import necessary modules and types for handling the webhook and database operations.
import { Webhook } from 'svix';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { buffer } from 'micro'; // For handling raw request bodies.
import { db } from '~/server/db'; // Database access.
import { user } from '~/server/db/schema'; // User schema from the database.
import { eq } from 'drizzle-orm'; // For constructing database queries.
import z from 'zod'; // For data validation.

// Disable the default body parser for this API route to manually handle the body.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main handler for incoming webhook requests.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests, rejecting others with a 405 Method Not Allowed status.
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  
  // Retrieve the webhook secret from the environment variables.
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET missing from environment configuration');
  }
 
  // Extract necessary headers from the incoming request for verification.
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;
 
  // Return a 400 Bad Request if any of the required Svix headers are missing.
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing required Svix headers' });
  }
  
  // Retrieve and parse the raw request body.
  const body = (await buffer(req)).toString();
 
  // Initialize a Svix webhook instance for signature verification.
  const wh = new Webhook(WEBHOOK_SECRET);
 
  let evt: WebhookEvent; // Placeholder for the verified event data.
 
  // Attempt to verify the incoming webhook signature and parse the event.
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ 'Error': err });
  }
 
  // Extract and validate the event data using Zod.
  const id = z.string().parse(evt.data.id);
  const eventType = evt.type;

  // Process the event based on its type (e.g., user creation or deletion).
  if (eventType === "user.created") {
    try {
      // Insert new user data into the database for 'user.created' events.
      await db.insert(user).values({
        id: id,
        userName: evt.data.username,
        budget: 100, // Default budget.
        driverChange: false, // Default driver change status.
      });
    } catch (error) {
      console.error('Failed to insert user data into database:', error);
    }
  }
  else if (eventType === "user.deleted") {
    try {
      // Delete the user from the database for 'user.deleted' events.
      await db.delete(user).where(eq(user.id, id));
    } catch (error) {
      console.error('Failed to delete user data from database:', error);
    }
  }
  
  // Redirect the client after processing the webhook.
  redirect(res);
}

// Helper function to redirect the client to the root path.
function redirect(res: NextApiResponse): void {
  res.setHeader('Location', '/');
  res.statusCode = 302; // Use 302 status code for temporary redirection.
  res.end();
}
