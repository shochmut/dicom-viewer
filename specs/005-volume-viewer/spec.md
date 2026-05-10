# Feature Specification: 3D Volume Viewer

**Feature Branch**: `005-volume-viewer`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Build a 3D Volume Viewer to add into the dicom-viewer. It should have its own tab to be selected and when it is selected the volume viewer shall open to the current selected dicom. The volume viewer should allow for clicking and dragging to rotate the 3d volume around for viewing. The volume viewer should also allow for mouse wheel scrolling to zoom in and out on the 3d volume."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Current Study as a 3D Volume (Priority: P1)

As a viewer user, I want to switch from the current image stack to a dedicated 3D Volume tab so I can inspect the selected DICOM data as a volume without losing the current study context.

**Why this priority**: Opening the current selection in a 3D view is the core value of the feature; rotation and zoom only matter after the volume is visible.

**Independent Test**: Can be fully tested by loading a DICOM series, selecting the 3D Volume tab, and verifying that the visible volume corresponds to the same selected data.

**Acceptance Scenarios**:

1. **Given** a DICOM series is loaded and selected in the viewer, **When** the user selects the 3D Volume tab, **Then** the viewer displays a 3D representation of that selected series.
2. **Given** the user is viewing a DICOM stack, **When** the user switches to the 3D Volume tab and then back to the stack view, **Then** the selected study context remains unchanged.
3. **Given** no DICOM data is selected, **When** the user selects the 3D Volume tab, **Then** the viewer displays a clear empty-state message instead of a broken or blank viewport.

---

### User Story 2 - Rotate the 3D Volume (Priority: P2)

As a viewer user, I want to click and drag on the 3D volume so I can rotate it and inspect the anatomy or object from different angles.

**Why this priority**: Rotation is the primary interaction that makes a 3D volume useful for visual inspection.

**Independent Test**: Can be tested by opening the 3D Volume tab, dragging across the volume, and verifying that the view orientation changes smoothly while the selected volume remains visible.

**Acceptance Scenarios**:

1. **Given** the 3D volume is visible, **When** the user clicks and drags horizontally or vertically over the volume, **Then** the displayed volume rotates in the corresponding direction.
2. **Given** the user releases the mouse button after rotating, **When** no drag is in progress, **Then** the volume remains at the last selected orientation.
3. **Given** the user rotates the volume repeatedly, **When** interaction continues for at least 30 seconds, **Then** the view remains responsive and does not reset unexpectedly.

---

### User Story 3 - Zoom the 3D Volume (Priority: P3)

As a viewer user, I want to use the mouse wheel to zoom in and out on the 3D volume so I can inspect large structures and finer spatial details.

**Why this priority**: Zoom complements rotation and allows users to adjust the view for inspection, but the volume must first be visible and rotatable.

**Independent Test**: Can be tested by opening the 3D Volume tab, using the mouse wheel, and verifying that the view moves closer to or farther from the volume within usable bounds.

**Acceptance Scenarios**:

1. **Given** the 3D volume is visible, **When** the user scrolls the mouse wheel up, **Then** the view zooms in toward the volume.
2. **Given** the 3D volume is visible, **When** the user scrolls the mouse wheel down, **Then** the view zooms out from the volume.
3. **Given** the user continues zooming in or out, **When** the nearest or farthest usable zoom level is reached, **Then** the viewer prevents the volume from becoming unusably clipped, invisible, or too distant to recover.

### Edge Cases

- The selected DICOM data contains only one image or too few slices to form a meaningful volume.
- The selected DICOM metadata is incomplete, malformed, or inconsistent across slices.
- The selected DICOM data is unavailable, still loading, or fails to load after the user switches to the 3D Volume tab.
- The selected DICOM series is large enough that volume preparation takes longer than the standard viewer transition time.
- The user switches tabs while a volume is still loading.
- The user attempts rotate or zoom interactions before the volume is ready.
- The feature presents visual inspection only and does not produce measurements, diagnoses, derived clinical findings, or validated medical decisions.
- If real patient data is present in the selected DICOM, the 3D view must not expose more patient-identifying information than the existing viewer already displays.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a distinct 3D Volume tab or equivalent top-level view selector alongside the existing DICOM viewing mode.
- **FR-002**: When the user selects the 3D Volume tab with a DICOM series already selected, the system MUST open a 3D volume view for that same selected series.
- **FR-003**: The system MUST preserve the current selected DICOM context when users switch between the stack view and the 3D Volume view.
- **FR-004**: The system MUST show an explicit loading state while the selected DICOM data is being prepared for 3D viewing.
- **FR-005**: The system MUST show a user-readable message when no DICOM data is selected, the selected data cannot form a volume, or the volume cannot be displayed.
- **FR-006**: Users MUST be able to rotate the displayed 3D volume by clicking and dragging within the 3D Volume view.
- **FR-007**: The system MUST keep the last user-selected 3D orientation stable after the user stops dragging.
- **FR-008**: Users MUST be able to zoom in and out on the displayed 3D volume using mouse wheel scrolling within the 3D Volume view.
- **FR-009**: The system MUST constrain zoom behavior so the user cannot accidentally move the volume into an unrecoverable, invisible, or unusably clipped state.
- **FR-010**: The system MUST ignore or safely defer rotate and zoom input while the 3D volume is not ready for interaction.
- **FR-011**: The system MUST describe loading, error, and degraded-mode behavior for slow, missing, malformed, or oversized imaging data.
- **FR-012**: The system MUST label the 3D Volume view as non-diagnostic unless an approved diagnostic validation standard is explicitly added to scope.
- **FR-013**: If the feature changes the data contract used to retrieve or describe DICOM series for viewing, the system MUST define that changed interface contract in a versioned artifact or explicit request and response example.

### Key Entities

- **Selected DICOM Series**: The current imaging data selected by the user for viewing; includes the images and metadata needed to determine whether a 3D volume can be presented.
- **3D Volume View**: The viewer mode that presents the selected DICOM series as a rotatable and zoomable 3D volume.
- **View State**: The user's current 3D orientation, zoom level, loading state, and error or empty-state status for the selected volume.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of tested users can locate and open the 3D Volume view from an already loaded DICOM series in under 10 seconds without guidance.
- **SC-002**: For the target sample DICOM datasets, the 3D Volume view presents either a usable volume or a clear user-readable status message within 5 seconds of tab selection.
- **SC-003**: 90% of tested users can rotate the volume to a visibly different orientation on their first attempt.
- **SC-004**: 90% of tested users can zoom in and back out without losing sight of the volume.
- **SC-005**: During standard rotate and zoom interactions on the target sample datasets, the viewer remains responsive enough that users perceive motion as continuous rather than stalled.
- **SC-006**: 100% of unsupported, missing, or invalid selected datasets result in a clear empty, loading, degraded, or error state rather than a blank or broken view.

## Assumptions

- The primary user is the same user who currently opens and inspects DICOM image stacks in the application.
- The feature uses the currently selected DICOM series or stack as the source for the 3D volume.
- The initial scope is desktop pointer interaction with mouse drag and wheel input; touch gestures and keyboard shortcuts are out of scope for this feature.
- The 3D Volume view is intended for visual exploration in the application and is non-diagnostic.
- Production PACS integration, long-term patient data storage changes, segmentation, measurements, and export of 3D outputs are out of scope unless introduced by a separate feature.
