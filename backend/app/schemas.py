from typing import Literal

from pydantic import BaseModel, ConfigDict


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)


class HealthResponse(ApiModel):
    status: str
    service: str
    version: str
    dicom_catalog_ready: bool


class ApiConfigResponse(ApiModel):
    app_name: str
    viewer_title: str
    api_prefix: str
    dicomweb_mode: Literal["proxy", "direct"]
    dicomweb_base_url: str | None
    sample_directory: str
    sample_directory_exists: bool
    features: list[str]


class SeriesSummaryResponse(ApiModel):
    uid: str
    modality: str | None
    description: str | None
    body_part: str | None
    instance_count: int


class StudySummaryResponse(ApiModel):
    uid: str
    patient_id: str | None
    patient_name: str | None
    description: str | None
    accession_number: str | None
    study_date: str | None
    instance_count: int
    source: Literal["filesystem", "demo"]
    series: list[SeriesSummaryResponse]


class RenderableInstanceResponse(ApiModel):
    instance_id: str
    sop_instance_uid: str | None
    instance_number: int | None
    image_url: str
    content_type: str


class SeriesViewportResponse(ApiModel):
    study_uid: str
    series_uid: str
    series_description: str | None
    modality: str | None
    instance_count: int
    initial_image_index: int
    instances: list[RenderableInstanceResponse]


class AnalysisStatusResponse(ApiModel):
    enabled: bool
    status: Literal["planned", "ready"]
    workloads: list[str]
