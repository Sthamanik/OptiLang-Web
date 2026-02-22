import axios from "axios";
import { config } from "@config/env.js";

const interpreterClient = axios.create({
  baseURL: config.interpreter.url,
  timeout: config.interpreter.timeout,
  headers: { "Content-Type": "application/json" },
});

// ── Response types (mirrors FastAPI schemas)

export interface LineStats {
  count: number;
  total_time: number;
  avg_time: number;
  memory: number;
}

export interface FunctionStats {
  calls: number;
  total_time: number;
  avg_time: number;
  max_depth: number;
}

export interface ProfilingData {
  line_stats: Record<string, LineStats>;
  function_stats: Record<string, FunctionStats>;
  total_time_ms: number;
  total_lines: number;
  lines_profiled: number;
}

export interface ScoreBreakdown {
  severity_penalty: number;
  complexity_penalty: number;
  performance_penalty: number;
  memory_penalty: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  timestamp: string;
}

export interface AnalysisResult extends ExecutionResult {
  suggestions: object[];
  optimization_score: number;
  score_breakdown: ScoreBreakdown;
  complexity_class: string;
  complexity_analysis: Record<string, unknown>;
}

// ── Client methods

export const executeCode = async (
  code: string,
  userId?: string,
  timeout = 5
): Promise<ExecutionResult> => {
  const { data } = await interpreterClient.post<ExecutionResult>("/execute", {
    code,
    timeout,
    user_id: userId,
  });
  return data;
};

export const analyzeCode = async (
  code: string,
  userId?: string
): Promise<AnalysisResult> => {
  const { data } = await interpreterClient.post<AnalysisResult>("/analyze", {
    code,
    user_id: userId,
  });
  return data;
};