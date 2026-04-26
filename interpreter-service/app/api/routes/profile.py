from __future__ import annotations

from datetime import datetime, timezone
import logging

from fastapi import APIRouter, HTTPException, status

import optilang
from app.core.serialization import serialize_profiling
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import ProfileResponse

router = APIRouter(tags=["profiling"])
logger = logging.getLogger(__name__)


@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def profile_code(request: ExecuteRequest) -> ProfileResponse:
    """
    Run OptiLang code and return profiling data only.
    No output, no suggestions, no score.
    Useful when Express only needs to store/display profiling metrics.
    """
    logger.info("Profile | user=%s code_len=%s", request.user_id, len(request.code))
    try:
        result = optilang.execute(
            request.code,
            timeout_seconds=request.timeout or 5,
            enable_profiling=True,  # always on — pointless otherwise
        )
        return ProfileResponse(
            success=len(result.errors) == 0,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=serialize_profiling(result.profiling),
            timestamp=datetime.now(timezone.utc),
        )
    except Exception as exc:
        logger.error("Profile error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile error: {exc}",
        ) from exc
