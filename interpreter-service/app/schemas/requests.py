from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator


class SourceRequest(BaseModel):
    """Common request schema for source-driven OptiLang endpoints."""

    code: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="OptiLang source code",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user ID for tracking",
    )

    @field_validator("code")
    @classmethod
    def code_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Code cannot be empty or whitespace only")
        return value


class ExecuteRequest(SourceRequest):
    """Request schema for code execution."""

    timeout: Optional[float] = Field(
        default=5,
        gt=0,
        le=30,
        description="Execution timeout in seconds",
    )
    enable_profiling: bool = Field(
        default=True,
        description="Whether to collect profiling data during execution",
    )


class AnalyzeRequest(ExecuteRequest):
    """Request schema for code analysis."""

    execution_trace: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Reserved for future external trace input",
    )


class TokenizeRequest(SourceRequest):
    """Request schema for tokenization."""


class ParseRequest(SourceRequest):
    """Request schema for parsing into an AST."""


class OptimizeRequest(ExecuteRequest):
    """Request schema for optimizer-only analysis."""
