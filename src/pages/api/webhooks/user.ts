import { Webhook } from 'svix';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { buffer } from 'micro';
import { db } from '~/server/db';
import { user } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import z from "zod";
 
export const config = {
  api: {
    bodyParser: false,
  }
}
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
 
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }
 
  // Get the headers
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;
 
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occured -- no svix headers' })
  }
 
  console.log('headers', req.headers, svix_id, svix_signature, svix_timestamp)
  
  // Get the body
  const body = (await buffer(req)).toString()
 
  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);
 
  let evt: WebhookEvent
 
  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ 'Error': err })
  }
 
  // Get the ID and type
  const id = z.string().parse(evt.data.id);
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  if (eventType === "user.created"){
    try {
      await db.insert(user).values({
        id: id,
        userName: evt.data.username,
        budget: 100,
        driverChange: false,
      });
    } catch (error) {
      console.error('Error inserting user data into Drizzle database:', error);
    }
  }
  else if (eventType === "user.deleted"){
    try {
      await db.delete(user).where(eq(user.id, id));
    } catch (error) {
      console.error('Error deleting user data from Drizzle database:', error);
    }
  }
  redirect(res);
  res.status(200).end();
}


function redirect(res: NextApiResponse): void {
  res.setHeader('Location', '/');
  res.statusCode = 302;
  res.end();
}
