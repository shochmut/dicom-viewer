# Data Model: Sample-Backed Cornerstone Viewer

## Entity: RenderableSeriesManifest

- Purpose: Supplies the frontend with the minimum ordered information needed to
  load one selected sample series into the viewport.
- Fields:
  - `study_uid`: study identifier for the selected series
  - `series_uid`: series identifier for the selected series
  - `series_description`: human-readable label shown in the workspace when
    available
  - `modality`: modality label for viewer context
  - `instance_count`: number of renderable instances in the selected series
  - `initial_image_index`: zero-based image index the viewport should open with
  - `instances`: ordered collection of `RenderableInstance` records
- Validation Rules:
  - Must only include instances that can be served as DICOM files to the
    browser.
  - Must return instances in deterministic display order.
  - Must fail clearly when the requested study or series does not exist or does
    not contain renderable images.

## Entity: RenderableInstance

- Purpose: Represents one DICOM object in a selected sample series that the
  frontend can turn into a Cornerstone image ID.
- Fields:
  - `instance_id`: opaque backend-generated identifier for the file-serving
    endpoint
  - `sop_instance_uid`: DICOM SOP Instance UID when available
  - `instance_number`: numeric ordering hint when present in metadata
  - `image_url`: backend URL that streams the DICOM Part 10 file for this
    instance
  - `content_type`: expected HTTP content type for the file response
- Validation Rules:
  - `image_url` must resolve to the same instance represented by the metadata
    record.
  - Ordering must remain stable across repeated requests for the same series.
  - `instance_id` must not expose raw absolute filesystem paths.

## Entity: ViewportSessionState

- Purpose: Tracks the active viewer state in the frontend for one viewport
  session.
- Fields:
  - `selected_study_uid`: currently selected study
  - `selected_series_uid`: currently selected series
  - `load_state`: one of `idle`, `loading`, `ready`, or `error`
  - `active_manifest_key`: stable key for the currently loaded manifest
  - `error_message`: user-visible load failure text when present
  - `zoom_state`: current camera zoom level managed by Cornerstone
  - `pan_state`: current camera pan offset managed by Cornerstone
- Validation Rules:
  - Selection changes must move the session back through `loading` before
    returning to `ready` or `error`.
  - A failed series load must not erase the user's study-selection context.
  - Cleanup must dispose prior viewport resources when a new session replaces
    the active one.

## Entity: ViewerToolBinding

- Purpose: Documents the user input mapping applied to the viewport for this
  feature slice.
- Fields:
  - `tool_name`: manipulation tool name
  - `binding`: primary drag or wheel
  - `user_intent`: pan or zoom
  - `scope`: viewport-specific ToolGroup binding
- Validation Rules:
  - No two active tools may share the same binding in the same viewport.
  - The configured bindings must match the feature requirements for drag-to-pan
    and wheel zoom.

## Relationships

- `RenderableSeriesManifest` contains one or more `RenderableInstance` records.
- `ViewportSessionState` references exactly one active
  `RenderableSeriesManifest` at a time.
- `ViewportSessionState` applies one or more `ViewerToolBinding` records to the
  active viewport.
