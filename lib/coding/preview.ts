import type { CodingCheck, CodingSource } from "../content/coding/types.ts";
import { evaluateCoding } from "./grading.ts";
import { isCodingRunShortcut } from "./keyboard.ts";

export const avatar = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#e5e5e5"/><text x="48" y="58" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#202020">JS</text></svg>')}`;

export function cleanCodingHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content
    .querySelectorAll("script,iframe,frame,frameset,object,embed,base,meta,link,portal")
    .forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (
        /^on/i.test(attribute.name) ||
        ["nonce", "srcdoc", "action", "formaction", "target"].includes(attribute.name)
      )
        node.removeAttribute(attribute.name);
      if (
        ["href", "src", "xlink:href"].includes(attribute.name) &&
        /^\s*(?:javascript|vbscript):/i.test(attribute.value)
      )
        node.removeAttribute(attribute.name);
    }
    if (node.tagName === "IMG" && /^(?:\.\/)?avatar\.svg$/.test(node.getAttribute("src") ?? ""))
      node.setAttribute("src", avatar);
  });
  return template.innerHTML;
}

const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const safeStyle = (css: string) => css.replace(/</g, "\\3c ");

export function codingDocument(source: CodingSource, title = "내 웹사이트") {
  const escapedTitle = title.replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!,
  );
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapedTitle}</title><style>${safeStyle(source.css)}</style></head><body>${cleanCodingHtml(source.html)}</body></html>`;
}

export function codingPreview(source: CodingSource, token: string, checks: CodingCheck[]) {
  if (!/^[a-zA-Z0-9-]+$/.test(token)) throw new Error("Invalid preview token");
  const policy = `default-src 'none'; script-src 'nonce-${token}'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'`;
  const runner = `(() => {
    const send = (type, extra = {}) => parent.postMessage({ channel: "codehack-coding", token: ${safeJson(token)}, type, ...extra }, "*");
    const grade = ${evaluateCoding.toString()};
    const shortcut = ${isCodingRunShortcut.toString()};
    addEventListener("keydown", (event) => {
      if (shortcut(event)) { event.preventDefault(); if (!event.repeat) send("run"); }
    }, true);
    document.addEventListener("submit", (event) => event.preventDefault(), true);
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a");
      if (!link) return;
      event.preventDefault();
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        try { document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: "smooth" }); } catch {}
      }
    }, true);
    addEventListener("load", () => {
      let attempts = 0;
      const measure = () => {
        // A freshly mounted offscreen frame can load before its viewport has layout.
        if (document.documentElement.getBoundingClientRect().width === 0 && attempts++ < 60) {
          setTimeout(measure, 30);
          return;
        }
        send("results", { results: grade(${safeJson(checks)}) });
      };
      setTimeout(measure, 30);
    }, { once: true });
  })();`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html { color-scheme: light; } body { font-family: system-ui, sans-serif; color: #202020; background: #fff; }</style><style>${safeStyle(source.css)}</style></head><body>${cleanCodingHtml(source.html)}<script nonce="${token}">${runner}</script></body></html>`;
}
