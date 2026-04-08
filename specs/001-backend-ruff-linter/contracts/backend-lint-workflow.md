# Contract: Backend Lint Workflow

## Status

Approved for implementation

## Purpose

Define the contributor-facing and repository-managed contract for backend Python
lint validation so local and shared enforcement remain aligned.

## Local Command Contract

- Working directory: `backend/`
- Required command: `poetry run ruff check .`
- Optional remediation command: `poetry run ruff check . --fix`
- Success condition: exit code `0`
- Failure condition: non-zero exit code with file-level Ruff diagnostics
- Scope rule: all in-scope backend Python files must be evaluated by the same
  command, including newly added files under the backend project tree

## Shared Validation Contract

- Workflow name: `backend-quality`
- Trigger intent: run for pull requests and pushes that affect backend quality
  inputs such as `backend/**/*.py`, `backend/pyproject.toml`,
  `backend/poetry.lock`, `.github/workflows/backend-quality.yml`, or `README.md`
- Required setup: install backend dependencies with Poetry before running checks
- Required Ruff step: run the same `poetry run ruff check .` command from
  `backend/`
- Additional verification step: run `poetry run mypy app` to satisfy the current
  repository constitution for backend changes
- Blocking rule: any failing Ruff result marks the backend change as not ready
  to merge
- Reporting rule: workflow output must surface which command failed so
  contributors can reproduce it locally

## Exclusions

- This feature does not change frontend linting behavior.
- This feature does not change backend API request/response contracts.
- This feature does not change DICOM ingestion, viewer behavior, or non-diagnostic labeling rules.

## Acceptance Mapping

- FR-001 through FR-003: satisfied by the shared local/CI command definition
- FR-004 and FR-005: satisfied by the blocking rule and reproducible diagnostics
- FR-006 and FR-007: satisfied by the scope rule and backend-tree invocation
- FR-008: satisfied by the required setup and local recovery guidance
