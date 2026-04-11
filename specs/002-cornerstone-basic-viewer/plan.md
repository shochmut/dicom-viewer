# Implementation Plan: Sample-Backed Cornerstone Viewer

**Branch**: `[002-cornerstone-basic-viewer]` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cornerstone-basic-viewer/spec.md`

## Summary

Replace the placeholder viewport with a real Cornerstone stack viewer that
loads sample DICOM series from the backend, automatically renders the initial
series, and supports drag-to-pan plus mouse-wheel zoom. Keep the slice narrow:
reuse the existing study queue and series inspector, add a focused backend
manifest plus file-serving contract for sample instances, and contain
Cornerstone lifecycle code inside a dedicated frontend viewer adapter.

## Technical Context

**Language/Version**: TypeScript 5.8 on the frontend and Python 3.12 on the backend  
**Primary Dependencies**: React 19, Vite 7, FastAPI, pydicom, `@cornerstonejs/core`, planned `@cornerstonejs/tools`, planned `@cornerstonejs/dicom-image-loader`  
**Storage**: Local filesystem sample data under `backend/sample_dicom`; in-memory frontend viewer state and Cornerstone caches  
**Testing**: `npm run lint`, `npm run build`, `poetry run ruff check .`, `poetry run mypy app`, and planned backend contract tests via `poetry run pytest tests/test_sample_viewer_api.py`  
**Target Platform**: Local desktop browsers served by Vite against a local FastAPI backend in development  
**Project Type**: Monorepo web application with a React frontend and FastAPI backend  
**Performance Goals**: Initial sample series render in under 5 seconds after bootstrap, selected-series swaps in under 3 seconds for the current sample dataset, and pan plus zoom remain responsive on typical developer hardware  
**Constraints**: Stay explicitly non-diagnostic; support only local sample data in this phase; avoid uploads, external DICOM selection, MPR, and volume rendering; keep `/api/v1/studies` lightweight; do not expose absolute filesystem paths to the browser  
**Scale/Scope**: One primary viewport, one existing frontend workspace shell, one backend sample-data source, and the current local sample study set with 6 series and 135 DICOM instances

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clinical safety boundaries identified: PASS. The feature remains explicitly
  non-diagnostic, is limited to local sample data, does not introduce derived
  measurements or model output, and will keep user-facing viewer and error text
  aligned with the repository's non-diagnostic language. Post-design re-check:
  PASS.
- Contract-first scope identified: PASS. Affected contracts are the existing
  study-summary feed at `GET /api/v1/studies`, a new per-series viewport
  manifest endpoint, a new instance file-streaming endpoint, and the frontend
  adapter contract that converts backend `imageUrl` values into Cornerstone
  `wado-uri:` image IDs. These are captured in
  `contracts/sample-series-viewport.md`. Post-design re-check: PASS.
- Verification plan defined: PASS. Implementation verification will run
  `npm run lint` and `npm run build` from `frontend/`, `poetry run ruff check .`
  and `poetry run mypy app` from `backend/`, plus a focused backend contract
  test for the manifest and file-serving endpoints. Manual smoke testing will
  verify initial render, drag-to-pan, wheel zoom, selection changes, and error
  handling. Post-design re-check: PASS.
- Performance expectations defined: PASS. The design targets the current local
  sample dataset, keeps bootstrap study loading lightweight, fetches instance
  manifests only for the active series, and requires explicit loading and error
  states when rendering or file access fails. Post-design re-check: PASS.
- Complexity justified: PASS. The design adds only the minimum new surface area:
  one viewer-focused frontend adapter, one manifest endpoint, one file-serving
  endpoint, and the Cornerstone packages required for stack rendering and basic
  tool bindings. Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-cornerstone-basic-viewer/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- sample-series-viewport.md
`-- tasks.md
```

### Source Code (repository root)

```text
backend/
|-- app/
|   |-- api/
|   |   |-- routes/
|   |   |   `-- studies.py
|   |   `-- router.py
|   |-- services/
|   |   `-- dicom_catalog.py
|   |-- config.py
|   `-- schemas.py
`-- tests/
    `-- test_sample_viewer_api.py

frontend/
|-- src/
|   |-- components/
|   |   `-- CornerstoneViewport.tsx
|   |-- lib/
|   |   |-- api.ts
|   |   `-- cornerstoneViewer.ts
|   |-- App.tsx
|   |-- App.css
|   `-- types.ts
|-- package.json
`-- package-lock.json
```

**Structure Decision**: Use the existing monorepo layout and keep the feature as
one vertical slice across the current backend and frontend applications. The
backend extends the study API surface and DICOM catalog service to expose an
ordered sample-series manifest plus file-serving route. The frontend keeps
selection state in `App.tsx`, adds a dedicated viewport component and
Cornerstone adapter under `frontend/src/`, and updates types and API helpers to
consume the new contract.

## Complexity Tracking

No constitution violations or extra complexity exceptions are required for this
feature.
