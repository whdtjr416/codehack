export type CodingSource = { html: string; css: string };
export type CodingGroup = "HTML 기초" | "CSS 기초" | "웹사이트 만들기";
export type CodingCheck = {
  label: string;
  kind: "element" | "attribute" | "style" | "layout" | "labels";
  selector: string;
  min?: number;
  attribute?: string;
  pattern?: string;
  property?: string;
  values?: string[];
  layout?: "center" | "fits" | "columns" | "stack";
  viewport?: "mobile";
};
export type CodingTask = {
  id: string;
  title: string;
  group: CodingGroup;
  level: "입문" | "초급" | "중급";
  prompt: string;
  theory: string;
  hint: string;
  explanation: string;
  starter: CodingSource;
  solution: CodingSource;
  checks: CodingCheck[];
  previousId?: string;
};
