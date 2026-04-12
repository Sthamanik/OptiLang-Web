from app.api.routes.execution import router as execution_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.health import router as health_router
from app.api.routes.language import router as language_router
from app.api.routes.optimization import router as optimization_router

__all__ = [
    "execution_router",
    "analysis_router",
    "health_router",
    "language_router",
    "optimization_router",
]
