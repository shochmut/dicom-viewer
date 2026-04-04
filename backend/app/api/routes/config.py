from fastapi import APIRouter

from app.config import get_settings
from app.schemas import ApiConfigResponse

router = APIRouter()


@router.get("/config", response_model=ApiConfigResponse)
def read_config() -> ApiConfigResponse:
    settings = get_settings()
    return ApiConfigResponse(
        app_name=settings.app_name,
        viewer_title=settings.viewer_title,
        api_prefix=settings.api_prefix,
        dicomweb_mode=settings.dicomweb_mode,
        dicomweb_base_url=settings.dicomweb_base_url,
        sample_directory=str(settings.dicom_sample_dir),
        sample_directory_exists=settings.dicom_sample_dir.exists(),
        features=[
            "viewer-shell",
            "study-catalog",
            "dicomweb-proxy-placeholder",
            "analysis-placeholder",
        ],
    )
