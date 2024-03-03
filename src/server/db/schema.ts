// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  int,
  mysqlTableCreator,
  varchar,
  boolean,
  primaryKey,
  date,
  float,
} from "drizzle-orm/mysql-core";

import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `f1fantasy_${name}`);

//users
export const user = createTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userName: varchar("userName", { length: 255 }),
  budget: int("budget"),
  points: int("points"),
  driverChange: boolean("driverChange"),
  constructorId: int("constructorId"),
});

export const usersRelations = relations(user, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
  usersToLeagues: many(usersToLeagues),
}));
//drivers - many to many
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

export const driverRelations = relations(drivers, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
  driversToRaces: many(driversToRaces),
}));

export const usersToDrivers = createTable(
  "usersToDrivers",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    driverId: int("driverId").notNull(),
    order: int("order").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.order] }),
  }),
);

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

export const races = createTable("races", {
  id: int("raceid").primaryKey(),
  name: varchar("name", { length: 255 }),
  track: varchar("track", { length: 255 }),
  country: varchar("country", { length: 255 }),
  completed: varchar("completed", { length: 255 }),
  endDate: varchar("date", { length: 255 }),
  raceType: varchar("raceType", { length: 255 }),
});

export const racesRelations = relations(races, ({ many }) => ({
  driversToRaces: many(driversToRaces),
}));

export const driversToRaces = createTable(
  "driversToRaces",
  {
    driverId: int("driverId").notNull(),
    raceId: int("raceId").notNull(),
    position: int("position"),
    retired: int("retired"),
    fastestLap: float("fastestLap"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.driverId, t.raceId] }),
  }),
);

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

//leagues - many to many
export const leagues = createTable("leagues", {
  id: int("id").primaryKey().autoincrement(),
  owner: varchar("owner", { length: 255 }),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }),
});

export const leagueRelations = relations(leagues, ({ many }) => ({
  usersToLeagues: many(usersToLeagues),
}));

export const usersToLeagues = createTable(
  "usersToLeagues",
  {
    userId: int("userId").notNull(),
    leagueId: int("leagueId").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.leagueId] }),
  }),
);

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
