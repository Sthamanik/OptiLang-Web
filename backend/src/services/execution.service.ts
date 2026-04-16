import {
  analyzeCode,
  AnalyzeResult,
  executeCode,
  ExecuteResult,
  optimizeCode,
  OptimizeResult,
  parseCode,
  ParseResult,
  profileCode,
  ProfileResult,
  scoreCode,
  ScoreResult,
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
    throw new ApiError(
      status === 422 ? 400 : 502,
      detail || "Interpreter service unavailable",
    );
  }
  throw new ApiError(502, "Interpreter service unavailable");
};

// ── Persist execution record (fire-and-forget) ────────────────────────────────

const persistExecution = (
  userId: string,
  code: string,
  result: ExecuteResult | AnalyzeResult,
): void => {
  const record: Record<string, unknown> = {
    userId,
    code,
    output: result.output,
    errors: result.errors,
    executionTime: result.execution_time,
  };

  if ("score_report" in result) {
    record["optimizationScore"] = result.score_report.score;
    record["complexityClass"] = result.score_report.complexity_class;
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

  persistExecution(userId, input.code, result);
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

  persistExecution(userId, input.code, result);
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
  userId: string
): Promise<TokenizeResult> => {
  return tokenizeCode(input.code, userId).catch(handleInterpreterError);
};

export const runParse = async (
  input: SourceInput,
  userId: string
): Promise<ParseResult> => {
  return parseCode(input.code, userId).catch(handleInterpreterError);
};