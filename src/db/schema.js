import { pgTable, pgEnum, serial, varchar, integer, timestamp, text, jsonb } from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

// ─── Matches ─────────────────────────────────────────────────

export const matches = pgTable("matches", {
  id:        serial("id").primaryKey(),
  sport:     varchar("sport", { length: 100 }).notNull(),
  homeTeam:  varchar("home_team", { length: 150 }).notNull(),
  awayTeam:  varchar("away_team", { length: 150 }).notNull(),
  status:    matchStatusEnum("status").notNull().default("scheduled"),
  startTime: timestamp("start_time").notNull(),
  endTime:   timestamp("end_time"),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Commentary ───────────────────────────────────────────────────────

export const commentary = pgTable("commentary", {
  id:        serial("id").primaryKey(),
  matchId:   integer("match_id")
               .notNull()
               .references(() => matches.id, { onDelete: "cascade" }),
  minute:    integer("minute"),
  sequence:  integer("sequence").notNull(),
  period:    varchar("period", { length: 50 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  actor:     varchar("actor", { length: 150 }),
  team:      varchar("team", { length: 150 }),
  message:   text("message").notNull(),
  metadata:  jsonb("metadata"),
  tags:      text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});