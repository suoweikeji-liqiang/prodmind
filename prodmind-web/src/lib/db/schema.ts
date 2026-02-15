import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const config = sqliteTable("config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  idea: text("idea").notNull(),
  status: text("status").notNull().default("active"),
  currentRound: integer("current_round").notNull().default(0),
  debatePhase: text("debate_phase").notNull().default("idle"),
  locale: text("locale").notNull().default("zh"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
});

export const conflictEvents = sqliteTable("conflict_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  ruleType: text("rule_type").notNull(),
  detail: text("detail").notNull(),
  userChoice: text("user_choice"),
  createdAt: text("created_at").notNull(),
});
