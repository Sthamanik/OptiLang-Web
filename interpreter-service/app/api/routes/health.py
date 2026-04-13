from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas.responses import HealthResponse
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        version=settings.version,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/")
async def root() -> dict:
    return {
        "service": settings.app_name,
        "version": settings.version,
        "status": "running",
        "docs": "/docs",
    }