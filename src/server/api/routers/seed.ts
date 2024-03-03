/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { drivers, races } from "~/server/db/schema";

export const seedRouter = createTRPCRouter({
  createDrivers: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Seeding DB");
    const url =
      "https://f1-live-motorsport-data.p.rapidapi.com/drivers/standings/2023";
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": env.Rapid_API_Key,
        "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
      },
    };
    const response = await fetch(url, options);
    const result = await response.json(); // Parse the JSON response
    const driversData = result.results; // Assuming the data is inside the "results" property

    for (const driver of driversData) {
      // Extract relevant properties from the API response
      const driverId = driver.id;
      const driverName = driver.driver_name;
      const nationality = driver.nationality;
      const team = driver.team_name;
      const position = driver.position;
      const points = driver.points;

      // Insert data into your database
      await ctx.db.insert(drivers).values({
        id: driverId,
        driverName: driverName,
        nationality: nationality,
        team: team,
        position: position,
        price: 0,
        totalPoints: points,
      });
    }
    console.log("Seeding Database Complete");
  }),

  createRaceData: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Seeding DB");
    const url = "https://f1-live-motorsport-data.p.rapidapi.com/races/2023";
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": env.Rapid_API_Key,
        "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
      },
    };
    const response = await fetch(url, options);
    const result = await response.json(); // Parse the JSON response
    const raceData = result.results; // Assuming the data is inside the "results" property
    const raceSessions = [
      "Grid",
      "Races",
    ];

    //seed only the qualifying and race data

    for (const race of raceData) {
      const name = race.name;
      const track = race.track;
      const country = race.country;
      const endDate = race.end_date;

      const sessions = race.sessions;
      for (const session of sessions) {
        if (raceSessions.includes(session.session_name)) {
          const sessionId = session.id;
          const sessionType = session.session_name;

          // Insert data into your database
          await ctx.db.insert(races).values({
            id: sessionId,
            name: name,
            track: track,
            country: country,
            endDate: endDate,
            raceType: sessionType,
          });
        }
      }
    }
    console.log("Seeding Database Complete");
  }),
  
});

