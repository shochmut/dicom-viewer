from fastapi import APIRouter

from app.config import get_settings
from app.schemas import HealthResponse

router = APIRouter()


@router.get("", response_model=HealthResponse)
def read_health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.version,
        dicom_catalog_ready=settings.dicom_sample_dir.exists(),
    )
