"""
POST /analyze — Execute PyLite code and return optimization analysis.

Flow (v0.2.0):
    1. Validate request (handled by Pydantic schema)
    2. Call optilang.execute(code) to get output + profiling data
    3. Call optilang.calculate_score(profiling) to get score + complexity
    4. Map results → AnalysisResponse
    5. Return response

Flow (Sprint 3 — when Optimizer is ready):
    The `suggestions` field will be populated by calling optilang.analyze().
    The scoring will include severity_penalty from those suggestions.
    No changes to this file's structure will be needed — just uncomment
    the analyze() call and map suggestions to SuggestionResponse.

Why execute() here too?
    Scoring requires profiling data, and profiling only comes from execution.
    The /analyze endpoint runs the code AND scores it in one HTTP call,
    saving the frontend from making two separate requests.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.requests import AnalyzeRequest
from app.schemas.responses import (
    AnalysisResponse,
    ScoreBreakdown,
    SuggestionResponse,
)
from app.api.routes.execution import _build_profiling
from datetime import datetime
import logging

import optilang

router = APIRouter(prefix="/analyze", tags=["analysis"])
logger = logging.getLogger(__name__)


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_code(request: AnalyzeRequest) -> AnalysisResponse:
    """
    Execute PyLite code and return full optimization analysis.

    Combines execution + scoring in a single endpoint so the frontend
    gets everything it needs in one round trip.

    Args:
        request: AnalyzeRequest with code and optional user_id.

    Returns:
        AnalysisResponse with execution output, profiling, score,
        score breakdown, complexity class, and suggestions (empty in v0.2.0).

    Raises:
        HTTPException 500: If an unexpected Python-level error occurs.
    """
    logger.info(f"Analyze request — user: {request.user_id}, "
                f"code_length: {len(request.code)} chars")

    try:
        # ── Step 1: Execute the code ──────────────────────────────────────
        result = optilang.execute(
            request.code,
            timeout=5,
        )

        success = len(result.errors) == 0

        if result.errors:
            logger.info(f"Analysis execution completed with errors: {result.errors}")

        # ── Step 2: Score the execution ───────────────────────────────────
        # calculate_score() works even if profiling is None (returns 100.0)
        # total_source_lines is used to normalise severity penalty
        total_source_lines = len(request.code.strip().splitlines())

        score_report = optilang.calculate_score(
            profiling_data=result.profiling or {},
            suggestions=[],          # Sprint 3: pass optilang.analyze() suggestions here
            total_source_lines=total_source_lines,
        )

        logger.info(f"Analysis complete — "
                    f"score: {score_report.score}, "
                    f"grade: {score_report.grade}, "
                    f"complexity: {score_report.complexity_class}")

        # ── Step 3: Build score breakdown ─────────────────────────────────
        breakdown = ScoreBreakdown(
            severity_penalty=score_report.breakdown.get("severity_penalty", 0.0),
            complexity_penalty=score_report.breakdown.get("complexity_penalty", 0.0),
            performance_penalty=score_report.breakdown.get("performance_penalty", 0.0),
            memory_penalty=score_report.breakdown.get("memory_penalty", 0.0),
        )

        # ── Step 4: Build complexity analysis details ──────────────────────
        complexity_analysis = {
            "complexity_class": score_report.complexity_class,
            "max_execution_count": score_report.max_execution_count,
            "lines_profiled": score_report.lines_profiled,
            "baseline_time_ms": score_report.baseline_time_ms,
            "grade": score_report.grade,
        }

        # ── Step 5: Suggestions (Sprint 3 placeholder) ────────────────────
        # When optilang.analyze() is available, replace [] with:
        #
        #   analysis = optilang.analyze(request.code, result.profiling)
        #   suggestions = [
        #       SuggestionResponse(
        #           line=s.line,
        #           pattern=s.pattern,
        #           severity=s.severity,
        #           description=s.description,
        #           suggestion=s.suggestion,
        #           impact_score=s.impact_score,
        #       )
        #       for s in analysis.suggestions
        #   ]
        suggestions: list[SuggestionResponse] = []

        # ── Step 6: Return response ───────────────────────────────────────
        return AnalysisResponse(
            success=success,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=_build_profiling(result.profiling),
            suggestions=suggestions,
            optimization_score=score_report.score,
            score_breakdown=breakdown,
            complexity_class=score_report.complexity_class,
            complexity_analysis=complexity_analysis,
            timestamp=datetime.utcnow(),
        )

    except Exception as e:
        logger.error(f"Unexpected analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal analysis error: {str(e)}",
        )