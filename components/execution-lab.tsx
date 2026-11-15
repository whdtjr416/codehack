"use client";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../lib/exercises";
import type { ExecutionResult } from "../lib/runtime/types";
import ExecutionWorker from "../lib/runtime/execution.worker?worker";
import { sqlSchema } from "../lib/runtime/sql";
import { CodeEditor, CodeText } from "./code-editor";

type Phase = "loading" | "ready" | "running" | "stopped";
export function useExecutionLab(exercise: Exercise | undefined, onPass: () => Promise<void>) {
 const [phase, setPhase] = useState<Phase>("loading");
 const [source, setSource] = useState("");
 const [params, setParams] = useState("[]");
 const [result, setResult] = useState<ExecutionResult | null>(null);
 const [error, setError] = useState("");
 const [generation, setGeneration] = useState(0);
 const [history, setHistory] = useState<{ source: string; correct: boolean }[]>([]);
 const worker = useRef<Worker | null>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const sequence = useRef(0);
 const pass = useRef(onPass); pass.current = onPass;
 const lock = useRef(false);
 useEffect(() => {
  if (!exercise) { setResult(null); setError(""); setPhase("ready"); return; }
  setPhase("loading"); setError(""); setResult(null); setSource(""); setParams(exercise.params || "[]"); setHistory([]);
  lock.current = false;
  let instance: Worker;
  try { instance = new ExecutionWorker(); }
  catch { setPhase("stopped"); setError("실행기를 시작하지 못했습니다. 환경 초기화로 다시 시도하세요."); return; }
  worker.current = instance;
  const stop = (message: string) => { clearTimeout(timer.current); instance.terminate(); worker.current = null; lock.current = false; setPhase("stopped"); setError(message); };
  timer.current = setTimeout(() => stop("실습 로딩에 실패했습니다. 환경 초기화로 다시 시도하세요."), 20000);
  instance.onmessage = (event: MessageEvent<{type: string; result?: ExecutionResult; error?: string; requestId?: number}>) => {
   if (worker.current !== instance) return;
   const message = event.data;
   if (message.type === "ready") { clearTimeout(timer.current); setPhase("ready"); return; }
   if (message.requestId !== undefined && message.requestId !== sequence.current) return;
   clearTimeout(timer.current); lock.current = false;
   if (message.type === "error") { setError(message.error || "실행 오류"); setPhase(message.requestId === undefined ? "stopped" : "ready"); return; }
   if (message.result) {
    setResult(message.result); setPhase("ready");
    if (message.result.correct) void pass.current();
   }
  };
  instance.onerror = event => { event.preventDefault(); stop("실행기를 불러오지 못했습니다. 환경 초기화로 다시 시도하세요."); };
  instance.postMessage({type:"init",id:exercise.id});
  return () => { clearTimeout(timer.current); instance.terminate(); if (worker.current === instance) worker.current = null; };
 }, [exercise?.id, generation]);
 function cancel() { clearTimeout(timer.current); worker.current?.terminate(); worker.current = null; lock.current = false; setPhase("stopped"); setResult(null); setError("실행을 중지했습니다. 환경 초기화 후 다시 실행하세요."); }
 function execute() {
  if (!worker.current || phase !== "ready" || lock.current || !source.trim()) return;
  lock.current = true; setPhase("running"); setResult(null); setError("");
  const current = worker.current; const requestId = ++sequence.current;
  setHistory(h => [...h.slice(-9), { source, correct: false }]);
  current.postMessage({type:"run",source,params,requestId});
  timer.current = setTimeout(() => {
   current.terminate(); if (worker.current === current) worker.current = null;
   lock.current = false; setPhase("stopped"); setResult(null); setError("실행 제한 시간(4초)을 초과했습니다. 환경 초기화 후 쿼리나 반복문을 줄여보세요.");
  }, 4000);
 }
 return { phase, source, setSource, params, setParams, result, error, history, execute, cancel, reset: () => setGeneration(g => g + 1) };
}
export type ExecutionLab = ReturnType<typeof useExecutionLab>;

