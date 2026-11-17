"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Monitor, Smartphone } from "lucide-react";
import { CodeEditor, CodeText } from "../editor/code-editor";
import { codingGroups, codingTasks } from "../../lib/content/coding/tasks";
import type { CodingGroup, CodingSource, CodingTask } from "../../lib/content/coding/types";
import { codingDocument, codingPreview } from "../../lib/coding/preview";
import { isCodingRunShortcut } from "../../lib/coding/keyboard";
import {
  codingStorageKey,
  emptyCodingProgress,
  initialCodingSource,
  parseCodingProgress,
  type CodingProgress,
} from "../../lib/coding/storage";
import type { CodingResult } from "../../lib/coding/grading";

export function CodingCourse({
  viewerKey,
  completed,
  onComplete,
}: {
  viewerKey: string;
  completed: string[];
  onComplete: (id: string, completed?: boolean) => Promise<string>;
}) {
  const [progress, setProgress] = useState<CodingProgress>(emptyCodingProgress);
  const progressRef = useRef(progress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const readFailed = useRef(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [group, setGroup] = useState<CodingGroup>("HTML 기초");
  const key = codingStorageKey(viewerKey);
  useEffect(() => {
    try {
      const saved = parseCodingProgress(localStorage.getItem(key), codingTasks);
      progressRef.current = saved;
      setProgress(saved);
      setSelected(saved.lastId);
      setGroup(codingTasks.find((item) => item.id === saved.lastId)?.group ?? "HTML 기초");
      readFailed.current = false;
    } catch {
      readFailed.current = true;
      setStorageError(
        "저장된 코드를 읽을 수 없습니다. 원본은 보존하며 이번 코드는 다운로드로 보관하세요.",
      );
    }
    setReady(true);
  }, [key]);

  function update(next: CodingProgress) {
    progressRef.current = next;
    setProgress(next);
    if (readFailed.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError("브라우저 저장에 실패했습니다. 탭을 닫기 전에 HTML을 다운로드하세요.");
    }
  }
  function open(task: CodingTask) {
    const current = progressRef.current;
    update({
      ...current,
      lastId: task.id,
      drafts: { ...current.drafts, [task.id]: { ...initialCodingSource(task, current) } },
    });
    setGroup(task.group);
    setSelected(task.id);
  }
  function edit(id: string, source: CodingSource) {
    const current = progressRef.current;
    update({ ...current, drafts: { ...current.drafts, [id]: source } });
  }
  async function pass(id: string) {
    const current = progressRef.current;
    update({ ...current, completed: Array.from(new Set([...current.completed, id])) });
    return onComplete(id);
  }
  async function resetTask(id: string) {
    const current = progressRef.current;
    const drafts = { ...current.drafts };
    delete drafts[id];
    update({ ...current, drafts, completed: current.completed.filter((item) => item !== id) });
    return onComplete(id, false);
  }
  function close() {
    setSelected(null);
    update({ ...progressRef.current, lastId: null });
  }
  const task = codingTasks.find((item) => item.id === selected);
  const finished = new Set([...completed, ...progress.completed]);
  if (!ready) return <p role="status">작성한 코드 불러오는 중…</p>;
  if (task)
    return (
      <CodingWorkspace
        key={`${viewerKey}:${task.id}`}
        task={task}
        initial={initialCodingSource(task, progress)}
        onEdit={(source) => edit(task.id, source)}
        onPass={() => pass(task.id)}
        onReset={() => resetTask(task.id)}
        onOpen={open}
        onClose={close}
        storageError={storageError}
      />
    );
  return (
    <section className="coding-course" aria-label="코드 짜기 학습">
      <div className="page-heading">
        <h1>코드 짜기</h1>
        <span>
          {codingTasks.filter((item) => finished.has(item.id)).length} / {codingTasks.length} 완료
        </span>
      </div>
      {storageError && (
        <p className="notice error" role="alert">
          {storageError}
        </p>
      )}
      <div className="coding-groups" aria-label="코드 짜기 분류">
        {codingGroups.map((name) => (
          <button key={name} aria-pressed={group === name} onClick={() => setGroup(name)}>
            {name}
            <span>{codingTasks.filter((item) => item.group === name).length}</span>
          </button>
        ))}
      </div>
      <p className="coding-group-description">
        {group === "웹사이트 만들기"
          ? "앞 단계의 코드를 이어서 포트폴리오 사이트를 완성합니다."
          : `${group === "HTML 기초" ? "요소와 문서 구조" : "스타일과 화면 배치"}를 직접 작성합니다. 실행은 Ctrl+R.`}
      </p>
      <ol className="coding-task-list">
        {codingTasks
          .filter((item) => item.group === group)
          .map((item, index) => (
            <li key={item.id}>
              <button onClick={() => open(item)}>
                <span className="coding-step">{String(index + 1).padStart(2, "0")}</span>
                <span className="coding-task-name">
                  {item.title}
                  <small>
                    {item.level}
                    {item.previousId ? " · 이전 코드 이어쓰기" : ""}
                  </small>
                </span>
                <span className={finished.has(item.id) ? "coding-done" : "muted"}>
                  {finished.has(item.id) ? "완료" : progress.drafts[item.id] ? "작성 중" : "시작"}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
      </ol>
      <p className="coding-storage-note">
        코드는 이 브라우저에 자동 저장됩니다. 각 단계는 원하는 순서로 열 수 있습니다.
      </p>
    </section>
  );
}

type Run = {
  token: string;
  source: CodingSource;
  preview: string;
  desktop: string;
  mobile: string;
};
function CodingWorkspace({
  task,
  initial,
  onEdit,
  onPass,
  onReset,
  onOpen,
  onClose,
  storageError,
}: {
  task: CodingTask;
  initial: CodingSource;
  onEdit: (source: CodingSource) => void;
  onPass: () => Promise<string>;
  onReset: () => Promise<string>;
  onOpen: (task: CodingTask) => void;
  onClose: () => void;
  storageError: string;
}) {
  const [source, setSource] = useState(initial);
  const [language, setLanguage] = useState<"html" | "css">(
    task.group === "CSS 기초" ? "css" : "html",
  );
  const [rightTab, setRightTab] = useState("미리보기");
  const [mobile, setMobile] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [results, setResults] = useState<CodingResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [resetPrompt, setResetPrompt] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const desktopFrame = useRef<HTMLIFrameElement>(null);
  const mobileFrame = useRef<HTMLIFrameElement>(null);
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const runRef = useRef<Run | null>(null);
  const currentSource = useRef(source);
  const parts = useRef<Record<string, CodingResult[]>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const alive = useRef(true);
  const performRun = useRef<() => void>(() => {});
  const passRef = useRef(onPass);
  passRef.current = onPass;
  currentSource.current = source;
  const sequence = codingTasks.filter((item) => item.group === task.group);
  const index = sequence.findIndex((item) => item.id === task.id);
  const nextTask =
    sequence[index + 1] ?? codingTasks[codingTasks.findIndex((item) => item.id === task.id) + 1];
  const dirty = !!run && (run.source.html !== source.html || run.source.css !== source.css);
  const success = !!results?.length && results.every((result) => result.passed) && !dirty;

  function execute() {
    clearTimeout(timer.current);
    const token = crypto.randomUUID();
    const code = { ...currentSource.current };
    const snapshot: Run = {
      token,
      source: code,
      preview: codingPreview(code, `${token}-preview`, []),
      desktop: codingPreview(
        code,
        `${token}-desktop`,
        task.checks.filter((check) => !check.viewport),
      ),
      mobile: codingPreview(
        code,
        `${token}-mobile`,
        task.checks.filter((check) => check.viewport === "mobile"),
      ),
    };
    runRef.current = snapshot;
    parts.current = {};
    setRun(snapshot);
    setResults(null);
    setFeedback("");
    setRunning(true);
    setRightTab("미리보기");
    timer.current = setTimeout(() => {
      runRef.current = null;
      setRunning(false);
      setFeedback("미리보기 응답이 없습니다. 코드를 확인한 뒤 다시 실행하세요.");
    }, 5000);
  }
  performRun.current = execute;
  useEffect(() => {
    alive.current = true;
    document.getElementById("coding-title")?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (isCodingRunShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) performRun.current();
      }
    };
    const message = (event: MessageEvent) => {
      const current = runRef.current;
      if (!current || event.data?.channel !== "codehack-coding") return;
      const role =
        event.source === desktopFrame.current?.contentWindow
          ? "desktop"
          : event.source === mobileFrame.current?.contentWindow
            ? "mobile"
            : event.source === previewFrame.current?.contentWindow
              ? "preview"
              : null;
      if (!role || event.data.token !== `${current.token}-${role}`) return;
      if (role === "preview") {
        if (event.data.type === "run") performRun.current();
        return;
      }
      if (event.data.type !== "results" || parts.current[role]) return;
      const expected = task.checks.filter((check) =>
        role === "mobile" ? check.viewport === "mobile" : !check.viewport,
      );
      const received = event.data.results;
      if (
        !Array.isArray(received) ||
        received.length !== expected.length ||
        received.some(
          (result, i) => result.label !== expected[i].label || typeof result.passed !== "boolean",
        )
      )
        return;
      parts.current[role] = received;
      if (!parts.current.desktop || !parts.current.mobile) return;
      clearTimeout(timer.current);
      const combined = task.checks.map((check) =>
        (check.viewport ? parts.current.mobile : parts.current.desktop).find(
          (result) => result.label === check.label,
        )!,
      );
      setResults(combined);
      setRunning(false);
      if (
        combined.every((result) => result.passed) &&
        currentSource.current.html === current.source.html &&
        currentSource.current.css === current.source.css
      ) {
        setSaving(true);
        void passRef
          .current()
          .then((text) => {
            if (alive.current && runRef.current?.token === current.token) setFeedback(text);
          })
          .finally(() => {
            if (alive.current) setSaving(false);
          });
      }
    };
    window.addEventListener("keydown", keydown, true);
    window.addEventListener("message", message);
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
      window.removeEventListener("keydown", keydown, true);
      window.removeEventListener("message", message);
    };
  }, [task]);
  function change(value: string) {
    const next = { ...source, [language]: value };
    currentSource.current = next;
    setSource(next);
    onEdit(next);
  }
  function reset() {
    const next = { ...task.starter };
    setSource(next);
    currentSource.current = next;
    void onReset().then((text) => {
      if (alive.current) setFeedback(text);
    });
    clearTimeout(timer.current);
    runRef.current = null;
    setRun(null);
    setResults(null);
    setRunning(false);
    setFeedback("");
    setResetPrompt(false);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([codingDocument(source, task.title)], { type: "text/html;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = task.group === "웹사이트 만들기" ? "portfolio.html" : `${task.id}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback("HTML 파일을 다운로드했습니다.");
  }
  return (
    <section className="coding-workspace" aria-labelledby="coding-title">
      <header className="coding-workspace-header">
        <span>
          코드 짜기 <span className="muted">/</span> {task.group}
        </span>
        <div>
          <button
            aria-label="이전 코딩 단계"
            disabled={index === 0}
            onClick={() => onOpen(sequence[index - 1])}
          >
            <ArrowLeft size={16} />
          </button>
          <span>
            {String(index + 1).padStart(2, "0")} / {sequence.length}
          </span>
          <button
            aria-label="다음 코딩 단계"
            disabled={!nextTask}
            onClick={() => nextTask && onOpen(nextTask)}
          >
            <ArrowRight size={16} />
          </button>
          <button onClick={onClose}>목록</button>
        </div>
      </header>
      {storageError && (
        <p className="notice error" role="alert">
          {storageError}
        </p>
      )}
      <div className="coding-columns">
        <div className="coding-source-pane">
          <span className="coding-level">{task.level}</span>
          <h1 id="coding-title" tabIndex={-1}>
            {task.title}
          </h1>
          <p className="coding-prompt">{task.prompt}</p>
          <details className="coding-requirements" open={task.checks.length <= 5}>
            <summary>
              요구사항 <span>{task.checks.length}</span>
            </summary>
            <ul>
              {task.checks.map((check, i) => (
                <li key={i}>{check.label}</li>
              ))}
            </ul>
          </details>
          <div className="coding-editor-tabs" aria-label="편집할 파일">
            <button aria-pressed={language === "html"} onClick={() => setLanguage("html")}>
              HTML
            </button>
            <button aria-pressed={language === "css"} onClick={() => setLanguage("css")}>
              CSS
            </button>
            <span>Ctrl+R</span>
          </div>
          <CodeEditor
            key={language}
            id={`coding-${language}`}
            label={`${language.toUpperCase()} 코드`}
            value={source[language]}
            onChange={change}
            onExecute={execute}
            disabled={false}
            language={language}
          />
          <div className="coding-actions">
            <button
              className="secondary"
              disabled={running || saving}
              onClick={() => setResetPrompt(true)}
            >
              초기화
            </button>
            <small role="status">{storageError ? "저장 실패" : "브라우저에 자동 저장됨"}</small>
            <button className="primary" onClick={execute} aria-keyshortcuts="Control+R">
              {running ? "다시 실행" : "실행 · 채점"}
            </button>
          </div>
          {resetPrompt && (
            <div className="coding-reset" role="alert">
              <p>이 단계의 코드와 완료 기록을 초기화할까요?</p>
              <button onClick={() => setResetPrompt(false)}>취소</button>
              <button onClick={reset}>코드 초기화</button>
            </div>
          )}
          <p className="coding-editor-note">
            HTML 탭에는 본문 요소를 작성합니다. 이미지 예제는 avatar.svg를 사용하세요.
          </p>
        </div>
        <div className="coding-result-pane">
          <div className="coding-output-tabs">
            <div aria-label="결과 보기">
              {["미리보기", "이론 · 풀이"].map((name) => (
                <button
                  key={name}
                  aria-pressed={rightTab === name}
                  onClick={() => setRightTab(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div aria-label="미리보기 화면 크기">
              <button
                aria-label="데스크톱 미리보기"
                aria-pressed={!mobile}
                onClick={() => setMobile(false)}
              >
                <Monitor size={19} />
              </button>
              <button
                aria-label="모바일 미리보기"
                aria-pressed={mobile}
                onClick={() => setMobile(true)}
              >
                <Smartphone size={19} />
              </button>
            </div>
          </div>
          <div hidden={rightTab !== "미리보기"}>
            <div className={`coding-preview${mobile ? " mobile" : ""}`}>
              {run ? (
                <iframe
                  ref={previewFrame}
                  key={`${run.token}-preview`}
                  title="내 웹사이트 미리보기"
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  srcDoc={run.preview}
                />
              ) : (
                <div className="coding-preview-empty">
                  <Monitor size={28} />
                  <p>작성한 웹사이트가 여기에 표시됩니다.</p>
                  <span>실행 · 채점 또는 Ctrl+R</span>
                </div>
              )}
            </div>
            <p className="coding-preview-size">
              {mobile ? "모바일 · 최대 390px" : "현재 작업 영역 너비"} · 배치 검사는 960px / 390px
            </p>
            <section className="coding-results" aria-label="코딩 채점 결과" aria-live="polite">
              <header>
                <h2>채점 결과</h2>
                <span className={success ? "coding-done" : "muted"}>
                  {running
                    ? "확인 중…"
                    : results
                      ? `${results.filter((result) => result.passed).length} / ${results.length} 통과`
                      : "실행 대기"}
                </span>
              </header>
              {dirty && (
                <p className="coding-stale">코드가 변경되었습니다. Ctrl+R로 다시 실행하세요.</p>
              )}
              {results ? (
                <ul>
                  {results.map((result, i) => (
                    <li key={i}>
                      <span className={result.passed ? "coding-done" : "coding-fail"}>
                        {result.passed ? <Check size={16} /> : "○"}
                      </span>
                      {result.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>실행하면 요구사항별 결과를 확인할 수 있습니다.</p>
              )}
            </section>
          </div>
          {rightTab === "이론 · 풀이" && (
            <section className="coding-theory">
              <h2>핵심 이론</h2>
              <p>{task.theory}</p>
              <button
                className="secondary"
                aria-expanded={showHint}
                onClick={() => setShowHint(!showHint)}
              >
                힌트 {showHint ? "닫기" : "보기"}
              </button>
              {showHint && <p>{task.hint}</p>}
              <button
                className="secondary"
                aria-expanded={showSolution}
                onClick={() => setShowSolution(!showSolution)}
              >
                예시 풀이 {showSolution ? "닫기" : "보기"}
              </button>
              {showSolution && (
                <>
                  <p>{task.explanation}</p>
                  <h3>HTML</h3>
                  <pre>
                    <CodeText source={task.solution.html} language="html" />
                  </pre>
                  {task.solution.css && (
                    <>
                      <h3>CSS</h3>
                      <pre>
                        <CodeText source={task.solution.css} language="css" />
                      </pre>
                    </>
                  )}
                </>
              )}
            </section>
          )}
          <div className="coding-result-actions">
            <button className="secondary" onClick={download}>
              <Download size={15} /> HTML 다운로드
            </button>
            {success && nextTask && (
              <button className="primary" onClick={() => onOpen(nextTask)}>
                다음 단계 <ArrowRight size={15} />
              </button>
            )}
            {success && !nextTask && <span className="coding-done">사이트 완성</span>}
          </div>
          {feedback && (
            <p className="coding-feedback" role="status">
              {feedback}
            </p>
          )}
        </div>
      </div>
      {run && (
        <div aria-hidden="true" className="coding-validation-frames">
          <iframe
            tabIndex={-1}
            ref={desktopFrame}
            key={`${run.token}-desktop`}
            title="데스크톱 배치 검사"
            sandbox="allow-scripts"
            srcDoc={run.desktop}
            width="960"
            height="800"
          />
          <iframe
            tabIndex={-1}
            ref={mobileFrame}
            key={`${run.token}-mobile`}
            title="모바일 배치 검사"
            sandbox="allow-scripts"
            srcDoc={run.mobile}
            width="390"
            height="844"
          />
        </div>
      )}
    </section>
  );
}
