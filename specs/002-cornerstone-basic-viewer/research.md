# Research: Sample-Backed Cornerstone Viewer

## Decision 1: Use a StackViewport for the first viewer slice

- Decision: Implement the initial viewer as a single Cornerstone `StackViewport`
  mounted in `#cornerstone-viewport`.
- Rationale: The requested scope is a basic 2D viewing surface for local sample
  DICOM content with pan and mouse-wheel zoom. Cornerstone documents
  `StackViewport` as the fit for rendering a stack of 2D images, while volume
  and 3D viewports are intended for MPR and volume rendering workflows that the
  spec explicitly keeps out of scope.
- Alternatives considered:
  - `VolumeViewport`: rejected because it introduces volume-loading and MPR
    concerns that are not needed for a single-stack viewer slice.
  - `VolumeViewport3D`: rejected because true 3D rendering is explicitly out of
    scope for this phase.

## Decision 2: Standardize on Cornerstone3D packages and initialize the DICOM
image loader once

- Decision: Use the existing `@cornerstonejs/core` dependency together with
  `@cornerstonejs/dicom-image-loader` and `@cornerstonejs/tools`, and initialize
  the DICOM image loader once in a frontend viewer adapter.
- Rationale: Cornerstone's current docs describe `@cornerstonejs/dicom-image-loader`
  as the loader that registers `wado-uri` and `wado-rs` support, and the modern
  initialization path is a single `init()` call that works with ESM bundlers
  like Vite. That aligns with the current frontend toolchain and avoids
  reviving older Cornerstone setup patterns.
- Alternatives considered:
  - Keep relying only on `@cornerstonejs/core`: rejected because the viewer also
    needs DICOM loading and tool bindings, which the core package does not
    provide by itself.
  - Extend the legacy `cornerstone-core` package already listed in
    `frontend/package.json`: rejected because the active frontend scaffold uses
    the newer `@cornerstonejs/*` package line and the feature should not deepen
    a mixed-version dependency story.

## Decision 3: Use a ToolGroup with explicit pan and wheel-zoom bindings

- Decision: Configure a per-viewport Cornerstone ToolGroup that activates
  `PanTool` for primary-button drag and `ZoomTool` for the wheel binding.
- Rationale: Cornerstone tools are designed to be registered globally, added to
  a ToolGroup, and activated with explicit bindings. The docs also note that a
  viewport belongs to one ToolGroup and that active tools should not share the
  same binding. This gives the feature a precise, low-complexity mapping to the
  requested drag-to-pan and mouse-wheel zoom behavior.
- Alternatives considered:
  - Bind the mouse wheel to stack scrolling: rejected because the requested
    interaction is zoom, not image scrolling.
  - Keep tool setup inline inside `App.tsx`: rejected because lifecycle-heavy
    viewport setup and teardown will be easier to reason about in a dedicated
    viewer adapter.

## Decision 4: Add a dedicated series manifest endpoint plus a DICOM file
streaming endpoint

- Decision: Keep `/api/v1/studies` as the lightweight study and series summary
  feed, and add a dedicated endpoint that returns the ordered renderable
  instances for one selected series together with a backend-served URL for each
  DICOM file.
- Rationale: The existing catalog endpoint exposes study and series summaries
  only. The browser cannot read `backend/sample_dicom` directly, so the simplest
  contract-first slice is a backend manifest for one selected series plus an
  HTTP endpoint that streams the Part 10 DICOM files needed by Cornerstone's
  `wado-uri` loader.
- Alternatives considered:
  - Expand `/api/v1/studies` to include every instance in every series: rejected
    because it would bloat bootstrap payloads and tie study-list loading to
    image-delivery concerns.
  - Read files directly from the frontend filesystem path: rejected because
    browser code cannot safely access the backend's local sample directory.
  - Return viewer-library-specific image IDs directly from the backend:
    rejected because the backend contract can stay cleaner by returning image
    URLs while the frontend adapter owns the Cornerstone-specific `wado-uri:`
    prefixing.

## Decision 5: Keep the current study queue UI and add a focused frontend
viewer adapter

- Decision: Preserve the existing `App.tsx` study queue and series inspector as
  the selection surface, and move Cornerstone initialization, series loading,
  cleanup, and error-state orchestration into a dedicated frontend component or
  helper module.
- Rationale: The current app already owns bootstrap loading and selected-study
  state. Splitting the viewport integration into a focused adapter keeps the
  React shell readable, makes cleanup on selection changes explicit, and avoids
  spreading rendering-engine state across unrelated UI sections.
- Alternatives considered:
  - Rewrite the full viewer shell around Cornerstone first: rejected because the
    spec calls for a thin vertical slice, not a broad UI re-architecture.
  - Push all Cornerstone setup into generic global utilities: rejected because
    this feature currently has one viewport and does not justify a larger
    abstraction layer.

## Decision 6: Add lightweight backend contract tests and keep frontend
verification tool-based

- Decision: Plan for backend API contract tests around the new sample-viewer
  endpoints, while keeping frontend verification to `npm run lint`, `npm run
  build`, and manual smoke testing of render, pan, zoom, and selection changes.
- Rationale: The constitution requires executable verification and specifically
  calls for contract tests when contracts change. A focused backend test around
  manifest ordering and file-serving behavior is the smallest reliable check for
  the new browser-backend interface without introducing a full browser E2E stack
  in the same feature.
- Alternatives considered:
  - Add a new frontend E2E framework in this feature: rejected because it is
    broader than the minimum viewer slice and would add significant setup
    overhead.
  - Skip automated contract tests: rejected because the feature adds new API
    behavior and the constitution requires a contract-level verification path.
