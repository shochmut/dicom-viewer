from fastapi import APIRouter

from app.api.routes import analysis, config, health, studies

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(config.router, tags=["config"])
api_router.include_router(studies.router, prefix="/studies", tags=["studies"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
