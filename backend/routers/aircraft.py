from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Aircraft, Mission
from schemas import AircraftCreate, AircraftUpdate, AircraftOut
from deps import get_current_user

router = APIRouter(prefix="/aircraft", tags=["Aircraft"])


@router.get("", response_model=List[AircraftOut])
def list_aircraft(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Aircraft).all()


@router.get("/{id}", response_model=AircraftOut)
def get_aircraft(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ac = db.query(Aircraft).filter(Aircraft.id == id).first()
    if not ac:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return ac


@router.post("", response_model=AircraftOut, status_code=201)
def create_aircraft(body: AircraftCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ac = Aircraft(**body.model_dump())
    db.add(ac)
    db.commit()
    db.refresh(ac)
    return ac


@router.patch("/{id}", response_model=AircraftOut)
def update_aircraft(id: str, body: AircraftUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ac = db.query(Aircraft).filter(Aircraft.id == id).first()
    if not ac:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(ac, k, v)
    db.commit()
    db.refresh(ac)
    return ac


@router.patch("/{id}/status", response_model=AircraftOut)
def update_status(id: str, status: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ac = db.query(Aircraft).filter(Aircraft.id == id).first()
    if not ac:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    ac.status = status
    db.commit()
    db.refresh(ac)
    return ac


@router.delete("/{id}")
def delete_aircraft(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ac = db.query(Aircraft).filter(Aircraft.id == id).first()
    if not ac:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    has_missions = db.query(Mission).filter(Mission.aircraft_id == id).first()
    if has_missions:
        raise HTTPException(status_code=400, detail="Cannot delete aircraft with existing missions")
    db.delete(ac)
    db.commit()
    return {"success": True}
