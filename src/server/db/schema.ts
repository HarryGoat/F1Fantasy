// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  int,
  mysqlTableCreator,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `f1fantasy_${name}`);


//user
export const user = createTable(
  "user",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userName: varchar("userName", { length: 255 }),
    budget: int("budget"),
    driverChange: boolean("driverChange"),
  },
  (userSchema) => ({
    idIndex: index("id_idx").on(userSchema.id),
  }),
);


//drivers
export const drivers = createTable(
  "drivers",
  {
    id: int("id").primaryKey().autoincrement(),
    driverName: varchar("driverName", { length: 255 }),
    nationality: varchar("nationality", { length: 255 }),
    team: varchar("team", { length: 255 }),
    isReserve: int("isReserve"),
    position: int("position"),
    price: int("price"),
    points: int("points"),
  },
  (driversSchema) => ({
    idIndex: index("id_idx").on(driversSchema.id),
  }),
);


export const userDrivers = createTable(
  "userDrivers",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("userId", { length: 255 }),
    driverId: varchar("driverId", { length: 255 }),
    driverOrder: int("driverOrder"),
    isSubstitute: boolean("isSubstitute"),
    isCaptain: boolean("isCaptain")
  },
  (userDriversSchema) => ({
    userIdIndex: index("id_idx").on(userDriversSchema.userId),
    idIndex: index("id_idx").on(userDriversSchema.id),
  }),
);

//constructors
export const constructors = createTable(
  "constructors",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }),
    position: int("position"),
    price: int("price"),
    points: int("points"),
  },
  (constructorsSchema) => ({
    idIndex: index("id_idx").on(constructorsSchema.id),
  }),
);


export const userConstructor = createTable(
  "userConstructor",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("userId", { length: 255 }),
    constructorId: varchar("driverId", { length: 255 }),
  },
  (userConstructorSchema) => ({
    userIdIndex: index("id_idx").on(userConstructorSchema.userId),
    idIndex: index("id_idx").on(userConstructorSchema.id),
  }),
);



//leagues
export const leagues = createTable(
  "leagues",
  {
    id: int("id").primaryKey().autoincrement(),
    owner: varchar("owner", { length: 255 }),
    name: varchar("name", { length: 255 }),
    password: varchar("password", { length: 255 }),
    publicOrPrivate: boolean("publicOrPrivate"),
  },
  (leagueSchema) => ({
    idIndex: index("id_idx").on(leagueSchema.id),
  }),
);

export const UserLeagueLink = createTable(
  "UserLeagueLink",
  {
    id: int("id").primaryKey().autoincrement(),
    leagueId: int("leagueId").notNull(),
    userId: int("userId").notNull(),
  },
  (UserLeagueLinkSchema) => ({
    idIndex: index("id_idx").on(UserLeagueLinkSchema.id),
    leagueIdIndex: index("leagueId_idx").on(UserLeagueLinkSchema.leagueId),
    userIdIndex: index("userId_idx").on(UserLeagueLinkSchema.userId),
  }),
);
