# Contract: Series Viewport Manifest

## Purpose

The 3D Volume Viewer depends on the existing series viewport manifest to identify the selected DICOM instances that should be displayed. The first implementation should reuse this contract rather than add a new endpoint.

## Endpoint

`GET /api/v1/studies/{studyUid}/series/{seriesUid}/viewport`

## Required Response Shape

```json
{
  "studyUid": "string",
  "seriesUid": "string",
  "seriesDescription": "string | null",
  "modality": "string | null",
  "instanceCount": 12,
  "initialImageIndex": 0,
  "instances": [
    {
      "instanceId": "string",
      "sopInstanceUid": "string | null",
      "instanceNumber": 1,
      "imageUrl": "string",
      "contentType": "application/dicom"
    }
  ]
}
```

## Volume Viewer Expectations

- `instances` must be ordered deterministically for stack and volume loading.
- `imageUrl` values must remain usable by the browser-side DICOM image loader.
- `instanceCount` must match the number of renderable instances.
- Series with no renderable instances must return a clear error response.
- Series with too few instances for volume display may still be valid for stack display, but the Volume view must show an unsupported-data state.

## Error Behavior

- `404 Study not found`: The selected study is no longer available.
- `404 Series not found for requested study`: The selected series is no longer available for the selected study.
- `409 Selected series has no renderable DICOM instances`: The series cannot be displayed.

## Change Rule

If implementation requires volume-specific fields beyond the current response, update this contract before changing code and add corresponding backend and frontend tests.
