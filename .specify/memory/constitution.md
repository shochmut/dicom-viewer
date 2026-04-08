<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.0.1
- Modified principles:
  - I. Clinical Safety Boundaries -> I. Clinical Safety Boundaries
    (clarified exploratory and non-diagnostic labeling expectations)
- Added sections:
  - None
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - not present: .specify/templates/commands/*.md
- Additional sync updates:
  - updated: README.md
  - updated: frontend/README.md
  - updated: frontend/src/App.tsx
  - updated: backend/app/api/routes/analysis.py
- Follow-up TODOs:
  - None
-->
# DICOM Viewer Constitution

## Core Principles

### I. Clinical Safety Boundaries
This repository MUST remain explicitly non-diagnostic unless a feature spec says
otherwise and names the required validation standard. Features that display,
transform, or analyze DICOM data MUST preserve source fidelity, identify derived
data clearly, and label research or model-driven outputs as exploratory in
user-facing and API-facing surfaces. Product copy, status text, and roadmap
items MUST avoid claims that imply clinical approval or diagnostic readiness.
Protected health information handling, retention, and transmission decisions
MUST be stated in the spec whenever real patient data is in scope. Rationale:
imaging software can create clinical risk through ambiguity long before it
reaches production scale.

### II. Contract-First Interfaces
Every change that affects communication between frontend, backend, browser-side
imaging libraries, or external DICOM sources MUST define the contract first.
The governing artifact may be an API schema, typed payload definition, adapter
interface, or documented request/response example, but it MUST be versioned with
the feature and reflected in implementation. Rationale: viewer work crosses
multiple runtime boundaries, and integration failures are more expensive than
local defects.

### III. Verification Before Merge
Behavior changes MUST ship with executable verification at the smallest useful
scope. Backend changes require automated tests where practical and MUST pass
`ruff` and `mypy`; frontend changes MUST pass `eslint` and `vite build`; any
contract change MUST add or update an integration or contract test. A task is
not complete until the author records the commands run and the outcome. Rationale:
this repo mixes Python, TypeScript, and imaging dependencies, so regressions must
be caught by tooling rather than memory.

### IV. Responsive Viewer Performance
Interactive viewer flows MUST protect responsiveness on typical developer
hardware. New rendering, parsing, or study-loading paths MUST document expected
latency, memory pressure, and failure behavior when data is incomplete, large,
or slow to arrive. Long-running work MUST be moved off the main UI interaction
path or surfaced with explicit loading/error states. Rationale: a viewer that
technically works but stalls under realistic imaging workloads is not acceptable.

### V. Incremental Simplicity
Work MUST be delivered as the thinnest vertical slice that proves value across
the monorepo. Prefer simple adapters, direct data flow, and existing framework
capabilities over speculative abstractions, broad plugin systems, or premature
microservices. Any added complexity needs a written justification in the plan.
Rationale: this repository is a learning and exploration sandbox, and clarity is
more valuable than architectural ambition.

## Technical Guardrails

- Frontend work MUST stay within the established React + Vite application unless
  a spec approves a structural change.
- Backend work MUST stay within the established FastAPI service and Python 3.12
  toolchain unless a spec approves a structural change.
- DICOM-facing features MUST state whether they rely on local files, DICOMweb,
  DIMSE, or a proxy layer, and MUST describe the fallback behavior when the data
  source is unavailable.
- User-facing features MUST document configuration requirements in repository
  docs or the feature quickstart before completion.

## Delivery Workflow

- Every non-trivial feature MUST have `spec.md`, `plan.md`, and `tasks.md`
  artifacts before implementation starts.
- Specs MUST cover user scenarios, safety/privacy edge cases, interface changes,
  and measurable success criteria.
- Plans MUST pass the Constitution Check by naming affected contracts, required
  verification, performance expectations, and any justified complexity.
- Tasks MUST be organized by user story, include exact file paths, and contain
  explicit verification and documentation tasks when those are required by the
  feature.
- Code review or self-review MUST confirm constitution compliance before merge.

## Governance

This constitution overrides conflicting local habits and template defaults.
Amendments require a documented rationale, updates to dependent templates, and a
version bump recorded in the Sync Impact Report. Versioning follows semantic
rules for governance: MAJOR for incompatible principle changes or removals, MINOR
for new principles or materially expanded requirements, and PATCH for wording
clarifications that do not change expected behavior. Compliance reviews MUST
occur during planning and again before merge, with violations either corrected or
explicitly justified in the implementation plan.

**Version**: 1.0.1 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-07
