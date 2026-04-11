# dicom-viewer Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-08

## Active Technologies
- TypeScript 5.8 on the frontend and Python 3.12 on the backend + React 19, Vite 7, FastAPI, pydicom, `@cornerstonejs/core`, planned `@cornerstonejs/tools`, planned `@cornerstonejs/dicom-image-loader` (002-cornerstone-basic-viewer)
- Local filesystem sample data under `backend/sample_dicom`; in-memory frontend viewer state and Cornerstone caches (002-cornerstone-basic-viewer)

- Python 3.12 for backend tooling and YAML for GitHub Actions workflow definition + Poetry, Ruff, Mypy, FastAPI backend package, GitHub Actions (001-backend-ruff-linter)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

- `cd backend`
- `poetry install`
- `poetry run ruff check .`
- `poetry run mypy app`

## Code Style

Python 3.12 for backend tooling and YAML for GitHub Actions workflow definition: Follow standard conventions

## Recent Changes
- 002-cornerstone-basic-viewer: Added TypeScript 5.8 on the frontend and Python 3.12 on the backend + React 19, Vite 7, FastAPI, pydicom, `@cornerstonejs/core`, planned `@cornerstonejs/tools`, planned `@cornerstonejs/dicom-image-loader`

- 001-backend-ruff-linter: Added Python 3.12 for backend tooling and YAML for GitHub Actions workflow definition + Poetry, Ruff, Mypy, FastAPI backend package, GitHub Actions

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
