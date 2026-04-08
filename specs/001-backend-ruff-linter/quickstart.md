# Quickstart: Backend Ruff Linting Standard

## Purpose

This quickstart describes the intended contributor workflow for the backend Ruff
linting feature before implementation begins.

## Prerequisites

- Python 3.12 available locally
- Poetry available locally
- Repository checkout on the feature branch or a branch that includes the final
  implementation

## Local Workflow

1. Change into the backend project directory:

```bash
cd backend
```

2. Install backend dependencies with the existing Poetry workflow:

```bash
poetry install
```

3. Run the required backend lint check:

```bash
poetry run ruff check .
```

4. Run the constitution-required backend type check before submitting changes:

```bash
poetry run mypy app
```

## Expected Results

- Ruff exits successfully when backend files comply with the configured lint
  rules.
- Ruff reports file-level violations when the backend code does not comply.
- Mypy continues to pass for backend code after any lint-related refactors.
- The root `README.md` exposes the same backend quality commands and names
  `backend-quality` as the shared validation workflow.

## Recovery Steps

- If `poetry` is unavailable, install Poetry first and rerun the setup step.
- If `ruff` is unavailable inside the backend environment, rerun `poetry
  install` from `backend/` to restore development dependencies.
- If the shared workflow fails but local checks pass, compare the branch's
  backend files and workflow inputs against the committed configuration before
  re-running validation.

## Shared Validation Expectation

After implementation, pull requests and pushes that modify backend lint inputs
should show a `backend-quality` workflow result. That workflow must run the same
`poetry run ruff check .` and `poetry run mypy app` commands documented for
local use from `backend/`. A failing Ruff or Mypy step means the change is not
ready to merge until the reported issues are fixed and the workflow passes.
