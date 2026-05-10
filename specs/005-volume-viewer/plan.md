# Implementation Plan: 3D Volume Viewer

**Branch**: `005-volume-viewer` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-volume-viewer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a selectable 3D Volume viewer mode to the existing DICOM viewer so the user can open the currently selected DICOM series as a non-diagnostic 3D volume, rotate it with click-and-drag, and zoom it with the mouse wheel. The technical approach reuses the current React + Vite frontend, FastAPI study catalog, pydicom-backed local sample data, and installed Cornerstone packages. The implementation should extend the current viewer shell and Cornerstone adapter rather than introduce a separate rendering stack.

## Technical Context

**Language/Version**: TypeScript 5.8 on the frontend; Python 3.12 on the backend  
**Primary Dependencies**: React 19, Vite 7, FastAPI, pydicom, `@cornerstonejs/core`, `@cornerstonejs/tools`, `@cornerstonejs/dicom-image-loader`  
**Storage**: Local filesystem DICOM sample data under `backend/sample_dicom`; no persistent application storage changes  
**Testing**: Frontend `npm run lint` and `npm run build`; backend `poetry run ruff check .`, `poetry run mypy app`, and targeted pytest if backend contract behavior changes  
**Target Platform**: Desktop web browser with local FastAPI backend for sample DICOM data  
**Project Type**: Web application with frontend viewer and backend DICOM catalog service  
**Performance Goals**: Volume tab shows a usable volume or clear state within 5 seconds for target sample datasets; rotate and zoom interactions remain continuous during normal desktop use  
**Constraints**: Non-diagnostic viewer only; preserve selected DICOM context across tabs; avoid extra patient-identifying displays; keep long-running volume preparation out of confusing blank states  
**Scale/Scope**: One viewer mode added to the existing single-page DICOM workbench; local sample series are the target data source for this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clinical safety boundaries identified: PASS. The feature is explicitly non-diagnostic, adds no measurements or clinical decisions, and must display non-diagnostic status consistently with the existing workbench.
- Contract-first scope identified: PASS. Affected contracts are the frontend viewer mode contract, the Cornerstone viewport adapter contract, and the existing series viewport manifest. The plan prefers reusing the existing manifest and documents the fallback if a backend contract extension becomes necessary.
- Verification plan defined: PASS. Required checks are frontend lint/build, interaction-focused frontend tests where practical, and backend ruff/mypy/pytest only if the manifest contract changes.
- Performance expectations defined: PASS. The plan names the 5-second load/status target, responsive rotate/zoom expectations, loading/error states, and large or invalid series fallback behavior.
- Complexity justified: PASS. No new service boundary or rendering stack is planned. The only new abstraction is a small viewer adapter split for stack versus volume behavior, justified by different Cornerstone viewport modes.

## Project Structure

### Documentation (this feature)

```text
specs/005-volume-viewer/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- series-viewport-manifest.md
|   `-- volume-viewer-ui.md
`-- tasks.md
```

### Source Code (repository root)

```text
backend/
|-- app/
|   |-- api/routes/studies.py
|   |-- schemas.py
|   `-- services/dicom_catalog.py
`-- tests/

frontend/
|-- src/
|   |-- App.tsx
|   |-- App.css
|   |-- components/
|   |   |-- CornerstoneViewport.tsx
|   |   `-- VolumeViewport.tsx
|   |-- lib/
|   |   |-- api.ts
|   |   `-- cornerstoneViewer.ts
|   `-- types.ts
```

**Structure Decision**: Use the existing web application structure. Frontend changes should live in `frontend/src` beside the current viewer shell and Cornerstone adapter. Backend files are listed only because the existing manifest endpoint is the data contract for rendering; backend edits should be avoided unless implementation proves the current ordered instance manifest is insufficient for Cornerstone volume loading.

## Complexity Tracking

No constitution violations or additional complexity are planned.

## Phase 0: Research

Research completed in [research.md](./research.md). All planning unknowns are resolved without adding a new toolchain.

## Phase 1: Design & Contracts

Design artifacts completed:

- [data-model.md](./data-model.md)
- [contracts/series-viewport-manifest.md](./contracts/series-viewport-manifest.md)
- [contracts/volume-viewer-ui.md](./contracts/volume-viewer-ui.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- Clinical safety boundaries identified: PASS. The design keeps the 3D view non-diagnostic and does not expand PHI display beyond existing study and series metadata.
- Contract-first scope identified: PASS. The UI mode contract and series manifest dependency are documented before tasks are generated.
- Verification plan defined: PASS. Quickstart includes frontend lint/build and backend checks when backend files change.
- Performance expectations defined: PASS. Loading, invalid data, and interaction responsiveness expectations are carried into the contracts and quickstart.
- Complexity justified: PASS. The feature remains a thin extension of the existing viewer and installed imaging dependencies.
