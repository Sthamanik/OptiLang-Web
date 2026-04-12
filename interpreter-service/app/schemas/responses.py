"""
Pydantic response models for the OptiLang interpreter service.

The service preserves the full OptiLang core output surface while keeping
legacy fields used by the current web backend.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TokenResponseItem(BaseModel):
    type: str = Field(description="Token type")
    value: Any = Field(description="Token value")
    line: int = Field(description="1-based source line")
    column: int = Field(description="1-based source column")


class LineStats(BaseModel):
    line: Optional[int] = Field(default=None, description="Source line number")
    count: int = Field(description="Number of executions")
    total_time_ms: float = Field(description="Total time spent on this line in milliseconds")
    avg_time_ms: float = Field(description="Average time per execution in milliseconds")
    min_time_ms: float = Field(description="Fastest recorded execution in milliseconds")
    max_time_ms: float = Field(description="Slowest recorded execution in milliseconds")
    memory_vars: int = Field(description="Variables visible when the line ran")
    memory_bytes: int = Field(description="Estimated memory footprint in bytes")


class FunctionStats(BaseModel):
    name: Optional[str] = Field(default=None, description="Function name")
    calls: int = Field(description="Number of function calls")
    total_time_ms: float = Field(description="Total time spent in the function in milliseconds")
    avg_time_ms: float = Field(description="Average time per call in milliseconds")
    min_time_ms: float = Field(description="Fastest recorded call in milliseconds")
    max_time_ms: float = Field(description="Slowest recorded call in milliseconds")
    max_recursion_depth: int = Field(description="Maximum recursion depth observed")
    callers: Dict[str, int] = Field(
        default_factory=dict,
        description="Call counts by caller name",
    )


class ProfilingData(BaseModel):
    line_stats: Dict[str, LineStats] = Field(
        default_factory=dict,
        description="Per-line profiling data keyed by line number",
    )
    function_stats: Dict[str, FunctionStats] = Field(
        default_factory=dict,
        description="Per-function profiling data keyed by function name",
    )
    total_time_ms: float = Field(description="Total execution time in milliseconds")
    total_lines_executed: int = Field(description="Total number of executed line events")
    total_lines: int = Field(description="Backward-compatible alias of total_lines_executed")
    lines_profiled: int = Field(description="Number of unique lines profiled")
    peak_memory_bytes: int = Field(description="Peak observed memory usage in bytes")
    complexity_estimate: str = Field(description="Profiler complexity estimate")
    complexity_method: str = Field(description="Profiler complexity detection method")
    complexity_confidence: float = Field(description="Confidence score for complexity estimate")
    sampled_lines: int = Field(description="Number of sampled line events")
    skipped_lines: int = Field(description="Number of skipped line events")
    line_sampling_rate: float = Field(description="Applied line sampling rate")
    memory_mode: str = Field(description="Profiler memory mode")


class SuggestionResponse(BaseModel):
    line: int = Field(description="Line number where the issue was detected")
    pattern: str = Field(description="Optimizer pattern name")
    severity: str = Field(description="Issue severity")
    description: str = Field(description="Human-readable description")
    suggestion: str = Field(description="Suggested fix")
    impact_score: float = Field(description="Estimated impact score")


class DimensionScoresResponse(BaseModel):
    correctness: float = Field(description="Correctness score")
    efficiency_complexity: float = Field(description="Efficiency and complexity score")
    quality: float = Field(description="Code quality score")
    maintainability: float = Field(description="Maintainability score")
    complexity_subscore: float = Field(description="Complexity contribution")
    efficiency_subscore: float = Field(description="Efficiency contribution")
    profiling_partial: bool = Field(description="Whether profiling data was partial or missing")
    optimizer_partial: bool = Field(description="Whether optimizer data was partial or missing")


class ScoreBreakdown(BaseModel):
    severity_penalty: float = Field(description="Legacy quality deficit value")
    complexity_penalty: float = Field(description="Legacy complexity deficit value")
    performance_penalty: float = Field(description="Legacy efficiency deficit value")
    memory_penalty: float = Field(description="Legacy memory penalty placeholder")


class ScoreReportResponse(BaseModel):
    score: float = Field(ge=0, le=100, description="Overall OptiLang score")
    grade: str = Field(description="Human-readable grade")
    complexity_class: str = Field(description="Detected complexity class")
    dimensions: DimensionScoresResponse = Field(description="Per-dimension score report")
    narrative: str = Field(description="Beginner-friendly explanation")
    error_count: int = Field(description="Number of execution errors")
    lines_profiled: int = Field(description="Number of unique lines profiled")
    cv: float = Field(description="Coefficient of variation of execution counts")


class ExecutionResponse(BaseModel):
    success: bool = Field(description="True if execution completed without errors")
    output: str = Field(description="Captured stdout output")
    errors: List[str] = Field(default_factory=list, description="Execution errors")
    execution_time: float = Field(description="Wall-clock execution time in seconds")
    profiling: Optional[ProfilingData] = Field(
        default=None,
        description="Runtime profiling output",
    )
    symbol_table: Dict[str, Any] = Field(
        default_factory=dict,
        description="Final global symbol table with JSON-safe values",
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class OptimizationResponse(BaseModel):
    success: bool = Field(description="True if optimization analysis completed")
    errors: List[str] = Field(default_factory=list, description="Execution or syntax errors")
    suggestions: List[SuggestionResponse] = Field(
        default_factory=list,
        description="Optimization suggestions sorted by impact",
    )
    suggestion_count: int = Field(description="Number of suggestions returned")
    profiling: Optional[ProfilingData] = Field(
        default=None,
        description="Profiling data used by the optimizer",
    )
    symbol_table: Dict[str, Any] = Field(
        default_factory=dict,
        description="Final global symbol table with JSON-safe values",
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AnalysisResponse(BaseModel):
    success: bool = Field(description="True if analysis completed without errors")
    output: str = Field(description="Captured stdout output")
    errors: List[str] = Field(default_factory=list, description="Execution errors")
    execution_time: float = Field(description="Wall-clock execution time in seconds")
    profiling: Optional[ProfilingData] = Field(
        default=None,
        description="Runtime profiling output",
    )
    symbol_table: Dict[str, Any] = Field(
        default_factory=dict,
        description="Final global symbol table with JSON-safe values",
    )
    suggestions: List[SuggestionResponse] = Field(
        default_factory=list,
        description="Optimization suggestions",
    )
    optimization_score: float = Field(
        ge=0,
        le=100,
        description="Backward-compatible mirror of score_report.score",
    )
    score_breakdown: ScoreBreakdown = Field(description="Backward-compatible legacy breakdown")
    complexity_class: str = Field(description="Detected complexity class")
    complexity_analysis: Dict[str, Any] = Field(
        default_factory=dict,
        description="Backward-compatible score summary for existing clients",
    )
    score_report: ScoreReportResponse = Field(description="Full scorer output")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TokenizeResponse(BaseModel):
    success: bool = Field(description="True if tokenization succeeded")
    tokens: List[TokenResponseItem] = Field(default_factory=list, description="Token stream")
    token_count: int = Field(description="Number of returned tokens")
    errors: List[str] = Field(default_factory=list, description="Lexer errors")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ParseResponse(BaseModel):
    success: bool = Field(description="True if parsing succeeded")
    tokens: List[TokenResponseItem] = Field(
        default_factory=list,
        description="Token stream used for parsing",
    )
    token_count: int = Field(description="Number of returned tokens")
    ast: Optional[Dict[str, Any]] = Field(
        default=None,
        description="JSON-safe AST structure",
    )
    errors: List[str] = Field(default_factory=list, description="Lexer or parser errors")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    status: str = Field(description="Service status")
    version: str = Field(description="Service version")
    timestamp: datetime = Field(description="Current server time")
