# Tasks: 3D Volume Viewer

**Input**: Design documents from `/specs/005-volume-viewer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include the verification tasks required by the constitution. This feature primarily uses the existing frontend build and lint checks; backend checks are required only if the series manifest contract changes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Backend: `backend/app/`
- Feature docs: `specs/005-volume-viewer/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the current code and dependency surface before feature work begins.

- [X] T001 Review current viewer mode wiring in `frontend/src/App.tsx`
- [X] T002 [P] Review current viewport lifecycle and Cornerstone initialization in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T003 [P] Review current series manifest types in `frontend/src/types.ts`
- [X] T004 [P] Review the manifest contract in `specs/005-volume-viewer/contracts/series-viewport-manifest.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared frontend structure that must exist before the user-story slices can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Add a volume-capable viewport controller interface beside the existing stack controller in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T006 Add volume viewer status and message conventions for `idle`, `loading`, `ready`, and `error` in `frontend/src/types.ts`
- [X] T007 [P] Add Volume mode styling hooks and non-diagnostic status styling in `frontend/src/App.css`
- [X] T008 Confirm the Volume UI contract still matches the planned implementation in `specs/005-volume-viewer/contracts/volume-viewer-ui.md`

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Open Current Study as a 3D Volume (Priority: P1) MVP

**Goal**: The user can select the Volume tab and see the currently selected DICOM series as a 3D volume, or a clear loading, empty, unsupported, or error state.

**Independent Test**: Load a DICOM series, select the Volume tab, verify the selected study and series remain unchanged, and verify the Volume area displays either the corresponding 3D volume or a clear user-readable fallback state.

### Implementation for User Story 1

- [X] T009 [US1] Enable the existing Volume viewer mode button in `frontend/src/App.tsx`
- [X] T010 [US1] Route `viewerMode === 'volume'` to a dedicated volume rendering path in `frontend/src/App.tsx`
- [X] T011 [P] [US1] Create the volume viewport component shell in `frontend/src/components/VolumeViewport.tsx`
- [X] T012 [US1] Load the selected study and series manifest for Volume mode using `loadSeriesViewportManifest` in `frontend/src/components/VolumeViewport.tsx`
- [X] T013 [US1] Add empty, loading, unsupported, and error state handling for Volume mode in `frontend/src/components/VolumeViewport.tsx`
- [X] T014 [US1] Implement Cornerstone volume viewport creation and cleanup using existing Cornerstone initialization in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T015 [US1] Preserve selected study and series state while switching between Stack and Volume in `frontend/src/App.tsx`
- [X] T016 [US1] Update the viewer overlay text for Volume mode and non-diagnostic status in `frontend/src/App.tsx`
- [X] T017 [US1] Confirm no backend contract changes are needed, or update `specs/005-volume-viewer/contracts/series-viewport-manifest.md` before editing `backend/app/api/routes/studies.py`
- [X] T018 [US1] Verify User Story 1 with `cd frontend; npm run lint` and `cd frontend; npm run build`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Rotate the 3D Volume (Priority: P2)

**Goal**: The user can click and drag the visible 3D volume to rotate it, and the orientation remains stable after release.

**Independent Test**: Open the Volume tab with a ready volume, drag horizontally and vertically inside the viewport, release the mouse, and verify the volume remains at the last orientation without resetting.

### Implementation for User Story 2

- [X] T019 [US2] Add drag interaction state and event registration for the volume viewport in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T020 [US2] Apply horizontal and vertical drag deltas to the volume camera orientation in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T021 [US2] Keep the final camera orientation after mouse release in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T022 [US2] Ignore drag input while the volume is not ready in `frontend/src/components/VolumeViewport.tsx`
- [X] T023 [P] [US2] Add ready and dragging cursor states for the volume viewport in `frontend/src/App.css`
- [X] T024 [US2] Verify User Story 2 with `cd frontend; npm run lint` and `cd frontend; npm run build`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Zoom the 3D Volume (Priority: P3)

**Goal**: The user can use the mouse wheel to zoom in and out on the 3D volume within recoverable bounds.

**Independent Test**: Open the Volume tab with a ready volume, scroll the mouse wheel up and down inside the viewport, and verify the volume zooms in and out without becoming invisible, unrecoverable, or unusably clipped.

### Implementation for User Story 3

- [X] T025 [US3] Add passive-safe wheel event registration for the volume viewport in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T026 [US3] Apply wheel input to the volume camera zoom level in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T027 [US3] Add minimum and maximum zoom bounds for the volume camera in `frontend/src/lib/cornerstoneViewer.ts`
- [X] T028 [US3] Ignore wheel input while the volume is not ready in `frontend/src/components/VolumeViewport.tsx`
- [X] T029 [P] [US3] Update Volume mode interaction copy and overlay affordances in `frontend/src/App.tsx`
- [X] T030 [US3] Verify User Story 3 with `cd frontend; npm run lint` and `cd frontend; npm run build`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and safety checks across the whole feature.

- [X] T031 [P] Update quickstart validation notes after implementation in `specs/005-volume-viewer/quickstart.md`
- [X] T032 [P] Confirm non-diagnostic wording remains visible and accurate in `frontend/src/App.tsx`
- [X] T033 Confirm Volume mode handles missing, single-slice, malformed, and failed-load series without a blank viewport in `frontend/src/components/VolumeViewport.tsx`
- [X] T034 Run full frontend verification with `cd frontend; npm run lint` and `cd frontend; npm run build`
- [X] T035 Run backend verification with `cd backend; poetry run ruff check .`, `cd backend; poetry run mypy app`, and `cd backend; poetry run pytest` if any backend file changed
- [X] T036 Record final verification outcomes in `specs/005-volume-viewer/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and a ready Volume viewport from US1 for full manual verification.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and a ready Volume viewport from US1 for full manual verification.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 - Open Current Study as a 3D Volume**: First priority and suggested MVP.
- **US2 - Rotate the 3D Volume**: Can be developed after the volume viewport path exists.
- **US3 - Zoom the 3D Volume**: Can be developed after the volume viewport path exists.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel during Setup.
- T007 and T008 can run in parallel during Foundational work after T005 and T006 are understood.
- T011 can run in parallel with T009 and T010 after foundational tasks are complete.
- T023 can run in parallel with T019 through T022.
- T029 can run in parallel with T025 through T028.
- T031 and T032 can run in parallel during Polish.

