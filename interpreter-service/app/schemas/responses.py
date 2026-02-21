"""
Pydantic response models for the OptiLang interpreter service.

All field names and types are kept in sync with what optilang library
methods actually return (ProfilingData.to_dict(), ScoreReport.to_dict()).
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


# ---------------------------------------------------------------------------
# Profiling schemas
# ---------------------------------------------------------------------------

class LineStats(BaseModel):
    """Per-line execution statistics."""
    count: int = Field(description="Number of times this line was executed")
    total_time: float = Field(description="Total time spent on this line (ms)")
    avg_time: float = Field(description="Average time per execution (ms)")
    memory: int = Field(description="Variables in scope when line ran")


class FunctionStats(BaseModel):
    """Per-function execution statistics."""
    calls: int = Field(description="Number of times function was called")
    total_time: float = Field(description="Total time spent in function (ms)")
    avg_time: float = Field(description="Average time per call (ms)")
    max_depth: int = Field(description="Maximum call stack depth reached")


class ProfilingData(BaseModel):
    """
    Profiling data — matches ProfilingData.to_dict() from the optilang library.

    Key names must exactly match the dict keys returned by to_dict():
        line_stats, function_stats, total_time_ms, total_lines, lines_profiled
    """
    line_stats: Dict[str, LineStats] = Field(
        description="Per-line stats keyed by line number (as string)"
    )
    function_stats: Dict[str, FunctionStats] = Field(
        description="Per-function stats keyed by function name"
    )
    total_time_ms: float = Field(description="Total execution time in milliseconds")
    total_lines: int = Field(description="Total line executions (sum of all counts)")
    lines_profiled: int = Field(description="Number of unique lines executed")


# ---------------------------------------------------------------------------
# Score schemas
# ---------------------------------------------------------------------------

class ScoreBreakdown(BaseModel):
    """Score penalty breakdown — matches ScoreReport.breakdown dict."""
    severity_penalty: float = Field(description="Penalty from optimization suggestions")
    complexity_penalty: float = Field(description="Penalty from detected time complexity")
    performance_penalty: float = Field(description="Penalty from slow execution vs baseline")
    memory_penalty: float = Field(description="Penalty from high variable counts")


# ---------------------------------------------------------------------------
# Suggestion schema (Sprint 3 — populated once Optimizer is built)
# ---------------------------------------------------------------------------

class SuggestionResponse(BaseModel):
    """Individual optimization suggestion."""
    line: int = Field(description="Line number where issue was detected")
    pattern: str = Field(description="Pattern name e.g. 'nested_loops'")
    severity: str = Field(description="Severity: low | medium | high")
    description: str = Field(description="Human-readable issue description")
    suggestion: str = Field(description="Actionable fix suggestion")
    impact_score: float = Field(ge=0, le=25, description="Score impact (0-25)")


# ---------------------------------------------------------------------------
# Main response schemas
# ---------------------------------------------------------------------------

class ExecutionResponse(BaseModel):
    """
    Response for POST /execute.

    Mirrors optilang.execute() → ExecutionResult fields.
    """
    success: bool = Field(description="True if execution completed without fatal error")
    output: str = Field(description="Program stdout output")
    errors: List[str] = Field(
        default_factory=list,
        description="Runtime or syntax errors (empty if clean run)"
    )
    execution_time: float = Field(description="Wall-clock execution time in seconds")
    profiling: Optional[ProfilingData] = Field(
        default=None,
        description="Line-by-line profiling data (None if profiling disabled)"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AnalysisResponse(BaseModel):
    """
    Response for POST /analyze.

    Combines execution profiling with optimization scoring.
    Suggestions list is empty in v0.2.0 (populated in Sprint 3).
    """
    success: bool = Field(description="True if analysis completed")
    output: str = Field(description="Program stdout output")
    errors: List[str] = Field(
        default_factory=list,
        description="Runtime or syntax errors"
    )
    execution_time: float = Field(description="Wall-clock execution time in seconds")
    profiling: Optional[ProfilingData] = Field(
        default=None,
        description="Line-by-line profiling data"
    )
    suggestions: List[SuggestionResponse] = Field(
        default_factory=list,
        description="Optimization suggestions (populated in Sprint 3)"
    )
    optimization_score: float = Field(
        ge=0,
        le=100,
        description="Overall optimization score (0-100)"
    )
    score_breakdown: ScoreBreakdown = Field(description="Per-component penalty breakdown")
    complexity_class: str = Field(description="Detected time complexity e.g. 'O(n²)'")
    complexity_analysis: Dict[str, Any] = Field(
        default_factory=dict,
        description="Full complexity analysis details"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Response for GET /health."""
    status: str = Field(description="Service status: 'healthy'")
    version: str = Field(description="Service version")
    timestamp: datetime = Field(description="Current server time")