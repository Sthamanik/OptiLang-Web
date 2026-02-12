from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ExecuteRequest(BaseModel):
    """Request schema for code execution."""
    
    code: str = Field(
        ..., 
        min_length=1,
        max_length=10000,
        description="PyLite code to execute"
    )
    timeout: Optional[int] = Field(
        default=5, 
        ge=1, 
        le=30,
        description="Execution timeout in seconds"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User ID for tracking"
    )
    
    @field_validator('code')
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Code cannot be empty or whitespace only')
        return v


class AnalyzeRequest(BaseModel):
    """Request schema for code analysis."""
    
    code: str = Field(
        ..., 
        min_length=1,
        max_length=10000,
        description="PyLite code to analyze"
    )
    execution_trace: Optional[dict] = Field(
        default=None,
        description="Optional execution trace data"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User ID for tracking"
    )
    
    @field_validator('code')
    @classmethod
    def code_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Code cannot be empty or whitespace only')
        return v
