import { exercises } from "../exercises";
import type { ExecutionResult } from "./types";
let run: ((source: string, id: string, params?: string) => ExecutionResult | Promise<ExecutionResult>) | undefined;
let exerciseId = "";
let running = false;
self.onmessage = async (event: MessageEvent<{type: "init" | "run"; id?: string; source?: string; params?: string; requestId?: number}>) => {
 const message = event.data;
 try {
  if (message.type === "init") {
   const exercise = exercises.find(e => e.id === message.id);
   if (!exercise) throw new Error("실습을 찾을 수 없습니다.");
   exerciseId = exercise.id;
   if (exercise.engine === "linux") {
    const { createLinuxRuntime } = await import("./linux");
    run = (await createLinuxRuntime()).run;
   } else {
    const [{ default: initSqlJs }, { createSqlRuntime }, { default: wasmUrl }] = await Promise.all([import("sql.js"), import("./sql"), import("sql.js/dist/sql-wasm.wasm?url")]);
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    run = createSqlRuntime(SQL).run;
   }
   self.postMessage({type: "ready"}); return;
  }
  if (!run || running) return;
  running = true; const start = performance.now();
  try {
   const result = await run(message.source || "", exerciseId, message.params);
   self.postMessage({type: "result", requestId: message.requestId, result: {...result, elapsedMs: Math.round(performance.now() - start)}});
  } finally { running = false; }
 } catch (e) { self.postMessage({type:"error", requestId:message.requestId, error:(e as Error).message}); }
};
