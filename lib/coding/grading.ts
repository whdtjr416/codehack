import type { CodingCheck } from "../content/coding/types.ts";

export type CodingResult = { label: string; passed: boolean };

// Self-contained: serialized into the sandbox after TypeScript is compiled.
// Grade rendered DOM and computed styles, not the learner's source spelling.
export function evaluateCoding(checks: CodingCheck[]): CodingResult[] {
  return checks.map((check) => {
    let passed = false;
    try {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(check.selector));
      const element = elements[0];
      const visible = (node: HTMLElement) => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return (
          box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.opacity !== "0"
        );
      };
      if (check.kind === "element") {
        passed =
          elements.filter(
            (node) =>
              visible(node) &&
              (node.textContent?.trim() || node.tagName === "IMG" || node.tagName === "INPUT"),
          ).length >= (check.min ?? 1);
      } else if (check.kind === "attribute") {
        passed = elements.some(
          (node) =>
            visible(node) &&
            new RegExp(check.pattern ?? "\\S").test(node.getAttribute(check.attribute!) ?? ""),
        );
      } else if (check.kind === "style" && element && visible(element)) {
        const value = getComputedStyle(element).getPropertyValue(check.property!);
        passed = check.values
          ? check.values.includes(value)
          : Number.parseFloat(value) >= (check.min ?? 1);
      } else if (check.kind === "labels") {
        passed =
          elements.length > 0 &&
          elements.every((node) => {
            const input = node as HTMLInputElement;
            return (
              visible(input) &&
              !!Array.from(input.labels ?? []).find((label) => label.textContent?.trim())
            );
          });
      } else if (check.kind === "layout" && element && visible(element)) {
        const box = element.getBoundingClientRect();
        const children = Array.from(element.children).filter((node) =>
          visible(node as HTMLElement),
        );
        const boxes = children.map((child) => child.getBoundingClientRect());
        if (check.layout === "fits") {
          passed =
            box.width > 0 &&
            box.left >= -1 &&
            box.right <= innerWidth + 1 &&
            document.documentElement.scrollWidth <= innerWidth + 2;
        } else if (check.layout === "center") {
          const parent = element.parentElement!.getBoundingClientRect();
          passed = Math.abs(box.left + box.width / 2 - (parent.left + parent.width / 2)) < 5;
        } else if (boxes.length >= 2) {
          passed = boxes
            .slice(1)
            .every((current, i) =>
              check.layout === "columns"
                ? Math.abs(current.top - boxes[0].top) < 3 && current.left >= boxes[i].right - 1
                : Math.abs(current.left - boxes[0].left) < 3 && current.top >= boxes[i].bottom - 1,
            );
        }
      }
    } catch {
      passed = false;
    }
    return { label: check.label, passed };
  });
}
