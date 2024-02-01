import { createTRPCRouter } from "~/server/api/trpc";
import { seedRouter } from "~/server/api/routers/seed";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    seed: seedRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
