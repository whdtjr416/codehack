import type { Database, SqlJsStatic, SqlValue } from "sql.js";
import type { ExecutionResult, ResultTable } from "./types.ts";
export const sqlSchema = "users(id, name, role, active)\ndocuments(id, owner_id, title)\nlogin_events(id, username, result)";
export const sqlSeed = `
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL CHECK(active IN (0,1)));
INSERT INTO users VALUES (1,'alice','analyst',1),(2,'bob','admin',1),(3,'carol','analyst',0),(4,'O''Brien','analyst',1);
CREATE TABLE documents (id INTEGER PRIMARY KEY, owner_id INTEGER REFERENCES users(id), title TEXT);
INSERT INTO documents VALUES (101,1,'운영 점검'),(102,2,'관리자 메모'),(103,1,'권한 검토');
CREATE TABLE login_events (id INTEGER PRIMARY KEY, username TEXT, result TEXT);
INSERT INTO login_events VALUES (1,'alice','failed'),(2,'bob','success'),(3,'alice','failed'),(4,'bob','failed'),(5,'alice','success');`;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function cell(value: SqlValue): string | number | null { return value instanceof Uint8Array ? `[BLOB ${value.length} bytes]` : typeof value === "string" ? value.slice(0, 4000) : value; }
export function createSqlRuntime(SQL: SqlJsStatic) {
 const db: Database = new SQL.Database();
 db.run("PRAGMA hard_heap_limit=16777216; PRAGMA foreign_keys=ON; PRAGMA max_page_count=512; PRAGMA temp_store=MEMORY;");
 db.run(sqlSeed);
 return { close: () => db.close(), run(source: string, id: string, paramsText = "[]"): ExecutionResult {
  if (!source.trim() || source.length > 12000) throw new Error("SQL은 1~12,000자로 입력하세요.");
  const params: unknown = JSON.parse(paramsText || "[]");
  if (!Array.isArray(params) || params.length > 20 || params.some(x => x !== null && typeof x !== "string" && typeof x !== "number")) throw new Error("매개변수는 문자열·숫자·null로 이루어진 JSON 배열이어야 합니다.");
  const tables: ResultTable[] = []; let truncated = false, statementCount = 0, parameterUsed = false, lastQuery = "", error = "";
  // All SQL, including writes, targets this disposable in-memory database only.
  try {
   for (const stmt of db.iterateStatements(source)) {
    try {
     if (++statementCount > 20) throw new Error("한 번에 20개 이하의 SQL 문을 실행하세요.");
     stmt.bind(params as SqlValue[]);
     const columns = stmt.getColumnNames(); const values: ResultTable["values"] = [];
     if (/\?/.test(stmt.getSQL())) parameterUsed = true;
     while (stmt.step()) { if (values.length >= 200) { truncated = true; break; } values.push(stmt.get().map(cell)); }
     if (columns.length) { tables.push({columns, values}); lastQuery = stmt.getSQL(); }
    } finally { stmt.free(); }
   }
  } catch (e) { error = (e as Error).message; }
  const values = tables.at(-1)?.values;
  let correct = false;
  if (!error && !truncated) {
   if (id === "sql-filter") correct = same(values, [[1,"alice"],[4,"O'Brien"]]);
   if (id === "sql-join") correct = same(values, [["운영 점검","alice"],["권한 검토","alice"]]);
   if (id === "sql-group") correct = same(values, [["alice",2],["bob",1]]);
   if (id === "sql-bind" && parameterUsed && same(params, ["O'Brien"]) && same(values, [[4,"O'Brien"]])) {
    // Verify that the answer really depends on the bound value, not a constant result.
    const check = db.prepare(lastQuery);
    try { check.bind(["alice"]); const rows = []; while (check.step() && rows.length < 3) rows.push(check.get()); correct = same(rows, [[1,"alice"]]); }
    finally { check.free(); }
   }
   if (id === "sql-update") {
    try { correct = same(db.exec("SELECT id,name,role,active FROM users ORDER BY id")[0]?.values, [[1,"alice","analyst",1],[2,"bob","admin",0],[3,"carol","analyst",0],[4,"O'Brien","analyst",1]]); } catch { correct = false; }
   }
  }
  return { stdout: !tables.length && !error ? `${statementCount}개 SQL 실행 완료` : "", stderr: error, exitCode: error ? 1 : 0, tables, truncated, correct,
   detail: correct ? "실행 결과가 조건과 일치합니다." : error ? "SQL 오류를 수정한 뒤 다시 실행하세요." : "행·열·정렬 순서와 변경 범위를 확인하세요." };
 }};
}
