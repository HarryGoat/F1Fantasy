import { authMiddleware } from "@clerk/nextjs";

// Apply Clerk authMiddleware to specify public routes.
export default authMiddleware({
  // Routes that don't require authentication.
  publicRoutes: ["/api/webhooks(.*)", "/", "/leagues", "/statistics"],
});

// Configure route matching for middleware application.
export const config = {
  // Apply middleware to all routes except for static files and _next routes.
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
