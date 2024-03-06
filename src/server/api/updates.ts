/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { db } from "~/server/db";
import { driversToRaces, races, drivers } from "~/server/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { env } from "~/env";

async function getYesterdayDate(): Promise<string> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return formatDate(yesterday);
}

async function getTodayDate(): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return formatDate(today);
}

// Function to format a date object into a string in the format "YYYY-MM-DD"
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Function to check if a given date is a race day
async function isRaceDay(date: string): Promise<boolean> {
  const raceDates = await db.select({ endDate: races.endDate }).from(races);
  const raceDatesArray = raceDates.map((races) => races.endDate);
  return raceDatesArray.includes(date);
}

// Function to get the IDs of past races before a given date
async function getPastRaces(date: string): Promise<number[]> {
  const pastRaces = await db.select({ id: races.id }).from(races).where(lt(races.endDate, date));
  return pastRaces.map((races) => races.id);
}

// Function to process a race by marking it as completed and inserting driver results
async function processRace(raceId: number): Promise<void> {
  await db.update(races).set({ completed: "true" }).where(eq(races.id, raceId));

  const url = `https://f1-live-motorsport-data.p.rapidapi.com/race/${raceId}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": env.Rapid_API_Key,
      "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();
  const driverResultsData = result.results.drivers;

  for (const driver of driverResultsData) {
    const driverId = driver.id;
    const position = driver.position;
    const retired = driver.retired;
    await db.insert(driversToRaces).values({
      driverId: driverId,
      raceId: raceId,
      position: position,
      retired: retired,
    });
  }
}

// Function to update driver standings based on the latest data from the API
async function updateDriverStandings(): Promise<void> {
  const url = "https://f1-live-motorsport-data.p.rapidapi.com/drivers/standings/2023";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": env.Rapid_API_Key,
      "X-RapidAPI-Host": "f1-live-motorsport-data.p.rapidapi.com",
    },
  };
  const response = await fetch(url, options);
  const result = await response.json();
  const driversData = result.results;

  for (const driver of driversData) {
    const driverId = driver.id;
    const points = driver.points;

    const currentDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    const previousPoints = currentDriver!.totalPoints;
    const recentPoints = points - previousPoints!;

    await db.update(drivers).set({
      totalPoints: points,
      recentPoints: recentPoints,
    }).where(eq(drivers.id, driverId));
  }
}

// Function to retrieve session data for a specific driver, session type, and date
async function getSessionData(sessionType: string, driverId: number, date: string): Promise<any> {
  return await db.select().from(driversToRaces)
    .innerJoin(races, eq(driversToRaces.raceId, races.id))
    .where(and(
      eq(races.endDate, date),
      eq(races.raceType, sessionType),
      eq(drivers.id, driverId),
    ));
}

// Function to update driver fantasy points based on their performance in sessions
async function updateDriverFantasyPoints(date: string): Promise<void> {
  const allDrivers = await db.select().from(drivers);
  const sessionNames = ["Grid", "Race"];

  for (const driver of allDrivers) {
    let points = 0;
    const previousFantasyPoints = driver.totalFantasyPoints!;

    for (const session of sessionNames) {
      const sessionResult = await getSessionData(session, driver.id, date);
      const position = sessionResult[0]?.driversToRaces.position;

      if (session === "Grid") {
        points = (21 - position) * 2;
      } else if (session === "Race") {
        const qualifyingPosition = sessionResult[0]?.driversToRaces.position;
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
}

// Main function to perform automated updates
async function automatedUpdates() {
  const yesterdayDate = await getYesterdayDate();
  const todayDate = await getTodayDate();

  if (await isRaceDay(yesterdayDate)) {
    console.log("Today is a race day!");
    const pastRaceIds = await getPastRaces(todayDate);

    for (const raceId of pastRaceIds) {
      console.log("Processing race:", raceId);
      await processRace(raceId);
    }

    await updateDriverStandings();
    await updateDriverFantasyPoints(yesterdayDate);
  } else {
    console.log("Today is not a race day.");
  }
}

void automatedUpdates();