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

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  execution_time: number;
  profiling: ProfilingData | null;
  symbol_table: Record<string, unknown>;
  timestamp: string;
}
