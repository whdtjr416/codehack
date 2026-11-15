"use client";

import { useEffect, useRef, useState } from "react";
import {
  Terminal,
  Database,
  Flag,
  Crosshair,
  ShieldCheck,
  BarChart3,
  NotebookPen,
} from "lucide-react";
import { MockExam } from "../exams/mock-exam";
import { QuestionList } from "./question-list";
import { CodeText } from "../editor/code-editor";
import { challenges } from "../../lib/content/ctf/challenges";
import { roadmap } from "../../lib/content/checklist";
import { exercises, exerciseFor } from "../../lib/content/practice/exercises";
import { writtenSolutions } from "../../lib/content/written-solutions";
import { ExecutionEditor, ExecutionOutput, useExecutionLab } from "../practice/execution-lab";
import { practiceDifficulty, pentestDifficulty } from "../../lib/content/difficulty";
import { topics } from "../../lib/content/topics";
import {
  subjects,
  lessons,
  quizzes,
  practices,
  pentests,
  studyItems,
  examSource,
} from "../../lib/content/catalog";

type QuizResult = { choice: number; correct: boolean; attempts: number };
type TrainingState = {
  solved: string[];
  notes: Record<string, string>;
  weeks: number[];
  completed: string[];
  quiz: Record<string, QuizResult>;
};
type ActionResult = {
  error?: string;
  correct?: boolean;
  message?: string;
  answer?: number;
  explanation?: string;
  attempts?: number;
  solution?: { answer: string; explanation: string[]; code?: string };
};
const empty: TrainingState = { solved: [], notes: {}, weeks: [], completed: [], quiz: {} };
const navigation = [
  { label: "학습", items: ["리눅스 명령어", "DB · SQL", "CTF", "모의해킹"] },
  { label: "시험", items: ["정보보안기사"] },
  { label: "기록", items: ["학습 현황", "노트"] },
];
const navigationIcons = {
  "리눅스 명령어": Terminal,
  "DB · SQL": Database,
  CTF: Flag,
  모의해킹: Crosshair,
  정보보안기사: ShieldCheck,
  "학습 현황": BarChart3,
  노트: NotebookPen,
};
const catalog = [
  ...challenges.map((c) => ({ id: c.id, title: c.title, group: "CTF" })),
  ...studyItems.map((c) => ({ id: c.id, title: c.title, group: c.group })),
];
const analysisTemplate =
  "## 관찰과 가설\n\n## 재현 절차와 증거\n\n## 원인과 영향\n\n## 수정 방법\n\n## 재검증\n- 비정상 동작 차단:\n- 정상 기능 유지:\n\n## 남은 의문\n";
const reportTemplate =
  "## 작업 범위와 승인\n\n## 발견사항 요약\n\n## 재현 조건과 증거\n\n## 원인과 영향 (사실 / 추정 구분)\n\n## 수정안\n\n## 재검증 결과\n- 비정상 요청:\n- 정상 기능:\n\n## 잔여 위험과 한계\n";

