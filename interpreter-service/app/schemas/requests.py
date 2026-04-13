from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CodeRequest(BaseModel):
    """Base request for all code-related endpoints."""

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


class ExecuteRequest(CodeRequest):
    """Request for /execute and /analyze endpoints."""

    timeout: Optional[float] = Field(
        default=5,
        gt=0,
        le=30,
        description="Execution timeout in seconds",
    )
    enable_profiling: bool = Field(
        default=True,
        description="Whether to collect profiling data",
    )