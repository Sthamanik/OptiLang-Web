import {
  analyzeCode,
  AnalyzeResult,
  executeCode,
  ExecuteResult,
  FunctionStats,
  optimizeCode,
  OptimizeResult,
  parseCode,
  ParseResult,
  ProfilingData,
  profileCode,
  ProfileResult,
  scoreCode,
  ScoreResult,
  ScoreReport,
  Suggestion,
  tokenizeCode,
  TokenizeResult,
} from "@services/interpreterClient.service.js";
import { Execution } from "@models/Execution.model.js";
import { ApiError } from "@utils/apiError.util.js";
import logger from "@utils/logger.util.js";
import { CodeInput, SourceInput } from "@validations/execution.validation.js";

const handleInterpreterError = (err: unknown): never => {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { detail?: string } };
    };
    const status = axiosErr.response?.status;
    const detail = axiosErr.response?.data?.detail;
    if (status === 429) {
      throw new ApiError(
        429,
        detail || "Interpreter service rate limit exceeded",
      );
    }
    throw new ApiError(
      status === 422 ? 400 : 502,
      detail || "Interpreter service unavailable",
    );
  }
  throw new ApiError(502, "Interpreter service unavailable");
};

// ── Persist execution record (fire-and-forget) ────────────────────────────────

type PersistedExecutionMode = "execute" | "analyze";

const normalizeSuggestions = (suggestions: Suggestion[]) =>
  suggestions.map((suggestion) => ({
    line: suggestion.line,
    pattern: suggestion.pattern,
    severity: suggestion.severity,
    description: suggestion.description,
    suggestion: suggestion.suggestion,
    impactScore: suggestion.impact_score,
  }));

const normalizeLineStats = (profiling: ProfilingData) =>
  Object.values(profiling.line_stats).map((lineStat) => ({
    line: lineStat.line ?? undefined,
    count: lineStat.count,
    totalTimeMs: lineStat.total_time_ms,
    avgTimeMs: lineStat.avg_time_ms,
    minTimeMs: lineStat.min_time_ms,
    maxTimeMs: lineStat.max_time_ms,
    memoryVars: lineStat.memory_vars,
    memoryBytes: lineStat.memory_bytes,
  }));

const normalizeFunctionStats = (profiling: ProfilingData) =>
  Object.values(profiling.function_stats).map(
    (functionStat: FunctionStats) => ({
      name: functionStat.name ?? undefined,
      calls: functionStat.calls,
      totalTimeMs: functionStat.total_time_ms,
      avgTimeMs: functionStat.avg_time_ms,
      minTimeMs: functionStat.min_time_ms,
      maxTimeMs: functionStat.max_time_ms,
      maxRecursionDepth: functionStat.max_recursion_depth,
      callers: functionStat.callers,
    }),
  );

const normalizeProfiling = (profiling: ProfilingData) => ({
  lineStats: normalizeLineStats(profiling),
  functionStats: normalizeFunctionStats(profiling),
  totalTimeMs: profiling.total_time_ms,
  totalLinesExecuted: profiling.total_lines_executed,
  totalLines: profiling.total_lines,
  linesProfiled: profiling.lines_profiled,
  peakMemoryBytes: profiling.peak_memory_bytes,
  complexityEstimate: profiling.complexity_estimate,
  complexityMethod: profiling.complexity_method,
  complexityConfidence: profiling.complexity_confidence,
  sampledLines: profiling.sampled_lines,
  skippedLines: profiling.skipped_lines,
  lineSamplingRate: profiling.line_sampling_rate,
  memoryMode: profiling.memory_mode,
});

const normalizeScoreReport = (scoreReport: ScoreReport) => ({
  score: scoreReport.score,
  grade: scoreReport.grade,
  complexityClass: scoreReport.complexity_class,
  dimensions: {
    correctness: scoreReport.dimensions.correctness,
    efficiencyComplexity: scoreReport.dimensions.efficiency_complexity,
    quality: scoreReport.dimensions.quality,
    maintainability: scoreReport.dimensions.maintainability,
    complexitySubscore: scoreReport.dimensions.complexity_subscore,
    efficiencySubscore: scoreReport.dimensions.efficiency_subscore,
    profilingPartial: scoreReport.dimensions.profiling_partial,
    optimizerPartial: scoreReport.dimensions.optimizer_partial,
  },
  narrative: scoreReport.narrative,
  errorCount: scoreReport.error_count,
  linesProfiled: scoreReport.lines_profiled,
  cv: scoreReport.cv,
});

const persistExecution = (
  userId: string,
  mode: PersistedExecutionMode,
  code: string,
  result: ExecuteResult | AnalyzeResult,
): void => {
  const record: Record<string, unknown> = {
    userId,
    mode,
    success: result.success,
    code,
    output: result.output,
    errors: result.errors,
    errorCount: result.errors.length,
    executionTime: result.execution_time,
    suggestionCount: 0,
  };

  if (result.profiling) {
    record["profiling"] = normalizeProfiling(result.profiling);
    record["peakMemoryBytes"] = result.profiling.peak_memory_bytes;
    record["linesProfiled"] = result.profiling.lines_profiled;
    record["complexityClass"] = result.profiling.complexity_estimate;
  }

  if ("suggestions" in result) {
    record["suggestions"] = normalizeSuggestions(result.suggestions);
    record["suggestionCount"] = result.suggestions.length;
  }

  if ("score_report" in result) {
    record["complexityClass"] = result.score_report.complexity_class;
    record["optimizationScore"] = result.score_report.score;
    record["scoreReport"] = normalizeScoreReport(result.score_report);
  }

  Execution.create(record).catch((err) =>
    logger.error("Failed to persist execution record:", err),
  );
};

export const runExecute = async (
  input: CodeInput,
  userId: string,
): Promise<ExecuteResult> => {
  const result = await executeCode(
    input.code,
    userId,
    input.timeout,
    input.enable_profiling,
  ).catch(handleInterpreterError);

  persistExecution(userId, "execute", input.code, result);
  return result;
};

export const runAnalyze = async (
  input: CodeInput,
  userId: string,
): Promise<AnalyzeResult> => {
  const result = await analyzeCode(
    input.code,
    userId,
    input.timeout,
    input.enable_profiling,
  ).catch(handleInterpreterError);

  persistExecution(userId, "analyze", input.code, result);
  return result;
};

export const runProfile = async (
  input: CodeInput,
  userId: string,
): Promise<ProfileResult> => {
  return profileCode(input.code, userId, input.timeout).catch(
    handleInterpreterError,
  );
};

/**
 * Suggestions only — no output, no score.
 */
export const runOptimize = async (
  input: CodeInput,
  userId: string,
): Promise<OptimizeResult> => {
  return optimizeCode(input.code, userId, input.timeout).catch(
    handleInterpreterError,
  );
};

/**
 * Score only — no output, no profiling, no suggestions.
 */
export const runScore = async (
  input: CodeInput,
  userId: string,
): Promise<ScoreResult> => {
  return scoreCode(input.code, userId, input.timeout).catch(
    handleInterpreterError,
  );
};

export const runTokenize = async (
  input: SourceInput,
  userId: string,
): Promise<TokenizeResult> => {
  return tokenizeCode(input.code, userId).catch(handleInterpreterError);
};

export const runParse = async (
  input: SourceInput,
  userId: string,
): Promise<ParseResult> => {
  return parseCode(input.code, userId).catch(handleInterpreterError);
};
