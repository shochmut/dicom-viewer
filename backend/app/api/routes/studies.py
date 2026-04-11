from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import get_settings
from app.schemas import SeriesViewportResponse, StudySummaryResponse
from app.services.dicom_catalog import (
    DICOM_CONTENT_TYPE,
    InstanceNotFoundError,
    NoRenderableInstancesError,
    SeriesNotFoundError,
    StudyNotFoundError,
    load_series_viewport_manifest,
    load_study_catalog,
    resolve_renderable_instance_path,
)

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


@router.get(
    "/{study_uid}/series/{series_uid}/viewport",
    response_model=SeriesViewportResponse,
)
def get_series_viewport(study_uid: str, series_uid: str) -> SeriesViewportResponse:
    settings = get_settings()

    try:
        return load_series_viewport_manifest(
            settings.dicom_sample_dir,
            settings.allowed_file_suffixes,
            study_uid,
            series_uid,
            settings.api_prefix,
        )
    except (StudyNotFoundError, SeriesNotFoundError) as error:
        raise HTTPException(
            status_code=404,
            detail="Series not found for requested study",
        ) from error
    except NoRenderableInstancesError as error:
        raise HTTPException(
            status_code=409,
            detail="Selected series has no renderable DICOM instances",
        ) from error


@router.get("/{study_uid}/series/{series_uid}/instances/{instance_id}/file")
def get_series_instance_file(
    study_uid: str,
    series_uid: str,
    instance_id: str,
) -> FileResponse:
    settings = get_settings()

    try:
        instance_path = resolve_renderable_instance_path(
            settings.dicom_sample_dir,
            settings.allowed_file_suffixes,
            study_uid,
            series_uid,
            instance_id,
        )
    except (StudyNotFoundError, SeriesNotFoundError, InstanceNotFoundError) as error:
        detail = (
            "Instance file not found"
            if isinstance(error, InstanceNotFoundError)
            else "Series not found for requested study"
        )
        raise HTTPException(status_code=404, detail=detail) from error
    except NoRenderableInstancesError as error:
        raise HTTPException(
            status_code=409,
            detail="Selected series has no renderable DICOM instances",
        ) from error

    return FileResponse(
        path=instance_path,
        media_type=DICOM_CONTENT_TYPE,
        filename=instance_path.name,
    )
