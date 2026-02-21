"""
POST /execute — Execute PyLite code using the optilang library.

Flow:
    1. Validate request (handled by Pydantic schema)
    2. Call optilang.execute(code, timeout)
    3. Map ExecutionResult → ExecutionResponse
    4. Return response

Error handling:
    - Syntax/runtime errors in the PyLite code are NOT HTTP errors —
      they are returned as a successful response with errors[] populated.
    - Only unexpected Python-level exceptions become HTTP 500.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.requests import ExecuteRequest
from app.schemas.responses import ExecutionResponse, ProfilingData, LineStats, FunctionStats
from datetime import datetime
import logging

import optilang

router = APIRouter(prefix="/execute", tags=["execution"])
logger = logging.getLogger(__name__)


def _build_profiling(raw: dict | None) -> ProfilingData | None:
    """
    Convert the raw profiling dict from ProfilingData.to_dict()
    into a ProfilingData Pydantic model.

    The library returns line_stats keyed by integer line numbers,
    but JSON keys must be strings — Pydantic handles the coercion
    automatically via Dict[str, LineStats].

    Args:
        raw: Dict from result.profiling (ProfilingData.to_dict()) or None.

    Returns:
        ProfilingData model, or None if profiling was disabled.
    """
    if raw is None:
        return None

    line_stats = {
        str(line_num): LineStats(
            count=stats.get("count", 0),
            total_time=stats.get("total_time", 0.0),
            avg_time=stats.get("avg_time", 0.0),
            memory=stats.get("memory", 0),
        )
        for line_num, stats in raw.get("line_stats", {}).items()
    }

    function_stats = {
        func_name: FunctionStats(
            calls=stats.get("calls", 0),
            total_time=stats.get("total_time", 0.0),
            avg_time=stats.get("avg_time", 0.0),
            max_depth=stats.get("max_depth", 0),
        )
        for func_name, stats in raw.get("function_stats", {}).items()
    }

    return ProfilingData(
        line_stats=line_stats,
        function_stats=function_stats,
        total_time_ms=raw.get("total_time_ms", 0.0),
        total_lines=raw.get("total_lines", 0),
        lines_profiled=raw.get("lines_profiled", 0),
    )


@router.post("", response_model=ExecutionResponse, status_code=status.HTTP_200_OK)
async def execute_code(request: ExecuteRequest) -> ExecutionResponse:
    """
    Execute PyLite code using the optilang library.

    PyLite syntax/runtime errors are returned in the `errors` field
    with `success: false` — they do NOT raise HTTP exceptions.
    Only unexpected internal failures return HTTP 500.

    Args:
        request: ExecuteRequest with code, timeout, and optional user_id.

    Returns:
        ExecutionResponse with output, errors, execution_time, and profiling.

    Raises:
        HTTPException 500: If an unexpected Python-level error occurs.
    """
    logger.info(f"Execute request — user: {request.user_id}, "
                f"code_length: {len(request.code)} chars, "
                f"timeout: {request.timeout}s")

    try:
        # ── Call the library ──────────────────────────────────────────────
        result = optilang.execute(
            request.code,
            timeout=request.timeout or 5,
        )

        # ── Determine success ─────────────────────────────────────────────
        # A run with errors (syntax/runtime) is still a "completed" execution
        # from the service's perspective — the library handled it gracefully.
        success = len(result.errors) == 0

        if result.errors:
            logger.info(f"Execution completed with errors: {result.errors}")
        else:
            logger.info(f"Execution successful — "
                        f"time: {result.execution_time:.4f}s, "
                        f"output_length: {len(result.output)} chars")

        # ── Build and return response ─────────────────────────────────────
        return ExecutionResponse(
            success=success,
            output=result.output,
            errors=result.errors,
            execution_time=result.execution_time,
            profiling=_build_profiling(result.profiling),
            timestamp=datetime.utcnow(),
        )

    except Exception as e:
        # Unexpected error in the service itself (not in user code)
        logger.error(f"Unexpected execution error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal execution error: {str(e)}",
        )