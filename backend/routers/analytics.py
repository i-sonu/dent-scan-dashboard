from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Inspection, Mission, Defect, Aircraft
from deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return {
        "total_inspections": db.query(Inspection).count(),
        "active_missions":   db.query(Mission).filter(Mission.status.in_(["flying", "uploading", "processing", "preflight"])).count(),
        "total_defects":     db.query(Defect).count(),
        "total_aircraft":    db.query(Aircraft).count(),
    }


@router.get("/defect-types")
def defect_types(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Defect.type, func.count(Defect.id)).group_by(Defect.type).all()
    return [{"type": r[0], "count": r[1]} for r in rows]


@router.get("/severity-trend")
def severity_trend(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Defect.severity, func.count(Defect.id)).group_by(Defect.severity).all()
    return [{"severity": r[0], "count": r[1]} for r in rows]


@router.get("/flight-hours")
def flight_hours(db: Session = Depends(get_db), _=Depends(get_current_user)):
    aircraft = db.query(Aircraft).all()
    return [{"name": a.registration, "hours": a.total_flight_hours} for a in aircraft]


@router.get("/inspection-trend")
def inspection_trend(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(
        func.to_char(Inspection.completed_at, 'Mon').label("month"),
        func.count(Inspection.id).label("inspections"),
        func.sum(Inspection.total_defects).label("defects"),
        func.sum(Inspection.critical_defects).label("critical"),
    ).group_by(func.to_char(Inspection.completed_at, 'Mon')).all()
    return [{"month": r[0], "inspections": r[1], "defects": r[2] or 0, "critical": r[3] or 0} for r in rows]
