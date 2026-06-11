import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  isVerified: boolean().notNull().default(false),
  otp: varchar({ length: 6 }),
  otpExpiry: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  domain: varchar({ length: 255 }).notNull(),
  owner: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const sharedProjectsTable = pgTable("shared_projects", {
  shareToken: varchar({ length: 255 }).primaryKey(),
  projectId: varchar({ length: 255 })
    .notNull()
    .references(() => projectsTable.websiteId, {
      onDelete: "cascade",
    }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
