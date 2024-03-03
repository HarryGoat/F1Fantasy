/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import cron from "node-cron";
import { db } from "~/server/db";
import { driversToRaces, races, drivers } from "~/server/db/schema";
import { eq, lt } from "drizzle-orm";
import { env } from "~/env";

export function startAutomatedUpdate() {
  cron.schedule("0 0 * * *", async function () {
    const todaysdate = new Date();

    const raceDates = await db
      .select({
        endDate: races.endDate,
      })
      .from(races);

    const raceDatesArray = raceDates.map((races) => races.endDate);

    if (todaysdate.getDate() - 1 in raceDatesArray) {
      console.log("Today is a race day!");
      const pastRaces = await db
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
          const fastestLapSeconds: number =
            minutes * 60 + seconds + milliseconds / 1000;

          // Insert data into  database
          await db.insert(driversToRaces).values({
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

      const url ="https://f1-live-motorsport-data.p.rapidapi.com/drivers/standings/2023";
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
        const points = driver.points;

        const currentDriver = await db.query.drivers.findFirst({
            where: eq(drivers.id, driverId),
          });
        
        const previousPoints = currentDriver!.totalPoints;
        const recentPoints = points - previousPoints!;

        await db.update(drivers)
        .set({
          totalPoints: points,
            recentPoints: recentPoints,
        })
        .where(
            eq(drivers.id, driverId),
        );
      }

      console.log("Seeding Database Complete");
    } else {
      console.log("Today is not a race day.");
    }
  });
}
