from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class TokenResponseItem(BaseModel):
    type: str = Field
    value: Any = Field
    line: int = Field
    column: int = Field

class LineStats(BaseModel):
    line: Optional[int] = None
    count: int
    total_time_ms: float
    avg_time_ms: float
    min_time_ms: float
    max_time_ms: float
    memory_vars: int
    memory_bytes: int

class FunctionStats(BaseModel):
    name: Optional[str] = None
    calls: int
    total_time_ms: float
    avg_time_ms: float
    min_time_ms: float
    max_time_ms: float
    max_recursion_depth: int
    callers: Dict[str, int] = Field(default_factory=dict)

class ProfilingData(BaseModel):
    line_stats: Dict[str, LineStats] = Field(default_factory=dict)
    function_stats: Dict[str, FunctionStats] = Field(default_factory=dict)
    total_time_ms: float
    total_lines_executed: int
    total_lines: int
    lines_profiled: int
    peak_memory_bytes: int
    complexity_estimate: str
    complexity_method: str
    complexity_confidence: float
    sampled_lines: int
    skipped_lines: int
    line_sampling_rate: float
    memory_mode: str

class Suggestion(BaseModel):
    line: int
    pattern: str
    severity: str
    description: str
    suggestion: str
    impact_score: float

class DimensionScores(BaseModel):
    correctness: float
    efficiency_complexity: float
    quality: float
    maintainability: float
    complexity_subscore: float
    efficiency_subscore: float
    profiling_partial: bool
    optimizer_partial: bool

class ScoreReport(BaseModel):
    score: float = Field(ge=0, le=100)
    grade: str
    complexity_class: str
    dimensions: DimensionScores
    narrative: str
    error_count: int
    lines_profiled: int
    cv: float

class ExecuteResponse(BaseModel):
    """Response for POST /execute — raw execution only."""
    success: bool
    output: str
    errors: List[str] = Field(default_factory=list)
    execution_time: float
    profiling: Optional[ProfilingData] = None
    symbol_table: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ProfileResponse(BaseModel):
    """Response for POST /profile — profiling data only."""
    success: bool
    errors: List[str] = Field(default_factory=list)
    execution_time: float
    profiling: Optional[ProfilingData] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OptimizeResponse(BaseModel):
    """Response for POST /optimize — suggestions only."""
    success: bool
    errors: List[str] = Field(default_factory=list)
    suggestions: List[Suggestion] = Field(default_factory=list)
    suggestion_count: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ScoreResponse(BaseModel):
    """Response for POST /score — score report only."""
    success: bool
    errors: List[str] = Field(default_factory=list)
    score_report: ScoreReport
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AnalyzeResponse(BaseModel):
    """Response for POST /analyze — full pipeline, everything in one shot."""
    success: bool
    output: str
    errors: List[str] = Field(default_factory=list)
    execution_time: float
    profiling: Optional[ProfilingData] = None
    symbol_table: Dict[str, Any] = Field(default_factory=dict)
    suggestions: List[Suggestion] = Field(default_factory=list)
    score_report: ScoreReport
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TokenizeResponse(BaseModel):
    success: bool = Field
    tokens: List[TokenResponseItem] = Field(default_factory=list)
    token_count: int = Field
    errors: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ParseResponse(BaseModel):
    success: bool = Field
    ast: Optional[Dict[str, Any]] = None
    errors: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime