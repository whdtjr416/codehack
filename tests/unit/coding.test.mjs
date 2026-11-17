import { test } from "node:test";
import assert from "node:assert/strict";
import { codingTasks, codingGroups } from "../../lib/content/coding/tasks.ts";
import { completionIds } from "../../lib/content/catalog.ts";
import { isCodingRunShortcut } from "../../lib/coding/keyboard.ts";
import {
  codingStorageKey,
  emptyCodingProgress,
  initialCodingSource,
  parseCodingProgress,
} from "../../lib/coding/storage.ts";
import { tokenizeCode } from "../../lib/editor/tokenize.ts";
import { evaluateCoding } from "../../lib/coding/grading.ts";

test("배치 채점은 모든 카드를 검사하고 줄바꿈·가로 넘침을 구분한다", () => {
  const previous = Object.fromEntries(
    ["document", "getComputedStyle", "innerWidth"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  const node = (left, top, width = 100, height = 50) => ({
    getBoundingClientRect: () => ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
    }),
    children: [],
  });
  const container = node(0, 0, 960, 300);
  const documentElement = { scrollWidth: 960 };
  try {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelectorAll: () => [container], documentElement },
    });
    Object.defineProperty(globalThis, "getComputedStyle", {
      configurable: true,
      value: () => ({ visibility: "visible", opacity: "1" }),
    });
    Object.defineProperty(globalThis, "innerWidth", { configurable: true, value: 960 });
    const check = (layout) =>
      evaluateCoding([{ label: "배치", kind: "layout", selector: ".projects", layout }])[0].passed;
    container.children = [node(0, 0), node(116, 0), node(232, 0)];
    assert.equal(check("columns"), true);
    container.children[2] = node(0, 66);
    assert.equal(check("columns"), false, "앞 두 카드만 가로여도 세 번째가 줄바꿈되면 실패");
    container.children = [node(0, 0), node(0, 66), node(0, 132)];
    assert.equal(check("stack"), true);
    container.children[2] = node(116, 66);
    assert.equal(check("stack"), false);
    assert.equal(check("fits"), true);
    documentElement.scrollWidth = 1200;
    assert.equal(check("fits"), false);
  } finally {
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test("코딩 30과제의 단계·채점 기준·서버 완료 ID를 연결한다", () => {
  assert.equal(codingTasks.length, 30);
  assert.equal(new Set(codingTasks.map((task) => task.id)).size, 30);
  assert.deepEqual(
    codingGroups.map((group) => codingTasks.filter((task) => task.group === group).length),
    [12, 12, 6],
  );
  for (const task of codingTasks) {
    assert.ok(completionIds.includes(task.id));
    assert.ok(
      task.checks.length && task.theory && task.hint && task.explanation && task.solution.html,
    );
    assert.equal(
      new Set(task.checks.map((check) => check.label)).size,
      task.checks.length,
      task.id,
    );
    assert.notDeepEqual(task.starter, task.solution);
    if (task.previousId) {
      const previous = codingTasks.find((candidate) => candidate.id === task.previousId);
      assert.ok(previous);
      assert.deepEqual(
        task.starter,
        previous.solution,
        "직접 건너뛰어도 직전 단계의 완성 코드로 시작한다",
      );
    }
  }
});

test("Control R과 한글 자판을 처리하고 Command R은 새로고침으로 보존한다", () => {
  const event = {
    key: "r",
    code: "KeyR",
    metaKey: false,
    ctrlKey: true,
    altKey: false,
    shiftKey: false,
    isComposing: false,
  };
  assert.equal(isCodingRunShortcut(event), true);
  assert.equal(isCodingRunShortcut({ ...event, key: "ㄱ" }), true);
  assert.equal(isCodingRunShortcut({ ...event, metaKey: true, ctrlKey: false }), false);
  for (const variation of [
    { ctrlKey: false },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { isComposing: true },
    { key: "s", code: "KeyS" },
  ])
    assert.equal(isCodingRunShortcut({ ...event, ...variation }), false);
});

test("저장된 작업 우선 복구·단계 코드 이어쓰기·계정 분리", () => {
  const first = codingTasks.find((task) => task.id === "coding-site-1");
  const next = codingTasks.find((task) => task.id === "coding-site-2");
  const progress = emptyCodingProgress();
  const custom = { html: "<h1>내 코드</h1>", css: "h1 { color: red; }" };
  progress.drafts[first.id] = custom;
  assert.deepEqual(initialCodingSource(next, progress), custom);
  progress.drafts[next.id] = { html: "<h1>다음 작업</h1>", css: "" };
  progress.lastId = next.id;
  progress.completed = [first.id];
  const restored = parseCodingProgress(JSON.stringify(progress), codingTasks);
  assert.deepEqual(restored, progress);
  assert.deepEqual(initialCodingSource(next, restored), progress.drafts[next.id]);
  assert.notEqual(codingStorageKey("alice"), codingStorageKey("bob"));
  assert.throws(() => parseCodingProgress("{broken", codingTasks));
  assert.throws(() =>
    parseCodingProgress(
      JSON.stringify({ drafts: { [first.id]: { html: 42, css: "" } } }),
      codingTasks,
    ),
  );
  assert.deepEqual(parseCodingProgress(null, codingTasks), emptyCodingProgress());
});

test("HTML·CSS 구문 강조는 미완성 코드와 모든 문자를 보존한다", () => {
  for (const task of codingTasks)
    for (const language of ["html", "css"]) {
      const input = task.solution[language];
      assert.equal(
        tokenizeCode(input, language)
          .map((token) => token.text)
          .join(""),
        input,
      );
    }
  for (const input of [
    '<a href="',
    "<!-- unfinished",
    'p { color: #fff; content: "<a>"; }',
    "<h1>안녕 &amp; hello</h1>",
  ])
    for (const language of ["html", "css"])
      assert.equal(
        tokenizeCode(input, language)
          .map((token) => token.text)
          .join(""),
        input,
      );
});
