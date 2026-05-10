# Data Model: 3D Volume Viewer

## Selected DICOM Series

Represents the study series currently selected by the user.

**Fields**

- `studyUid`: Stable study identifier.
- `seriesUid`: Stable series identifier.
- `seriesDescription`: Optional display name for the selected series.
- `modality`: Optional modality label.
- `instanceCount`: Number of renderable instances in the selected series.
- `instances`: Ordered list of renderable DICOM instances.

**Relationships**

- Belongs to a selected study.
- Provides the source data for one stack view and one 3D volume view.

**Validation Rules**

- `studyUid` and `seriesUid` must be present before the volume view attempts to load.
- `instanceCount` must be greater than one for a meaningful volume.
- `instances` must contain renderable image URLs in a deterministic order.

## Renderable Instance

Represents one DICOM file that can be loaded into the viewer.

**Fields**

- `instanceId`: Stable application identifier for the instance.
- `sopInstanceUid`: Optional source DICOM SOP Instance UID.
- `instanceNumber`: Optional source ordering value.
- `imageUrl`: URL used by the browser-side DICOM image loader.
- `contentType`: Media type returned for the file.

**Relationships**

- Belongs to a selected DICOM series.
- Participates in stack display and volume assembly.

**Validation Rules**

- `imageUrl` must resolve to a DICOM object that the existing image loader can decode.
- Missing or malformed instances must produce an error or degraded state rather than a blank viewport.

## 3D Volume View

Represents the active viewer mode that displays the selected DICOM series as a 3D volume.

**Fields**

- `mode`: Must be `volume` when this view is active.
- `loadState`: One of `idle`, `loading`, `ready`, or `error`.
- `message`: Optional user-readable status or error message.
- `sourceStudyUid`: Study UID used to prepare the current volume.
- `sourceSeriesUid`: Series UID used to prepare the current volume.

**Relationships**

- Uses exactly one selected DICOM series at a time.
- Owns the current view state while the Volume tab is active.

**State Transitions**

- `idle` -> `loading`: User opens the Volume tab with a selected series.
- `loading` -> `ready`: The selected series is prepared and displayed as a volume.
- `loading` -> `error`: Data is unavailable, unsupported, malformed, or cannot form a volume.
- `ready` -> `loading`: User changes study or series while Volume mode remains active.
- Any state -> `idle`: User switches away or no series is selected.

## View State

Represents user interaction state inside the 3D volume viewport.

**Fields**

- `orientation`: Current camera orientation selected through drag rotation.
- `zoomLevel`: Current constrained zoom level.
- `isInteracting`: Whether the user is actively dragging or scrolling.

**Relationships**

- Belongs to the current 3D Volume View.
- Resets when a different selected DICOM series is loaded.

**Validation Rules**

- Rotation input is only accepted when `loadState` is `ready`.
- Zoom must remain within usable bounds so the volume remains recoverable.
- The last orientation remains stable after drag release.
