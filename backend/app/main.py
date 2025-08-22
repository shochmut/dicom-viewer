from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pydicom
from pathlib import Path
from typing import List

app = FastAPI(title="Viewer API")

# Allow the Vite dev server and your deployed origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/local-dicom/files")
def list_local_dicom() -> List[str]:
    # demo: enumerate .dcm files from a local folder
    folder = Path("./sample_dicom")
    if not folder.exists():
        return []
    return [str(p.name) for p in folder.glob("*.dcm")]

@app.get("/local-dicom/metadata/{filename}")
def get_metadata(filename: str):
    path = Path("./sample_dicom") / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    ds = pydicom.dcmread(path, stop_before_pixels=True, force=True)
    # Return a JSON-safe subset
    return {
        "SOPInstanceUID": ds.get("SOPInstanceUID", None),
        "StudyInstanceUID": ds.get("StudyInstanceUID", None),
        "SeriesInstanceUID": ds.get("SeriesInstanceUID", None),
        "Modality": ds.get("Modality", None),
        "PatientID": ds.get("PatientID", None),
    }
