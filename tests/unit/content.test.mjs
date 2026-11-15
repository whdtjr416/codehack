import { readDataConstant } from "../helpers/data-module.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { challenges } from "../../lib/content/ctf/challenges.ts";
import {
  lessons,
  quizzes,
  practices,
  pentests,
  subjects,
  studyItems,
  completionIds,
} from "../../lib/content/catalog.ts";
import { readDocument } from "../../lib/labs/document-access.ts";

test("학습 항목 ID가 중복되지 않고 연결된 자료가 존재한다", () => {
  const ids = [...challenges, ...studyItems].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of lessons) assert.ok(challenges.some((c) => c.id === l.related));
  for (const q of quizzes) {
    assert.ok(lessons.some((l) => l.id === q.lesson));
    assert.equal(q.options.length, 4);
  }
  for (const p of practices) assert.ok(lessons.some((l) => l.id === p.related));
  for (const id of completionIds) assert.ok(ids.includes(id));
});
test("필기 5과목 각각 개념·연습·실기 자료가 있다", () => {
  assert.equal(subjects.length, 5);
  for (const s of subjects) {
    assert.ok(lessons.filter((l) => l.subject === s).length >= 3);
    assert.ok(quizzes.filter((q) => q.subject === s).length >= 3);
    assert.ok(practices.some((p) => p.subject === s));
  }
});
test("모의해킹 다운로드 자료가 실제로 존재한다", async () => {
  for (const p of pentests) {
    const text = await readFile(new URL(`../../public/labs/${p.id}.txt`, import.meta.url), "utf8");
    assert.ok(text.includes(p.evidence));
    assert.ok(text.includes(p.scope));
  }
});
test("접근 제어 수정은 타인 접근을 거부하고 정상 접근을 유지한다", () => {
  assert.equal(readDocument("vulnerable", "alice", 2).status, 200);
  assert.equal(readDocument("fixed", "alice", 2).status, 403);
  assert.equal(readDocument("fixed", "bob", 1).status, 403);
  assert.equal(readDocument("fixed", "alice", 1).status, 200);
  assert.equal(readDocument("fixed", "bob", 2).status, 200);
  assert.equal(readDocument("fixed", "alice", 99).status, 404);
  assert.equal(readDocument("fixed", "unknown", 1).status, 401);
  assert.equal(readDocument("invalid", "alice", 1).status, 400);
});

test("각 실습 분야 100개와 모의고사 5과목×20문항을 제공한다", async () => {
  const { exercises } = await import("../../lib/content/practice/exercises.ts");
  const { mockExams } = await import("../../lib/exams/scoring.ts");
  for (const engine of ["linux", "sql"])
    assert.equal(exercises.filter((e) => e.engine === engine).length, 100);
  assert.equal(challenges.length, 100);
  assert.equal(pentests.length, 100);
  assert.equal(quizzes.length, 100);
  for (const bank of [
    challenges,
    pentests,
    quizzes,
    ...["linux", "sql"].map((engine) => exercises.filter((e) => e.engine === engine)),
  ])
    assert.equal(new Set(bank.map((x) => x.title)).size, bank.length, "제목 중복");
  for (const exam of mockExams) {
    assert.equal(exam.questionIds.length, 100);
    assert.equal(new Set(exam.questionIds).size, 100);
    for (const subject of subjects)
      assert.equal(
        exam.questionIds.filter((id) => quizzes.find((q) => q.id === id)?.subject === subject)
          .length,
        20,
      );
  }
});

const jsonConstant = (path, name) => readDataConstant(new URL(path, import.meta.url), name);

test("추가 CTF 88개 모두 독립 답안·해설이 연결되고 계산값이 맞는다", async () => {
  const answers = await jsonConstant("../../lib/server/ctf/answer-bank.ts", "extraCtfAnswers");
  const solutions = await jsonConstant("../../lib/server/ctf/answer-bank.ts", "extraCtfSolutions");
  const added = challenges.filter((c) => c.id.startsWith("ctf-"));
  assert.equal(added.length, 88);
  for (const c of added) {
    assert.match(answers[c.id], /^flag\{.+\}$/);
    assert.equal(solutions[c.id].answer, answers[c.id]);
    assert.ok(solutions[c.id].explanation[0].length > 0);
    assert.ok(c.theory);
  }
  assert.equal(answers["ctf-dh-shared"], `flag{${8 ** 6 % 23}}`);
  assert.equal(answers["ctf-rsa-private"], "flag{103}");
  assert.equal((7 * 103) % 120, 1);
  assert.equal(answers["ctf-affine"], "flag{hello}");
  assert.equal(answers["ctf-atbash"], "flag{audit}");
  assert.ok(added.find((c) => c.id === "ctf-atbash").body.includes("zfwrg"));
});

test("모의고사 채점은 미응답·과락·합격 경계를 구분한다", async () => {
  const keys = {
    ...(await jsonConstant("../../lib/server/exams/answers.ts", "quizKeys")),
    ...(await jsonConstant("../../lib/server/exams/answer-bank.ts", "extraQuizKeys")),
  };
  const { mockExams, scoreExam, validateChoices } = await import("../../lib/exams/scoring.ts");
  const ids = mockExams[0].questionIds;
  assert.equal(Object.keys(keys).length, 100);
  for (const q of quizzes) {
    assert.ok(Number.isInteger(keys[q.id].answer));
    assert.ok(q.options[keys[q.id].answer]);
    assert.ok(keys[q.id].explanation);
    assert.equal(new Set(q.options).size, 4);
  }
  const perfect = Object.fromEntries(ids.map((id) => [id, keys[id].answer]));
  const full = scoreExam(ids, perfect, keys);
  assert.equal(full.score, 100);
  assert.equal(full.passed, true);
  const blank = scoreExam(ids, {}, keys);
  assert.equal(blank.score, 0);
  assert.equal(blank.answered, 0);
  assert.equal(blank.review[ids[0]].choice, null);
  const uneven = Object.fromEntries(ids.slice(20).map((id) => [id, keys[id].answer]));
  const failed = scoreExam(ids, uneven, keys);
  assert.equal(failed.score, 80);
  assert.equal(failed.passed, false);
  assert.equal(failed.subjects[0].failed, true);
  const boundary = Object.fromEntries(
    subjects
      .flatMap((s) =>
        ids.filter((id) => quizzes.find((q) => q.id === id).subject === s).slice(0, 12),
      )
      .map((id) => [id, keys[id].answer]),
  );
  assert.equal(scoreExam(ids, boundary, keys).score, 60);
  assert.equal(scoreExam(ids, boundary, keys).passed, true);
  assert.equal(validateChoices({ [ids[0]]: 0 }, ids), true);
  for (const invalid of [
    { unknown: 0 },
    { [ids[0]]: 4 },
    { [ids[0]]: -1 },
    { [ids[0]]: "0" },
    [],
    null,
  ])
    assert.equal(validateChoices(invalid, ids), false);
});
