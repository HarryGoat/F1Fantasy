import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { drivers, user, usersToDrivers } from "~/server/db/schema";
import { db } from "~/server/db";
import { type InferSelectModel, asc, eq, lt, and, notInArray } from "drizzle-orm";

// Retrieves the current budget for a specified user.
async function getUserBudget(userId: string) {
  const userData = await db.query.user.findFirst({ where: eq(user.id, userId) });
  return userData!.budget!;
}

// Fetches the price of the driver currently selected by the user in a given order.
async function getCurrentDriverPrice(order: number, userId: string) {
  const currentDriverId = (await checkUserHasCurrentDriver(order, userId))!.driverId;
  return currentDriverId
    ? (await db.query.drivers.findFirst({ where: eq(drivers.id, currentDriverId) }))!.price!
    : 0;
}

// Determines whether a user has selected a driver for a specific order.
async function checkUserHasCurrentDriver(order: number, userId: string) {
  return await db.query.usersToDrivers.findFirst({
    where: and(eq(usersToDrivers.userId, userId), eq(usersToDrivers.order, order)),
  });
}

// Lists all driver IDs already selected by the user.
async function getAllDrivers(userId: string) {
  const drivers = await db
    .select({ driverId: usersToDrivers.driverId })
    .from(usersToDrivers)
    .where(eq(usersToDrivers.userId, userId));
  return drivers.map((driver) => driver.driverId);
}

export const driverRouter = createTRPCRouter({
  // Retrieves drivers selected by the user, formatted for UI display.
  getMyDrivers: protectedProcedure.query(async ({ ctx }) => {
    const userDrivers = (
      await ctx.db.query.usersToDrivers.findMany({
        where: eq(usersToDrivers.userId, ctx.userId),
        orderBy: [asc(usersToDrivers.order)],
        with: { driver: true },
      })
    ).reduce((acc, userToDriver) => {
      acc[userToDriver.order] = userToDriver.driver;
      return acc;
    }, {} as Record<number, InferSelectModel<typeof drivers> | undefined>);

    return Array.from({ length: 5 }, (_, i) => ({ order: i, driver: userDrivers[i] }));
  }),

  // Lists drivers affordable and not already selected by the user, factoring in budget adjustments for driver changes.
  getDrivers: protectedProcedure
    .input(z.object({ order: z.number() }))
    .query(async ({ input, ctx }) => {
      const userBudget = await getUserBudget(ctx.userId);
      const currentDriverPrice = await getCurrentDriverPrice(input.order, ctx.userId);
      const adjustedBudget = userBudget + currentDriverPrice;

      const allDrivers = await getAllDrivers(ctx.userId);
      return await ctx.db.query.drivers.findMany({
        where: and(
          lt(drivers.price, adjustedBudget),
          notInArray(drivers.id, allDrivers.length > 0 ? allDrivers : [0]) // Use [0] as a fallback to ensure query runs.
        ),
      });
    }),

  // Allows users to add a driver to their selection, updating their budget and replacing any existing driver if needed.
  addDrivers: protectedProcedure
    .input(z.object({ driverId: z.number(), order: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const driverPrice = (await ctx.db.query.drivers.findFirst({ where: eq(drivers.id, input.driverId) }))!.price!;
      const userBudget = await getUserBudget(ctx.userId);
      const currentDriverPrice = await getCurrentDriverPrice(input.order, ctx.userId);

      // If user is replacing a driver, adjust budget accordingly, else just deduct the new driver's price.
      const updatedBudget = currentDriverPrice > 0
        ? userBudget + currentDriverPrice - driverPrice
        : userBudget - driverPrice;

      if (currentDriverPrice > 0) {
        await ctx.db.update(usersToDrivers).set({ driverId: input.driverId })
          .where(and(eq(usersToDrivers.userId, ctx.userId), eq(usersToDrivers.order, input.order)));
      } else {
        await ctx.db.insert(usersToDrivers).values({ userId: ctx.userId, driverId: input.driverId, order: input.order });
      }
      
      await ctx.db.update(user).set({ budget: updatedBudget }).where(eq(user.id, ctx.userId));
    }),
});
