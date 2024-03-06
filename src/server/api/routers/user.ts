// Import required TRPC and database utilities.
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { drivers, user, usersToDrivers } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";

// Retrieves the budget for a specific user by ID.
async function getUserBudget(userId: string) {
  const userData = await db.query.user.findFirst({ where: eq(user.id, userId) });
  return userData!.budget!;
}

// Defines a router for user-related data fetching procedures.
export const userRouter = createTRPCRouter({
  // Procedure to fetch and return the current user's budget.
  displayUserBudget: protectedProcedure.query(async ({ ctx }) => {
    return await getUserBudget(ctx.userId);
  }),

  // Procedure to calculate and return the total and recent fantasy points of the user's drivers.
  displayUserPoints: protectedProcedure.query(async ({ ctx }) => {
    const userDrivers = await db.select({ driverId: usersToDrivers.driverId })
      .from(usersToDrivers).where(eq(usersToDrivers.userId, ctx.userId));

    let userTotalPoints = 0;
    let userRecentPoints = 0;

    // Loop through each driver to accumulate their total and recent fantasy points.
    for (const driver of userDrivers) {
      const currentDriver = await db.query.drivers.findFirst({
        where: eq(drivers.id, driver.driverId),
      });
      userTotalPoints += currentDriver!.totalFantasyPoints!;
      userRecentPoints += currentDriver!.recentPoints!;
    }
    return { userTotalPoints, userRecentPoints };
  }),
});
