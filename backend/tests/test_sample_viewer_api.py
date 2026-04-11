from pathlib import Path
from typing import Iterator
from urllib.parse import quote

import pytest
from app.config import get_settings
from app.main import create_app
from fastapi.testclient import TestClient
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import (
    ExplicitVRLittleEndian,
    SecondaryCaptureImageStorage,
    generate_uid,
)


def create_test_client(
    monkeypatch: pytest.MonkeyPatch,
    sample_dir: Path | None = None,
) -> TestClient:
    if sample_dir is None:
        monkeypatch.delenv("DICOM_SAMPLE_DIR", raising=False)
    else:
        monkeypatch.setenv("DICOM_SAMPLE_DIR", str(sample_dir))

    get_settings.cache_clear()
    return TestClient(create_app())


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    with create_test_client(monkeypatch) as current_client:
        yield current_client

    get_settings.cache_clear()


def write_test_dicom(
    path: Path,
    study_uid: str,
    series_uid: str,
    *,
    with_pixel_data: bool,
) -> None:
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    dataset = FileDataset(str(path), {}, file_meta=file_meta, preamble=b"\0" * 128)
    dataset.is_little_endian = True
    dataset.is_implicit_VR = False
    dataset.SOPClassUID = SecondaryCaptureImageStorage
    dataset.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    dataset.StudyInstanceUID = study_uid
    dataset.SeriesInstanceUID = series_uid
    dataset.InstanceNumber = 1
    dataset.PatientID = "TEST-PATIENT"
    dataset.PatientName = "Test^Patient"
    dataset.SeriesDescription = "Synthetic series"
    dataset.Modality = "OT"
    dataset.Rows = 2
    dataset.Columns = 2
    dataset.SamplesPerPixel = 1
    dataset.PhotometricInterpretation = "MONOCHROME2"
    dataset.BitsAllocated = 8
    dataset.BitsStored = 8
    dataset.HighBit = 7
    dataset.PixelRepresentation = 0

    if with_pixel_data:
        dataset.PixelData = bytes([0, 1, 2, 3])

    dataset.save_as(path)


def get_first_sample_selection(client: TestClient) -> tuple[str, str]:
    response = client.get("/api/v1/studies")
    response.raise_for_status()
    payload = response.json()
    first_study = payload[0]
    first_series = first_study["series"][0]
    return first_study["uid"], first_series["uid"]


def test_viewport_manifest_returns_renderable_instances(client: TestClient) -> None:
    study_uid, series_uid = get_first_sample_selection(client)

    response = client.get(
        "/api/v1/studies/"
        f"{quote(study_uid, safe='')}/series/{quote(series_uid, safe='')}/viewport"
    )

    assert response.status_code == 200
    payload = response.json()

    assert payload["studyUid"] == study_uid
    assert payload["seriesUid"] == series_uid
    assert payload["instanceCount"] == len(payload["instances"])
    assert payload["initialImageIndex"] == 0
    assert payload["instances"]
    assert payload["instances"][0]["contentType"] == "application/dicom"
    assert "/instances/" in payload["instances"][0]["imageUrl"]


def test_instance_file_endpoint_streams_dicom_content(client: TestClient) -> None:
    study_uid, series_uid = get_first_sample_selection(client)
    manifest_response = client.get(
        "/api/v1/studies/"
        f"{quote(study_uid, safe='')}/series/{quote(series_uid, safe='')}/viewport"
    )
    manifest_response.raise_for_status()
    image_url = manifest_response.json()["instances"][0]["imageUrl"]

    response = client.get(image_url)

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/dicom"
    assert len(response.content) > 0


def test_viewport_manifest_returns_not_found_for_missing_series(
    client: TestClient,
) -> None:
    study_uid, _ = get_first_sample_selection(client)

    response = client.get(
        f"/api/v1/studies/{quote(study_uid, safe='')}/series/missing-series/viewport"
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Series not found for requested study"}


def test_viewport_manifest_returns_conflict_for_non_renderable_series(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    study_uid = generate_uid()
    series_uid = generate_uid()
    series_dir = tmp_path / "study-a" / "series-a"
    series_dir.mkdir(parents=True)
    write_test_dicom(
        series_dir / "metadata-only.dcm",
        study_uid,
        series_uid,
        with_pixel_data=False,
    )

    with create_test_client(monkeypatch, tmp_path) as current_client:
        response = current_client.get(
            "/api/v1/studies/"
            f"{quote(study_uid, safe='')}/series/{quote(series_uid, safe='')}/viewport"
        )

    get_settings.cache_clear()

    assert response.status_code == 409
    assert response.json() == {
        "detail": "Selected series has no renderable DICOM instances"
    }


def test_instance_file_endpoint_returns_not_found_for_missing_instance(
    client: TestClient,
) -> None:
    study_uid, series_uid = get_first_sample_selection(client)

    response = client.get(
        "/api/v1/studies/"
        f"{quote(study_uid, safe='')}/series/{quote(series_uid, safe='')}/instances/"
        "missing-instance/file"
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Instance file not found"}
