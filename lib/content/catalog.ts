import { exercises } from "./practice/exercises.ts";
import { lessons } from "./exams/lessons.ts";
import { quizzes } from "./exams/questions.ts";
import { practices } from "./exams/practices.ts";
import { pentests } from "./pentest/scenarios.ts";
import { codingTasks } from "./coding/tasks.ts";
export { lessons, quizzes, practices, pentests };
export { subjects, examSource } from "./exams/subjects.ts";
export type { Lesson, Quiz, Practice, Pentest } from "./types.ts";

export const completionIds = [
  ...lessons,
  ...practices,
  ...pentests,
  ...exercises,
  ...codingTasks,
].map((x) => x.id);
export const studyItems = [
  ...codingTasks.map((x) => ({ id: x.id, title: x.title, group: "코드 짜기" })),
  ...exercises.map((x) => ({ ...x, group: x.engine === "linux" ? "리눅스 명령어" : "DB · SQL" })),
  ...lessons.map((x) => ({ ...x, group: "정보보안기사 · 개념" })),
  ...quizzes.map((x) => ({ ...x, group: "정보보안기사 · 필기" })),
  ...practices.map((x) => ({ ...x, group: "정보보안기사 · 실기" })),
  ...pentests.map((x) => ({ ...x, group: "모의해킹" })),
];
