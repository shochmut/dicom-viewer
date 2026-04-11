# Tasks: Sample-Backed Cornerstone Viewer

**Input**: Design documents from `/specs/002-cornerstone-basic-viewer/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [sample-series-viewport.md](./contracts/sample-series-viewport.md)

**Tests**: Keep verification aligned with the constitution by adding backend contract coverage in `backend/tests/test_sample_viewer_api.py`, and by running `npm run lint`, `npm run build`, `poetry run ruff check .`, `poetry run mypy app`, and `poetry run pytest tests/test_sample_viewer_api.py` before sign-off.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repo for backend contract tests and frontend Cornerstone viewer work.

- [ ] T001 Update `frontend/package.json` and `frontend/package-lock.json` to add the Cornerstone viewer dependencies needed for stack rendering, tools, and DICOM loading
- [ ] T002 [P] Update `backend/pyproject.toml` and `backend/poetry.lock` to add the backend test dependency needed for `backend/tests/test_sample_viewer_api.py`
- [ ] T003 [P] Create the new implementation entry points at `frontend/src/components/CornerstoneViewport.tsx`, `frontend/src/lib/cornerstoneViewer.ts`, and `backend/tests/test_sample_viewer_api.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared sample-viewer contract and typed plumbing that all user stories depend on.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T004 Extend `backend/app/schemas.py` with the response models required for the sample series viewport manifest and renderable instances
- [ ] T005 [P] Add ordered series manifest generation and opaque instance lookup helpers to `backend/app/services/dicom_catalog.py`
- [ ] T006 [P] Add viewport manifest types and fetch helpers to `frontend/src/types.ts` and `frontend/src/lib/api.ts`

**Checkpoint**: The backend and frontend share a typed contract for loading one sample series into the viewport.

---

## Phase 3: User Story 1 - Open the Sample Viewer (Priority: P1) MVP

**Goal**: Replace the placeholder viewport with the first renderable sample series from `backend/sample_dicom`.

**Independent Test**: Start the backend and frontend, open the workspace, and confirm the first renderable sample series appears in `#cornerstone-viewport` without manual file loading.

### Verification for User Story 1

- [ ] T007 [P] [US1] Add contract coverage for the sample viewport manifest and DICOM file responses in `backend/tests/test_sample_viewer_api.py`

### Implementation for User Story 1

- [ ] T008 [US1] Implement the sample viewport manifest and instance file endpoints in `backend/app/api/routes/studies.py`
- [ ] T009 [P] [US1] Implement Cornerstone bootstrap, DICOM loader initialization, and stack loading helpers in `frontend/src/lib/cornerstoneViewer.ts`
- [ ] T010 [US1] Build `frontend/src/components/CornerstoneViewport.tsx` with initial loading, ready, and error rendering for one sample series
- [ ] T011 [US1] Replace the placeholder callout with the live viewport and auto-select the first renderable series in `frontend/src/App.tsx` and `frontend/src/App.css`

**Checkpoint**: The application loads sample-backed imaging content into the main viewport on startup.

---

## Phase 4: User Story 2 - Inspect Images With Basic Navigation (Priority: P2)

**Goal**: Let users pan with drag and zoom with the mouse wheel on the loaded sample image.

**Independent Test**: With the initial sample series loaded, drag inside the viewport to pan and use the mouse wheel to zoom, confirming the image remains responsive and the active series stays loaded.

### Verification for User Story 2

- [ ] T012 [P] [US2] Update the pan-and-zoom smoke steps and expected outcomes in `specs/002-cornerstone-basic-viewer/quickstart.md`

### Implementation for User Story 2

- [ ] T013 [US2] Register the viewport ToolGroup and bind drag-to-pan plus wheel zoom in `frontend/src/lib/cornerstoneViewer.ts`
- [ ] T014 [US2] Connect interaction-safe viewport lifecycle and cleanup behavior in `frontend/src/components/CornerstoneViewport.tsx`
- [ ] T015 [P] [US2] Update `frontend/src/App.tsx` and `frontend/src/App.css` so the viewport overlay and surrounding shell reflect the interactive viewer state without diagnostic claims

**Checkpoint**: The loaded sample image supports the requested basic navigation controls.

---

## Phase 5: User Story 3 - Switch Between Available Sample Content (Priority: P3)

**Goal**: Let the viewport follow the actively selected study or series and show clear loading and error states on selection changes.

**Independent Test**: Select a different available sample series, confirm the viewport reloads to the new content, then force an invalid or unreadable selection and confirm the viewer shows a clear error state instead of a blank surface.

### Verification for User Story 3

- [ ] T016 [US3] Expand `backend/tests/test_sample_viewer_api.py` to cover missing series, empty manifests, and missing instance file responses

