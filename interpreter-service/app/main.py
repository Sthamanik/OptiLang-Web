from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import execution_router, analysis_router, health_router
import logging

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description="Interpreter service for OptiLang - Execute and analyze PyLite code",
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health_router)
    app.include_router(execution_router)
    app.include_router(analysis_router)
    
    @app.on_event("startup")
    async def startup_event():
        """Actions to perform on application startup."""
        logger.info(f"{settings.app_name} v{settings.version} starting up...")
        logger.info(f"Debug mode: {settings.debug}")
        logger.info(f"CORS origins: {settings.cors_origins}")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Actions to perform on application shutdown."""
        logger.info(f"{settings.app_name} shutting down...")
    
    return app


# Create app instance
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
