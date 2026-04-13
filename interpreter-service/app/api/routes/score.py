from __future__ import annotations

from datetime import datetime, timezone
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_score_report, serialize_suggestions
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import ScoreResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(tags=["scoring"])
logger = logging.getLogger(__name__)


@router.post("/score", response_model=ScoreResponse, status_code=status.HTTP_200_OK)
async def score_code(request: ExecuteRequest) -> ScoreResponse:
    """
    Run OptiLang code and return score report only.
    No output, no profiling, no suggestions.
    Useful when Express only needs to persist/display the score.
    """
    logger.info("Score | user=%s code_len=%s", request.user_id, len(request.code))
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=True,
        )

        optimization_report = None
        try:
            ast = parse(tokenize(request.code))
            optimization_report = optilang.analyze(ast, result.profiling, result.symbol_table)
        except OptiLangError as exc:
            logger.info("Score — analysis skipped: %s", exc)

        score_report = optilang.calculate_score(
            profiling_data=result.profiling.to_dict() if result.profiling else None,
            optimizer_report=optimization_report,
            source_lines=max(1, len(request.code.splitlines())),
            errors=result.errors,
        )

        return ScoreResponse(
            success=len(result.errors) == 0,
            errors=result.errors,
            score_report=serialize_score_report(score_report),
            timestamp=datetime.now(timezone.utc),
        )
    except Exception as exc:
        logger.error("Score error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Score error: {exc}",
        ) from exc