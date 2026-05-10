# Contract: Volume Viewer UI

## Purpose

Defines the user-facing state and interaction contract for the 3D Volume tab.

## View Selection

- The viewer mode switch includes an enabled `Volume` option.
- Selecting `Volume` uses the currently selected study and series.
- Switching between `Stack` and `Volume` preserves the selected study and series.
- If no series is selected, the Volume area shows an empty state.

## Status States

| State | Required Behavior |
|-------|-------------------|
| `idle` | No volume is being loaded; prompt the user to select a series if needed. |
| `loading` | Show an explicit loading state while the selected series is prepared. |
| `ready` | Show the 3D volume and allow rotate and zoom interactions. |
| `error` | Show a user-readable reason when the volume cannot be displayed. |

## Interactions

- Dragging with the primary mouse button rotates the 3D volume.
- Releasing the mouse button preserves the last orientation.
- Mouse wheel scrolling zooms in and out.
- Zoom is constrained so the volume cannot become unrecoverable, invisible, or unusably clipped.
- Rotate and zoom input before `ready` is ignored or safely deferred.

## Safety Copy

- The Volume view must maintain the app's non-diagnostic framing.
- The view must not add measurements, diagnostic findings, or patient-identifying fields beyond existing study and series display.

## Acceptance Checks

- A user can open Volume from a loaded selected series.
- A user can rotate the volume with drag.
- A user can zoom in and out with the wheel.
- Invalid or unsupported series produce a clear message, not a blank viewport.
