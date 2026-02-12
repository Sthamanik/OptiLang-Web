export interface OptimizationReport {
  suggestions: Suggestion[];
  optimization_score: number;
  score_breakdown: ScoreBreakdown;
  complexity_analysis: Record<string, any>;
}

export interface Suggestion {
  line: number;
  pattern: string;
  severity: 'low' | 'medium' | 'high';
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
