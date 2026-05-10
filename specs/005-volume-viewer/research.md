# Research: 3D Volume Viewer

## Decision: Reuse the Existing DICOM Viewer Toolchain

Use the same tools already present in the DICOM viewer: React, Vite, TypeScript, FastAPI, pydicom, `@cornerstonejs/core`, `@cornerstonejs/tools`, and `@cornerstonejs/dicom-image-loader`.

**Rationale**: The user explicitly requested the same tools being used for the DICOM viewer. The repository already initializes Cornerstone and loads local DICOM instances through the FastAPI manifest endpoint, so the lowest-risk path is extending that adapter for volume display.

**Alternatives considered**: A separate Three.js renderer or custom WebGL volume renderer. Rejected because it would duplicate imaging responsibilities already covered by Cornerstone and would add a second rendering model to the app.

## Decision: Reuse the Current Series Viewport Manifest First

Use the existing `/api/v1/studies/{studyUid}/series/{seriesUid}/viewport` manifest as the source of ordered instance URLs for both stack and volume display.

**Rationale**: The current manifest already contains study UID, series UID, modality, instance count, initial index, and renderable instance URLs. This keeps the first volume slice inside the current frontend/backend contract and avoids a backend change unless implementation reveals missing volume-specific metadata.

**Alternatives considered**: Add a new `/volume` endpoint immediately. Rejected for the planning slice because no new user-facing data is required yet, and a premature endpoint would violate incremental simplicity.

## Decision: Add a Volume-Specific Frontend Viewport Path

Introduce a volume viewer path in the frontend that can be selected through the existing viewer mode switch, while keeping the stack viewer behavior intact.

**Rationale**: The current UI already models `ViewerMode` as `stack | mpr | volume`, and the Volume button exists but is disabled. Enabling the mode and routing it to a dedicated Cornerstone volume viewport path minimizes UI churn and preserves the current stack workflow.

**Alternatives considered**: Replace the current stack viewport with a universal viewport component. Rejected because stack and volume interactions have different defaults and failure modes; a small mode-specific split is clearer.

## Decision: Keep Interaction Scope to Mouse Drag and Wheel

Support desktop pointer drag for rotation and mouse wheel for zoom in the 3D Volume view. Do not include touch gestures, keyboard shortcuts, measurement tools, segmentation, or export in this feature.

**Rationale**: This matches the feature specification and keeps the MVP focused on view selection, rotation, and zoom.

**Alternatives considered**: Add full tool palettes, touch controls, or keyboard navigation. Rejected as broader UX scope that should be specified separately.

## Decision: Non-Diagnostic Exploratory Labeling

Carry the existing non-diagnostic workbench posture into the 3D Volume view and avoid adding measurements or clinical claims.

**Rationale**: The constitution requires explicit clinical safety boundaries for DICOM display features. This feature is for visual exploration only.

**Alternatives considered**: Treat the 3D volume as diagnostic-ready because it displays source imaging data. Rejected because no validation standard is in scope.

## Decision: Loading and Fallback States Are Required

Display loading, unsupported-data, invalid-data, and failed-load states in the volume area instead of allowing blank or broken viewports.

**Rationale**: Volume rendering may fail for single-slice series, malformed metadata, unsupported transfer syntax, missing files, or large datasets. Clear states satisfy the spec and the responsiveness principle.

**Alternatives considered**: Fail silently or fall back to stack view automatically. Rejected because users need to understand why the selected volume did not open.
