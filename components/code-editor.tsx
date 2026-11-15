"use client";

import { useRef } from "react";
import { tokenizeCode, type CodeLanguage } from "../lib/code-tokens";

// Keep source text intact. React escapes each token; no HTML is injected.
export function CodeText({ source, language = "generic" }: { source: string; language?: CodeLanguage }) {
 return <>{tokenizeCode(source, language).map(({text, kind}, index) => <span key={index} className={`syntax-${kind}`}>{text}</span>)}</>;
}

export function CodeEditor({ value, onChange, onExecute, disabled, language }: {
 value: string; onChange: (value: string) => void; onExecute: () => void; disabled: boolean; language: "shell" | "sql";
}) {
 const highlight = useRef<HTMLPreElement>(null);
 const gutter = useRef<HTMLDivElement>(null);
 const lineCount = value.split("\n").length;
 return <div className={`code-editor${disabled ? " is-disabled" : ""}`}>
  <div className="code-editor-header"><span>{language === "sql" ? "query.sql" : "terminal.sh"}</span><span>{language === "sql" ? "SQL" : "Bash"}</span></div>
  <div className="code-editor-body">
   <div className="code-gutter" aria-hidden="true"><div ref={gutter}>{Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}</div></div>
   <pre className="code-highlight" aria-hidden="true" ref={highlight}><code><CodeText source={value + "\n"} language={language} /></code></pre>
   <textarea id="execution-source" className="code-input" spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" wrap="off" maxLength={12000} value={value} onChange={e => onChange(e.target.value)}
    onScroll={e => { if (highlight.current) { highlight.current.scrollTop = e.currentTarget.scrollTop; highlight.current.scrollLeft = e.currentTarget.scrollLeft; } if (gutter.current) gutter.current.style.transform = `translateY(${-e.currentTarget.scrollTop}px)`; }}
    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) { e.preventDefault(); onExecute(); } }}
    placeholder={language === "shell" ? "명령어를 입력하세요" : "SQL을 입력하세요"} disabled={disabled} />
  </div>
 </div>;
}
