import axios from "axios";
import { config } from "@config/env.js";

const interpreterClient = axios.create({
  baseURL: config.interpreter.url,
  timeout: config.interpreter.timeout,
  headers: { "Content-Type": "application/json" },
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

export interface ScoreBreakdown {
  severity_penalty: number;
  complexity_penalty: number;
  performance_penalty: number;
  memory_penalty: number;
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

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  symbol_table: Record<string, unknown>;
  timestamp: string;
}

export interface OptimizationResult {
  success: boolean;
  errors: string[];
  suggestions: Suggestion[];
  suggestion_count: number;
  profiling: ProfilingData | null;
  symbol_table: Record<string, unknown>;
  timestamp: string;
}

export interface AnalysisResult extends ExecutionResult {
  suggestions: Suggestion[];
  optimization_score: number;
  score_breakdown: ScoreBreakdown;
  complexity_class: string;
  complexity_analysis: Record<string, unknown>;
  score_report: ScoreReport;
}

export interface ProfileResult {
  success: boolean;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  timestamp: string;
}

export interface ScoreResult {
  success: boolean;
  errors: string[];
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

export interface ParseResult extends TokenizeResult {
  ast: Record<string, unknown> | null;
}

export const executeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true
): Promise<ExecutionResult> => {
  const { data } = await interpreterClient.post<ExecutionResult>("/execute", {
    code,
    timeout,
    enable_profiling: enableProfiling,
    user_id: userId,
  });
  return data;
};

export const analyzeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true
): Promise<AnalysisResult> => {
  const { data } = await interpreterClient.post<AnalysisResult>("/analyze", {
    code,
    timeout,
    enable_profiling: enableProfiling,
    user_id: userId,
  });
  return data;
};

export const optimizeCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true
): Promise<OptimizationResult> => {
  const { data } = await interpreterClient.post<OptimizationResult>("/optimize", {
    code,
    timeout,
    enable_profiling: enableProfiling,
    user_id: userId,
  });
  return data;
};

export const tokenizeCode = async (
  code: string,
  userId?: string
): Promise<TokenizeResult> => {
  const { data } = await interpreterClient.post<TokenizeResult>("/tokenize", {
    code,
    user_id: userId,
  });
  return data;
};

export const parseCode = async (
  code: string,
  userId?: string
): Promise<ParseResult> => {
  const { data } = await interpreterClient.post<ParseResult>("/parse", {
    code,
    user_id: userId,
  });
  return data;
};

export const profileCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true
): Promise<ProfileResult> => {
  const { data } = await interpreterClient.post<ProfileResult>("/profile", {
    code,
    timeout,
    enable_profiling: enableProfiling,
    user_id: userId,
  });
  return data;
};

export const scoreCode = async (
  code: string,
  userId?: string,
  timeout = 5,
  enableProfiling = true
): Promise<ScoreResult> => {
  const { data } = await interpreterClient.post<ScoreResult>("/score", {
    code,
    timeout,
    enable_profiling: enableProfiling,
    user_id: userId,
  });
  return data;
};
