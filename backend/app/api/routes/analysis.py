from fastapi import APIRouter

from app.config import get_settings
from app.schemas import AnalysisStatusResponse

router = APIRouter()


@router.get("/status", response_model=AnalysisStatusResponse)
def read_analysis_status() -> AnalysisStatusResponse:
    settings = get_settings()
    return AnalysisStatusResponse(
        enabled=settings.analysis_enabled,
        status="ready" if settings.analysis_enabled else "planned",
        workloads=[
            "stress-strain modeling",
            "exploratory model experiments",
            "derived measurement prototypes",
        ],
    )
