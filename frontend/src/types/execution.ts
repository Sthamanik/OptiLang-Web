export interface ExecutionResult {
  output: string;
  errors: string[];
  execution_time: number;
  profiling?: ProfilingData;
}

export interface ProfilingData {
  line_stats: Record<number, LineStats>;
  function_stats: Record<string, FunctionStats>;
  total_time: number;
  total_memory: number;
}

export interface LineStats {
  count: number;
  time: number;
  memory: number;
}

export interface FunctionStats {
  calls: number;
  total_time: number;
}
