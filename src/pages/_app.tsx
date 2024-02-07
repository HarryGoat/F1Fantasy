import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
        <main>
        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
            <div className="mx-auto grid h-full max-w-lg grid-cols-6">
             {/* Sign In Button */}
             <SignInOrOutButton />
              <Link
                href="/races"
                className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
              >
                <svg
                  className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                  fill="currentColor"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                <span className="sr-only">Home</span>
              </Link>

              <Link
                href="/statistics"
                className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
              >
                <svg
                  className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                  fill="currentColor"
                >
                  <path d="M13 20a1 1 0 0 1-.64-.231L7 15.3l-5.36 4.469A1 1 0 0 1 0 19V2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17a1 1 0 0 1-1 1Z" />
                </svg>
                <span className="sr-only">Bookmark</span>
              </Link>

              <Link
                href="/"
                className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
              >
                <svg
                  className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 1v16M1 9h16"
                  />
                </svg>
                <span className="sr-only">New post</span>
              </Link>

              <Link
                href="/leagues"
                className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
              >
                <svg
                  className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </Link>

              <Link
                href="/settings"
                className="dark:hover-bg-gray-800 group inline-flex flex-col items-center justify-center p-4 hover:bg-gray-50"
              >
                <svg className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
                </svg>
                <span className="sr-only">settings</span>
              </Link>
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
        <SignOutButton>
          <svg
            className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
            fill="currentColor"
          >
            <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
          </svg>
        </SignOutButton>
      ) : (
        <SignInButton>
          <svg
            className="mb-1 h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
            fill="currentColor"
          >
            <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
          </svg>
        </SignInButton>
      )}
    </div>
  );
};

export default api.withTRPC(MyApp);
