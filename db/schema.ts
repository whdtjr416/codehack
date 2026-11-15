import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
export const solves = sqliteTable("solves", { userId: text("user_id").notNull(), challengeId: text("challenge_id").notNull(), solvedAt: text("solved_at").notNull() }, t => [primaryKey({ columns: [t.userId, t.challengeId] })]);
export const notes = sqliteTable("notes", { userId: text("user_id").notNull(), challengeId: text("challenge_id").notNull(), body: text("body").notNull() }, t => [primaryKey({ columns: [t.userId, t.challengeId] })]);
export const weeks = sqliteTable("weeks", { userId: text("user_id").notNull(), week: integer("week").notNull() }, t => [primaryKey({ columns: [t.userId, t.week] })]);
