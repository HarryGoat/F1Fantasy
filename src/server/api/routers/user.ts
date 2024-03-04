import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { drivers, user, usersToDrivers } from "~/server/db/schema";
import { db } from "~/server/db";
import {
  eq,
} from "drizzle-orm";


async function getUserBudget(userId: string) {
  const thisUserData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  const budget = thisUserData!.budget!;
  return budget;
}



export const userRouter = createTRPCRouter({
    displayUserBudget: protectedProcedure.query(async ({ ctx }) => {
        const userBudget = await getUserBudget(ctx.userId);
        return userBudget;
      }),
    
      displayUserPoints: protectedProcedure.query(async ({ ctx }) => {
        const userDrivers = await db.select({driverId: usersToDrivers.driverId}).from(usersToDrivers).where(eq(usersToDrivers.userId, ctx.userId));
        let userTotalPoints = 0;
        let userRecentPoints = 0;

        for (const driver of userDrivers){
            const currentDriver = await db.query.drivers.findFirst({
              where: eq(drivers.id, driver.driverId),
            });
            const driverTotalPoints = currentDriver!.totalFantasyPoints!;
            const driverRecentPoints = currentDriver!.recentPoints!;
            userTotalPoints += driverTotalPoints;
            userRecentPoints += driverRecentPoints;
          }
        return {userTotalPoints, userRecentPoints};
      }),
});
