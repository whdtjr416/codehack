"use client";
import { useState } from "react";
import { difficultyLevels } from "../../lib/content/difficulty";
type Item = {
  id: string;
  title: string;
  category: string;
  status: string;
  detail?: string;
  level?: string;
};
export function QuestionList({
  items,
  onOpen,
  label,
}: {
  items: Item[];
  onOpen: (id: string) => void;
  label: string;
}) {
  const [level, setLevel] = useState("전체 난이도");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [status, setStatus] = useState("전체");
  const [page, setPage] = useState(0);
  const categories = ["전체", ...new Set(items.map((i) => i.category))];
  const levels = difficultyLevels.filter((l) => items.some((i) => i.level === l));
  const found = items.filter(
    (i) =>
      (level === "전체 난이도" || i.level === level) &&
      (category === "전체" || i.category === category) &&
      (status === "전체" ||
        (status === "완료"
          ? ["완료", "해결", "정답"].includes(i.status)
          : !["완료", "해결", "정답"].includes(i.status))) &&
      (i.title + " " + i.category).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(found.length / 20));
  const current = Math.min(page, pages - 1);
  return (
    <>
      <div className="question-filters">
        <input
          aria-label={`${label} 검색`}
          placeholder="문제 검색"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <select
          aria-label={`${label} 분류`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <>
          {levels.length > 0 && (
            <select
              aria-label={`${label} 난이도`}
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(0);
              }}
            >
              {["전체 난이도", ...levels].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          )}
        </>
        <select
          aria-label={`${label} 상태`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          {["전체", "미완료", "완료"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span>
          {found.length} / {items.length}개
        </span>
      </div>
      <div className="study-list">
        {found.slice(current * 20, current * 20 + 20).map((i) => (
          <article key={i.id}>
            <div>
              <small>
                {i.category}
                {i.level ? ` · ${i.level}` : ""}
                {i.detail ? ` · ${i.detail}` : ""}
              </small>
              <button className="problem-link" onClick={() => onOpen(i.id)}>
                {i.title}
              </button>
            </div>
            <span
              className={`item-status ${["완료", "해결", "정답"].includes(i.status) ? "done" : ""}`}
            >
              {i.status}
            </span>
            <button
              className="row-open"
              aria-label={`${i.title} 열기`}
              onClick={() => onOpen(i.id)}
            >
              →
            </button>
          </article>
        ))}
      </div>
      {!found.length && <p className="empty">조건에 맞는 문제가 없습니다.</p>}
      <nav className="pagination" aria-label={`${label} 페이지`}>
        <button disabled={current === 0} onClick={() => setPage(current - 1)}>
          ← 이전
        </button>
        <span>
          {current + 1} / {pages}
        </span>
        <button disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
          다음 →
        </button>
      </nav>
    </>
  );
}
