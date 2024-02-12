// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  int,
  mysqlTableCreator,
  varchar,
  boolean,
  primaryKey,
} from "drizzle-orm/mysql-core";

import { relations } from 'drizzle-orm';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `f1fantasy_${name}`);


//users
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

export const userRelations = relations(user, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
  usersToLeagues: many(usersToLeagues),
}));

//drivers - many to many
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

export const driverRelations = relations(drivers, ({ many }) => ({
  usersToDrivers: many(usersToDrivers),
}));

export const usersToDrivers = createTable('usersToDrivers', {
  userId: int('user_id').notNull(),
  driverId: int('group_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.driverId] }), 
}));

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

//leagues - many to many
export const leagues = createTable(
  "leagues",
  {
    id: int("id").primaryKey().autoincrement(),
    owner: varchar("owner", { length: 255 }),
    name: varchar("name", { length: 255 }),
    password: varchar("password", { length: 255 }),
  },
  (leagueSchema) => ({
    idIndex: index("id_idx").on(leagueSchema.id),
  }),
);

export const leagueRelations = relations(leagues, ({ many }) => ({
  usersToLeagues: many(usersToLeagues),
}));

export const usersToLeagues = createTable('usersToLeagues', {
  userId: int('user_id').notNull(),
  leagueId: int('group_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.leagueId] }), 
}));


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

//constructor - one to one
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
