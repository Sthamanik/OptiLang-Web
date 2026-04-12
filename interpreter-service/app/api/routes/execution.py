from __future__ import annotations

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_profiling, to_json_safe
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import ExecutionResponse

router = APIRouter(prefix="/execute", tags=["execution"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ExecutionResponse, status_code=status.HTTP_200_OK)
async def execute_code(request: ExecuteRequest) -> ExecutionResponse:
    """Execute OptiLang source code through the public core API."""
    logger.info(
        "Execute request user=%s code_length=%s timeout=%ss profiling=%s",
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

        return ExecutionResponse(
            success=len(result.errors) == 0,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=serialize_profiling(result.profiling),
            symbol_table=to_json_safe(result.symbol_table),
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Unexpected execution error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal execution error: {exc}",
        ) from exc
