import { Bash } from "just-bash/browser";
import { trainingLs } from "./ls.ts";
import type { ExecutionResult } from "./types.ts";
export const ROOT = "/home/student";
export const CONFIG = "APP_ENV=training\nLOG_LEVEL=info\n";
export const APP_LOG = "09:00 INFO started\n09:02 ERROR database timeout\n09:03 WARN retrying\n09:04 ERROR login rejected\n09:05 INFO recovered\n";
export const AUTH_LOG = "user=alice result=failed\nuser=bob result=success\nuser=alice result=failed\nuser=bob result=failed\nuser=alice result=success\n";
export const shellCommands = ["ls", "cat", "pwd", "cd", "chmod", "stat", "grep", "wc", "head", "tail", "sort", "uniq", "cut", "echo", "printf", "mkdir", "cp", "mv", "rm", "touch", "find", "sed", "awk", "tee", "whoami", "help"];
export async function createLinuxRuntime() {
 const shell = new Bash({ cwd: ROOT, env: { HOME: ROOT, USER: "student" }, files: {
  [`${ROOT}/config.env`]: CONFIG, [`${ROOT}/logs/app.log`]: APP_LOG, [`${ROOT}/logs/auth.log`]: AUTH_LOG,
 }, customCommands: [trainingLs], commands: ["pwd", "cat", "chmod", "stat", "grep", "wc", "head", "tail", "sort", "uniq", "cut", "echo", "printf", "mkdir", "cp", "mv", "rm", "touch", "find", "sed", "awk", "tee", "whoami", "help"],
 executionLimits: { maxExecutionTimeMs: 2000, maxCommandCount: 500, maxLoopIterations: 1000, maxAwkIterations: 1000, maxSedIterations: 1000, maxSourceBytes: 12000, maxOutputSize: 32000, maxFileSystemBytes: 2 * 1024 * 1024, maxLiveBytes: 8 * 1024 * 1024, maxStringLength: 65536, maxArrayElements: 10000 } });
 await shell.fs.chmod(`${ROOT}/config.env`, 0o666);
 let cwd = ROOT;
 let env: Record<string,string> = { HOME: ROOT, USER: "student" };
 return { async run(source: string, id: string): Promise<ExecutionResult> {
  if (!source.trim() || source.length > 12000) throw new Error("명령어는 1~12,000자로 입력하세요.");
  const result = await shell.exec(source, { cwd, env });
  cwd = result.env.PWD || cwd; env = result.env;
  let correct = false, snapshot = `현재 경로: ${cwd}`;
  try {
   const stat = await shell.fs.stat(`${ROOT}/config.env`);
   const content = await shell.fs.readFile(`${ROOT}/config.env`);
   snapshot += `\nconfig.env 권한: ${(stat.mode & 0o777).toString(8)}`;
   if (id === "linux-permissions") correct = (stat.mode & 0o777) === 0o640 && content === CONFIG;
   if (id === "linux-backup") correct = content === CONFIG && await shell.fs.readFile(`${ROOT}/backup/config.env`) === CONFIG;
  } catch { snapshot += "\n파일 상태를 다시 확인하세요."; }
  if (id === "linux-errors") correct = result.stdout.trim() === APP_LOG.split("\n").filter(l => l.includes("ERROR")).join("\n");
  if (id === "linux-count") correct = result.stdout.trim() === "3";
  correct = correct && result.exitCode === 0;
  return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode, tables: [], correct, snapshot, detail: correct ? "실행 결과가 조건과 일치합니다." : "출력과 파일 상태가 문제 조건에 맞는지 확인하세요." };
 }};
}
