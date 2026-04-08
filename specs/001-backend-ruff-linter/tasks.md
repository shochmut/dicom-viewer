# Tasks: Backend Ruff Linting Standard

**Input**: Design documents from `/specs/001-backend-ruff-linter/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [backend-lint-workflow.md](./contracts/backend-lint-workflow.md)

**Tests**: Keep verification aligned with the constitution by running `poetry run ruff check .` and `poetry run mypy app` from `backend/`, and by implementing the shared `backend-quality` workflow as the automated enforcement path.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repository paths needed for backend quality enforcement work.

- [x] T001 Create the shared workflow file scaffold at `.github/workflows/backend-quality.yml`
- [x] T002 [P] Review the current backend quality inputs in `backend/pyproject.toml`, `README.md`, and `specs/001-backend-ruff-linter/contracts/backend-lint-workflow.md` before implementation changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the canonical backend lint contract before user-story work begins.

**CRITICAL**: No user story work should begin until this phase is complete.

- [x] T003 Update `backend/pyproject.toml` with explicit Ruff configuration, backend lint scope, and any required exclusions for non-code assets
- [x] T004 Align the command contract in `specs/001-backend-ruff-linter/contracts/backend-lint-workflow.md` with the final Ruff configuration in `backend/pyproject.toml`

**Checkpoint**: The repository has one canonical backend lint command contract and scope definition.

---

## Phase 3: User Story 1 - Run a Single Backend Lint Check (Priority: P1) MVP

**Goal**: Contributors can run one required Ruff-based backend lint workflow locally and get actionable results.

**Independent Test**: Introduce a temporary backend Python lint violation, run `poetry run ruff check .` from `backend/`, confirm the failure points to the offending file, fix the issue, and rerun successfully.

### Verification for User Story 1

- [x] T005 [US1] Update `README.md` with the canonical local backend quality commands for `poetry install`, `poetry run ruff check .`, and `poetry run mypy app`

### Implementation for User Story 1

- [x] T006 [P] [US1] Confirm the core backend modules in `backend/app/main.py`, `backend/app/config.py`, `backend/app/schemas.py`, and `backend/app/services/dicom_catalog.py` comply with the Ruff rules defined in `backend/pyproject.toml`
- [x] T007 [P] [US1] Confirm the API modules in `backend/app/api/router.py`, `backend/app/api/routes/health.py`, `backend/app/api/routes/config.py`, `backend/app/api/routes/studies.py`, and `backend/app/api/routes/analysis.py` comply with the Ruff rules defined in `backend/pyproject.toml`
- [x] T008 [US1] Reconcile any local-workflow wording in `README.md` with the final behavior of `backend/pyproject.toml` after the backend lint command is verified end to end

**Checkpoint**: Contributors can run the required backend lint workflow locally and understand the expected success/failure behavior.

---

## Phase 4: User Story 2 - Enforce the Same Standard During Review (Priority: P2)

**Goal**: Reviewers see the same backend quality outcome in shared validation that contributors see locally.

**Independent Test**: Open a branch with a deliberate backend lint violation, confirm `.github/workflows/backend-quality.yml` reports a failing quality check, fix the violation locally, and confirm the shared workflow definition is ready to pass with the same commands.

### Verification for User Story 2

- [x] T009 [US2] Define the scoped pull request and push triggers for backend quality inputs in `.github/workflows/backend-quality.yml`

### Implementation for User Story 2

- [x] T010 [US2] Add Poetry setup and the canonical `poetry run ruff check .` and `poetry run mypy app` steps to `.github/workflows/backend-quality.yml`
- [x] T011 [US2] Synchronize the workflow name, trigger scope, and blocking expectations across `.github/workflows/backend-quality.yml`, `README.md`, and `specs/001-backend-ruff-linter/contracts/backend-lint-workflow.md`

**Checkpoint**: The repository has a shared backend quality workflow that mirrors the local command contract and is ready to gate review.

---

## Phase 5: User Story 3 - Discover the Required Standard Quickly (Priority: P3)

**Goal**: New contributors can discover the required backend lint standard and recover from missing-tool failures without outside help.

**Independent Test**: Start from the repository documentation, identify Ruff as the required backend linter within 5 minutes, follow the documented setup steps, and use the recovery guidance to resolve a missing Poetry or Ruff dependency.

### Verification for User Story 3

- [x] T012 [US3] Reorganize the backend development guidance in `README.md` so Ruff is clearly discoverable before backend runtime commands

### Implementation for User Story 3

- [x] T013 [P] [US3] Update `specs/001-backend-ruff-linter/quickstart.md` so onboarding, recovery steps, and shared-validation expectations match `README.md` and `.github/workflows/backend-quality.yml`
- [x] T014 [US3] Expand the troubleshooting guidance in `README.md` for missing Poetry or Ruff dependencies and failed `backend-quality` runs

**Checkpoint**: New contributors can discover the backend lint standard and recover from common setup failures using repository guidance alone.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks and constitution-required verification.

- [x] T015 [P] Confirm `backend/pyproject.toml`, `.github/workflows/backend-quality.yml`, `README.md`, `specs/001-backend-ruff-linter/contracts/backend-lint-workflow.md`, and `specs/001-backend-ruff-linter/quickstart.md` all describe the same backend quality command contract
- [x] T016 Run `poetry run ruff check .` and `poetry run mypy app` from `backend/` against the final `backend/pyproject.toml`, then record the commands and outcomes in `specs/001-backend-ruff-linter/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user-story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion and delivers the MVP local lint workflow
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow User Story 1 so the shared workflow is introduced after the local command contract is stable
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should follow User Story 2 so documentation reflects the final workflow name and recovery behavior
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: Depends only on the canonical Ruff configuration and contract from Phase 2
- **US2**: Depends on the canonical Ruff configuration from Phase 2 and benefits from US1 completing first so CI enforces a verified local workflow
- **US3**: Depends on the canonical Ruff configuration from Phase 2 and benefits from US2 completing first so contributor docs reflect the final shared workflow

