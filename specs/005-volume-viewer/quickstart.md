# Quickstart: 3D Volume Viewer

## Prerequisites

- Backend dependencies installed with Poetry.
- Frontend dependencies installed with npm.
- Optional local DICOM samples available under `backend/sample_dicom`.

## Run Locally

1. Start the backend:

   ```powershell
   cd backend
   poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. Start the frontend:

   ```powershell
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

3. Open the frontend in a desktop browser and select a DICOM study and series.

4. Select the `Volume` viewer mode.

5. Verify the selected series opens as a non-diagnostic 3D volume or shows a clear unsupported/error state.

6. Drag inside the volume viewport to rotate.

7. Use the mouse wheel inside the volume viewport to zoom in and out.

8. Switch back to `Stack` and confirm the selected study and series remain unchanged.

## Verification

Run these commands before considering implementation complete:

```powershell
cd frontend
npm run lint
npm run build
```

If backend contracts or DICOM catalog behavior change, also run:

```powershell
cd backend
poetry run ruff check .
poetry run mypy app
poetry run pytest
```

## Expected Results

- The `Volume` tab is enabled.
- Volume loading has visible `loading`, `ready`, and `error` states.
- Valid target sample series display within 5 seconds or produce a clear fallback state.
- Drag rotation and wheel zoom remain responsive during ordinary inspection.
- The UI remains explicitly non-diagnostic.

## Verification Outcomes

- 2026-05-10: `cd frontend; npm run lint` passed.
- 2026-05-10: `cd frontend; npm run build` passed when run outside the sandbox after the sandbox blocked esbuild worker spawning with `EPERM`.
- 2026-05-10: Backend verification was not required because no backend files or DICOM catalog contracts changed.
