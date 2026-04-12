from __future__ import annotations

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_profiling, serialize_suggestions, to_json_safe
from app.schemas.requests import OptimizeRequest
from app.schemas.responses import OptimizationResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(prefix="/optimize", tags=["optimization"])
logger = logging.getLogger(__name__)


@router.post("", response_model=OptimizationResponse, status_code=status.HTTP_200_OK)
async def optimize_code(request: OptimizeRequest) -> OptimizationResponse:
    """Expose OptiLang's optimizer report without the scorer wrapper."""
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=request.enable_profiling,
        )

        try:
            ast = parse(tokenize(request.code))
            report = optilang.analyze(ast, result.profiling, result.symbol_table)
            suggestions = serialize_suggestions(report)
        except OptiLangError as exc:
            logger.info("Optimization parse/setup error: %s", exc)
            suggestions = []

        return OptimizationResponse(
            success=len(result.errors) == 0,
            errors=result.errors,
            suggestions=suggestions,
            suggestion_count=len(suggestions),
            profiling=serialize_profiling(result.profiling),
            symbol_table=to_json_safe(result.symbol_table),
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Unexpected optimization error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal optimization error: {exc}",
        ) from exc
