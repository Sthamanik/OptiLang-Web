// ── Profiling ─────────────────────────────────────────────────────────────────
export interface LineStats {
  line:             number          // line number (always present from backend)
  count:            number
  total_time_ms:    number
  avg_time_ms:      number
  min_time_ms:      number
  max_time_ms:      number
  memory_vars:      number
  memory_bytes:     number
}

export interface FunctionStats {
  name?:               string | null
  calls:               number
  total_time_ms:       number
  avg_time_ms:         number
  min_time_ms:         number
  max_time_ms:         number
  max_recursion_depth: number
  callers:             Record<string, number>
}

export interface ProfilingData {
  line_stats:           Record<string, LineStats>
  function_stats:       Record<string, FunctionStats>
  total_time_ms:        number
  total_lines_executed: number
  total_lines:          number
  lines_profiled:       number
  peak_memory_bytes:    number
  complexity_estimate:  string
  complexity_method:    string
  complexity_confidence: number
  sampled_lines:        number
  skipped_lines:        number
  line_sampling_rate:   number
  memory_mode:          string
}

// ── Scoring ───────────────────────────────────────────────────────────────────
export interface DimensionScores {
  correctness:           number
  efficiency_complexity: number
  quality:               number
  maintainability:       number
  complexity_subscore:   number
  efficiency_subscore:   number
  profiling_partial:     boolean
  optimizer_partial:     boolean
}

export interface ScoreReport {
  score:            number
  grade:            'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'
  complexity_class: string
  dimensions:       DimensionScores
  narrative:        string
  error_count:      number
  lines_profiled:   number
  cv:               number
}

// ── Suggestions ───────────────────────────────────────────────────────────────
export interface Suggestion {
  line:         number
  pattern:      string
  severity:     'low' | 'medium' | 'high'
  description:  string
  suggestion:   string
  impact_score: number
}

// ── Execution result — matches /api/analyze response (AnalyzeResponse) ────────
// The backend wraps interpreter-service's AnalyzeResponse and returns:
// { success, output, errors, execution_time, profiling, symbol_table,
//   suggestions, score_report, timestamp }
// plus execution_time_ms added for convenience
export interface ExecutionResult {
  success:           boolean
  output:            string
  errors:            string[]
  execution_time:    number          // seconds
  execution_time_ms: number          // ms (added by backend service)
  profiling:         ProfilingData | null
  symbol_table:      Record<string, unknown>
  suggestions:       Suggestion[]
  // score_report from interpreter, also surfaced as score for backward compat
  score_report?:     ScoreReport
  score?:            ScoreReport     // backward compat with old server.py
  timestamp:         string
}

// ── API wrapper ───────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data:    T | null
}

export interface ExecuteRequest {
  code:             string
  enable_profiling: boolean
  timeout:          number
}
