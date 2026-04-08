# Implementation Plan: Backend Ruff Linting Standard

**Branch**: `[001-backend-ruff-linter]` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-ruff-linter/spec.md`

## Summary

Formalize Ruff as the required backend Python linter by configuring it in the
existing backend Poetry project, documenting one local lint workflow for
contributors, and adding a shared GitHub Actions quality workflow that runs the
same Ruff check for backend changes. Keep the slice narrow: no backend API
behavior changes, no frontend tooling changes, and no new wrapper scripts beyond
the existing Poetry entry point.

## Technical Context

**Language/Version**: Python 3.12 for backend tooling and YAML for GitHub Actions workflow definition  
**Primary Dependencies**: Poetry, Ruff, Mypy, FastAPI backend package, GitHub Actions  
**Storage**: N/A  
**Testing**: `poetry run ruff check .`, `poetry run mypy app`, and manual verification that the shared workflow fails on lint violations and passes after fixes  
**Target Platform**: Local developer environments on Windows/macOS/Linux and GitHub-hosted Linux runners for shared validation  
**Project Type**: Monorepo web application with a FastAPI backend and React frontend; this feature touches backend tooling, repository automation, and documentation only  
**Performance Goals**: Local backend linting for the current 13 Python files completes in under 10 seconds on typical developer hardware; the shared backend quality workflow completes in under 3 minutes; no runtime API latency or DICOM processing behavior changes  
**Constraints**: Preserve the existing Poetry-managed backend workflow, use the same Ruff command locally and in shared validation, exclude non-code assets from lint failures, avoid new frontend quality requirements, and keep the implementation to the smallest viable repository slice  
**Scale/Scope**: One backend Poetry project, 13 existing backend Python files, one new shared validation workflow, and targeted documentation/configuration updates in `backend/`, `.github/workflows/`, and `README.md`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clinical safety boundaries identified: PASS. This feature is internal tooling only, does not change user-facing or API-facing diagnostic claims, does not alter DICOM-derived outputs, and does not introduce new PHI handling paths. Post-design re-check: PASS.
- Contract-first scope identified: PASS. No frontend/backend runtime contract, viewer-library contract, or external DICOM contract changes are in scope. A contributor-workflow contract will be captured in `contracts/backend-lint-workflow.md` so local and shared validation semantics stay explicit. Post-design re-check: PASS.
- Verification plan defined: PASS. Implementation verification will run `poetry run ruff check .` and `poetry run mypy app` from `backend/`. No frontend files are expected to change, so `eslint` and `vite build` remain not applicable for this feature unless scope expands. Shared validation will surface backend quality status in pull requests. Post-design re-check: PASS.
- Performance expectations defined: PASS. Ruff adoption must keep local feedback fast on the current backend size, keep shared validation under a short CI budget, and introduce no runtime performance or degraded-mode changes because backend request handling is untouched. Post-design re-check: PASS.
- Complexity justified: PASS. The only new automation is a single GitHub Actions workflow because the repository currently has no shared backend validation path; this is simpler than custom scripts, pre-commit-only enforcement, or a larger CI framework. Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-ruff-linter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── backend-lint-workflow.md
└── tasks.md
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── backend-quality.yml

backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   └── router.py
│   ├── services/
│   ├── config.py
│   ├── main.py
│   └── schemas.py
├── pyproject.toml
└── poetry.lock

README.md
```

**Structure Decision**: Use the existing monorepo structure and limit implementation to repository-level automation plus backend configuration and docs. The feature will update `backend/pyproject.toml` for Ruff configuration, add `.github/workflows/backend-quality.yml` for shared validation, and update `README.md` for contributor guidance. Frontend source layout remains untouched.

## Complexity Tracking

No constitution violations or extra complexity exceptions are required for this
feature.
