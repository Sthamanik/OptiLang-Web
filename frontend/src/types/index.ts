// ── Matches optilang/profiler.py ─────────────────────────────────────────────

export interface LineStats {
  line: number
  count: number
  total_time_ms: number
  avg_time_ms: number
  min_time_ms: number
  max_time_ms: number
  memory_vars: number
  memory_bytes: number
}

export interface FunctionStats {
  name: string
  calls: number
  total_time_ms: number
  avg_time_ms: number
  min_time_ms: number
  max_time_ms: number
  max_recursion_depth: number
  callers: Record<string, number>
}

export interface ProfilingData {
  line_stats: Record<string, LineStats>   // key = line number as string
  function_stats: Record<string, FunctionStats>
  total_time_ms: number
  total_lines_executed: number
  lines_profiled: number
  peak_memory_bytes: number
  complexity_estimate: string
}

// ── Matches optilang/scoring.py ───────────────────────────────────────────────

export interface ScoreBreakdown {
  severity_penalty: number
  complexity_penalty: number
  performance_penalty: number
  memory_penalty: number
}

export interface ScoreReport {
  score: number
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'
  complexity_class: string
  dimensions: DimensionScores
  narrative: string
  error_count: number
  lines_profiled: number
  cv: number
}

export interface DimensionScores {
  correctness: number
  efficiency_complexity: number
  quality: number
  maintainability: number
  complexity_subscore: number
  efficiency_subscore: number
  profiling_partial: boolean
  optimizer_partial: boolean
}

// ── Matches optilang/models.py ────────────────────────────────────────────────

export interface Suggestion {
  line: number
  pattern: string
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion: string
  impact_score: number
}

export interface ExecutionResult {
  output: string
  errors: string[]
  execution_time: number        // seconds (from Python)
  execution_time_ms: number     // converted to ms by the server
  profiling: ProfilingData | null
  symbol_table: Record<string, unknown>
  score: ScoreReport | null
  suggestions: Suggestion[]
}

// ── API wrapper ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

export interface ExecuteRequest {
  code: string
  enable_profiling: boolean
  timeout: number
}
