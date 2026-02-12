from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class ProfilingData(BaseModel):
    """Profiling data schema."""
    line_stats: Dict[int, Dict[str, Any]]
    function_stats: Dict[str, Dict[str, Any]]
    total_time: float
    total_memory: int


class ExecutionResponse(BaseModel):
    """Response schema for code execution."""
    
    success: bool = Field(description="Whether execution succeeded")
    output: str = Field(description="Program output")
    errors: List[str] = Field(default_factory=list, description="Execution errors")
    execution_time: float = Field(description="Execution time in milliseconds")
    profiling: Optional[ProfilingData] = Field(default=None, description="Profiling data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SuggestionResponse(BaseModel):
    """Individual optimization suggestion schema."""
    
    line: int = Field(description="Line number")
    pattern: str = Field(description="Pattern detected")
    severity: str = Field(description="Severity level: low, medium, high")
    description: str = Field(description="Issue description")
    suggestion: str = Field(description="Optimization suggestion")
    impact_score: float = Field(ge=0, le=25, description="Impact score (0-25)")


class ScoreBreakdown(BaseModel):
    """Score breakdown schema."""
    severity_penalty: float
    complexity_penalty: float
    performance_penalty: float
    memory_penalty: float


class AnalysisResponse(BaseModel):
    """Response schema for code analysis."""
    
    success: bool = Field(description="Whether analysis succeeded")
    suggestions: List[SuggestionResponse] = Field(
        default_factory=list,
        description="Optimization suggestions"
    )
    optimization_score: float = Field(
        ge=0, 
        le=100,
        description="Overall optimization score (0-100)"
    )
    score_breakdown: ScoreBreakdown = Field(description="Score breakdown")
    complexity_analysis: Dict[str, Any] = Field(
        default_factory=dict,
        description="Time complexity analysis"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    version: str
    timestamp: datetime
