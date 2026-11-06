from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import Defect, Inspection
from schemas import DefectCreate, DefectUpdate, DefectOut
from deps import get_current_user

router = APIRouter(tags=["Defects"])


@router.get("/inspections/{inspection_id}/defects", response_model=List[DefectOut])
def list_defects(inspection_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Defect).filter(Defect.inspection_id == inspection_id).all()


@router.post("/inspections/{inspection_id}/defects", response_model=DefectOut, status_code=201)
def add_defect(inspection_id: str, body: DefectCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ins = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")
    d = Defect(inspection_id=inspection_id, **body.model_dump())
    db.add(d)
    ins.total_defects += 1
    if body.severity == "critical":
        ins.critical_defects += 1
    db.commit()
    db.refresh(d)
    return d


@router.patch("/defects/{id}", response_model=DefectOut)
def update_defect(id: str, body: DefectUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Defect).filter(Defect.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Defect not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    db.commit()
    db.refresh(d)
    return d


@router.delete("/defects/{id}")
def delete_defect(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Defect).filter(Defect.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Defect not found")
    ins = db.query(Inspection).filter(Inspection.id == d.inspection_id).first()
    if ins:
        ins.total_defects = max(0, ins.total_defects - 1)
        if d.severity == "critical":
            ins.critical_defects = max(0, ins.critical_defects - 1)
    db.delete(d)
    db.commit()
    return {"success": True}


@router.patch("/defects/{id}/confirm", response_model=DefectOut)
def confirm_defect(id: str, confirmed_by: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Defect).filter(Defect.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Defect not found")
    d.confirmed_by = confirmed_by
    db.commit()
    db.refresh(d)
    return d
