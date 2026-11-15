export type ResultTable = { columns: string[]; values: (string | number | null)[][] };
export type ExecutionResult = { stdout: string; stderr: string; exitCode: number; tables: ResultTable[]; correct: boolean; detail: string; snapshot?: string; truncated?: boolean; elapsedMs?: number };
