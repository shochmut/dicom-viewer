# Contract: Sample Series Viewport Loading

## Status

Proposed for implementation

## Purpose

Define the backend-to-frontend contract that allows the browser viewer to load
one selected sample-backed DICOM series into the Cornerstone viewport while
keeping the study list payload lightweight.

## Contract Summary

- Existing summary endpoint remains: `GET /api/v1/studies`
- New series manifest endpoint: `GET /api/v1/studies/{studyUid}/series/{seriesUid}/viewport`
- New instance file endpoint:
  `GET /api/v1/studies/{studyUid}/series/{seriesUid}/instances/{instanceId}/file`
- Frontend responsibility: convert each `imageUrl` from the manifest into a
  Cornerstone `wado-uri:` image ID before loading the stack
- Backend responsibility: order renderable instances deterministically and
  stream the matching DICOM file for each `instanceId`

## Series Manifest Endpoint

### Request

```http
GET /api/v1/studies/1.2.840.113619.2.55.3.604688435.3.145.1599728766.467/series/1.2.840.113619.2.55.3.604688435.3.145.1599728766.468/viewport
Accept: application/json
```

### Success Response

```json
{
  "studyUid": "1.2.840.113619.2.55.3.604688435.3.145.1599728766.467",
  "seriesUid": "1.2.840.113619.2.55.3.604688435.3.145.1599728766.468",
  "seriesDescription": "AXIAL",
  "modality": "CT",
  "instanceCount": 24,
  "initialImageIndex": 0,
  "instances": [
    {
      "instanceId": "sample-000001",
      "sopInstanceUid": "1.2.840.113619.2.55.3.604688435.3.145.1599728766.469",
      "instanceNumber": 1,
      "imageUrl": "/api/v1/studies/1.2.840.113619.2.55.3.604688435.3.145.1599728766.467/series/1.2.840.113619.2.55.3.604688435.3.145.1599728766.468/instances/sample-000001/file",
      "contentType": "application/dicom"
    }
  ]
}
```

### Manifest Rules

- `instances` must be returned in the order the viewport should display them.
- `initialImageIndex` must reference a valid element within `instances`.
- `imageUrl` must be resolvable by the running frontend without exposing an
  absolute local filesystem path.
- The response must include only renderable DICOM instances for the selected
  series.

## Instance File Endpoint

### Request

```http
GET /api/v1/studies/{studyUid}/series/{seriesUid}/instances/{instanceId}/file
Accept: application/dicom
```

### Success Response

- Status: `200 OK`
- Content-Type: `application/dicom`
- Body: raw DICOM Part 10 file for the requested instance

## Error Contract

### Missing Study Or Series

```json
{
  "detail": "Series not found for requested study"
}
```

### Empty Or Unrenderable Series

```json
{
  "detail": "Selected series has no renderable DICOM instances"
}
```

### Missing Instance File

```json
{
  "detail": "Instance file not found"
}
```

## Acceptance Mapping

- FR-001 through FR-004: satisfied by the manifest endpoint and visible loading
  behavior it enables
- FR-005 through FR-008: satisfied by loading ordered image URLs into the
  viewport and re-requesting the manifest on selection change
- FR-009: satisfied by explicit error responses that the frontend can surface
- FR-010: satisfied by this versioned request and response contract artifact
