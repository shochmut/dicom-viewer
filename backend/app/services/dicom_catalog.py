from dataclasses import dataclass, field
from functools import lru_cache
from hashlib import sha1
from pathlib import Path
from urllib.parse import quote

import pydicom
from pydicom.errors import InvalidDicomError

from app.schemas import (
    RenderableInstanceResponse,
    SeriesSummaryResponse,
    SeriesViewportResponse,
    StudySummaryResponse,
)

DICOM_CONTENT_TYPE = "application/dicom"


class CatalogLookupError(Exception):
    """Base exception for sample DICOM catalog lookup errors."""


class StudyNotFoundError(CatalogLookupError):
    """Raised when a requested study is not present in the sample catalog."""


class SeriesNotFoundError(CatalogLookupError):
    """Raised when a requested series is not present in the sample catalog."""


class NoRenderableInstancesError(CatalogLookupError):
    """Raised when a requested series has no renderable instances."""


class InstanceNotFoundError(CatalogLookupError):
    """Raised when a requested instance file is not present in a renderable series."""


@dataclass
class SeriesAccumulator:
    uid: str
    modality: str | None
    description: str | None
    body_part: str | None
    instance_count: int = 0


@dataclass
class StudyAccumulator:
    uid: str
    patient_id: str | None
    patient_name: str | None
    description: str | None
    accession_number: str | None
    study_date: str | None
    instance_count: int = 0
    series: dict[str, SeriesAccumulator] = field(default_factory=dict)


@dataclass(frozen=True)
class RenderableInstanceRecord:
    instance_id: str
    path: Path
    sop_instance_uid: str | None
    instance_number: int | None


@dataclass(frozen=True)
class SeriesViewportRecord:
    study_uid: str
    series_uid: str
    series_description: str | None
    modality: str | None
    instances: tuple[RenderableInstanceRecord, ...]


def _read_text(dataset: pydicom.dataset.FileDataset, attribute: str) -> str | None:
    value = dataset.get(attribute)
    if value is None:
        return None

    text_value = str(value).strip()
    return text_value or None


def _read_int(dataset: pydicom.dataset.FileDataset, attribute: str) -> int | None:
    value = dataset.get(attribute)
    if value is None:
        return None

    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _normalize_dicom_date(value: str | None) -> str | None:
    if not value:
        return None

    if len(value) == 8 and value.isdigit():
        return f"{value[0:4]}-{value[4:6]}-{value[6:8]}"

    return value


def _resolve_study_uid(dataset: pydicom.dataset.FileDataset, dicom_path: Path) -> str:
    return _read_text(dataset, "StudyInstanceUID") or f"study:{dicom_path.parent.name}"


def _resolve_series_uid(
    dataset: pydicom.dataset.FileDataset,
    dicom_path: Path,
    study_uid: str,
) -> str:
    return _read_text(dataset, "SeriesInstanceUID") or f"{study_uid}:{dicom_path.stem}"


def _is_renderable_dataset(dataset: pydicom.dataset.FileDataset) -> bool:
    return (
        dataset.get("PixelData") is not None
        and dataset.get("Rows") is not None
        and dataset.get("Columns") is not None
    )


def _build_instance_id(sample_dir: Path, dicom_path: Path) -> str:
    relative_path = dicom_path.resolve().relative_to(sample_dir.resolve()).as_posix()
    return sha1(relative_path.encode("utf-8")).hexdigest()[:16]


def _normalize_sample_dir_cache_key(sample_dir: Path) -> str:
    return str(sample_dir.resolve())


def _iter_dicom_files(
    sample_dir: Path,
    allowed_file_suffixes: tuple[str, ...],
) -> list[Path]:
    if not sample_dir.exists():
        return []

    files: list[Path] = []
    for path in sample_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in allowed_file_suffixes:
            files.append(path)

    return sorted(files)


def load_study_catalog(
    sample_dir: Path,
    allowed_file_suffixes: tuple[str, ...],
) -> list[StudySummaryResponse]:
    studies: dict[str, StudyAccumulator] = {}

    for dicom_path in _iter_dicom_files(sample_dir, allowed_file_suffixes):
        try:
            dataset = pydicom.dcmread(dicom_path, stop_before_pixels=True, force=True)
        except (InvalidDicomError, FileNotFoundError, PermissionError, OSError):
            continue

        study_uid = _resolve_study_uid(dataset, dicom_path)
        series_uid = _resolve_series_uid(dataset, dicom_path, study_uid)

        study = studies.setdefault(
            study_uid,
            StudyAccumulator(
                uid=study_uid,
                patient_id=_read_text(dataset, "PatientID"),
                patient_name=_read_text(dataset, "PatientName"),
                description=_read_text(dataset, "StudyDescription"),
                accession_number=_read_text(dataset, "AccessionNumber"),
                study_date=_normalize_dicom_date(_read_text(dataset, "StudyDate")),
            ),
        )

        study.instance_count += 1
        if study.patient_id is None:
            study.patient_id = _read_text(dataset, "PatientID")
        if study.patient_name is None:
            study.patient_name = _read_text(dataset, "PatientName")
        if study.description is None:
            study.description = _read_text(dataset, "StudyDescription")
        if study.accession_number is None:
            study.accession_number = _read_text(dataset, "AccessionNumber")
        if study.study_date is None:
            study.study_date = _normalize_dicom_date(_read_text(dataset, "StudyDate"))

        series = study.series.setdefault(
            series_uid,
            SeriesAccumulator(
                uid=series_uid,
                modality=_read_text(dataset, "Modality"),
                description=_read_text(dataset, "SeriesDescription"),
                body_part=_read_text(dataset, "BodyPartExamined"),
            ),
        )
        series.instance_count += 1

    return [
        StudySummaryResponse(
            uid=study.uid,
            patient_id=study.patient_id,
            patient_name=study.patient_name,
            description=study.description,
            accession_number=study.accession_number,
            study_date=study.study_date,
            instance_count=study.instance_count,
            source="filesystem",
            series=[
                SeriesSummaryResponse(
                    uid=current_series.uid,
                    modality=current_series.modality,
                    description=current_series.description,
                    body_part=current_series.body_part,
                    instance_count=current_series.instance_count,
                )
                for current_series in sorted(
                    study.series.values(),
                    key=lambda current_series: (
                        current_series.modality or "",
                        current_series.description or "",
                        current_series.uid,
                    ),
                )
            ],
        )
        for study in sorted(
            studies.values(),
            key=lambda current_study: (
                current_study.study_date or "",
                current_study.patient_name or "",
                current_study.uid,
            ),
            reverse=True,
        )
    ]


