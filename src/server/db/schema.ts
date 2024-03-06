import {
  int,
  mysqlTableCreator,
  varchar,
  boolean,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Utilize mysqlTableCreator for consistent table naming across the F1 fantasy project schema.
export const createTable = mysqlTableCreator((name) => `f1fantasy_${name}`);

// Define the 'user' table with essential fields including budget, points, and driverChange status.
export const user = createTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userName: varchar("userName", { length: 255 }),
  budget: int("budget"),
  points: int("points"),
  driverChange: boolean("driverChange"),
  constructorId: int("constructorId"), // Reference to a constructor/team.
});

// Establish relations for 'user', enabling many-to-many connections to drivers and leagues.
export const usersRelations = relations(user, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
  usersToLeagues: many(usersToLeagues),
}));

// Define the 'drivers' table for storing driver details including team and point statistics.
export const drivers = createTable("drivers", {
  id: int("id").primaryKey(),
  driverName: varchar("driverName", { length: 255 }),
  nationality: varchar("nationality", { length: 255 }),
  team: varchar("team", { length: 255 }),
  position: int("position"),
  price: int("price"),
  totalPoints: int("totalPoints"),
  recentPoints: int("recentPoints"),
  totalFantasyPoints: int("totalFantasyPoints"),
  recentFantasyPoints: int("recentFantasyPoints"),
});

// Set up relations for 'drivers' to facilitate many-to-many connections with users and races.
export const driverRelations = relations(drivers, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
  driversToRaces: many(driversToRaces),
}));

// 'usersToDrivers' table models the many-to-many relationship between users and drivers.
export const usersToDrivers = createTable("usersToDrivers", {
  userId: varchar("userId", { length: 255 }).notNull(),
  driverId: int("driverId").notNull(),
  order: int("order").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.order] }), // Composite primary key.
}));

// Define relationships for 'usersToDrivers', linking back to 'user' and 'drivers' tables.
export const usersToDriversRelations = relations(usersToDrivers, ({ one }) => ({
  driver: one(drivers, {
    fields: [usersToDrivers.driverId],
    references: [drivers.id],
  }),
  user: one(user, {
    fields: [usersToDrivers.userId],
    references: [user.id],
  }),
}));

// 'races' table stores information about individual races, including completion status.
export const races = createTable("races", {
  id: int("raceid").primaryKey(),
  name: varchar("name", { length: 255 }),
  track: varchar("track", { length: 255 }),
  country: varchar("country", { length: 255 }),
  completed: varchar("completed", { length: 255 }),
  endDate: varchar("date", { length: 255 }), // Date the race is concluded.
  raceType: varchar("raceType", { length: 255 }), // Type of race (e.g., Qualifying, Main Race).
});

// 'racesRelations' to link races with driver performances in specific races.
export const racesRelations = relations(races, ({ many }) => ({
  driversToRaces: many(driversToRaces),
}));

// 'driversToRaces' table captures performance details of drivers in races.
export const driversToRaces = createTable("driversToRaces", {
  driverId: int("driverId").notNull(),
  raceId: int("raceId").notNull(),
  position: int("position"),
  retired: boolean("retired"), // Indicates if the driver retired from the race.
}, (t) => ({
  pk: primaryKey({ columns: [t.driverId, t.raceId] }), // Composite primary key.
}));

// Define relationships for 'driversToRaces' to easily access related driver and race details.
export const driversToRacesRelations = relations(driversToRaces, ({ one }) => ({
  driver: one(drivers, {
    fields: [driversToRaces.driverId],
    references: [drivers.id],
  }),
  race: one(races, {
    fields: [driversToRaces.raceId],
    references: [races.id],
  }),
}));

// 'leagues' table models fantasy leagues, with an owner and optional password for private leagues.
export const leagues = createTable("leagues", {
  id: int("id").primaryKey().autoincrement(),
  owner: varchar("owner", { length: 255 }),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }),
});

// 'leagueRelations' establish many-to-many connections between leagues and their participating users.
export const leagueRelations = relations(leagues, ({ many }) => ({
  usersToLeagues: many(usersToLeagues),
}));

// 'usersToLeagues' table represents the many-to-many relationship between users and leagues.
export const usersToLeagues = createTable("usersToLeagues", {
  userId: int("userId").notNull(),
  leagueId: int("leagueId").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.leagueId] }), // Composite primary key.
}));

// Set up relationships for 'usersToLeagues' for easy navigation between users and their leagues.
export const usersToLeaguesRelations = relations(usersToLeagues, ({ one }) => ({
  league: one(leagues, {
    fields: [usersToLeagues.leagueId],
    references: [leagues.id],
  }),
  user: one(user, {
    fields: [usersToLeagues.userId],
    references: [user.id],
  }),
}));
