import { Execution, IExecution } from "@/models/Execution.model.js";
import { ApiError } from "@utils/apiError.util.js";
import { HistoryQuery } from "@validations/execution.validation.js";

export interface PaginatedHistory {
  executions: IExecution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getHistory = async (
  userId: string,
  query: HistoryQuery
): Promise<PaginatedHistory> => {
  const { page, limit, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  // ── Build filter 
  const filter: Record<string, unknown> = { userId };

  if (search && search.trim()) {
    // Use MongoDB text index on code field
    filter["$text"] = { $search: search.trim() };
  }

  // ── Build sort 
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [executions, total] = await Promise.all([
    Execution.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    Execution.countDocuments(filter),
  ]);

  return {
    executions: executions as IExecution[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getExecutionById = async (
  id: string,
  userId: string
): Promise<IExecution> => {
  const execution = await Execution.findOne({ _id: id, userId })
    .select("-__v")
    .lean();

  if (!execution) {
    throw new ApiError(404, "Execution record not found");
  }

  return execution as IExecution;
};

export const deleteExecution = async (
  id: string,
  userId: string
): Promise<void> => {
  const deleted = await Execution.findOneAndDelete({ _id: id, userId });

  if (!deleted) {
    throw new ApiError(404, "Execution record not found");
  }
};

export const clearHistory = async (
  userId: string
): Promise<{ deletedCount: number }> => {
  const result = await Execution.deleteMany({ userId });
  return { deletedCount: result.deletedCount };
};