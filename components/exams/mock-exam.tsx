"use client";
import { useEffect, useRef, useState } from "react";
import { lessons, quizzes, subjects } from "../../lib/content/catalog";
import { mockExams, validateChoices } from "../../lib/exams/scoring";
import type {
  ExamAttempt,
  ExamChoices,
  ExamMode,
  ExamReview,
  ExamScore,
} from "../../lib/exams/scoring";
type Draft = {
  attemptId: string;
  mode: ExamMode;
  choices: ExamChoices;
  marked: string[];
  index: number;
  startedAt: string;
};
type Result = ExamAttempt & ExamScore;
const exam = mockExams[0];
const questions = exam.questionIds.map((id) => quizzes.find((q) => q.id === id)!);
const modeName = (mode: ExamMode) => (mode === "learn" ? "학습" : "시험");
export function MockExam({ signedIn, viewerKey }: { signedIn: boolean; viewerKey: string }) {
  const storageKey = `codehack:exam:${viewerKey}:${exam.id}:v1`;
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [review, setReview] = useState<Record<string, ExamReview>>({});
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<ExamMode>("learn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [now, setNow] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("전체");
  const [navSubject, setNavSubject] = useState(subjects[0]);
  const autoSubmitted = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  const pane = useRef<HTMLElement>(null);
  const active = !!draft || !!result;
  const current = questions[index];
  const choices: ExamChoices =
    draft?.choices ??
    Object.fromEntries(
      Object.entries(result?.review ?? {})
        .filter(([, r]) => r.choice !== null)
        .map(([id, r]) => [id, r.choice!]),
    );
  const feedback = result?.review[current.id] ?? review[current.id];
  const remaining =
    draft?.mode === "exam"
      ? Math.max(0, exam.minutes * 60 - Math.floor((now - Date.parse(draft.startedAt)) / 1000))
      : null;
  const expired = remaining === 0;
  const answered = Object.keys(choices).length;
  const visibleIds = exam.questionIds.filter(
    (id) =>
      reviewFilter === "전체" ||
      (reviewFilter === "오답" && result && !result.review[id].correct) ||
      (reviewFilter === "미응답" && choices[id] === undefined) ||
      (reviewFilter === "표시" && draft?.marked.includes(id)),
  );
  function persist(next: Draft | null) {
    setDraft(next);
    try {
      if (next) localStorage.setItem(storageKey, JSON.stringify(next));
      else localStorage.removeItem(storageKey);
      setStorageError("");
    } catch {
      setStorageError("브라우저 임시 저장을 사용할 수 없습니다. 창을 닫기 전에 제출하세요.");
    }
  }
  async function loadHistory() {
    if (!signedIn) return;
    try {
      const r = await fetch("/api/exams");
      const d = (await r.json()) as { attempts: ExamAttempt[]; error?: string };
      if (!r.ok) throw Error(d.error);
      setHistory(d.attempts);
    } catch (e) {
      setError((e as Error).message || "응시 기록을 불러오지 못했습니다.");
    }
  }
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (
          typeof d.attemptId === "string" &&
          /^[a-f0-9-]{36}$/.test(d.attemptId) &&
          ["learn", "exam"].includes(d.mode) &&
          validateChoices(d.choices, exam.questionIds) &&
          Array.isArray(d.marked) &&
          d.marked.every(
            (id: unknown) => typeof id === "string" && exam.questionIds.includes(id),
          ) &&
          Number.isInteger(d.index) &&
          d.index >= 0 &&
          d.index < 100 &&
          Number.isFinite(Date.parse(d.startedAt))
        ) {
          setDraft(d);
          setIndex(d.index);
          setNavSubject(questions[d.index].subject);
        } else
          setStorageError(
            "저장된 임시 답안 형식을 읽을 수 없습니다. 새 응시를 시작할 수 있습니다.",
          );
      }
    } catch {
      setStorageError("임시 답안을 불러오지 못했습니다.");
    }
    setNow(Date.now());
    setReady(true);
    void loadHistory();
  }, [storageKey, signedIn]);
  useEffect(() => {
    if (!draft || draft.mode !== "exam") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [draft?.attemptId, draft?.mode]);
  useEffect(() => {
    if (expired && draft && signedIn && !busy && autoSubmitted.current !== draft.attemptId) {
      autoSubmitted.current = draft.attemptId;
      void submit();
    }
  }, [expired, draft?.attemptId, signedIn, busy]);
  function start() {
    const next: Draft = {
      attemptId: crypto.randomUUID(),
      mode,
      choices: {},
      marked: [],
      index: 0,
      startedAt: new Date().toISOString(),
    };
    persist(next);
    setResult(null);
    setIndex(0);
    setNavSubject(subjects[0]);
    setReview({});
    setReviewFilter("전체");
    setNow(Date.now());
    setError("");
    setConfirmSubmit(false);
  }
  function go(next: number) {
    setIndex(next);
    setNavSubject(questions[next].subject);
    if (draft) persist({ ...draft, index: next });
    setConfirmSubmit(false);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "nearest" });
    });
  }
  function choose(value: number) {
    if (!draft || busy || expired) return;
    persist({ ...draft, choices: { ...draft.choices, [current.id]: value } });
    setReview((r) => {
      const copy = { ...r };
      delete copy[current.id];
      return copy;
    });
    setConfirmSubmit(false);
  }
  async function explain() {
    if (!draft || choices[current.id] === undefined) return;
    setBusy(true);
    setError("");
    const id = current.id;
    try {
      const r = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          examId: exam.id,
          questionId: id,
          choice: choices[id],
        }),
      });
      const d = (await r.json()) as ExamReview & { error?: string };
      if (!r.ok) throw Error(d.error);
      setReview((v) => ({ ...v, [id]: d }));
      if (window.matchMedia("(max-width:760px)").matches)
        pane.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!draft || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", examId: exam.id, ...draft }),
      });
      const d = (await r.json()) as Result & { error?: string };
      if (!r.ok) throw Error(d.error);
      setResult(d);
      persist(null);
      setConfirmSubmit(false);
      setReviewFilter("전체");
      void loadHistory();
    } catch (e) {
      setError((e as Error).message || "제출하지 못했습니다. 답안은 임시 저장되어 있습니다.");
    } finally {
      setBusy(false);
    }
  }
  async function openResult(attemptId: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/exams?attempt=${encodeURIComponent(attemptId)}`);
      const d = (await r.json()) as Result & { error?: string };
      if (!r.ok) throw Error(d.error);
      setResult(d);
      setIndex(0);
      setNavSubject(subjects[0]);
      setReviewFilter("전체");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const theory = current.theory ?? lessons.find((l) => l.id === current.lesson)?.concept;
  if (!ready) return <p role="status">모의고사 불러오는 중…</p>;
  return (
    <section className="exam" aria-label="정보보안기사 모의고사">
      {error && (
        <div className="notice error" role="alert">
          {error} <button onClick={() => void loadHistory()}>기록 새로고침</button>
        </div>
      )}
      {storageError && (
        <p className="notice" role="status">
          {storageError}
        </p>
      )}
      {!active && (
        <>
          <div className="exam-start">
            <div>
              <span className="pane-label">자체 제작 · 1회차</span>
              <h2>정보보안기사 모의고사</h2>
              <p>5과목 · 과목별 20문항 · 총 100문항</p>
              <p className="section-note">평균 60점 이상, 모든 과목 40점 이상</p>
            </div>
            <div className="exam-start-actions">
              <div className="mode-switch" aria-label="응시 방식">
                <button aria-pressed={mode === "learn"} onClick={() => setMode("learn")}>
                  학습
                </button>
                <button aria-pressed={mode === "exam"} onClick={() => setMode("exam")}>
                  시험
                </button>
              </div>
              <p className="section-note">
                {mode === "learn"
                  ? "시간 제한 없이 오른쪽에서 이론과 해설 확인"
                  : "150분 · 전체 제출 후 이론과 해설 공개"}
              </p>
              <button className="primary" disabled={!signedIn || busy} onClick={start}>
                100문항 시작
              </button>
            </div>
          </div>
          <div className="section-heading spaced">
            <h2>응시 기록</h2>
            <span className="section-note">최근 20회</span>
          </div>
          {history.length ? (
            <div className="study-list">
              {history.map((h) => (
                <article key={h.attemptId}>
                  <div>
                    <button
                      className="problem-link"
                      disabled={busy}
                      onClick={() => void openResult(h.attemptId)}
                    >
                      {new Date(h.submittedAt).toLocaleString("ko-KR")} · {modeName(h.mode)}
                    </button>
                    <small>
                      {h.answered}/100 응답 · {h.passed ? "기준 충족" : "기준 미달"}
                    </small>
                  </div>
                  <strong>{h.score}점</strong>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => void openResult(h.attemptId)}
                  >
                    오답 · 해설 →
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">아직 제출한 모의고사가 없습니다.</p>
          )}
        </>
      )}
      {active && (
        <>
          <header className="exam-toolbar">
            <div>
              <strong>모의고사 1회</strong>
              <span>
                {modeName(draft?.mode ?? result!.mode)} · {answered}/100 응답
              </span>
            </div>
            <div>
              {remaining !== null && (
                <span
                  className={expired ? "exam-expired" : "exam-clock"}
                  role="timer"
                  aria-label="남은 시간"
                >
                  {expired
                    ? "시간 종료"
                    : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
                </span>
              )}
              {result ? (
                <button
                  onClick={() => {
                    setResult(null);
                    setReviewFilter("전체");
                  }}
                >
                  응시 목록
                </button>
              ) : (
                <button
                  disabled={!signedIn || busy}
                  className="primary"
                  onClick={() =>
                    answered < 100 && !confirmSubmit && !expired
                      ? setConfirmSubmit(true)
                      : void submit()
                  }
                >
                  {busy
                    ? "처리 중…"
                    : confirmSubmit
                      ? `미응답 ${100 - answered}개 포함 제출`
                      : "전체 제출 · 채점"}
                </button>
              )}
            </div>
          </header>
          {draft && (
            <p className="exam-save-note">
              답안은 이 브라우저에 자동 저장됩니다.
              {draft.mode === "exam" ? " 창을 닫아도 시험 시간은 계속 흐릅니다." : ""}
            </p>
          )}
          {result && (
            <section className="exam-score" aria-label="모의고사 채점 결과">
              <div className="exam-total">
                <strong>
                  {result.score}
                  <small> / 100점</small>
                </strong>
                <span>
                  {result.passed ? "기준 충족" : "기준 미달"} ·{" "}
                  {result.mode === "learn" ? "학습 모드 결과" : "시험 모드 결과"}
                </span>
              </div>
              <div className="exam-subject-scores">
                {result.subjects.map((s) => (
                  <div key={s.subject}>
                    <span>{s.subject}</span>
                    <strong>{s.score}점</strong>
                    <small>
                      {s.correct}/{s.total} 정답{s.failed ? " · 과락" : ""}
                    </small>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="exam-layout">
            <div className="exam-question-pane">
              <div className="exam-question-head">
                <span className="pane-label">
                  {index + 1} / 100 · {current.subject}
                </span>
                {draft && (
                  <button
                    disabled={busy}
                    className="text-button"
                    aria-pressed={draft.marked.includes(current.id)}
                    onClick={() =>
                      persist({
                        ...draft,
                        marked: draft.marked.includes(current.id)
                          ? draft.marked.filter((id) => id !== current.id)
                          : [...draft.marked, current.id],
                      })
                    }
                  >
                    {draft.marked.includes(current.id) ? "★ 다시 볼 문제" : "☆ 다시 보기"}
                  </button>
                )}
              </div>
              <h2 ref={heading} tabIndex={-1}>
                {current.title}
              </h2>
              <fieldset className="exam-options" disabled={!draft || busy || expired}>
                <legend className="sr-only">모의고사 정답 선택</legend>
                {current.options.map((option, i) => (
                  <label
                    className={`quiz-option ${choices[current.id] === i ? "chosen" : ""} ${result && feedback?.answer === i ? "answer-option" : ""}`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name="mock-answer"
                      checked={choices[current.id] === i}
                      onChange={() => choose(i)}
                    />
                    <span>
                      <b>{i + 1}</b>
                      {option}
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="exam-question-actions">
                <button disabled={index === 0 || busy} onClick={() => go(index - 1)}>
                  ← 이전
                </button>
                {draft?.mode === "learn" && (
                  <button
                    className="primary"
                    disabled={choices[current.id] === undefined || busy || !signedIn}
                    onClick={() => void explain()}
                  >
                    정답 · 해설 확인
                  </button>
                )}
                <button disabled={index === 99 || busy} onClick={() => go(index + 1)}>
                  다음 →
                </button>
              </div>
              <div className="exam-navigator">
                <div className="section-heading">
                  <h3>문항 이동</h3>
                  <select
                    aria-label="문항 이동 과목"
                    value={navSubject}
                    onChange={(e) => setNavSubject(e.target.value)}
                  >
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    aria-label="문항 상태 필터"
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                  >
                    {["전체", ...(result ? ["오답"] : ["표시"]), "미응답"].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                {[navSubject].map((subject) => {
                  const ids = questions.filter(
                    (q) => q.subject === subject && visibleIds.includes(q.id),
                  );
                  return (
                    ids.length > 0 && (
                      <div className="exam-subject-nav" key={subject}>
                        <small>{subject}</small>
                        <div>
                          {ids.map((q) => {
                            const n = exam.questionIds.indexOf(q.id);
                            return (
                              <button
                                key={q.id}
                                aria-label={`${n + 1}번 ${choices[q.id] === undefined ? "미응답" : "응답"}${result ? (result.review[q.id].correct ? " 정답" : " 오답") : ""}${draft?.marked.includes(q.id) ? " 표시" : ""}`}
                                aria-current={index === n ? "step" : undefined}
                                disabled={busy}
                                className={`${choices[q.id] !== undefined ? "answered" : ""} ${result && !result.review[q.id].correct ? "incorrect" : ""} ${draft?.marked.includes(q.id) ? "marked" : ""}`}
                                onClick={() => go(n)}
                              >
                                {n + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  );
                })}
                {!questions.some((q) => q.subject === navSubject && visibleIds.includes(q.id)) && (
                  <p className="section-note">이 과목에 해당 문항이 없습니다.</p>
                )}
              </div>
            </div>
            <aside ref={pane} className="exam-explanation" aria-label="이론과 문제풀이">
              <span className="pane-label">이론 · 문제풀이</span>
              {draft?.mode === "exam" ? (
                <p className="result-placeholder">
                  시험 모드는 전체 제출 후 이론과 해설을 확인합니다.
                </p>
              ) : (
                <>
                  <h3>핵심 이론</h3>
                  <p>{theory}</p>
                  <hr />
                  {feedback ? (
                    <div aria-live="polite">
                      <p className={`feedback ${feedback.correct ? "success" : "failure"}`}>
                        {feedback.choice === null
                          ? "미응답"
                          : feedback.correct
                            ? "정답입니다."
                            : "오답입니다."}
                      </p>
                      <h3>정답 {feedback.answer + 1}번</h3>
                      <p>{current.options[feedback.answer]}</p>
                      <h3>문제풀이</h3>
                      <p>{feedback.explanation}</p>
                      {feedback.choice !== null && feedback.choice !== feedback.answer && (
                        <p className="section-note">
                          내 답: {feedback.choice + 1}번 · {current.options[feedback.choice]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="result-placeholder">
                      답을 선택하고 ‘정답 · 해설 확인’을 누르세요.
                    </p>
                  )}
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
