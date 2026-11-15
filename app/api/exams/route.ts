import { getCurrentUser } from "../../auth";
import { getDb } from "../../../db";
import { examAttempts } from "../../../db/schema";
import { and, desc, eq } from "drizzle-orm";
import { mockExams, scoreExam, validateChoices } from "../../../lib/exams/scoring";
import { quizKeys } from "../../../lib/server/exams/answers";
export const dynamic = "force-dynamic";
const response = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function result(row: typeof examAttempts.$inferSelect) {
  const exam = mockExams.find((e) => e.id === row.examId)!;
  return {
    attemptId: row.attemptId,
    examId: row.examId,
    mode: row.mode,
    startedAt: row.startedAt,
    submittedAt: row.submittedAt,
    ...scoreExam(exam.questionIds, JSON.parse(row.choices), quizKeys),
  };
}
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return response({ error: "로그인이 필요합니다." }, 401);
  const id = new URL(request.url).searchParams.get("attempt");
  const rows = await getDb()
    .select()
    .from(examAttempts)
    .where(
      id
        ? and(eq(examAttempts.userId, user.userId), eq(examAttempts.attemptId, id))
        : eq(examAttempts.userId, user.userId),
    )
    .orderBy(desc(examAttempts.submittedAt))
    .limit(id ? 1 : 20);
  if (id)
    return rows[0] ? response(result(rows[0])) : response({ error: "응시 기록이 없습니다." }, 404);
  return response({
    attempts: rows.map((row) => {
      const { review, subjects, ...summary } = result(row);
      void review;
      void subjects;
      return summary;
    }),
  });
}
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return response({ error: "로그인이 필요합니다." }, 401);
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return response({ error: "허용되지 않은 요청입니다." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 20000)
    return response({ error: "요청이 너무 큽니다." }, 413);
  let data;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return response({ error: "요청이 너무 큽니다." }, 413);
    data = JSON.parse(raw);
  } catch {
    return response({ error: "잘못된 요청입니다." }, 400);
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return response({ error: "잘못된 요청입니다." }, 400);
  const exam = mockExams.find((e) => e.id === data.examId);
  if (!exam) return response({ error: "모의고사를 찾을 수 없습니다." }, 400);
  if (
    data.action === "review" &&
    exam.questionIds.includes(data.questionId) &&
    Number.isInteger(data.choice) &&
    data.choice >= 0 &&
    data.choice < 4
  ) {
    const key = quizKeys[data.questionId];
    return response({ ...key, choice: data.choice, correct: data.choice === key.answer });
  }
  if (
    data.action !== "submit" ||
    typeof data.attemptId !== "string" ||
    !/^[a-f0-9-]{36}$/.test(data.attemptId) ||
    !["learn", "exam"].includes(data.mode) ||
    !validateChoices(data.choices, exam.questionIds) ||
    typeof data.startedAt !== "string" ||
    !Number.isFinite(Date.parse(data.startedAt)) ||
    Date.parse(data.startedAt) > Date.now() + 60000
  )
    return response({ error: "응시 정보와 답안을 확인하세요." }, 400);
  const db = getDb();
  await db
    .insert(examAttempts)
    .values({
      userId: user.userId,
      attemptId: data.attemptId,
      examId: exam.id,
      mode: data.mode,
      choices: JSON.stringify(data.choices),
      startedAt: new Date(data.startedAt).toISOString(),
      submittedAt: new Date().toISOString(),
    })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(examAttempts)
    .where(and(eq(examAttempts.userId, user.userId), eq(examAttempts.attemptId, data.attemptId)));
  return response(result(row));
}