export function ExecutionEditor({exercise, lab}: {exercise: Exercise; lab: ExecutionLab}) {
 return <section className="execution-editor">
  <p className="task-prompt">{exercise.prompt}</p>
  <details className="environment-details"><summary>{exercise.engine === "linux" ? "파일 · 지원 명령어" : "테이블 · 데이터 확인"}</summary>
   {exercise.engine === "linux" ? <><pre>/home/student/\n  config.env\n  logs/app.log\n  logs/auth.log</pre><p>ls · pwd · cd · cat · chmod · stat · grep · wc · head · tail · sort · uniq · cut · mkdir · cp · mv · rm · touch · find · sed · awk · echo · printf · tee</p><p>가상 Bash 환경입니다. 파일 변경은 실습을 닫거나 초기화할 때 사라집니다.</p></> : <><pre>{sqlSchema}</pre><p>users와 documents, login_events가 준비되어 있습니다. SELECT * FROM users; 등으로 내용을 확인할 수 있습니다.</p><p>SQLite 실습 DB입니다. 변경은 실습을 닫거나 초기화할 때 사라집니다.</p></>}
  </details>
  <label className="input-label" htmlFor="execution-source">{exercise.engine === "linux" ? "명령어" : "SQL"}<span>Ctrl / ⌘ + Enter</span></label>
  <CodeEditor value={lab.source} onChange={lab.setSource} onExecute={lab.execute} disabled={lab.phase === "running"} language={exercise.engine === "linux" ? "shell" : "sql"} />
  {exercise.engine === "sql" && <details className="parameters" open={exercise.params ? true : undefined}><summary>입력 매개변수</summary><label className="sr-only" htmlFor="sql-params">SQL 매개변수 JSON</label><input id="sql-params" value={lab.params} onChange={e => lab.setParams(e.target.value)} disabled={lab.phase === "running"} maxLength={2000} spellCheck={false} /><small>? 순서대로 JSON 배열에 입력</small></details>}
  <div className="execution-actions"><button className="secondary" disabled={lab.phase === "running"} onClick={lab.reset}>환경 초기화</button>{lab.phase === "running" ? <button className="secondary" onClick={lab.cancel}>실행 중지</button> : <button className="primary" disabled={lab.phase !== "ready" || !lab.source.trim()} onClick={lab.execute}>{lab.phase === "loading" ? "준비 중…" : "실행 · 채점"}</button>}</div>
  {lab.history.length > 0 && <details className="execution-history"><summary>입력 기록 {lab.history.length}</summary>{lab.history.map((h,i) => <button key={i} disabled={lab.phase === "running"} onClick={() => lab.setSource(h.source)}>{h.source}</button>)}</details>}
 </section>;
}
export function ExecutionOutput({exercise,lab}: {exercise:Exercise;lab:ExecutionLab}) {
 return <>
  {lab.phase === "running" && <p className="result-placeholder" role="status">실행 중…</p>}
  {lab.error && <p className="feedback error" role="alert">{lab.error}</p>}
  {lab.result && <div className="execution-output">
   <div className={`feedback ${lab.result.correct ? "success" : "error"}`} role="status"><strong>{lab.result.correct ? "정답" : lab.result.exitCode ? "실행 오류" : "다시 확인"}</strong><p>{lab.result.detail}</p></div>
   <div className="section-heading spaced"><h3>실행 결과</h3><span className="section-note">{lab.result.elapsedMs}ms · 종료 {lab.result.exitCode}</span></div>
   {lab.result.stdout && <pre className="terminal-output">{lab.result.stdout}</pre>}
   {lab.result.stderr && <pre className="terminal-output output-error">{lab.result.stderr}</pre>}
   {lab.result.tables.map((table,i) => <div className="table-wrap result-table" key={i}><table><thead><tr>{table.columns.map((column,j) => <th key={j}>{column}</th>)}</tr></thead><tbody>{table.values.map((row,j) => <tr key={j}>{row.map((value,k) => <td key={k}>{value === null ? "NULL" : String(value)}</td>)}</tr>)}</tbody></table>{!table.values.length && <p className="section-note">0행</p>}</div>)}
   {!lab.result.stdout && !lab.result.stderr && !lab.result.tables.length && <p className="section-note">출력 없음</p>}
   {lab.result.truncated && <p className="section-note">결과는 200행까지 표시합니다. 조건을 좁혀 다시 실행하세요.</p>}
   {lab.result.snapshot && <pre className="state-snapshot">{lab.result.snapshot}</pre>}
   <h3 className="spaced">정답 예시</h3><pre className="solution-code"><code><CodeText source={exercise.solution} language={exercise.engine === "linux" ? "shell" : "sql"} /></code></pre>
   <h3>해설</h3><ul className="explanation-list">{exercise.explanation.map(text => <li key={text}>{text}</li>)}</ul>
  </div>}
  {!lab.result && !lab.error && lab.phase !== "running" && <p className="result-placeholder">왼쪽에서 실행하면 결과·정답·해설이 여기에 표시됩니다.</p>}
 </>;
}
