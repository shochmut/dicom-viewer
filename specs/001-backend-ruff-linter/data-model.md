# Data Model: Backend Ruff Linting Standard

This feature does not introduce persisted runtime data. The design still relies
on a few explicit planning entities so implementation tasks can stay precise.

## Entity: BackendLintScope

- Purpose: Defines which backend files are checked by the required lint
  workflow.
- Fields:
  - `working_directory`: `backend/`
  - `included_content`: Python source files within the backend project
  - `excluded_content`: non-Python assets, lockfiles, generated artifacts, and
    sample data paths that should not produce lint failures
  - `auto_inclusion_rule`: newly added backend Python files are linted
    automatically when they live under the backend project tree
- Validation Rules:
  - Must align with the documented local command and the CI workflow command.
  - Must avoid accidental inclusion of non-code repository paths.

## Entity: BackendLintCommand

- Purpose: Represents the contributor-facing command used to evaluate backend
  lint compliance.
- Fields:
  - `name`: backend Ruff check
  - `working_directory`: `backend/`
  - `command`: `poetry run ruff check .`
  - `failure_signal`: non-zero exit code with file-level diagnostics
  - `owner`: backend contributors and maintainers
- Validation Rules:
  - Must be runnable after standard backend dependency installation.
  - Must produce actionable diagnostics that identify the violating file.

## Entity: SharedValidationRun

- Purpose: Represents the repository-managed quality run that enforces backend
  lint compliance during review.
- Fields:
  - `workflow_name`: `backend-quality`
  - `trigger_types`: pull request and push events for backend-relevant changes
  - `required_checks`: Ruff lint result, plus constitution-required Mypy result
  - `blocking_rule`: backend changes are not merge-ready if Ruff fails
  - `reported_status`: pass or fail surfaced in the hosting platform UI
- Validation Rules:
  - Must execute the same Ruff command documented for local use.
  - Must scope execution to backend-quality inputs so unrelated frontend-only
    changes do not run the workflow unnecessarily.

## Relationships

- `BackendLintScope` constrains `BackendLintCommand`.
- `BackendLintCommand` is reused inside `SharedValidationRun`.
- `SharedValidationRun` is the shared enforcement mechanism for the
  contributor-facing command contract.
