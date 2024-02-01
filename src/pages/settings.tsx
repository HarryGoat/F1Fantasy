import { UserProfile } from "@clerk/nextjs";
 
const UserProfilePage = () => (
  <UserProfile path="/settings" routing="hash" />
);
 
export default UserProfilePage;