@lru_cache(maxsize=128)
def _load_series_viewport_record_cached(
    sample_dir_key: str,
    allowed_file_suffixes: tuple[str, ...],
    study_uid: str,
    series_uid: str,
) -> SeriesViewportRecord:
    sample_dir = Path(sample_dir_key)
    matching_study_found = False
    matching_series_found = False
    series_description: str | None = None
    modality: str | None = None
    instances: list[RenderableInstanceRecord] = []

    for dicom_path in _iter_dicom_files(sample_dir, allowed_file_suffixes):
        try:
            dataset = pydicom.dcmread(dicom_path, force=True)
        except (InvalidDicomError, FileNotFoundError, PermissionError, OSError):
            continue

        current_study_uid = _resolve_study_uid(dataset, dicom_path)
        if current_study_uid != study_uid:
            continue

        matching_study_found = True
        current_series_uid = _resolve_series_uid(dataset, dicom_path, current_study_uid)
        if current_series_uid != series_uid:
            continue

        matching_series_found = True
        series_description = series_description or _read_text(
            dataset,
            "SeriesDescription",
        )
        modality = modality or _read_text(dataset, "Modality")

        if not _is_renderable_dataset(dataset):
            continue

        instances.append(
            RenderableInstanceRecord(
                instance_id=_build_instance_id(sample_dir, dicom_path),
                path=dicom_path.resolve(),
                sop_instance_uid=_read_text(dataset, "SOPInstanceUID"),
                instance_number=_read_int(dataset, "InstanceNumber"),
            )
        )

    if not matching_study_found:
        raise StudyNotFoundError(study_uid)

    if not matching_series_found:
        raise SeriesNotFoundError(series_uid)

    if not instances:
        raise NoRenderableInstancesError(series_uid)

    instances.sort(
        key=lambda current_instance: (
            current_instance.instance_number
            if current_instance.instance_number is not None
            else float("inf"),
            current_instance.sop_instance_uid or "",
            current_instance.path.as_posix(),
        )
    )

    return SeriesViewportRecord(
        study_uid=study_uid,
        series_uid=series_uid,
        series_description=series_description,
        modality=modality,
        instances=tuple(instances),
    )


def _load_series_viewport_record(
    sample_dir: Path,
    allowed_file_suffixes: tuple[str, ...],
    study_uid: str,
    series_uid: str,
) -> SeriesViewportRecord:
    return _load_series_viewport_record_cached(
        _normalize_sample_dir_cache_key(sample_dir),
        allowed_file_suffixes,
        study_uid,
        series_uid,
    )


def load_series_viewport_manifest(
    sample_dir: Path,
    allowed_file_suffixes: tuple[str, ...],
    study_uid: str,
    series_uid: str,
    api_prefix: str,
) -> SeriesViewportResponse:
    viewport_record = _load_series_viewport_record(
        sample_dir,
        allowed_file_suffixes,
        study_uid,
        series_uid,
    )
    encoded_study_uid = quote(study_uid, safe="")
    encoded_series_uid = quote(series_uid, safe="")

    return SeriesViewportResponse(
        study_uid=viewport_record.study_uid,
        series_uid=viewport_record.series_uid,
        series_description=viewport_record.series_description,
        modality=viewport_record.modality,
        instance_count=len(viewport_record.instances),
        initial_image_index=0,
        instances=[
            RenderableInstanceResponse(
                instance_id=current_instance.instance_id,
                sop_instance_uid=current_instance.sop_instance_uid,
                instance_number=current_instance.instance_number,
                image_url=(
                    f"{api_prefix}/studies/{encoded_study_uid}/series/"
                    f"{encoded_series_uid}/instances/{current_instance.instance_id}/file"
                ),
                content_type=DICOM_CONTENT_TYPE,
            )
            for current_instance in viewport_record.instances
        ],
    )


def resolve_renderable_instance_path(
    sample_dir: Path,
    allowed_file_suffixes: tuple[str, ...],
    study_uid: str,
    series_uid: str,
    instance_id: str,
) -> Path:
    viewport_record = _load_series_viewport_record(
        sample_dir,
        allowed_file_suffixes,
        study_uid,
        series_uid,
    )

    for current_instance in viewport_record.instances:
        if current_instance.instance_id == instance_id:
            return current_instance.path

    raise InstanceNotFoundError(instance_id)