---

## Parallel Example: User Story 1

```text
Task: "Enable the existing Volume viewer mode button in frontend/src/App.tsx"
Task: "Create the volume viewport component shell in frontend/src/components/VolumeViewport.tsx"
Task: "Confirm no backend contract changes are needed in specs/005-volume-viewer/contracts/series-viewport-manifest.md"
```

## Parallel Example: User Story 2

```text
Task: "Add drag interaction state and event registration for the volume viewport in frontend/src/lib/cornerstoneViewer.ts"
Task: "Add ready and dragging cursor states for the volume viewport in frontend/src/App.css"
```

## Parallel Example: User Story 3

```text
Task: "Add passive-safe wheel event registration for the volume viewport in frontend/src/lib/cornerstoneViewer.ts"
Task: "Update Volume mode interaction copy and overlay affordances in frontend/src/App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate that the Volume tab opens the selected DICOM series or a clear fallback state.
5. Run `cd frontend; npm run lint` and `cd frontend; npm run build`.

### Incremental Delivery

1. Setup and Foundational work establish the shared volume viewport path.
2. US1 enables the Volume tab and loading/fallback states.
3. US2 adds drag rotation.
4. US3 adds wheel zoom.
5. Polish verifies safety wording, error handling, and build checks.

### Parallel Team Strategy

1. Complete Setup and Foundational work together.
2. Once the volume viewport path exists, split follow-up work:
   - Developer A: US1 integration and state handling.
   - Developer B: US2 rotation behavior.
   - Developer C: US3 zoom behavior.
3. Integrate through the shared `frontend/src/lib/cornerstoneViewer.ts` controller contract.

## Notes

- [P] tasks are marked only where they touch different files or can proceed without depending on incomplete tasks.
- Backend edits should be avoided unless the existing series manifest cannot support volume display.
- Any backend contract change must update `specs/005-volume-viewer/contracts/series-viewport-manifest.md` before implementation.
