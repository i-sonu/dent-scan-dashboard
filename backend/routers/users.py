from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import bcrypt
from database import get_db
from models import User
from schemas import UserCreate, UserOut, PasswordChange
from deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(User).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt(10))
    u = User(
        username=body.username,
        name=body.name,
        email=body.email,
        password_hash=hashed.decode(),
        role=body.role,
        organization=body.organization,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{id}")
def delete_user(id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    admins = db.query(User).filter(User.role == "admin").count()
    if u.role == "admin" and admins <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last admin")
    db.delete(u)
    db.commit()
    return {"success": True}


@router.patch("/{id}/password")
def change_password(id: str, body: PasswordChange, db: Session = Depends(get_db), _=Depends(get_current_user)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt(10)).decode()
    db.commit()
    return {"success": True}
