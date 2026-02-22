import { z } from "zod";

export const codeSchema = z.object({
  code: z
    .string()
    .nonempty("Code is required")
    .min(1, "Code cannot be empty")
    .max(10000, "Code cannot exceed 10,000 characters"),
  timeout: z
    .number()
    .int()
    .min(1, "Timeout must be at least 1 second")
    .max(30, "Timeout cannot exceed 30 seconds")
    .optional()
    .default(5),
});

export const historyQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Math.max(Number(val) || 1, 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(Number(val) || 20, 50)),
  search: z
    .string()
    .max(200, "Search query too long")
    .optional(),
  sortBy: z
    .enum(["createdAt", "executionTime", "optimizationScore"])
    .optional()
    .default("createdAt"),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),
});

export type CodeInput = z.infer<typeof codeSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;