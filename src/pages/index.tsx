import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { api } from "~/utils/api";

export default function Home() {
  const user = useUser();
  console.log("Before executing useMutation"); // Add this line
  console.log("After executing useMutation"); // Add this line

  
  return (
    <>
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>

          {!user.isSignedIn && <SignInButton afterSignInUrl="test"/>}
          {!!user.isSignedIn && <SignOutButton />}
        </div>
      </main>
    </>
  );
}