### Implementation for User Story 3

- [ ] T017 [US3] Extend `backend/app/services/dicom_catalog.py` and `backend/app/api/routes/studies.py` to return deterministic selection-specific manifests and explicit viewer error responses
- [ ] T018 [P] [US3] Add selected-series state and selection-aware viewport manifest loading in `frontend/src/App.tsx`, `frontend/src/types.ts`, and `frontend/src/lib/api.ts`
- [ ] T019 [US3] Make the series inspector selectable and reflect the active series in `frontend/src/App.tsx` and `frontend/src/App.css`
- [ ] T020 [US3] Update `frontend/src/components/CornerstoneViewport.tsx` to cancel stale loads, reload on selection changes, and surface selection-specific loading and error states

**Checkpoint**: Users can switch between available sample series and get explicit feedback when a selection cannot be rendered.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final contract sync, documentation, and constitution-required verification.

- [ ] T021 [P] Update `README.md`, `frontend/README.md`, and `specs/002-cornerstone-basic-viewer/quickstart.md` so the local run flow and viewer-control guidance match the final implementation
- [ ] T022 [P] Confirm `backend/app/schemas.py`, `frontend/src/types.ts`, and `specs/002-cornerstone-basic-viewer/contracts/sample-series-viewport.md` describe the same sample viewer contract
- [ ] T023 Run `npm run lint` and `npm run build` in `frontend/`, then run `poetry run ruff check .`, `poetry run mypy app`, and `poetry run pytest tests/test_sample_viewer_api.py` in `backend/`, and record the outcomes in `specs/002-cornerstone-basic-viewer/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user-story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion and delivers the MVP sample-backed viewport
- **User Story 2 (Phase 4)**: Depends on User Story 1 because pan and zoom require a working viewport and loaded sample stack
- **User Story 3 (Phase 5)**: Depends on User Story 1 because series switching reuses the sample manifest and viewport loading path
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Depends only on the shared sample-viewer contract from Phase 2
- **US2**: Depends on US1's working viewport render path and does not require US3
- **US3**: Depends on US1's working viewport render path and can proceed independently of US2 once the base viewer load path exists

### Within Each User Story

- Write or expand backend contract verification before changing endpoint behavior where practical
- Keep backend schema and service changes aligned before wiring endpoint responses
- Implement the Cornerstone adapter before finalizing the viewport component behavior
- Complete the user-facing integration in `frontend/src/App.tsx` only after the underlying adapter and contract pieces are stable
- Finish story-specific verification before moving to final polish

### Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`
- `T005` and `T006` can run in parallel after `T004`
- `T008` and `T009` can run in parallel after `T007`
- `T014` and `T015` can run in parallel after `T013`
- `T017` and `T018` can run in parallel after `T016`
- `T021` and `T022` can run in parallel before the final verification run in `T023`

---

## Parallel Example: User Story 1

```bash
Task: "Implement the sample viewport manifest and instance file endpoints in backend/app/api/routes/studies.py"
Task: "Implement Cornerstone bootstrap, DICOM loader initialization, and stack loading helpers in frontend/src/lib/cornerstoneViewer.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Connect interaction-safe viewport lifecycle and cleanup behavior in frontend/src/components/CornerstoneViewport.tsx"
Task: "Update frontend/src/App.tsx and frontend/src/App.css so the viewport shell reflects the interactive viewer state"
```

---

## Parallel Example: User Story 3

```bash
Task: "Extend backend/app/services/dicom_catalog.py and backend/app/api/routes/studies.py to return deterministic selection-specific manifests and explicit viewer error responses"
Task: "Add selected-series state and selection-aware viewport manifest loading in frontend/src/App.tsx, frontend/src/types.ts, and frontend/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate startup rendering of the initial sample series before moving on

### Incremental Delivery

1. Establish dependencies and the typed sample-viewer contract
2. Deliver the initial sample-backed viewport render path
3. Add pan and wheel-zoom behavior
4. Add series switching and selection-specific error handling
5. Finish with documentation and full verification

### Parallel Team Strategy

1. One developer handles backend contract work in `backend/app/` and `backend/tests/`
2. One developer handles frontend adapter and viewport work in `frontend/src/lib/` and `frontend/src/components/`
3. Shared integration work in `frontend/src/App.tsx` and `frontend/src/App.css` happens after the backend contract and viewport adapter stabilize

---

## Notes

- [P] tasks touch different files or independent file groups and can be done concurrently
- The recommended MVP scope is Phase 3 after Setup and Foundational work complete
- `backend/tests/test_sample_viewer_api.py` is the planned automated contract-verification path for the new sample viewer API
- Keep the feature explicitly non-diagnostic in viewer text, loading states, and documentation
