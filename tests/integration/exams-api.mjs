// Local-only integration test. Each run removes only its own UUID fixture.
import assert from "node:assert/strict";
import { readDataConstant } from "../helpers/data-module.mjs";
import { execFileSync } from "node:child_process";
import { mockExams } from "../../lib/exams/scoring.ts";
const base = "http://127.0.0.1:5173";
assert.equal((await fetch(base + "/api/exams")).status, 401);
const login = await fetch(base + "/signin-with-chatgpt?return_to=/", { redirect: "manual" });
const cookie = login.headers
  .getSetCookie()
  .map((x) => x.split(";")[0])
  .join("; ");
const post = (body, origin = base) =>
  fetch(base + "/api/exams", {
    method: "POST",
    headers: { cookie, origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const get = async (path = "/api/exams") => {
  const r = await fetch(base + path, { headers: { cookie } });
  assert.equal(r.status, 200);
  return r.json();
};
const before = await get();
const trainingBefore = await get("/api/training");
const keys = (path, name) => readDataConstant(new URL(path, import.meta.url), name);
const allKeys = {
  ...(await keys("../../lib/server/exams/answers.ts", "quizKeys")),
  ...(await keys("../../lib/server/exams/answer-bank.ts", "extraQuizKeys")),
};
const choices = Object.fromEntries(mockExams[0].questionIds.map((id) => [id, allKeys[id].answer]));
const attemptId = crypto.randomUUID();
const payload = {
  action: "submit",
  examId: "security-01",
  attemptId,
  mode: "exam",
  startedAt: new Date().toISOString(),
  choices,
};
try {
  assert.equal((await post(payload, "https://untrusted.invalid")).status, 403);
  for (const change of [
    { examId: "missing" },
    { choices: { fake: 0 } },
    { choices: { "q-perm": 4 } },
    { attemptId: "bad-id" },
    { startedAt: "bad-date" },
    { mode: "unknown" },
  ])
    assert.equal((await post({ ...payload, ...change })).status, 400);
  const review = await post({
    action: "review",
    examId: "security-01",
    questionId: "q-perm",
    choice: 1,
  });
  const explanation = await review.json();
  assert.equal(explanation.correct, false);
  assert.equal(explanation.answer, 0);
  assert.ok(explanation.explanation);
  assert.deepEqual(
    (await get("/api/training")).quiz,
    trainingBefore.quiz,
    "설명 보기는 개별 연습 기록을 덮어쓰지 않는다",
  );
  let r = await post(payload);
  assert.equal(r.status, 200);
  const result = await r.json();
  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
  assert.equal(result.answered, 100);
  assert.equal(Object.keys(result.review).length, 100);
  assert.ok(result.subjects.every((s) => s.correct === 20));
  const duplicate = await (await post({ ...payload, choices: {} })).json();
  assert.equal(duplicate.score, 100);
  assert.equal(duplicate.submittedAt, result.submittedAt);
  const saved = await get("/api/exams?attempt=" + attemptId);
  assert.equal(saved.score, 100);
  assert.equal(saved.review["q-perm"].choice, 0);
  const list = await get();
  assert.equal(list.attempts.filter((a) => a.attemptId === attemptId).length, 1);
  assert.equal(list.attempts.find((a) => a.attemptId === attemptId).review, undefined);
  const spoof = await fetch(base + "/api/exams?attempt=" + attemptId, {
    headers: { "oai-authenticated-user-id": "local_seedy" },
  });
  assert.equal(spoof.status, 401);
  console.log(
    "PASS: mock exam auth/origin, input validation, review isolation, 100-answer grading, persistence and idempotency.",
  );
} finally {
  execFileSync(
    process.execPath,
    [
      "--import",
      "./scripts/sites-env.mjs",
      "./node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "DB",
      "--local",
      "--config",
      "dist/server/wrangler.json",
      "--persist-to",
      ".wrangler/state",
      "--command",
      `DELETE FROM exam_attempts WHERE user_id='local_seedy' AND attempt_id='${attemptId}';`,
    ],
    { stdio: "pipe" },
  );
  assert.deepEqual(await get(), before);
  assert.deepEqual(await get("/api/training"), trainingBefore);
  console.log("Only this run’s fixture removed; original records retained.");
}
