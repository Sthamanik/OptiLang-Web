import logging
from asyncio import Lock
from collections import deque
from time import monotonic

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    analysis_router,
    execution_router,
    health_router,
    language_router,
    optimization_router,
    profile_router,
    score_router,
)
from app.core.config import settings

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

UNPROTECTED_PATHS = {"/health"}
DOCS_PATH_PREFIXES = ("/docs", "/redoc", "/openapi.json")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description="Interpreter service for OptiLang core execution, parsing, and analysis",
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # ── CORS — must be added BEFORE auth middleware ───────────────────────────
    # Allows the browser (localhost:3000) to call localhost:8000
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],   # allows X-Internal-Service-Secret
    )

    app.state.request_timestamps = deque()
    app.state.rate_limit_lock = Lock()
    app.state.rate_limit_window_seconds = 60

    @app.middleware("http")
    async def protect_interpreter_service(request: Request, call_next):
        path = request.url.path

        # Allow CORS preflight OPTIONS through without auth check
        if request.method == "OPTIONS":
            return await call_next(request)

        if path in UNPROTECTED_PATHS or path.startswith(DOCS_PATH_PREFIXES):
            return await call_next(request)

        shared_secret = request.headers.get("X-Internal-Service-Secret")
        if shared_secret != settings.internal_api_secret:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Forbidden"},
            )

        now = monotonic()
        timestamps = app.state.request_timestamps
        rate_limit_lock = app.state.rate_limit_lock
        window = app.state.rate_limit_window_seconds

        async with rate_limit_lock:
            while timestamps and now - timestamps[0] >= window:
                timestamps.popleft()

            if len(timestamps) >= settings.rate_limit_per_minute:
                retry_after = max(1, int(window - (now - timestamps[0])))
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={"Retry-After": str(retry_after)},
                    content={"detail": "Interpreter rate limit exceeded. Please retry shortly."},
                )

            timestamps.append(now)
        return await call_next(request)

    app.include_router(analysis_router)
    app.include_router(execution_router)
    app.include_router(health_router)
    app.include_router(language_router)
    app.include_router(optimization_router)
    app.include_router(profile_router)
    app.include_router(score_router)

    @app.on_event("startup")
    async def startup_event():
        logger.info(f"{settings.app_name} v{settings.version} starting up...")
        logger.info(f"Debug mode: {settings.debug}")
        logger.info("Global interpreter rate limit: %s requests/minute", settings.rate_limit_per_minute)

    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info(f"{settings.app_name} shutting down...")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
