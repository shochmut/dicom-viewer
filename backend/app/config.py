import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Literal


def _parse_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default

    items = [item.strip() for item in value.split(",")]
    return [item for item in items if item]


@dataclass(frozen=True)
class Settings:
    app_name: str
    viewer_title: str
    version: str
    api_prefix: str
    cors_origins: list[str]
    dicom_sample_dir: Path
    dicomweb_mode: Literal["proxy", "direct"]
    dicomweb_base_url: str | None
    analysis_enabled: bool
    allowed_file_suffixes: tuple[str, ...]


@lru_cache
def get_settings() -> Settings:
    backend_root = Path(__file__).resolve().parent.parent
    default_sample_dir = (backend_root / "sample_dicom").resolve()

    configured_sample_dir = os.getenv("DICOM_SAMPLE_DIR")
    sample_dir = (
        Path(configured_sample_dir).expanduser().resolve()
        if configured_sample_dir
        else default_sample_dir
    )

    configured_mode = os.getenv("DICOMWEB_MODE", "proxy").strip().lower()
    dicomweb_mode: Literal["proxy", "direct"] = (
        "direct" if configured_mode == "direct" else "proxy"
    )

    return Settings(
        app_name=os.getenv("APP_NAME", "DICOM Viewer API"),
        viewer_title=os.getenv("VIEWER_TITLE", "DICOM Workbench"),
        version="0.1.0",
        api_prefix="/api/v1",
        cors_origins=_parse_csv(
            os.getenv("CORS_ORIGINS"),
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        ),
        dicom_sample_dir=sample_dir,
        dicomweb_mode=dicomweb_mode,
        dicomweb_base_url=os.getenv("DICOMWEB_BASE_URL", "").strip() or None,
        analysis_enabled=os.getenv("ENABLE_ANALYSIS", "").strip().lower()
        in {"1", "true", "yes", "on"},
        allowed_file_suffixes=(".dcm", ".dicom"),
    )
