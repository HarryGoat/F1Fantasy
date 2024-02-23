import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { constructors, drivers, user, usersToDrivers } from "~/server/db/schema";
import { db } from "~/server/db";
import { type InferSelectModel, asc, eq, lt, and, notInArray } from "drizzle-orm";

//adjust budget by getting driver details and finding price. if the user already has a driver, than only subtract/add the difference
//add the driver to the userDriver database
async function getUserBudget(userId: string) {
  const thisUserData = await db.query.user.findFirst({
    where: eq(user.id, userId)
  });    
  const budget = thisUserData!.budget!;
  return budget;
}

async function getCurrentDriverPrice(order: number, userId: string) {
  const currentDriverId = (await checkUserHasCurrentDriver(order, userId))!.driverId;

  const currentDriverPrice = currentDriverId ? (await db.query.drivers.findFirst({
    where: eq(drivers.id, currentDriverId)
  }))!.price! : undefined;

  return currentDriverPrice;
}

async function checkUserHasCurrentDriver(order: number, userId: string) {
  const userHasDriver = (await db.query.usersToDrivers.findFirst({
    where: and(
      eq(usersToDrivers.userId, userId),
      eq(usersToDrivers.order, order)
    )
  }));
  return userHasDriver;
}


async function getAllDrivers(userId: string) {
  const userHasDriver = await db.select({
    driverId: usersToDrivers.driverId
  }).from(usersToDrivers).where(
      eq(usersToDrivers.userId, userId));  

  return userHasDriver.map((driver) => driver.driverId);
}



export const driverRouter = createTRPCRouter({

  getMyDrivers: protectedProcedure.query(async ({ ctx }) => {
    const userDrivers = (await ctx.db.query.usersToDrivers.findMany({
      where: eq(usersToDrivers.userId, ctx.userId),
      orderBy: [asc(usersToDrivers.order)],
      with: {driver: true}
    })).reduce((acc, userToDriver) => {
      acc[userToDriver.order] = userToDriver.driver;
      return acc;
    }, {} as Record<number, InferSelectModel<typeof drivers> | undefined>);

    const res: {order: number, driver?: InferSelectModel<typeof drivers>}[] = [];

    for(let i = 0; i < 5; i++){
      res.push({order: i, driver: userDrivers[i]});
    }

    return res;
}),
  //change this so that the user it compares the drivers price with the users budget plus the driver they are replacing if the user already has a driver in this slot
  getDrivers: protectedProcedure.input(z.object({ order: z.number() })).query(async ({ input, ctx }) => {
    const userBudget = await getUserBudget(ctx.userId);
    const userHasDriver = await checkUserHasCurrentDriver(input.order, ctx.userId);
    const allDrivers = await getAllDrivers(ctx.userId);

    // If the user already has a driver in this slot, include it in budget calculation
    const currentDriverPrice = userHasDriver ? (await getCurrentDriverPrice(input.order, ctx.userId))! : 0;
    const adjustedBudget = userBudget + currentDriverPrice;

    // Find affordable drivers not already owned by the user
//check if alldrivers is empty
    if (allDrivers.length > 0){
      const affordableDrivers = await ctx.db.query.drivers.findMany({
        where: and(
          lt(drivers.price, adjustedBudget),
          notInArray(drivers.id, allDrivers)
        ),
      });
      return affordableDrivers
    }
    const affordableDrivers = await ctx.db.query.drivers.findMany({
      where: 
        lt(drivers.price, adjustedBudget,
      ),
    });
    

    return affordableDrivers;
}),



    getConstructors: protectedProcedure.query(async ({ ctx }) => {
      const userBudget = await getUserBudget(ctx.userId);
      const affordableConstructors = await ctx.db.query.constructors.findMany({
          where: lt(constructors.price, userBudget)
        });


      return affordableConstructors;
  }),

  addDrivers: protectedProcedure
    .input(z.object({ driverId: z.number(), order: z.number() }))
    .mutation(async({ input, ctx }) => {

      const driverPrice = (await db.query.drivers.findFirst({
        where: eq(drivers.id, input.driverId),
      }))!.price!;

      const userBudget = await getUserBudget(ctx.userId);

          if (await checkUserHasCurrentDriver(input.order, ctx.userId)) {
            // If the user has a driver in this slot, calculate the adjusted budget
            const currentDriverPrice = (await getCurrentDriverPrice(input.order, ctx.userId))!;
            await ctx.db.update(usersToDrivers).set(
              {
                driverId: input.driverId,
              }
            ).where(
              and(
                eq(usersToDrivers.userId, ctx.userId),  
                eq(usersToDrivers.order, input.order)
              )
            );

            const updatedBudget = userBudget + currentDriverPrice - driverPrice;
            await db.update(user).set({ budget: updatedBudget }).where(eq(user.id, ctx.userId));
          }
          else {
            await ctx.db.insert(usersToDrivers).values(
              {
                userId: ctx.userId,
                driverId: input.driverId,
                order: input.order,
              }
            );
            const updatedBudget = userBudget - driverPrice;
            await db.update(user).set({ budget: updatedBudget }).where(eq(user.id, ctx.userId));
          }
      }),
});

