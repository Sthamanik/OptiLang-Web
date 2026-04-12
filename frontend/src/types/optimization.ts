export interface Suggestion {
  line: number;
  pattern: string;
  severity: "low" | "medium" | "high" | string;
  description: string;
  suggestion: string;
  impact_score: number;
}

export interface ScoreBreakdown {
  severity_penalty: number;
  complexity_penalty: number;
  performance_penalty: number;
  memory_penalty: number;
}

export interface DimensionScores {
  correctness: number;
  efficiency_complexity: number;
  quality: number;
  maintainability: number;
  complexity_subscore: number;
  efficiency_subscore: number;
  profiling_partial: boolean;
  optimizer_partial: boolean;
}

export interface ScoreReport {
  score: number;
  grade: string;
  complexity_class: string;
  dimensions: DimensionScores;
  narrative: string;
  error_count: number;
  lines_profiled: number;
  cv: number;
}

export interface OptimizationReport {
  suggestions: Suggestion[];
  optimization_score: number;
  score_breakdown: ScoreBreakdown;
  complexity_class: string;
  complexity_analysis: Record<string, unknown>;
  score_report: ScoreReport;
}
