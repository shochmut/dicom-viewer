from dataclasses import dataclass, field
from pathlib import Path

import pydicom
from pydicom.errors import InvalidDicomError

from app.schemas import SeriesSummaryResponse, StudySummaryResponse


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


def _read_text(dataset: pydicom.dataset.FileDataset, attribute: str) -> str | None:
    value = dataset.get(attribute)
    if value is None:
        return None

    text_value = str(value).strip()
    return text_value or None


def _normalize_dicom_date(value: str | None) -> str | None:
    if not value:
        return None

    if len(value) == 8 and value.isdigit():
        return f"{value[0:4]}-{value[4:6]}-{value[6:8]}"

    return value


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

        study_uid = _read_text(dataset, "StudyInstanceUID") or (
            f"study:{dicom_path.parent.name}"
        )
        series_uid = _read_text(dataset, "SeriesInstanceUID") or (
            f"{study_uid}:{dicom_path.stem}"
        )

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
                    uid=series.uid,
                    modality=series.modality,
                    description=series.description,
                    body_part=series.body_part,
                    instance_count=series.instance_count,
                )
                for series in sorted(
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
