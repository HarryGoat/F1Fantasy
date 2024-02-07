import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const SVGIcon = ({ path }: { path: string }) => (
  <svg
    className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
  >
    <path
      d={path}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const NavigationLink = ({ href, icon, text }: { href: string; icon: JSX.Element; text: string }) => (
  <Link
    href={href}
    className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
  >
    {icon}
    <span className="sr-only">{text}</span>
  </Link>
);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
        <main>
          <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
            <div className="mx-auto grid h-full max-w-lg grid-cols-6">
              <SignInOrOutButton />
              <NavigationLink
                href="/races"
                text="Home"
                icon={<SVGIcon path="M9 1v16M1 9h16" />}
              />
              <NavigationLink
                href="/statistics"
                text="Bookmark"
                icon={<SVGIcon path="M9 1v16M1 9h16" />}
              />
              <NavigationLink
                href="/"
                text="New post"
                icon={<SVGIcon path="M9 1v16M1 9h16" />}
              />
              <NavigationLink
                href="/leagues"
                text="Search"
                icon={<SVGIcon path="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />}
              />
              <NavigationLink
                href="/settings"
                text="Settings"
                icon={<SVGIcon path="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2" />}
              />
            </div>
          </div>
        </main>
      </ClerkProvider>
    </>
  );
};

const SignInOrOutButton = () => {
  const { isSignedIn } = useUser();
  return (
    <div className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50 col-span-1">
      {isSignedIn ? (
        <SignOutButton >
          <div>
          <SVGIcon path="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </div>
        </SignOutButton>
      ) : (
        <SignInButton>
          <div>
          <SVGIcon path="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2" />
          </div>
        </SignInButton>
      )}
    </div>
  );
};


export default api.withTRPC(MyApp);
