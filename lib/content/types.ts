export type Lesson = {
  id: string;
  subject: string;
  title: string;
  concept: string;
  example: string;
  checks: string[];
  related: string;
};
export type Quiz = {
  id: string;
  subject: string;
  title: string;
  options: string[];
  lesson: string;
  theory?: string;
};
export type Practice = {
  id: string;
  subject: string;
  title: string;
  prompt: string;
  criteria: string[];
  related: string;
};
export type Pentest = {
  id: string;
  title: string;
  category: string;
  summary: string;
  scope: string;
  evidence: string;
  steps: string[];
  checks: string[];
  concept: string;
};
