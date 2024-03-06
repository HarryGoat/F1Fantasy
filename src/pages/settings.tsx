// Import the UserProfile component from Clerk for user profile management.
import { UserProfile } from "@clerk/nextjs";
 
// UserProfilePage renders the user's profile settings using Clerk's UserProfile component.
// `path` sets the base URL path for profile pages. `routing` enables hash-based SPA routing.
const UserProfilePage = () => (
  <UserProfile path="/settings" routing="hash" />
);
 
// Export UserProfilePage for use in the application.
export default UserProfilePage;
