import { executeCode, analyzeCode, ExecutionResult, AnalysisResult } from "@services/interpreterClient.service.js";
import { Execution } from "@models/Execution.js";
import { ApiError } from "@utils/apiError.util.js";
import logger from "@utils/logger.util.js";
import { CodeInput } from "@validations/execution.validation.js";

// ── Helpers 

const saveExecution = (
  userId: string,
  code: string,
  result: ExecutionResult | AnalysisResult
): void => {
  const record: Record<string, unknown> = {
    userId,
    code,
    output: result.output,
    errors: result.errors,
    executionTime: result.execution_time,
  };

  // Only present on AnalysisResult
  if ("optimization_score" in result) {
    record["optimizationScore"] = result.optimization_score;
    record["complexityClass"] = result.complexity_class;
  }

  Execution.create(record).catch((err) =>
    logger.error("Failed to save execution record:", err)
  );
};

const handleInterpreterError = (err: unknown): never => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  ) {
    const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
    const status = axiosErr.response?.status;
    const detail = axiosErr.response?.data?.detail;
    throw new ApiError(
      status === 422 ? 400 : 502,
      detail || "Interpreter service unavailable"
    );
  }
  throw new ApiError(502, "Interpreter service unavailable");
};

// ── Service methods 

export const runCode = async (
  input: CodeInput,
  userId: string
): Promise<ExecutionResult> => {
  const result = await executeCode(input.code, userId, input.timeout).catch(
    handleInterpreterError
  );

  saveExecution(userId, input.code, result);

  return result;
};

export const runAnalysis = async (
  input: CodeInput,
  userId: string
): Promise<AnalysisResult> => {
  const result = await analyzeCode(input.code, userId).catch(
    handleInterpreterError
  );

  saveExecution(userId, input.code, result);

  return result;
};