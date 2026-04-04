from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import get_settings
from app.schemas import HealthResponse


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        summary="API and DICOM utilities for the dicom-viewer monorepo",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_prefix)

    @app.get("/", tags=["meta"])
    def read_root() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "api_prefix": settings.api_prefix,
            "docs_url": "/docs",
        }

    @app.get("/healthz", include_in_schema=False, response_model=HealthResponse)
    def read_healthz() -> HealthResponse:
        return HealthResponse(
            status="ok",
            service=settings.app_name,
            version=settings.version,
            dicom_catalog_ready=settings.dicom_sample_dir.exists(),
        )

    return app


app = create_app()
