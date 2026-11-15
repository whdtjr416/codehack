import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
export const solves = sqliteTable(
  "solves",
  {
    userId: text("user_id").notNull(),
    challengeId: text("challenge_id").notNull(),
    solvedAt: text("solved_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeId] })],
);
export const notes = sqliteTable(
  "notes",
  {
    userId: text("user_id").notNull(),
    challengeId: text("challenge_id").notNull(),
    body: text("body").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeId] })],
);
export const weeks = sqliteTable(
  "weeks",
  { userId: text("user_id").notNull(), week: integer("week").notNull() },
  (t) => [primaryKey({ columns: [t.userId, t.week] })],
);
export const checkpoints = sqliteTable(
  "checkpoints",
  { userId: text("user_id").notNull(), itemId: text("item_id").notNull() },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);
export const quizResults = sqliteTable(
  "quiz_results",
  {
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    choice: integer("choice").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    attempts: integer("attempts").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);
export const examAttempts = sqliteTable(
  "exam_attempts",
  {
    userId: text("user_id").notNull(),
    attemptId: text("attempt_id").notNull(),
    examId: text("exam_id").notNull(),
    mode: text("mode").notNull(),
    choices: text("choices").notNull(),
    startedAt: text("started_at").notNull(),
    submittedAt: text("submitted_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.attemptId] })],
);
