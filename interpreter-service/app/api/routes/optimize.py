from __future__ import annotations

from datetime import datetime, timezone
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_suggestions
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import OptimizeResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(tags=["optimization"])
logger = logging.getLogger(__name__)


@router.post("/optimize", response_model=OptimizeResponse, status_code=status.HTTP_200_OK)
async def optimize_code(request: ExecuteRequest) -> OptimizeResponse:
    """
    Run OptiLang code and return suggestions only.
    No output, no profiling, no score.
    Useful when Express only needs suggestions (e.g. background lint check).
    """
    logger.info("Optimize | user=%s code_len=%s", request.user_id, len(request.code))
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=True,
        )

        suggestions: list = []
        try:
            ast = parse(tokenize(request.code))
            report = optilang.analyze(ast, result.profiling, result.symbol_table)
            suggestions = serialize_suggestions(report)
        except OptiLangError as exc:
            logger.info("Optimize — analysis skipped: %s", exc)

        return OptimizeResponse(
            success=len(result.errors) == 0,
            errors=result.errors,
            suggestions=suggestions,
            suggestion_count=len(suggestions),
            timestamp=datetime.now(timezone.utc),
        )
    except Exception as exc:
        logger.error("Optimize error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimize error: {exc}",
        ) from exc