### Within Each User Story

- Finalize the command contract before changing contributor-facing docs
- Verify backend code remains compliant before turning on shared enforcement
- Implement the shared workflow before documenting final troubleshooting for it
- Finish story-specific documentation before the final cross-cutting verification run

### Parallel Opportunities

- `T002` can run in parallel with `T001` after the workflow path is reserved
- `T006` and `T007` can run in parallel after `T003` completes because they touch different backend files
- `T013` can run in parallel with late-stage README refinement once the workflow contract in `T011` is stable
- `T015` can run in parallel with the final verification execution in `T016` if one person checks docs while another runs commands

---

## Parallel Example: User Story 1

```bash
Task: "Confirm the core backend modules in backend/app/main.py, backend/app/config.py, backend/app/schemas.py, and backend/app/services/dicom_catalog.py comply with the Ruff rules"
Task: "Confirm the API modules in backend/app/api/router.py, backend/app/api/routes/health.py, backend/app/api/routes/config.py, backend/app/api/routes/studies.py, and backend/app/api/routes/analysis.py comply with the Ruff rules"
```

---

## Parallel Example: User Story 3

```bash
Task: "Update specs/001-backend-ruff-linter/quickstart.md to match the final onboarding and recovery flow"
Task: "Refine README.md troubleshooting text for missing Poetry or Ruff dependencies and failed backend-quality runs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the local Ruff workflow independently before enabling shared enforcement

### Incremental Delivery

1. Establish Ruff scope and the backend command contract
2. Deliver the local contributor workflow in `backend/pyproject.toml` and `README.md`
3. Add the `backend-quality` shared workflow
4. Finish onboarding and recovery documentation
5. Run final constitution-required verification and consistency checks

### Parallel Team Strategy

1. One developer completes Setup and Foundational work
2. After `T003` lands, split US1 validation across the core backend files and API files
3. After `T011` lands, split final documentation sync and verification between `README.md` and `specs/001-backend-ruff-linter/quickstart.md`

---

## Notes

- [P] tasks touch different files or independent file groups and can be done concurrently
- The recommended MVP scope is Phase 3 only after Setup and Foundational work complete
- `backend-quality` is the expected shared check name across workflow and docs
- The final implementation should not add frontend lint requirements or change backend runtime behavior

## Verification Outcomes

- 2026-04-07: Initial `cd backend && poetry run ruff check .` after enabling the
  Ruff config failed on import ordering in `backend/app/config.py` and line
  length issues in `backend/app/services/dicom_catalog.py`; those files were
  updated during implementation.
- 2026-04-07: Final `cd backend && poetry run ruff check .` -> PASS
- 2026-04-07: Final `cd backend && poetry run mypy app` -> PASS
