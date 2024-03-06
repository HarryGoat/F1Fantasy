/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Import environment variables and tRPC router creation utilities.
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// Import schema definitions for 'drivers' and 'races'.
import { drivers, races } from "~/server/db/schema";

export const seedRouter = createTRPCRouter({
  // Procedure to seed drivers data from an external API into the database.
  createDrivers: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Seeding DB with drivers data");
    const url = "https://f1-live-motorsport-data.p.rapidapi.com/drivers/standings/2023";
    // Configure request headers with API key and host for the F1 data provider.
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": env.Rapid_API_Key,
        "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
      },
    };
    // Fetch drivers data from the API.
    const response = await fetch(url, options);
    const result = await response.json();
    const driversData = result.results;

    // Loop through each driver and insert their data into the database.
    for (const driver of driversData) {
      await ctx.db.insert(drivers).values({
        id: driver.id,
        driverName: driver.driver_name,
        nationality: driver.nationality,
        team: driver.team_name,
        position: driver.position,
        price: 0, // Default price set to 0, adjust as needed.
        totalPoints: driver.points,
      });
    }
    console.log("Seeding drivers data complete");
  }),

  // Procedure to seed race data from an external API into the database.
  createRaceData: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Seeding DB with race data");
    const url = "https://f1-live-motorsport-data.p.rapidapi.com/races/2023";
    // Configure request headers with API key and host for the F1 data provider.
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": env.Rapid_API_Key,
        "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
      },
    };
    // Fetch races data from the API.
    const response = await fetch(url, options);
    const result = await response.json();
    const raceData = result.results;

    // Loop through each race and insert relevant data into the database.
    for (const race of raceData) {
      const sessions = race.sessions;
      for (const session of sessions) {
        // Seed only qualifying and race session data.
        if (["Grid", "Races"].includes(session.session_name)) {
          await ctx.db.insert(races).values({
            id: session.id,
            name: race.name,
            track: race.track,
            country: race.country,
            endDate: race.end_date,
            raceType: session.session_name,
          });
        }
      }
    }
    console.log("Seeding race data complete");
  }),
});
