from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
from models import Mission
from schemas import MissionCreate, MissionUpdate, MissionOut
from deps import get_current_user

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.get("", response_model=List[MissionOut])
def list_missions(
    status: Optional[str] = Query(None),
    aircraft_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Mission).options(joinedload(Mission.aircraft))
    if status:
        q = q.filter(Mission.status == status)
    if aircraft_id:
        q = q.filter(Mission.aircraft_id == aircraft_id)
    return q.order_by(Mission.created_at.desc()).all()


@router.get("/{id}", response_model=MissionOut)
def get_mission(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = db.query(Mission).options(joinedload(Mission.aircraft)).filter(Mission.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    return m


@router.post("", response_model=MissionOut, status_code=201)
def create_mission(body: MissionCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = Mission(**body.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/{id}", response_model=MissionOut)
def update_mission(id: str, body: MissionUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = db.query(Mission).filter(Mission.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/{id}/status", response_model=MissionOut)
def update_status(id: str, status: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = db.query(Mission).filter(Mission.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    m.status = status
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{id}")
def delete_mission(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = db.query(Mission).filter(Mission.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    db.delete(m)
    db.commit()
    return {"success": True}
