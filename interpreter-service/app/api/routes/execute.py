from __future__ import annotations

from datetime import datetime, timezone
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_profiling, to_json_safe
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import ExecuteResponse

router = APIRouter(tags=["execution"])
logger = logging.getLogger(__name__)


@router.post("/execute", response_model=ExecuteResponse, status_code=status.HTTP_200_OK)
async def execute_code(request: ExecuteRequest) -> ExecuteResponse:
    """
    Run OptiLang code and return raw output + profiling.
    No suggestions, no score. Use /analyze for the full pipeline.
    """
    logger.info("Execute | user=%s code_len=%s", request.user_id, len(request.code))
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=request.enable_profiling,
        )
        return ExecuteResponse(
            success=len(result.errors) == 0,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=serialize_profiling(result.profiling),
            symbol_table=to_json_safe(result.symbol_table),
            timestamp=datetime.now(timezone.utc),
        )
    except Exception as exc:
        logger.error("Execute error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution error: {exc}",
        ) from exc