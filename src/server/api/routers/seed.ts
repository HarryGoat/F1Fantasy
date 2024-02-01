import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { constructors, drivers } from "~/server/db/schema";

require("dotenv").config();
// const Rapid_API_Key = process.env.Rapid_API_Key;

export const seedRouter = createTRPCRouter({
  create: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Seeding DB")
    const url = 'https://f1-live-motorsport-data.p.rapidapi.com/drivers/standings/2023';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': env.Rapid_API_Key,
            'X-RapidAPI-Host': 'f1-live-motorsport-data.p.rapidapi.com'
        }
    };
    const response = await fetch(url, options);
      const result = await response.json(); // Parse the JSON response
      const driversData = result.results; // Assuming the data is inside the "results" property

      for (let i = 0; i < driversData.length; i++) {
          const driver = driversData[i];

          // Extract relevant properties from the API response
          const driverName = driver.driver_name;
          const nationality = driver.nationality;
          const isReserve = driver.is_reserve;
          const team = driver.team_name;
          const position = parseInt(driver.position);
          const points = parseInt(driver.points);

          // Insert data into your database
          await ctx.db.insert(drivers).values({
            driverName: driverName,
            nationality: nationality,
            isReserve: isReserve,
            team: team,
            position: position,
            price: 0,
            points: points,
          });
    }
    console.log("Seeding Database Complete")
  }),
});
