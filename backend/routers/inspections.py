from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models import Inspection
from schemas import InspectionOut, InspectionUpdate
from deps import get_current_user

router = APIRouter(prefix="/inspections", tags=["Inspections"])


@router.get("", response_model=List[InspectionOut])
def list_inspections(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Inspection).options(joinedload(Inspection.defects), joinedload(Inspection.aircraft)).order_by(Inspection.completed_at.desc()).all()


@router.get("/{id}", response_model=InspectionOut)
def get_inspection(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ins = db.query(Inspection).options(joinedload(Inspection.defects), joinedload(Inspection.aircraft)).filter(Inspection.id == id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return ins


@router.patch("/{id}", response_model=InspectionOut)
def update_inspection(id: str, body: InspectionUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ins = db.query(Inspection).filter(Inspection.id == id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(ins, k, v)
    db.commit()
    db.refresh(ins)
    return ins
