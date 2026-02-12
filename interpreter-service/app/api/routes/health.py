from fastapi import APIRouter
from app.schemas.responses import HealthResponse
from app.core.config import settings
from datetime import datetime

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns:
        Service health status
    """
    return HealthResponse(
        status="healthy",
        version=settings.version,
        timestamp=datetime.utcnow()
    )


@router.get("/")
async def root() -> dict:
    """
    Root endpoint.
    
    Returns:
        Service information
    """
    return {
        "service": settings.app_name,
        "version": settings.version,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }
