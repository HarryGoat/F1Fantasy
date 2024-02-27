/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { lt } from "drizzle-orm";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { drivers, driversToRaces, races } from "~/server/db/schema";

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
      "Qualifying 1",
      "Qualifying 2",
      "Qualifying 3",
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

  createDriverResultsData: publicProcedure.mutation(async ({ ctx }) => {
    const todaysdate = new Date();

    const raceDates = await ctx.db
      .select({
        endDate: races.endDate,
      })
      .from(races);

    const raceDatesArray = raceDates.map((races) => races.endDate);

    if (todaysdate.getDate() - 1 in raceDatesArray) {
      console.log("Today is a race day!");
      const pastRaces = await ctx.db
        .select({
          id: races.id,
        })
        .from(races)
        .where(lt(races.endDate, todaysdate));

      const pastRaceIds = pastRaces.map((races) => races.id);

      for (const raceId of pastRaceIds) {
        console.log("Seeding DB");
        const url = `https://f1-live-motorsport-data.p.rapidapi.com/race/${raceId}`;
        const options = {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": env.Rapid_API_Key,
            "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
          },
        };

        const response = await fetch(url, options);
        const result = await response.json(); // Parse the JSON response
        const driverResultsData = result.results.drivers; // Assuming the drivers data is inside the "drivers" property

        for (const driver of driverResultsData) {
          // Extract relevant properties from the API response
          const driverId = driver.id;
          const position = driver.position;
          const stops = driver.stops;
          const retired = driver.retired;
          const gap = parseFloat(driver.gap);
          
          const fastestLap: string = driver.time;
          const lapTimeParts: string[] = fastestLap.split(":");
          const minutes: number = parseInt(lapTimeParts[0]!);
          const seconds: number = parseFloat(lapTimeParts[1]!);
          const milliseconds: number = parseFloat(lapTimeParts[2]!);
          const fastestLapSeconds: number = minutes * 60 + seconds + milliseconds / 1000;

          // Insert data into  database
          await ctx.db.insert(driversToRaces).values({
            driverId: driverId,
            raceId: raceId,
            position: position,
            stops: stops,
            retired: retired,
            fastestLap: fastestLapSeconds,
            gap: gap,
          });
        }
      }

      console.log("Seeding Database Complete");
    } else {
      console.log("Today is not a race day.");
    }
  }),
});
