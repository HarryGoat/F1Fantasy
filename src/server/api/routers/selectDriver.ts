import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { drivers, user } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq, lt } from "drizzle-orm";

const DriverInputSchema = z.object({
  id: z.number(),
  driverName: z.string(),
  nationality: z.string(),
  team: z.string(),
  isReserve: z.number(),
  position: z.number(),
  price: z.number(),
  points: z.number(),
});

async function getUserBudget(userId: string) {
  const thisUserData = await db.query.user.findFirst({
    where: eq(user.id, userId)
  });    
  const budget = thisUserData!.budget!;
  return budget;
}

export const driverRouter = createTRPCRouter({
  
    getDrivers: protectedProcedure.query(async ({ ctx }) => {
        const userBudget = await getUserBudget(ctx.userId);
        const affordableDrivers = await ctx.db.query.drivers.findMany({
            where: lt(drivers.price, userBudget)
          })

        const lol = await ctx.db.query.user.findFirst({
          where: (user, {eq}) => eq(user.id, ctx.userId),
          with: {
            usersToDrivers: {
              with: {driver: true}
            }
          }
        })
        
        const firstDriver = lol?.usersToDrivers[0]?.driver


        return affordableDrivers;
    }),

    // addDrivers: protectedProcedure
    //   .input( 
    //     z.object({  
    //       driver: DriverInputSchema,
    //     }), 
    //     )
    //     .mutation(async ({ ctx, input }) => {
    //       await ctx.db.insert(userDrivers).values({
    //         driverName: input.driver.driverName,
    //         userName: user?.username,
    //   });
    // }),
});
