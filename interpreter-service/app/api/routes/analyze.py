from __future__ import annotations

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import (
    serialize_profiling,
    serialize_score_report,
    serialize_suggestions,
    to_json_safe,
)
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import AnalyzeResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(tags=["analysis"])
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_code(request: ExecuteRequest) -> AnalyzeResponse:
    """
    Full pipeline — execute + profile + optimize + score in one request.
    This is the primary endpoint for the web IDE experience.
    Returns everything the frontend needs to render all panels.
    """
    logger.info("Analyze | user=%s code_len=%s", request.user_id, len(request.code))
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=request.enable_profiling,
        )

        optimization_report = None
        suggestions: list = []
        try:
            ast = parse(tokenize(request.code))
            optimization_report = optilang.analyze(ast, result.profiling, result.symbol_table)
            suggestions = serialize_suggestions(optimization_report)
        except OptiLangError as exc:
            logger.info("Analyze — optimization skipped: %s", exc)

        score_report = optilang.calculate_score(
            profiling_data=result.profiling.to_dict() if result.profiling else None,
            optimizer_report=optimization_report,
            source_lines=max(1, len(request.code.splitlines())),
            errors=result.errors,
        )

        return AnalyzeResponse(
            success=len(result.errors) == 0,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=serialize_profiling(result.profiling),
            symbol_table=to_json_safe(result.symbol_table),
            suggestions=suggestions,
            score_report=serialize_score_report(score_report),
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Analyze error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis error: {exc}",
        ) from exc