# Quickstart: Sample-Backed Cornerstone Viewer

## Purpose

This quickstart describes the intended development and verification flow for the
sample-backed Cornerstone viewer feature before implementation begins.

## Prerequisites

- Python 3.12 and Poetry available locally
- Node.js available locally for the Vite frontend
- Repository checkout on `002-cornerstone-basic-viewer` or a branch that
  contains the final implementation
- Sample DICOM files present under `backend/sample_dicom`

## Run The Backend

1. Start in the backend project:

```bash
cd backend
```

2. Install backend dependencies:

```bash
poetry install
```

3. Start the FastAPI server:

```bash
poetry run uvicorn app.main:app --reload
```

## Run The Frontend

1. In a separate terminal, move into the frontend project:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

## Viewer Smoke Test

1. Open the frontend in the browser while the backend is running.
2. Confirm the study queue loads sample-backed study metadata from the backend.
3. Confirm the first renderable sample series appears in
   `#cornerstone-viewport` after the workspace finishes bootstrapping.
4. Click and drag inside the viewport and verify the image pans.
5. Use the mouse wheel over the viewport and verify the image zooms in and out.
6. Select a different sample series from the existing workspace controls and
   verify the viewport updates to the new content.
7. Temporarily force a missing-series or unreadable-file condition and verify
   the viewport shows a visible error state instead of a blank surface.

## Planned Verification Commands

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
poetry run ruff check .
poetry run mypy app
poetry run pytest tests/test_sample_viewer_api.py
```

## Expected Results

- The viewport renders sample-backed DICOM content without the placeholder
  callout.
- Drag-to-pan and wheel zoom remain responsive on the current sample dataset.
- Selection changes load the newly selected sample series without a full page
  refresh.
- The backend manifest and file-serving endpoints pass their contract tests.

## Recovery Notes

- If the frontend cannot reach the backend, verify `VITE_API_BASE_URL` points to
  the FastAPI server.
- If the viewport shows no sample content, verify `backend/sample_dicom`
  exists and the backend can enumerate DICOM files from that directory.
- If the viewer library fails to initialize, reinstall frontend dependencies and
  re-run the build to catch missing packages or import errors.
