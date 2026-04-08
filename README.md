# dicom-viewer

Personal non-diagnostic sandbox for learning modern DICOM viewer tooling in a
monorepo setup.

## Stack

- Frontend: React + Vite viewer shell with a reserved Cornerstone 3D mount point
- Backend: FastAPI service for health/config endpoints and local DICOM catalog scanning
- DICOM access: DICOMweb proxy or direct browser access depending on CORS and deployment
- Future analysis: stress-strain modeling, measurements, and exploratory
  workflow research
- PACS target: dcm4chee or another DICOMweb-capable archive

## Repository Layout

```text
frontend/  React application shell
backend/   FastAPI API and DICOM utilities
```

## Current Scaffold

- Viewer workspace UI with study queue, viewport placeholder, series inspector, and config panels
- Backend API routes for health, config, studies, and analysis status
- Local sample DICOM convention at `backend/sample_dicom`
- Environment examples for both frontend and backend

## Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend quality:

```bash
cd backend
poetry install
poetry run ruff check .
poetry run mypy app
```

Backend API:

```bash
cd backend
poetry run uvicorn app.main:app --reload
```

Pull requests and pushes that change backend quality inputs run the
`backend-quality` workflow. If that workflow fails, rerun `poetry run ruff
check .` and `poetry run mypy app` from `backend/` to reproduce the failure
before pushing another update.

If `poetry` or `ruff` is unavailable locally, rerun `poetry install` from
`backend/` to restore the development toolchain.

## Next Steps

1. Initialize Cornerstone 3D in the `#cornerstone-viewport` element.
2. Add WADO-RS/QIDO-RS proxy endpoints for a real DICOMweb source.
3. Layer in viewer tools, annotations, and exploratory analysis pipelines with
   explicit non-diagnostic labeling.
