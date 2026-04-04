from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas import StudySummaryResponse
from app.services.dicom_catalog import load_study_catalog

router = APIRouter()


@router.get("", response_model=list[StudySummaryResponse])
def list_studies() -> list[StudySummaryResponse]:
    settings = get_settings()
    return load_study_catalog(
        settings.dicom_sample_dir,
        settings.allowed_file_suffixes,
    )


@router.get("/{study_uid}", response_model=StudySummaryResponse)
def get_study(study_uid: str) -> StudySummaryResponse:
    settings = get_settings()
    studies = load_study_catalog(
        settings.dicom_sample_dir,
        settings.allowed_file_suffixes,
    )

    for study in studies:
        if study.uid == study_uid:
            return study

    raise HTTPException(status_code=404, detail="Study not found")
