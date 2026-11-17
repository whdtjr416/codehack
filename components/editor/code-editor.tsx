"use client";

import { useRef } from "react";
import { tokenizeCode, type CodeLanguage } from "../../lib/editor/tokenize";

// Keep source text intact. React escapes each token; no HTML is injected.
export function CodeText({
  source,
  language = "generic",
}: {
  source: string;
  language?: CodeLanguage;
}) {
  return (
    <>
      {tokenizeCode(source, language).map(({ text, kind }, index) => (
        <span key={index} className={`syntax-${kind}`}>
          {text}
        </span>
      ))}
    </>
  );
}

export function CodeEditor({
  value,
  onChange,
  onExecute,
  disabled,
  language,
  id = "execution-source",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  disabled: boolean;
  language: "shell" | "sql" | "html" | "css";
  id?: string;
  label?: string;
}) {
  const highlight = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;
  return (
    <div className={`code-editor${disabled ? " is-disabled" : ""}`}>
      <div className="code-editor-header">
        <span>
          {
            { sql: "query.sql", shell: "terminal.sh", html: "index.html", css: "style.css" }[
              language
            ]
          }
        </span>
        <span>{language === "shell" ? "Bash" : language.toUpperCase()}</span>
      </div>
      <div className="code-editor-body">
        <div className="code-gutter" aria-hidden="true">
          <div ref={gutter}>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
        <pre className="code-highlight" aria-hidden="true" ref={highlight}>
          <code>
            <CodeText source={value + "\n"} language={language} />
          </code>
        </pre>
        <textarea
          id={id}
          aria-label={label}
          className="code-input"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          maxLength={12000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (highlight.current) {
              highlight.current.scrollTop = e.currentTarget.scrollTop;
              highlight.current.scrollLeft = e.currentTarget.scrollLeft;
            }
            if (gutter.current)
              gutter.current.style.transform = `translateY(${-e.currentTarget.scrollTop}px)`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onExecute();
            }
          }}
          placeholder={
            language === "shell" ? "명령어를 입력하세요" : `${language.toUpperCase()}을 입력하세요`
          }
          disabled={disabled}
        />
      </div>
    </div>
  );
}
