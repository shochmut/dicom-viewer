# Feature Specification: Backend Ruff Linting Standard

**Feature Branch**: `[001-backend-ruff-linter]`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "The backend python code should use ruff as a python linter"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a Single Backend Lint Check (Priority: P1)

As a backend contributor, I need one required linting standard for Python code so
I can validate changes before review and avoid style-related rework.

**Why this priority**: A single local lint workflow delivers immediate value to
every backend change and establishes the minimum quality gate for the feature.

**Independent Test**: Make a backend Python change, run the documented backend
lint workflow, and confirm it reports violations when present and succeeds after
they are fixed.

**Acceptance Scenarios**:

1. **Given** a contributor has modified backend Python files, **When** they run
   the standard backend lint workflow, **Then** the workflow evaluates the
   in-scope backend Python files with Ruff and returns a clear pass or fail
   result.
2. **Given** the lint workflow reports blocking violations, **When** the
   contributor corrects the issues and reruns the workflow, **Then** the
   workflow completes successfully without additional manual reviewer guidance.

---

### User Story 2 - Enforce the Same Standard During Review (Priority: P2)

As a maintainer or reviewer, I need backend changes checked against the same
lint standard used locally so merge decisions are consistent and objective.

**Why this priority**: Shared enforcement prevents contributors and reviewers
from using different standards and reduces subjective review churn.

**Independent Test**: Submit a backend change that violates the lint standard
and confirm the shared validation path blocks merge until the issue is fixed.

**Acceptance Scenarios**:

1. **Given** a proposed backend change contains a lint violation, **When** the
   shared validation path runs, **Then** the change is marked failing and is not
   considered ready to merge until the violation is resolved.
2. **Given** a backend change satisfies the lint standard, **When** the shared
   validation path runs, **Then** reviewers see that the required backend lint
   check passed.

---

### User Story 3 - Discover the Required Standard Quickly (Priority: P3)

As a new contributor, I need the repository to state the required backend lint
tool and how to run it so I can become productive without asking maintainers for
process details.

**Why this priority**: Clear documentation reduces onboarding friction, but it
depends on the standard and enforcement path already being defined.

**Independent Test**: Follow the repository's backend setup and documentation
from a clean checkout and confirm the contributor can identify and run the lint
workflow without outside help.

**Acceptance Scenarios**:

1. **Given** a contributor has completed backend setup, **When** they consult
   the repository documentation for code quality expectations, **Then** they can
   identify Ruff as the required backend Python linter and find the standard way
   to run it.
2. **Given** the lint tool is not yet available in the contributor's backend
   environment, **When** they attempt to use the documented workflow, **Then**
   the repository guidance tells them how to resolve the missing prerequisite.

### Edge Cases

- How the workflow behaves when backend directories contain non-Python files,
  generated artifacts, or sample DICOM data that should not be linted.
- How shared validation handles pre-existing backend lint violations that are
  outside the files changed in the current contribution.
- How contributors recover when Ruff is not installed in the active backend
  environment or the backend development dependencies have not been set up yet.
- How the standard applies to newly added backend Python files so they enter the
  linted scope automatically without extra maintainer action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST designate Ruff as the required linter for
  backend Python code.
- **FR-002**: The repository MUST provide one documented workflow for running
  backend lint checks locally before review or merge.
- **FR-003**: The local contributor workflow and the shared validation workflow
  MUST apply the same backend linting standard.
- **FR-004**: Shared validation MUST block backend changes from being considered
  ready to merge when required Ruff lint checks fail.
- **FR-005**: Lint failures MUST identify the affected backend file and provide
  actionable issue details so contributors can resolve problems without
  maintainer guesswork.
- **FR-006**: The repository MUST define which backend paths are in scope for
  linting and which backend paths, if any, are intentionally excluded.
- **FR-007**: Newly added backend Python files within the defined scope MUST be
  included automatically in the required lint workflow.
- **FR-008**: Repository guidance MUST explain how contributors restore the
  required backend lint workflow when Ruff or backend development dependencies
  are unavailable locally.
- **FR-009**: This feature MUST not introduce new linting requirements for the
  frontend codebase as part of the same scope.
- **FR-010**: Introducing Ruff lint enforcement MUST not change the functional
  behavior of existing backend API or DICOM-processing features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of backend pull requests or equivalent review submissions are
  evaluated against the required Ruff lint check before merge.
- **SC-002**: A contributor who has completed backend setup can identify the
  required backend linter and run the documented lint workflow within 5 minutes.
- **SC-003**: At least 95% of backend lint failures reported during shared
  validation are reproducible by contributors on the first local rerun of the
  documented workflow.
- **SC-004**: After rollout, no backend change that fails the required Ruff lint
  check is merged through the normal review process.

## Assumptions

- The feature serves internal repository users: backend contributors, reviewers,
  and maintainers.
- Backend development dependencies remain managed through the existing backend
  project workflow rather than introducing a separate package-management path.
- The current presence of Ruff in backend development dependencies reflects an
  acceptable project direction, and this feature formalizes its required use.
- Scope is limited to backend Python linting policy, enforcement, and
  contributor documentation; formatting, type-checking, and frontend tooling are
  unchanged unless needed only to support the backend lint workflow.
