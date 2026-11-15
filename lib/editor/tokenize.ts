export type CodeLanguage = "shell" | "sql" | "generic";
type TokenKind =
  | "plain"
  | "keyword"
  | "command"
  | "function"
  | "option"
  | "variable"
  | "string"
  | "number"
  | "operator"
  | "comment";
export type CodeToken = { text: string; kind: TokenKind };

const sqlKeywords = new Set(
  "SELECT FROM WHERE AND OR NOT IN IS NULL TRUE FALSE AS JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING GROUP BY ORDER ASC DESC HAVING LIMIT OFFSET DISTINCT ALL UNION INTERSECT EXCEPT WITH RECURSIVE INSERT INTO VALUES UPDATE SET DELETE CREATE ALTER DROP TABLE VIEW INDEX PRIMARY FOREIGN KEY REFERENCES UNIQUE CHECK DEFAULT CONSTRAINT CASE WHEN THEN ELSE END EXISTS BETWEEN LIKE GLOB COLLATE RETURNING BEGIN COMMIT ROLLBACK TRANSACTION PRAGMA EXPLAIN REPLACE INTEGER TEXT REAL BLOB".split(
    " ",
  ),
);
const shellKeywords = new Set(
  "if then else elif fi for in while until do done case esac function select export local return break continue".split(
    " ",
  ),
);
const genericKeywords = new Set(
  "import from as if else elif return for in while def class lambda try except finally raise with yield async await pass break continue and or not is True False None const let var function new throw catch null true false undefined typeof instanceof".split(
    " ",
  ),
);

// Lexical coloring only: every character, including unfinished input, is preserved.
export function tokenizeCode(source: string, language: CodeLanguage): CodeToken[] {
  const comments =
    language === "sql"
      ? "--[^\\n]*|/\\*[\\s\\S]*?(?:\\*/|$)"
      : language === "shell"
        ? "(?<!\\S)#[^\\n]*"
        : "#[^\\n]*|//[^\\n]*|/\\*[\\s\\S]*?(?:\\*/|$)";
  const word = language === "shell" ? "[A-Za-z_./~][\\w./~:-]*" : "[A-Za-z_][\\w]*";
  const options = language === "shell" ? "--?[A-Za-z][\\w-]*|" : "";
  const pattern = new RegExp(
    `"(?:\\\\.|[^"\\\\])*"?|'(?:''|\\\\.|[^'\\\\])*'?|${comments}|\\$\\{[^}\\n]*\\}?|\\$[A-Za-z_][\\w]*|${options}\\b(?:0x[\\da-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\b|${word}|[+*/%=!<>|&^~?:-]+|\\s+|[^]`,
    "g",
  );
  let commandExpected = true;
  return Array.from(source.matchAll(pattern), (match) => {
    const text = match[0];
    const after = source.slice(match.index! + text.length);
    let kind: TokenKind = "plain";
    if (/^\s+$/.test(text)) {
      if (text.includes("\n")) commandExpected = true;
    } else if (/^["']/.test(text)) kind = "string";
    else if (/^(?:#|\/\/|\/\*)/.test(text) || (language === "sql" && text.startsWith("--")))
      kind = "comment";
    else if (text.startsWith("$")) kind = "variable";
    else if (language === "shell" && /^--?[A-Za-z]/.test(text)) kind = "option";
    else if (/^\d/.test(text)) kind = "number";
    else if (language === "sql" && sqlKeywords.has(text.toUpperCase())) kind = "keyword";
    else if (language === "generic" && genericKeywords.has(text)) kind = "keyword";
    else if (language === "shell" && shellKeywords.has(text)) {
      kind = "keyword";
      commandExpected = ["if", "then", "else", "elif", "while", "until", "do"].includes(text);
    } else if (/^[A-Za-z_./~]/.test(text)) {
      if (language === "shell") {
        if (commandExpected && after.startsWith("=")) kind = "variable";
        else if (commandExpected) {
          kind = "command";
          commandExpected = ["sudo", "env", "command", "time"].includes(text);
        }
      } else if (/^\s*\(/.test(after)) kind = "function";
    } else if (/^[+*/%=!<>|&^~?:-]+$/.test(text)) kind = "operator";
    if (language === "shell" && ["|", "||", "&", "&&", ";", "("].includes(text))
      commandExpected = true;
    return { text, kind };
  });
}
