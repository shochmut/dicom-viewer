# Research: Backend Ruff Linting Standard

## Decision 1: Keep Ruff configuration in `backend/pyproject.toml`

- Decision: Define Ruff settings in the existing backend Poetry project file and
  run Ruff from the `backend/` working directory with `poetry run ruff check .`.
- Rationale: The backend already uses Poetry for dependency management and
  already declares `ruff` as a development dependency. Keeping configuration in
  `backend/pyproject.toml` preserves one backend source of truth and avoids
  introducing a parallel lint configuration file.
- Alternatives considered:
  - Add a standalone `ruff.toml`: rejected because it spreads backend tooling
    configuration across more files without a clear benefit for this repo size.
  - Add a root-level lint config: rejected because the request is limited to the
    backend and the repo uses separate frontend and backend toolchains.

## Decision 2: Use one Poetry-based lint command for local and shared validation

- Decision: Standardize on `poetry run ruff check .` from `backend/` as the
  required backend lint command for contributors and CI.
- Rationale: Running from `backend/` keeps the command short, naturally limits
  scope to the backend Poetry project, and automatically includes new Python
  files under that tree without requiring a custom wrapper script.
- Alternatives considered:
  - Lint only `backend/app`: rejected because future backend tests or support
    modules would require additional maintenance to stay in scope.
  - Create a shell or Python wrapper command: rejected because Poetry already
    provides a stable invocation point and the constitution favors the simplest
    viable slice.

## Decision 3: Add a single GitHub Actions workflow for shared enforcement

- Decision: Introduce one repository workflow, `backend-quality`, that installs
  backend dependencies and runs the backend quality commands on pull requests and
  pushes that affect backend quality inputs.
- Rationale: The repo currently has no `.github/workflows` directory, so a
  dedicated workflow is the smallest shared validation mechanism that can expose
  blocking status during review.
- Alternatives considered:
  - Rely only on local developer commands: rejected because it does not satisfy
    the requirement for shared validation that blocks non-compliant changes.
  - Use pre-commit as the only enforcement point: rejected because it is local
    opt-in unless separately enforced in CI.
  - Build a multi-stage CI pipeline: rejected because it adds unnecessary
    complexity for a single backend linting standard.

## Decision 4: Preserve constitution-required backend verification without
expanding feature scope

- Decision: Keep Ruff as the feature-owned backend lint requirement while still
  planning to run `poetry run mypy app` in implementation verification and the
  shared backend quality workflow to remain aligned with the repository
  constitution.
- Rationale: The constitution already requires both Ruff and Mypy for backend
  changes. Including Mypy in the verification plan keeps the feature compliant
  without broadening the requested scope into new frontend or runtime behavior.
- Alternatives considered:
  - Gate only Ruff everywhere: rejected because it would knowingly leave the
    plan out of alignment with the existing repository constitution.
  - Expand the feature into a general backend QA overhaul: rejected because the
    user asked for Ruff adoption specifically.

## Decision 5: Document the workflow in existing repo docs instead of creating a
new tooling surface

- Decision: Update existing repository documentation and the feature quickstart
  rather than introducing a new backend-specific tooling abstraction.
- Rationale: Contributors already start from the root `README.md`, and the
  feature only needs one discoverable command plus dependency recovery guidance.
- Alternatives considered:
  - Add a dedicated `backend/README.md`: rejected as optional extra structure
    that is not required for the initial thin slice.
  - Add custom `make` or task-runner commands: rejected because the repository
    does not currently depend on those tools.
