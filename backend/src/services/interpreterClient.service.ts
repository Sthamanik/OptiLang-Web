import axios from "axios";
import { config } from "@config/env.js";

const interpreterClient = axios.create({
  baseURL: config.interpreter.url,
  timeout: config.interpreter.timeout,
  headers: {
    "Content-Type": "application/json",
    "X-Internal-Service-Secret": config.interpreter.sharedSecret,
  },
});

export interface TokenResponseItem {
  type: string;
  value: unknown;
  line: number;
  column: number;
}

export interface LineStats {
  line?: number | null;
  count: number;
  total_time_ms: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  memory_vars: number;
  memory_bytes: number;
}

export interface FunctionStats {
  name?: string | null;
  calls: number;
  total_time_ms: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  max_recursion_depth: number;
  callers: Record<string, number>;
}

export interface ProfilingData {
  line_stats: Record<string, LineStats>;
  function_stats: Record<string, FunctionStats>;
  total_time_ms: number;
  total_lines_executed: number;
  total_lines: number;
  lines_profiled: number;
  peak_memory_bytes: number;
  complexity_estimate: string;
  complexity_method: string;
  complexity_confidence: number;
  sampled_lines: number;
  skipped_lines: number;
  line_sampling_rate: number;
  memory_mode: string;
}

export interface Suggestion {
  line: number;
  pattern: string;
  severity: "low" | "medium" | "high" | string;
  description: string;
  suggestion: string;
  impact_score: number;
}

export interface DimensionScores {
  correctness: number;
  efficiency_complexity: number;
  quality: number;
  maintainability: number;
  complexity_subscore: number;
  efficiency_subscore: number;
  profiling_partial: boolean;
  optimizer_partial: boolean;
}

export interface ScoreReport {
  score: number;
  grade: string;
  complexity_class: string;
  dimensions: DimensionScores;
  narrative: string;
  error_count: number;
  lines_profiled: number;
  cv: number;
}

export interface ExecuteResult {
  success: boolean;
  output: string;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  symbol_table: Record<string, unknown>;
  timestamp: string;
}

export interface ProfileResult {
  success: boolean;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  timestamp: string;
}

export interface OptimizeResult {
  success: boolean;
  errors: string[];
  suggestions: Suggestion[];
  suggestion_count: number;
  timestamp: string;
}

export interface ScoreResult {
  success: boolean;
  errors: string[];
  score_report: ScoreReport;
  timestamp: string;
}

export interface AnalyzeResult {
  success: boolean;
  output: string;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  symbol_table: Record<string, unknown>;
  suggestions: Suggestion[];
  score_report: ScoreReport;
  timestamp: string;
}

export interface TokenizeResult {
  success: boolean;
  tokens: TokenResponseItem[];
  token_count: number;
  errors: string[];
  timestamp: string;
}

export interface ParseResult {
  success: boolean;
  ast: Record<string, unknown> | null;
  errors: string[];
  timestamp: string;
}

function buildPayload(
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true,
) {
  return { code, user_id: userId, timeout, enable_profiling: enableProfiling };
}

export const executeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true,
): Promise<ExecuteResult> => {
  const { data } = await interpreterClient.post<ExecuteResult>(
    "/execute",
    buildPayload(code, userId, timeout, enableProfiling),
  );
  return data;
};

export const profileCode = async (
  code: string,
  userId?: string,
  timeout = 5,
): Promise<ProfileResult> => {
  const { data } = await interpreterClient.post<ProfileResult>(
    "/profile",
    buildPayload(code, userId, timeout, true),
  );
  return data;
};

export const optimizeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
): Promise<OptimizeResult> => {
  const { data } = await interpreterClient.post<OptimizeResult>(
    "/optimize",
    buildPayload(code, userId, timeout, true),
  );
  return data;
};

export const scoreCode = async (
  code: string,
  userId?: string,
  timeout = 5,
): Promise<ScoreResult> => {
  const { data } = await interpreterClient.post<ScoreResult>(
    "/score",
    buildPayload(code, userId, timeout, true),
  );
  return data;
};

export const analyzeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true,
): Promise<AnalyzeResult> => {
  const { data } = await interpreterClient.post<AnalyzeResult>(
    "/analyze",
    buildPayload(code, userId, timeout, enableProfiling),
  );
  return data;
};

export const tokenizeCode = async (
  code: string,
  userId?: string,
): Promise<TokenizeResult> => {
  const { data } = await interpreterClient.post<TokenizeResult>("/tokenize", {
    code,
    user_id: userId,
  });
  return data;
};

export const parseCode = async (
  code: string,
  userId?: string,
): Promise<ParseResult> => {
  const { data } = await interpreterClient.post<ParseResult>("/parse", {
    code,
    user_id: userId,
  });
  return data;
};
