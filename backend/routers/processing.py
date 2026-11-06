import os
import uuid
import shutil
import tempfile
import threading
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from models import Mission, ProcessingJob, Inspection, Defect
from schemas import ProcessingJobOut
from deps import get_current_user

router = APIRouter(tags=["Processing"])

ALLOWED_EXTENSIONS = {".zip", ".tar"}
MESHES_DIR = Path(__file__).parent.parent / "static" / "meshes"
MESHES_DIR.mkdir(parents=True, exist_ok=True)


def _run_pipeline(mission_id: str, local_file_path: str):
    """Background thread: upload to Mega, poll for GLB, create inspection."""
    db = SessionLocal()
    job = None
    try:
        job = db.query(ProcessingJob).filter(ProcessingJob.mission_id == mission_id).first()

        # ── Step 1: Upload to Mega ──────────────────────────────────────────
        if job:
            job.stage = "uploading"
            job.progress = 10
            db.commit()

        from services.mega_service import upload_to_mega, download_glb_from_mega
        upload_to_mega(local_file_path)

        # ── Step 2: Update stage to reconstructing while waiting ────────────
        if job:
            job.stage = "reconstructing"
            job.progress = 25
            db.commit()

        # ── Step 3: Poll Mega and download GLB ──────────────────────────────
        inspection_id = str(uuid.uuid4())
        glb_filename  = f"{inspection_id}.glb"
        glb_dest      = str(MESHES_DIR / glb_filename)

        download_glb_from_mega(glb_dest)

        # ── Step 4: Create Inspection ────────────────────────────────────────
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        mesh_url = f"/static/meshes/{glb_filename}"

        inspection = Inspection(
            id=inspection_id,
            mission_id=mission_id,
            aircraft_id=mission.aircraft_id,
            total_defects=3,
            critical_defects=0,
            completed_at=datetime.utcnow(),
            operator=mission.assigned_operator,
            status="pending_review",
            mesh_url=mesh_url,
        )
        db.add(inspection)
        db.flush()

        # ── Step 5: Placeholder defects ──────────────────────────────────────
        placeholder_defects = [
            Defect(inspection_id=inspection_id, type="dent",      severity="medium", location="Fuselage – Section A", description="Placeholder defect — replace with AI output", detected_at=datetime.utcnow()),
            Defect(inspection_id=inspection_id, type="scratch",   severity="low",    location="Wing – Left panel",    description="Placeholder defect — replace with AI output", detected_at=datetime.utcnow()),
            Defect(inspection_id=inspection_id, type="corrosion", severity="high",   location="Tail – Lower section", description="Placeholder defect — replace with AI output", detected_at=datetime.utcnow()),
        ]
        for d in placeholder_defects:
            db.add(d)

        # ── Step 6: Mark mission complete ────────────────────────────────────
        mission.status = "completed"
        mission.completed_at = datetime.utcnow()
        mission.progress = 100

        if job:
            job.stage = "completed"
            job.progress = 100
            job.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        if job:
            job.stage = "queued"
            job.error_message = str(e)
            db.commit()
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if mission:
            mission.status = "failed"
            db.commit()
    finally:
        # Remove temp upload file
        try:
            os.remove(local_file_path)
        except Exception:
            pass
        db.close()


@router.post("/missions/{mission_id}/upload", status_code=202)
def upload_files(
    mission_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    # Validate file extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Only .zip and .tar files are accepted. Got: {suffix}")

    # Check mission exists
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    # Save file to temp location
    temp_dir = tempfile.mkdtemp(prefix="aerosepct_upload_")
    temp_path = os.path.join(temp_dir, file.filename)
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Update mission status
    mission.status = "uploading"
    mission.progress = 0

    # Create processing job
    job = ProcessingJob(
        mission_id=mission_id,
        stage="queued",
        progress=0,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    db.commit()

    # Run pipeline in background thread (not blocking the request)
    thread = threading.Thread(target=_run_pipeline, args=(mission_id, temp_path), daemon=True)
    thread.start()

    return {"message": "Upload received. Processing started.", "mission_id": mission_id}


@router.get("/processing", response_model=List[ProcessingJobOut])
def list_jobs(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(ProcessingJob).order_by(ProcessingJob.started_at.desc()).all()


@router.get("/processing/{mission_id}", response_model=ProcessingJobOut)
def get_job(mission_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    job = db.query(ProcessingJob).filter(ProcessingJob.mission_id == mission_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="No processing job found for this mission")
    return job
