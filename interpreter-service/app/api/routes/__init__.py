from app.api.routes.analyze import router as analysis_router
from app.api.routes.execute import router as execution_router
from app.api.routes.health import router as health_router
from app.api.routes.language import router as language_router
from app.api.routes.optimize import router as optimization_router
from app.api.routes.profile import router as profile_router
from app.api.routes.score import router as score_router

__all__ = [
    "analysis_router",
    "execution_router",
    "health_router",
    "language_router",
    "optimization_router",
    "profile_router",
    "score_router",
]