export default function Dashboard({
  signedIn,
  viewerKey,
}: {
  signedIn: boolean;
  viewerKey: string;
}) {
  const [tab, setTab] = useState("학습 현황");
  const [state, setState] = useState<TrainingState>(empty);
  const [loaded, setLoaded] = useState(!signedIn);
  const [error, setError] = useState("");
  const [examMode, setExamMode] = useState("모의고사");
  const [subject, setSubject] = useState("전체 과목");
  const [noteGroup, setNoteGroup] = useState("전체");
  const [selected, setSelected] = useState<string | null>(null);
  const [flag, setFlag] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [ctfFeedback, setCtfFeedback] = useState<ActionResult | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const resultPane = useRef<HTMLElement | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<ActionResult | null>(null);
  const [message, setMessage] = useState("");
  const [correct, setCorrect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(0);
  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const savedDraft = useRef("");
  const [labMode, setLabMode] = useState("vulnerable");
  const [labUser, setLabUser] = useState("alice");
  const [labDocument, setLabDocument] = useState("2");
  const [labResult, setLabResult] = useState("");
  const exercise = exerciseFor(selected);
  const lab = useExecutionLab(exercise, recordExercise);
  const active = catalog.find((c) => c.id === selected);
  const challenge = challenges.find((c) => c.id === selected);
  const lesson = lessons.find((c) => c.id === selected);
  const quiz = quizzes.find((c) => c.id === selected);
  const practice = practices.find((c) => c.id === selected);
  const pentest = pentests.find((c) => c.id === selected);
  const working = busy || lab.phase === "running";
  const canWrite = signedIn && loaded && !working;
  const score = challenges
    .filter((c) => state.solved.includes(c.id))
    .reduce((s, c) => s + c.points, 0);
  const total = challenges.reduce((s, c) => s + c.points, 0);
  const wrong = quizzes.filter((q) => state.quiz[q.id] && !state.quiz[q.id].correct);
  const quizCorrect = quizzes.filter((q) => state.quiz[q.id]?.correct).length;
  const labCompleted = pentests.filter((p) => state.completed.includes(p.id)).length;
  const noteItems = catalog.filter((c) => state.notes[c.id]?.trim());
  const topic = topics.find((t) => t.title === tab);

  async function load() {
    setError("");
    try {
      const r = await fetch("/api/training");
      const d = (await r.json()) as TrainingState & { error?: string };
      if (!r.ok) throw Error(d.error || "기록을 불러오지 못했습니다.");
      setState({ ...empty, ...d });
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    if (signedIn) void load();
  }, [signedIn]);
  useEffect(() => {
    if (!selected) return;
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [selected, note, working]);
  useEffect(() => {
    if (!selected) return;
    document.getElementById("problem-title")?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 760px)").matches)
      document.getElementById("content")?.scrollIntoView({ block: "start" });
  }, [selected]);
  useEffect(() => {
    if (
      selected &&
      (ctfFeedback || quizFeedback || reviewed || lab.result || lab.error) &&
      window.matchMedia("(max-width: 760px)").matches
    )
      resultPane.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected, ctfFeedback, quizFeedback, reviewed, lab.result, lab.error]);

  function close() {
    if (working) return;
    if (note !== savedDraft.current && !window.confirm("저장하지 않은 노트가 있습니다. 닫을까요?"))
      return;
    setSelected(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  function navigate(name: string) {
    if (working) return;
    if (
      selected &&
      note !== savedDraft.current &&
      !window.confirm("저장하지 않은 노트가 있습니다. 메뉴를 이동할까요?")
    )
      return;
    setSelected(null);
    setTab(name);
  }
  function open(id: string) {
    if (working) return;
    if (
      selected &&
      note !== savedDraft.current &&
      !window.confirm("저장하지 않은 노트가 있습니다. 다른 항목을 열까요?")
    )
      return;
    const item = catalog.find((c) => c.id === id);
    if (!item) return;
    if (!selected) returnFocus.current = document.activeElement as HTMLElement | null;
    const initial =
      state.notes[id] ??
      (id.startsWith("pentest-")
        ? reportTemplate
        : id.startsWith("practical-")
          ? "## 나의 답안\n\n## 채점 기준과 비교\n\n## 보완할 내용\n"
          : id.startsWith("lesson-")
            ? "## 핵심 개념\n\n## 직접 설명한 내용\n\n## 확인이 필요한 부분\n"
            : analysisTemplate);
    setSelected(id);
    setFlag("");
    setChoice(state.quiz[id]?.choice ?? null);
    setQuizFeedback(null);
    setCtfFeedback(null);
    setReviewed(!!state.notes[id]?.trim());
    setProgressMessage("");
    setHint(0);
    setMessage("");
    setSaveMessage("");
    setNote(initial);
    savedDraft.current = initial;
    setLabResult("");
  }
  async function mutate(payload: unknown): Promise<ActionResult> {
    const r = await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = (await r.json()) as ActionResult;
    if (!r.ok) throw Error(d.error || "저장에 실패했습니다.");
    return d;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge) return;
    setBusy(true);
    setMessage("");
    try {
      const d = await mutate({ action: "submit", id: challenge.id, flag });
      setMessage(d.message || "");
      setCorrect(!!d.correct);
      setCtfFeedback(d);
      if (d.correct)
        setState((s) => ({ ...s, solved: Array.from(new Set([...s.solved, challenge.id])) }));
    } catch (e) {
      setCorrect(false);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function answerQuiz() {
    if (!quiz || choice === null) return;
    setBusy(true);
    setMessage("");
    try {
      const d = await mutate({ action: "quiz", id: quiz.id, choice });
      setQuizFeedback(d);
      setState((s) => ({
        ...s,
        quiz: { ...s.quiz, [quiz.id]: { choice, correct: !!d.correct, attempts: d.attempts || 1 } },
      }));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!active) return;
    const body = note;
    setBusy(true);
    setSaveMessage("");
    try {
      await mutate({ action: "note", id: active.id, body });
      setState((s) => ({ ...s, notes: { ...s.notes, [active.id]: body } }));
      savedDraft.current = body;
      setSaveMessage("저장했습니다.");
      return true;
    } catch (e) {
      setSaveMessage((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function toggleComplete(id: string) {
    setBusy(true);
    try {
      const completed = !state.completed.includes(id);
      await mutate({ action: "complete", id, completed });
      setState((s) => ({
        ...s,
        completed: completed ? [...s.completed, id] : s.completed.filter((x) => x !== id),
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function toggleTrack(week: number) {
    setBusy(true);
    try {
      const completed = !state.weeks.includes(week);
      await mutate({ action: "week", week, completed });
      setState((s) => ({
        ...s,
        weeks: completed ? [...s.weeks, week] : s.weeks.filter((w) => w !== week),
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function runLab() {
    setBusy(true);
    try {
      const r = await fetch(
        `/api/lab?mode=${encodeURIComponent(labMode)}&user=${encodeURIComponent(labUser)}&document=${encodeURIComponent(labDocument)}`,
      );
      if (!r.ok) throw Error("실습 응답을 불러오지 못했습니다.");
      setLabResult(JSON.stringify(await r.json(), null, 2));
      setReviewed(true);
    } catch (e) {
      setLabResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function recordExercise() {
    const id = selected;
    if (!id || !exercises.some((e) => e.id === id) || !signedIn || !loaded) return;
    try {
      await mutate({ action: "complete", id, completed: true });
      setState((s) => ({ ...s, completed: Array.from(new Set([...s.completed, id])) }));
      setProgressMessage("완료 기록 저장됨");
    } catch {
      setProgressMessage("완료 기록 저장 실패. 다시 실행하면 재시도합니다.");
    }
  }
  async function reviewAnswer() {
    if (await save()) setReviewed(true);
  }
  async function revealCtf() {
    if (!challenge || !canWrite) return;
    setBusy(true);
    setMessage("");
    try {
      setCtfFeedback(await mutate({ action: "solution", id: challenge.id }));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportNotes() {
    const body = noteItems
      .map((c) => `# ${c.title}\n분류: ${c.group}\n\n${state.notes[c.id]}`)
      .join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "코드핵-노트.md";
    a.click();
    URL.revokeObjectURL(url);
  }
  const completionButton = (id: string) => (
    <button
      aria-pressed={state.completed.includes(id)}
      disabled={!canWrite}
      className={state.completed.includes(id) ? "track-check checked" : "track-check"}
      onClick={() => void toggleComplete(id)}
    >
      {state.completed.includes(id) ? "✓ 완료" : "완료 표시"}
    </button>
  );

  const filteredSubject = (
    <label className="select-label">
      과목{" "}
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        {["전체 과목", ...subjects].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </label>
  );
  const matchesSubject = (x: { subject: string }) =>
    subject === "전체 과목" || x.subject === subject;

  const itemType = (id: string) =>
    exercises.some((e) => e.id === id)
      ? "실행 실습"
      : challenges.some((c) => c.id === id)
        ? "CTF"
        : lessons.some((l) => l.id === id)
          ? "개념"
          : quizzes.some((q) => q.id === id)
            ? "필기"
            : practices.some((p) => p.id === id)
              ? "실기"
              : "코드 리뷰";
  const itemStatus = (id: string) =>
    state.solved.includes(id) || state.completed.includes(id)
      ? "완료"
      : state.quiz[id]
        ? state.quiz[id].correct
          ? "정답"
          : "오답"
        : "미완료";
  const topicList = (ids: string[]) => (
    <div className="study-list">
      {ids.map((id) => {
        const item = catalog.find((c) => c.id === id);
        if (!item) return null;
        return (
          <article key={id}>
            <span className="type-label">{itemType(id)}</span>
            <div>
              <button className="problem-link" onClick={() => open(id)}>
                {item.title}
              </button>
            </div>
            <span
              className={`item-status ${itemStatus(id) === "완료" || itemStatus(id) === "정답" ? "done" : ""}`}
            >
              {itemStatus(id)}
            </span>
            <button className="row-open" aria-label={`${item.title} 열기`} onClick={() => open(id)}>
              →
            </button>
          </article>
        );
      })}
    </div>
  );
  const noteMatches = (c: (typeof catalog)[number]) =>
    noteGroup === "전체" ||
    (topics.find((t) => t.title === noteGroup)?.items.includes(c.id) ??
      c.group.startsWith(noteGroup));

  const sequence =
    exercise && exercises.some((e) => e.id === selected)
      ? exercises.filter((e) => e.engine === exercise.engine)
      : challenge
        ? challenges
        : quiz
          ? quizzes
          : practice
            ? practices
            : pentest
              ? pentests
              : lessons;
  const position = sequence.findIndex((item) => item.id === selected);
  const noteEditor = (
    <>
      <label htmlFor="note" className="input-label">
        {practice ? "내 답안" : pentest ? "진단 보고서" : "노트"}
        <span>{note.length}/8,000자</span>
      </label>
      <textarea
        id="note"
        maxLength={8000}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaveMessage("");
        }}
        rows={8}
        disabled={!signedIn || !loaded || working}
      />
      <div className="note-actions">
        <span role="status">
          {saveMessage || (note !== savedDraft.current ? "저장하지 않은 변경사항" : "")}
        </span>
        <button
          className="primary"
          disabled={!canWrite || !note.trim()}
          onClick={() => void (practice || pentest ? reviewAnswer() : save())}
        >
          {practice || pentest ? "답안 저장 · 해설 보기" : "노트 저장"}
        </button>
      </div>
    </>
  );

  return (
    <div className="app">
      <a className="skip-link" href="#content">
        본문으로 이동
      </a>
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("학습 현황")}>
          코드핵
        </button>
        <nav aria-label="주요 메뉴">
          {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.items.map((name) => {
                const Icon = navigationIcons[name as keyof typeof navigationIcons];
                return (
                  <button
                    key={name}
                    disabled={working}
                    aria-current={tab === name ? "page" : undefined}
                    className={tab === name ? "active" : ""}
                    onClick={() => navigate(name)}
                  >
                    <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-account">
          {signedIn ? (
            <span>
              <i />
              로그인됨
            </span>
          ) : (
            <a href="/signin-with-chatgpt?return_to=%2F" target="_top">
              로그인 →
            </a>
          )}
        </div>
      </aside>
      <main id="content" className={active ? "workspace-main" : undefined} tabIndex={-1}>
        {!active && (
          <>
            <div className="page-heading">
              <h1>{tab}</h1>
              {tab === "CTF" ? (
                <span>
                  {state.solved.length} / {challenges.length} 해결
                </span>
              ) : tab === "모의해킹" ? (
                <span>
                  {labCompleted} / {pentests.length} 완료
                </span>
              ) : tab === "정보보안기사" ? (
                <a href={examSource.url} target="_blank" rel="noreferrer">
                  시험 안내 ↗
                </a>
              ) : topic ? (
                <span>직접 실행 · 채점</span>
              ) : tab === "노트" ? (
                <button className="secondary" disabled={!noteItems.length} onClick={exportNotes}>
                  내보내기
                </button>
              ) : null}
            </div>
            {!signedIn && (
              <div className="notice">
                <a href="/signin-with-chatgpt?return_to=%2F" target="_top">
                  로그인
                </a>
                하면 풀이와 노트를 저장합니다.
              </div>
            )}
            {error && (
              <div className="notice error" role="alert">
                {error} <button onClick={() => void load()}>다시 불러오기</button>
              </div>
            )}
            {!loaded && !error && (
              <p role="status" className="muted">
                기록 불러오는 중…
              </p>
            )}

            {tab === "학습 현황" && (
              <>
                <section className="category-grid" aria-label="학습 카테고리">
                  {topics.map((t) => (
                    <button key={t.title} onClick={() => setTab(t.title)}>
                      <span className="category-title">
                        {t.title}
                        <span aria-hidden="true">↗</span>
                      </span>
                      <span className="category-meta">{t.summary}</span>
                      <small>
                        실행{" "}
                        {
                          exercises.filter(
                            (e) => t.items.includes(e.id) && state.completed.includes(e.id),
                          ).length
                        }
                        /{exercises.filter((e) => t.items.includes(e.id)).length} 완료
                      </small>
                    </button>
                  ))}
                  <button onClick={() => setTab("CTF")}>
                    <span className="category-title">
                      CTF<span aria-hidden="true">↗</span>
                    </span>
                    <span className="category-meta">웹 · 시스템 · 암호 · 리버싱 · 포렌식</span>
                    <small>{challenges.length}개 문제</small>
                  </button>
                  <button onClick={() => setTab("모의해킹")}>
                    <span className="category-title">
                      모의해킹<span aria-hidden="true">↗</span>
                    </span>
                    <span className="category-meta">접근 제어 · 코드 리뷰 · 보고서</span>
                    <small>{pentests.length}개 실습</small>
                  </button>
                  <button onClick={() => setTab("정보보안기사")}>
                    <span className="category-title">
                      정보보안기사<span aria-hidden="true">↗</span>
                    </span>
                    <span className="category-meta">100문항 모의고사 · 개념 · 실기</span>
                    <small>{subjects.length}과목</small>
                  </button>
                </section>
                <section className="stats" aria-label="학습 기록">
                  <div>
                    <span>CTF 점수</span>
                    <strong>
                      {score}
                      <small> / {total}</small>
                    </strong>
                  </div>
                  <div>
                    <span>필기 연습 정답</span>
                    <strong>
                      {quizCorrect}
                      <small> / {quizzes.length}</small>
                    </strong>
                  </div>
                  <div>
                    <span>모의해킹 완료</span>
                    <strong>
                      {labCompleted}
                      <small> / {pentests.length}</small>
                    </strong>
                  </div>
                  <div>
                    <span>노트</span>
                    <strong>{noteItems.length}</strong>
                  </div>
                </section>
                <div className="section-heading spaced">
                  <h2>과목별 진도</h2>
                  <button
                    className="text-button"
                    onClick={() => {
                      setExamMode("오답 복습");
                      setSubject("전체 과목");
                      setTab("정보보안기사");
                    }}
                  >
                    오답 {wrong.length} →
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="subject-table">
                    <thead>
                      <tr>
                        <th>과목</th>
                        <th>개념 완료</th>
                        <th>최근 정답</th>
                        <th>오답</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s}>
                          <td>
                            <button
                              className="problem-link"
                              onClick={() => {
                                setSubject(s);
                                setExamMode("개념 학습");
                                setTab("정보보안기사");
                              }}
                            >
                              {s}
                            </button>
                          </td>
                          <td>
                            {
                              lessons.filter(
                                (l) => l.subject === s && state.completed.includes(l.id),
                              ).length
                            }
                            /{lessons.filter((l) => l.subject === s).length}
                          </td>
                          <td>
                            {
                              quizzes.filter((q) => q.subject === s && state.quiz[q.id]?.correct)
                                .length
                            }
                            /{quizzes.filter((q) => q.subject === s).length}
                          </td>
                          <td>{wrong.filter((q) => q.subject === s).length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <details className="track-details">
                  <summary>
                    학습 체크리스트{" "}
                    <span>
                      {state.weeks.length} / {roadmap.length}
                    </span>
                  </summary>
                  <div className="track-list">
                    {roadmap.map((w, i) => (
                      <article key={w[0]}>
                        <div>
                          <h2>{w[0]}</h2>
                          <p>{w[2]}</p>
                        </div>
                        <button
                          aria-pressed={state.weeks.includes(i + 1)}
                          disabled={!canWrite}
                          className={
                            state.weeks.includes(i + 1) ? "track-check checked" : "track-check"
                          }
                          onClick={() => void toggleTrack(i + 1)}
                        >
                          {state.weeks.includes(i + 1) ? "✓ 완료" : "완료 표시"}
                        </button>
                      </article>
                    ))}
                  </div>
                </details>
              </>
            )}

            {topic && (
              <>
                <div className="section-heading">
                  <h2>실행 실습</h2>
                  <span className="section-note">
                    {topic.title === "리눅스 명령어" ? "가상 Bash" : "SQLite"}
                  </span>
                </div>
                <QuestionList
                  key={topic.title}
                  label={topic.title}
                  onOpen={open}
                  items={exercises
                    .filter((e) => topic.items.includes(e.id))
                    .map((e) => ({
                      id: e.id,
                      title: e.title,
                      category: e.topic ?? "기초 실습",
                      level: practiceDifficulty(e.topic),
                      status: itemStatus(e.id),
                    }))}
                />
                <div className="section-heading spaced">
                  <h2>개념 · 연습 문제</h2>
                </div>
                {topicList(topic.items.filter((id) => !exercises.some((e) => e.id === id)))}
              </>
            )}

            {tab === "CTF" && (
              <QuestionList
                label="CTF"
                onOpen={open}
                items={challenges.map((c) => ({
                  id: c.id,
                  title: c.title,
                  category: c.category,
                  level: c.level,
                  status: state.solved.includes(c.id) ? "해결" : "미완료",
                  detail: `${c.points}점`,
                }))}
              />
            )}

            {tab === "정보보안기사" && (
              <>
                <div className="subnav" aria-label="기사 학습 종류">
                  {["모의고사", "개념 학습", "필기 연습", "실기 연습", "오답 복습"].map((mode) => (
                    <button
                      key={mode}
                      aria-pressed={examMode === mode}
                      className={examMode === mode ? "active" : ""}
                      onClick={() => setExamMode(mode)}
                    >
                      {mode}
                      {mode === "오답 복습" ? ` ${wrong.length}` : ""}
                    </button>
                  ))}
                </div>
                {examMode === "모의고사" && <MockExam signedIn={signedIn} viewerKey={viewerKey} />}
                {examMode !== "모의고사" && (
                  <div className="section-heading">
                    {filteredSubject}
                    <span className="section-note">
                      {examMode === "개념 학습"
                        ? ""
                        : examMode === "실기 연습"
                          ? "자체 제작 · 직접 검토"
                          : "자체 제작 · 마지막 제출 기준"}
                    </span>
                  </div>
                )}
                {examMode === "개념 학습" && (
                  <div className="study-list">
                    {lessons.filter(matchesSubject).map((l) => (
                      <article key={l.id}>
                        <div>
                          <small>{l.subject}</small>
                          <button className="problem-link" onClick={() => open(l.id)}>
                            {l.title}
                          </button>
                        </div>
                        <span
                          className={`item-status ${state.completed.includes(l.id) ? "done" : ""}`}
                        >
                          {state.completed.includes(l.id) ? "완료" : "미완료"}
                        </span>
                        <button
                          className="row-open"
                          aria-label={`${l.title} 열기`}
                          onClick={() => open(l.id)}
                        >
                          →
                        </button>
                      </article>
                    ))}
                  </div>
                )}
                {(examMode === "필기 연습" || examMode === "오답 복습") && (
                  <QuestionList
                    key={examMode}
                    label="필기"
                    onOpen={open}
                    items={(examMode === "오답 복습" ? wrong : quizzes)
                      .filter(matchesSubject)
                      .map((q) => ({
                        id: q.id,
                        title: q.title,
                        category: q.subject,
                        status: state.quiz[q.id]
                          ? state.quiz[q.id].correct
                            ? "정답"
                            : "오답"
                          : "미완료",
                      }))}
                  />
                )}
                {examMode === "실기 연습" && (
                  <div className="study-list">
                    {practices.filter(matchesSubject).map((p) => (
                      <article key={p.id}>
                        <div>
                          <small>{p.subject}</small>
                          <button className="problem-link" onClick={() => open(p.id)}>
                            {p.title}
                          </button>
                        </div>
                        <span className="item-status">
                          {state.completed.includes(p.id) ? "검토 완료" : "미완료"}
                        </span>
                        <button
                          className="row-open"
                          aria-label={`${p.title} 열기`}
                          onClick={() => open(p.id)}
                        >
                          →
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "모의해킹" && (
              <>
                <p className="section-note">가상 자료 · 보고서 작성 · 예시 답안 직접 비교</p>
                <QuestionList
                  label="모의해킹"
                  onOpen={open}
                  items={pentests.map((p) => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    level: pentestDifficulty(p.category),
                    status: state.completed.includes(p.id) ? "완료" : "미완료",
                  }))}
                />
              </>
            )}

            {tab === "노트" && (
              <>
                <div className="filters">
                  <div>
                    {["전체", ...topics.map((t) => t.title), "CTF", "모의해킹", "정보보안기사"].map(
                      (g) => (
                        <button
                          key={g}
                          aria-pressed={noteGroup === g}
                          className={noteGroup === g ? "selected" : ""}
                          onClick={() => setNoteGroup(g)}
                        >
                          {g}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div className="notes-list">
                  {noteItems.filter(noteMatches).map((c) => (
                    <button key={c.id} onClick={() => open(c.id)}>
                      <div>
                        <small>{c.group}</small>
                        <strong>{c.title}</strong>
                        <p>{state.notes[c.id].slice(0, 110)}</p>
                      </div>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
                {!noteItems.filter(noteMatches).length && (
                  <p className="empty">저장한 노트가 없습니다.</p>
                )}
              </>
            )}
          </>
        )}

        {active && (
          <section className="modal problem-workspace" aria-labelledby="problem-title">
            <header className="modal-header">
              <span>
                {active.group}
                {exercise
                  ? ` · ${practiceDifficulty(exercise.topic)}`
                  : pentest
                    ? ` · ${pentestDifficulty(pentest.category)}`
                    : challenge
                      ? ` · ${challenge.level}`
                      : ""}
                {challenge ? ` · ${challenge.points}점` : ""}
              </span>
              <div className="workspace-navigation">
                <button
                  disabled={working || position <= 0}
                  onClick={() => open(sequence[position - 1].id)}
                  aria-label="이전 문제"
                >
                  ← 이전
                </button>
                <span>
                  {position + 1} / {sequence.length}
                </span>
                <button
                  disabled={working || position < 0 || position >= sequence.length - 1}
                  onClick={() => open(sequence[position + 1].id)}
                  aria-label="다음 문제"
                >
                  다음 →
                </button>
                <button
                  disabled={working}
                  className="close"
                  aria-label="학습 항목 닫기"
                  onClick={close}
                >
                  목록
                </button>
              </div>
            </header>
            <div className="modal-body">
              <div className="lesson-pane">
                <span className="pane-label">문제</span>
                <h1 id="problem-title" tabIndex={-1}>
                  {active.title}
                </h1>
                {challenge && (
                  <>
                    <pre className="problem-body">{challenge.body}</pre>
                    <div className="hints">
                      <button
                        className="text-button"
                        disabled={hint >= challenge.hints.length}
                        onClick={() => setHint((h) => h + 1)}
                      >
                        힌트 ({hint}/{challenge.hints.length})
                      </button>
                      {challenge.hints.slice(0, hint).map((h, i) => (
                        <p key={h}>
                          {i + 1}. {h}
                        </p>
                      ))}
                    </div>
                    <form onSubmit={submit}>
                      <label htmlFor="flag" className="input-label">
                        정답<span>{state.solved.includes(challenge.id) ? "해결 완료" : ""}</span>
                      </label>
                      <div className="submit-row">
                        <input
                          id="flag"
                          autoComplete="off"
                          placeholder="flag{...}"
                          maxLength={200}
                          value={flag}
                          onChange={(e) => setFlag(e.target.value)}
                          disabled={!canWrite}
                        />
                        <button className="primary" disabled={!canWrite || !flag.trim()}>
                          제출 · 해설
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {lesson && (
                  <div className="lesson-content">
                    <p className="section-note">{lesson.subject}</p>
                    <h3>자가점검</h3>
                    <ul>
                      {lesson.checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <div className="related">
                      <button className="text-button" onClick={() => open(lesson.related)}>
                        관련 CTF →
                      </button>
                      {completionButton(lesson.id)}
                    </div>
                  </div>
                )}

                {quiz && (
                  <div className="quiz-content">
                    <p className="section-note">
                      {quiz.subject} · 자체 제작
                      {state.quiz[quiz.id] ? ` · ${state.quiz[quiz.id].attempts}회 제출` : ""}
                    </p>
                    <fieldset disabled={!canWrite}>
                      <legend className="sr-only">정답 선택</legend>
                      {quiz.options.map((o, i) => (
                        <label className="quiz-option" key={o}>
                          <input
                            type="radio"
                            name="answer"
                            checked={choice === i}
                            onChange={() => {
                              setChoice(i);
                              setQuizFeedback(null);
                            }}
                          />
                          <span>
                            {i + 1}. {o}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    <button
                      className="primary"
                      disabled={!canWrite || choice === null}
                      onClick={() => void answerQuiz()}
                    >
                      제출 · 해설
                    </button>
                    <div className="related">
                      <button className="text-button" onClick={() => open(quiz.lesson)}>
                        관련 개념 →
                      </button>
                    </div>
                  </div>
                )}

                {practice && (
                  <div className="lesson-content">
                    <p className="section-note">
                      {practice.subject} · 서술형은 예시 답안과 직접 비교
                    </p>
                    <pre className="problem-body">{practice.prompt}</pre>
                  </div>
                )}
                {pentest && (
                  <div className="lesson-content">
                    <p className="section-note">{pentest.category} · 가상 실습</p>
                    <details className="environment-details">
                      <summary>실습 범위</summary>
                      <p>{pentest.scope}</p>
                    </details>
                    <div className="section-heading spaced">
                      <h3>진단 자료</h3>
                      <a className="text-button" href={`/labs/${pentest.id}.txt`} download>
                        다운로드
                      </a>
                    </div>
                    <pre className="problem-body">{pentest.evidence}</pre>
                    {pentest.id === "pentest-access" && (
                      <section className="lab-console">
                        <h3>요청 비교</h3>
                        <div className="lab-controls">
                          <label>
                            버전
                            <select
                              aria-label="실습 버전"
                              value={labMode}
                              onChange={(e) => {
                                setLabMode(e.target.value);
                                setLabResult("");
                              }}
                            >
                              <option value="vulnerable">취약 버전</option>
                              <option value="fixed">수정 버전</option>
                            </select>
                          </label>
                          <label>
                            사용자
                            <select
                              aria-label="실습 사용자"
                              value={labUser}
                              onChange={(e) => {
                                setLabUser(e.target.value);
                                setLabResult("");
                              }}
                            >
                              <option>alice</option>
                              <option>bob</option>
                              <option>unknown</option>
                            </select>
                          </label>
                          <label>
                            문서
                            <select
                              aria-label="실습 문서"
                              value={labDocument}
                              onChange={(e) => {
                                setLabDocument(e.target.value);
                                setLabResult("");
                              }}
                            >
                              <option value="1">1 (alice)</option>
                              <option value="2">2 (bob)</option>
                              <option value="99">99 (없음)</option>
                            </select>
                          </label>
                          <button
                            className="primary"
                            disabled={working}
                            onClick={() => void runLab()}
                          >
                            실행 · 해설
                          </button>
                        </div>
                      </section>
                    )}
                    <h3>수행 과제</h3>
                    <ol>
                      {pentest.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {exercise && <ExecutionEditor exercise={exercise} lab={lab} />}
                {!signedIn && (
                  <p className="notice">
                    <a href="/signin-with-chatgpt?return_to=%2F" target="_top">
                      로그인
                    </a>{" "}
                    후 풀이 기록을 저장할 수 있습니다.
                  </p>
                )}
                {(practice || pentest) && !exercise ? (
                  <section className="answer-editor">{noteEditor}</section>
                ) : (
                  <details className="workspace-notes">
                    <summary>{practice || pentest ? "답안 · 보고서" : "풀이 노트"}</summary>
                    {noteEditor}
                  </details>
                )}
              </div>
              <aside className="result-pane" ref={resultPane} aria-label="결과와 해설">
                <span className="pane-label">이론 · 결과 · 해설</span>
                {exercise && (
                  <>
                    <ExecutionOutput exercise={exercise} lab={lab} />
                    {progressMessage && (
                      <p className="progress-message" role="status">
                        {progressMessage}
                      </p>
                    )}
                  </>
                )}
                {challenge && (
                  <>
                    <h3>핵심 이론</h3>
                    <p className="explanation-text">{challenge.theory ?? challenge.summary}</p>
                    {message && (
                      <p role="status" className={correct ? "feedback success" : "feedback error"}>
                        {message}
                      </p>
                    )}
                    {ctfFeedback?.solution ? (
                      <>
                        <h3 className="spaced">정답</h3>
                        <pre className="solution-code">{ctfFeedback.solution.answer}</pre>
                        <h3>해설</h3>
                        <ul className="explanation-list">
                          {ctfFeedback.solution.explanation.map((text) => (
                            <li key={text}>{text}</li>
                          ))}
                        </ul>
                        {ctfFeedback.solution.code && (
                          <pre className="solution-code">
                            <code>
                              <CodeText source={ctfFeedback.solution.code} />
                            </code>
                          </pre>
                        )}
                        <section className="defense-task">
                          <h3>방어 과제</h3>
                          <p>{challenge.defense}</p>
                        </section>
                      </>
                    ) : (
                      <>
                        <p className="result-placeholder">
                          정답을 제출하면 채점 결과와 풀이가 표시됩니다.
                        </p>
                        <button
                          className="text-button"
                          disabled={!canWrite}
                          onClick={() => void revealCtf()}
                        >
                          정답·해설 먼저 보기
                        </button>
                      </>
                    )}
                  </>
                )}
                {quiz && (
                  <>
                    <h3>핵심 이론</h3>
                    <p className="explanation-text">
                      {quiz.theory ?? lessons.find((l) => l.id === quiz.lesson)?.concept}
                    </p>
                    {quizFeedback ? (
                      <>
                        <div
                          role="status"
                          className={quizFeedback.correct ? "feedback success" : "feedback error"}
                        >
                          <strong>{quizFeedback.correct ? "정답" : "오답"}</strong>
                        </div>
                        <h3 className="spaced">정답</h3>
                        <p className="reference-answer">
                          {(quizFeedback.answer ?? 0) + 1}. {quiz.options[quizFeedback.answer ?? 0]}
                        </p>
                        <h3>해설</h3>
                        <p className="explanation-text">{quizFeedback.explanation}</p>
                      </>
                    ) : (
                      <p className="result-placeholder">
                        왼쪽에서 답을 제출하면 정답과 해설이 표시됩니다.
                      </p>
                    )}
                    {message && (
                      <p role="alert" className="feedback error">
                        {message}
                      </p>
                    )}
                  </>
                )}
                {lesson && (
                  <>
                    <h3>핵심 이론</h3>
                    <p className="explanation-text">{lesson.concept}</p>
                    <h3>적용 사례</h3>
                    <p className="explanation-text">{lesson.example}</p>
                    <h3 className="spaced">확인할 내용</h3>
                    <ul className="explanation-list">
                      {lesson.checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}
                {(practice || pentest) && (
                  <>
                    <h3>핵심 이론</h3>
                    <p className="explanation-text">
                      {pentest?.concept ?? lessons.find((l) => l.id === practice?.related)?.concept}
                    </p>
                    {labResult && (
                      <>
                        <h3 className="spaced">요청 결과</h3>
                        <pre className="terminal-output">{labResult}</pre>
                      </>
                    )}
                    {reviewed || (exercise && lab.result) ? (
                      <>
                        <h3 className="spaced">
                          예시 답안 <span className="section-note">직접 비교</span>
                        </h3>
                        <p className="reference-answer">{writtenSolutions[active.id]}</p>
                        <h3>검토 기준</h3>
                        <ul className="explanation-list">
                          {(practice?.criteria || pentest?.checks || []).map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                        {completionButton(active.id)}
                      </>
                    ) : (
                      <>
                        {!exercise && (
                          <p className="result-placeholder">
                            왼쪽에서 답안을 저장하면 예시 답안과 검토 기준이 표시됩니다.
                          </p>
                        )}
                        <button
                          className="text-button review-preview"
                          onClick={() => setReviewed(true)}
                        >
                          예시 답안 먼저 보기
                        </button>
                      </>
                    )}
                  </>
                )}
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
