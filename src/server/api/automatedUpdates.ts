/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

//aws, configure eventbridge, include anoy missing files
//implement caching

//create scoring system, calculate fantasy points for each driver, and update the database

//calculate user fantasy points after a race weekend
//create statistics page
//implement caching
import { db } from "~/server/db";
import { driversToRaces, races, drivers } from "~/server/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { env } from "~/env";
void (async() => {
const todaysdate = new Date();
todaysdate.setHours(0, 0, 0, 0);
const todayString = `${todaysdate.getFullYear()}-${String(todaysdate.getMonth() + 1).padStart(2, "0")}-${String(todaysdate.getDate()).padStart(2, "0")}`;

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);
const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

const raceDates = await db
  .select({
    endDate: races.endDate,
  })
  .from(races);
const raceDatesArray = raceDates.map((races) => races.endDate);

if (raceDatesArray.includes(yesterdayString)) {
  console.log("Today is a race day!");
  const pastRaces = await db
    .select({
      id: races.id,
    })
    .from(races)
    .where(lt(races.endDate, todayString));

  const pastRaceIds = pastRaces.map((races) => races.id);

  for (const raceId of pastRaceIds) {
    console.log("Seeding DB");

    await db
      .update(races)
      .set({ completed: "true" })
      .where(eq(races.id, raceId));

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
      const retired = driver.retired;

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
        retired: retired,
        fastestLap: fastestLapSeconds,
      });
    }
  }

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
    const points = driver.points;

    const currentDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    const previousPoints = currentDriver!.totalPoints;
    const recentPoints = points - previousPoints!;

    await db
      .update(drivers)
      .set({
        totalPoints: points,
        recentPoints: recentPoints,
      })
      .where(eq(drivers.id, driverId));
  }

  const sessionNames = ["Grid", "Race"];

  async function returnSessionData(sessionType: string, driverId: number) {
    const driverSessions = await db
      .select()
      .from(driversToRaces)
      .innerJoin(races, eq(driversToRaces.raceId, races.id))
      .where(
        and(
          eq(races.endDate, yesterdayString),
          eq(races.raceType, sessionType),
          eq(drivers.id, driverId),
        ),
      )
      .then((result) => {
        return result;
      });
    return driverSessions;
  }
  
  const allDrivers = await db.select().from(drivers);

  for (const driver of allDrivers){
    let points = 0;
    const previousFantasyPoints = driver.totalFantasyPoints!;
    for (const session of sessionNames){
      let counter = 0;
      const sessionResult = await returnSessionData(session, driver.id);
      const position = sessionResult[counter]!.driversToRaces.position!;
      if (session === "Grid"){
        counter += 1;
        points = (21 - position) * 2;
      }
      else if (session ==="Race"){
        const qualifyingPosition = sessionResult[0]!.driversToRaces.position!;
        const overtakes = qualifyingPosition - position;
        points += ((21 - position) * 4) + (overtakes * (1 + (overtakes / 20)));
      }
    }
    points = Math.round(points / 5);
    const updatedFantasyPoints = previousFantasyPoints + points;
    await db.update(drivers).set({
      totalFantasyPoints: updatedFantasyPoints,
      recentFantasyPoints: points,
    }).where(eq(drivers.id, driver.id));
  }

} else {
  console.log("Today is not a race day.");
}
})();