import type { CodingSource, CodingTask } from "../content/coding/types.ts";

export type CodingProgress = {
  drafts: Record<string, CodingSource>;
  completed: string[];
  lastId: string | null;
};
export const emptyCodingProgress = (): CodingProgress => ({
  drafts: {},
  completed: [],
  lastId: null,
});
export const codingStorageKey = (viewer: string) => `codehack:coding:${viewer}:v1`;

export function parseCodingProgress(raw: string | null, tasks: CodingTask[]): CodingProgress {
  if (!raw) return emptyCodingProgress();
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object" || !data.drafts || typeof data.drafts !== "object")
    throw new Error("저장된 코드를 읽을 수 없습니다.");
  const ids = new Set(tasks.map((task) => task.id));
  const drafts: Record<string, CodingSource> = {};
  for (const [id, draft] of Object.entries(data.drafts)) {
    if (!ids.has(id)) continue;
    const code = draft as CodingSource;
    if (
      !code ||
      typeof code.html !== "string" ||
      typeof code.css !== "string" ||
      code.html.length > 12000 ||
      code.css.length > 12000
    )
      throw new Error("저장된 코드의 형식을 확인하세요.");
    drafts[id] = { html: code.html, css: code.css };
  }
  return {
    drafts,
    completed: Array.isArray(data.completed)
      ? [...new Set<string>(data.completed.filter((id: string) => ids.has(id)))]
      : [],
    lastId: ids.has(data.lastId) ? data.lastId : null,
  };
}

export function initialCodingSource(task: CodingTask, progress: CodingProgress): CodingSource {
  return (
    progress.drafts[task.id] ??
    (task.previousId ? progress.drafts[task.previousId] : undefined) ??
    task.starter
  );
}
