import { exercises } from "./exercises";
// Existing study IDs share progress and notes across category entry points.
export const topics = [
 {
  title: "리눅스 명령어", summary: "명령어 실행 · 파일 · 로그",
  items: [...exercises.filter(e => e.engine === "linux").map(e => e.id), "lesson-sys-perm", "permissions", "q-perm", "practical-perm"],
 },
 {
  title: "DB · SQL", summary: "쿼리 실행 · 조회 · 집계 · 수정",
  items: [...exercises.filter(e => e.engine === "sql").map(e => e.id), "lesson-app-input", "q-sql", "practical-sql", "pentest-query"],
 },
];
