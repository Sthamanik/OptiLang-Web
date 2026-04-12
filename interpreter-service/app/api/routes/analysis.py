from __future__ import annotations

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import (
    build_legacy_score_breakdown,
    serialize_profiling,
    serialize_score_report,
    serialize_suggestions,
    to_json_safe,
)
from app.schemas.requests import AnalyzeRequest
from app.schemas.responses import AnalysisResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(prefix="/analyze", tags=["analysis"])
logger = logging.getLogger(__name__)


def _source_line_count(source: str) -> int:
    return max(1, len(source.splitlines()) or 0)


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_code(request: AnalyzeRequest) -> AnalysisResponse:
    """Run the full OptiLang insight pipeline for a source string."""
    logger.info(
        "Analyze request user=%s code_length=%s timeout=%ss profiling=%s",
        request.user_id,
        len(request.code),
        request.timeout,
        request.enable_profiling,
    )

    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=request.enable_profiling,
        )

        optimization_report = None
        suggestions: list[dict] = []

        try:
            ast = parse(tokenize(request.code))
            optimization_report = optilang.analyze(
                ast,
                result.profiling,
                result.symbol_table,
            )
            suggestions = serialize_suggestions(optimization_report)
        except OptiLangError as exc:
            logger.info("Optimization phase skipped: %s", exc)

        score_report = optilang.calculate_score(
            profiling_data=result.profiling.to_dict() if result.profiling else None,
            optimizer_report=optimization_report,
            source_lines=_source_line_count(request.code),
            errors=result.errors,
        )
        score_report_payload = serialize_score_report(score_report)

        complexity_analysis = {
            "grade": score_report_payload["grade"],
            "narrative": score_report_payload["narrative"],
            "dimensions": score_report_payload["dimensions"],
            "error_count": score_report_payload["error_count"],
            "lines_profiled": score_report_payload["lines_profiled"],
            "cv": score_report_payload["cv"],
        }

        return AnalysisResponse(
            success=len(result.errors) == 0,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=serialize_profiling(result.profiling),
            symbol_table=to_json_safe(result.symbol_table),
            suggestions=suggestions,
            optimization_score=score_report_payload["score"],
            score_breakdown=build_legacy_score_breakdown(score_report),
            complexity_class=score_report_payload["complexity_class"],
            complexity_analysis=complexity_analysis,
            score_report=score_report_payload,
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Unexpected analysis error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal analysis error: {exc}",
        ) from exc
