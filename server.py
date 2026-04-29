"""
server.py — FastAPI bridge between the React frontend and the optilang library.

Run with:
    python server.py

Endpoints:
    GET  /api/health   → service status
    POST /api/execute  → run PyLite code, return output + profiling + score
"""

from __future__ import annotations
from optilang.scoring import calculate_score
from optilang.optimizer import Optimizer
from optilang.parser import parse
from optilang.lexer import tokenize
from optilang import execute
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from typing import Any, Dict, List, Optional

# ── Windows fix ───────────────────────────────────────────────────────────────
import sys
import os

_project_root = os.path.dirname(os.path.abspath(__file__))
if _project_root in sys.path:
    sys.path.remove(_project_root)
sys.path.append(_project_root)
# ─────────────────────────────────────────────────────────────────────────────


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
        code -> execute() -> optimizer -> scoring -> JSON response
    """
    try:
        # ── Step 1: Execute ──────────────────────────────────────────
        result = execute(
            req.code,
            timeout_seconds=float(req.timeout),
            enable_profiling=req.enable_profiling,
        )

        execution_time_ms = result.execution_time * 1000

        # ── Step 2: Profiling ────────────────────────────────────────
        profiling_dict: Optional[Dict[str, Any]] = None
        if result.profiling is not None:
            profiling_dict = result.profiling.to_dict()

        # ── Step 3: Optimizer (suggestions) ─────────────────────────
        optimizer_report = None
        suggestions: List[Dict[str, Any]] = []
        try:
            ast = parse(tokenize(req.code))
            optimizer_report = Optimizer(
                ast,
                result.profiling,
                result.symbol_table or None,
            ).run()
            suggestions = [
                {
                    "line":        s.line,
                    "severity":    s.severity,
                    "pattern":     s.pattern,
                    "description": s.description,
                    "suggestion":  s.suggestion,
                    "impact_score": s.impact_score,
                }
                for s in optimizer_report.suggestions
            ]
        except Exception:
            pass  # optimizer failure is non-fatal

        # ── Step 4: Score ────────────────────────────────────────────
        score_dict: Optional[Dict[str, Any]] = None
        if profiling_dict is not None:
            source_lines = len([l for l in req.code.splitlines() if l.strip()])
            score_report = calculate_score(
                profiling_data=profiling_dict,
                optimizer_report=optimizer_report,
                source_lines=source_lines,
                errors=result.errors,
            )
            score_dict = score_report.to_dict()

        # ── Step 5: Response ─────────────────────────────────────────
        data: Dict[str, Any] = {
            "output":            result.output,
            "errors":            result.errors,
            "execution_time":    result.execution_time,
            "execution_time_ms": round(execution_time_ms, 3),
            "profiling":         profiling_dict,
            "symbol_table":      result.symbol_table,
            "score":             score_dict,
            "suggestions":       suggestions,
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
