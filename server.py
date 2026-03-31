"""
server.py — FastAPI bridge between the React frontend and the optilang library.

Run with:
    python server.py

Endpoints:
    GET  /api/health   → service status
    POST /api/execute  → run PyLite code, return output + profiling + score
"""

from __future__ import annotations

# ── Windows fix ───────────────────────────────────────────────────────────────
# On Windows, uvicorn subprocess spawning puts the project root at the front
# of sys.path, which causes Python to find optilang/token.py before the
# stdlib's built-in token module → circular import crash.
# Fix: move the project root to the END of sys.path so stdlib wins first.
import sys
import os

_project_root = os.path.dirname(os.path.abspath(__file__))
if _project_root in sys.path:
    sys.path.remove(_project_root)
sys.path.append(_project_root)   # re-add at the end so stdlib is found first
# ─────────────────────────────────────────────────────────────────────────────

from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Import the actual optilang library ────────────────────────────────────────
from optilang import execute
from optilang.scoring import calculate_score

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="OptiLang Server",
    version="0.1.0",
    description="Runs PyLite code via the optilang library",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ─────────────────────────────────────────────────

class ExecuteRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50_000)
    enable_profiling: bool = Field(default=True)
    timeout: int = Field(default=10, ge=1, le=60)


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "optilang-server", "version": "0.1.0"}


@app.post("/api/execute", response_model=ApiResponse)
def execute_code(req: ExecuteRequest):
    """
    Full pipeline:
        code -> optilang.execute() -> profiling -> scoring -> JSON response
    """
    try:
        result = execute(
            req.code,
            timeout_seconds=float(req.timeout),
            enable_profiling=req.enable_profiling,
        )

        execution_time_ms = result.execution_time * 1000

        profiling_dict: Optional[Dict[str, Any]] = None
        if result.profiling is not None:
            profiling_dict = result.profiling.to_dict()

        score_dict: Optional[Dict[str, Any]] = None
        if profiling_dict is not None:
            source_lines = len([l for l in req.code.splitlines() if l.strip()])
            score_report = calculate_score(
                profiling_data=profiling_dict,
                suggestions=[],
                total_source_lines=source_lines,
            )
            score_dict = score_report.to_dict()

        data: Dict[str, Any] = {
            "output":            result.output,
            "errors":            result.errors,
            "execution_time":    result.execution_time,
            "execution_time_ms": round(execution_time_ms, 3),
            "profiling":         profiling_dict,
            "symbol_table":      result.symbol_table,
            "score":             score_dict,
            "suggestions":       [],
        }

        return ApiResponse(success=True, message="Execution successful", data=data)

    except Exception as exc:
        return ApiResponse(
            success=False,
            message=f"Server error: {exc}",
            data=None,
        )


# ── Entry point (Windows-safe) ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[_project_root],
    )
