import { quizzes } from "../content/exams/questions.ts";
import { subjects } from "../content/exams/subjects.ts";
export type ExamMode = "learn" | "exam";
export type ExamChoices = Record<string, number>;
export const mockExams = [
  {
    id: "security-01",
    title: "정보보안기사 모의고사 1회",
    minutes: 150,
    questionIds: subjects.flatMap((subject) =>
      quizzes.filter((q) => q.subject === subject).map((q) => q.id),
    ),
  },
];
export type ExamReview = {
  choice: number | null;
  answer: number;
  correct: boolean;
  explanation: string;
};
export type ExamScore = {
  score: number;
  answered: number;
  passed: boolean;
  subjects: { subject: string; correct: number; total: number; score: number; failed: boolean }[];
  review: Record<string, ExamReview>;
};
export type ExamAttempt = {
  attemptId: string;
  examId: string;
  mode: ExamMode;
  startedAt: string;
  submittedAt: string;
  score: number;
  answered: number;
  passed: boolean;
};
export function validateChoices(value: unknown, ids: string[]): value is ExamChoices {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([id, choice]) =>
        ids.includes(id) &&
        Number.isInteger(choice) &&
        (choice as number) >= 0 &&
        (choice as number) < 4,
    )
  );
}
export function scoreExam(
  ids: string[],
  choices: ExamChoices,
  keys: Record<string, { answer: number; explanation: string }>,
): ExamScore {
  const questions = ids.map((id) => quizzes.find((q) => q.id === id)!);
  const review = Object.fromEntries(
    questions.map((q) => [
      q.id,
      {
        choice: choices[q.id] ?? null,
        answer: keys[q.id].answer,
        correct: choices[q.id] === keys[q.id].answer,
        explanation: keys[q.id].explanation,
      },
    ]),
  );
  const breakdown = subjects.map((subject) => {
    const group = questions.filter((q) => q.subject === subject);
    const correct = group.filter((q) => review[q.id].correct).length;
    const score = (correct / group.length) * 100;
    return { subject, correct, total: group.length, score, failed: score < 40 };
  });
  const score = (questions.filter((q) => review[q.id].correct).length / questions.length) * 100;
  return {
    score,
    answered: questions.filter((q) => choices[q.id] !== undefined).length,
    passed: score >= 60 && breakdown.every((s) => !s.failed),
    subjects: breakdown,
    review,
  };
}
