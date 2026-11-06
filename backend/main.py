"""
Aerosepct — FastAPI Backend
Runs on http://localhost:8000
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from pathlib import Path
import bcrypt
import os

from dotenv import load_dotenv
load_dotenv()

from deps import create_access_token, decode_access_token, get_current_user, JWT_EXPIRE_HOURS
from routers import aircraft, missions, inspections, defects, reports, users, analytics, processing

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Aerosepct API",
    description="Backend for Aerosepct UAV inspection platform",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static files (3D mesh models) ───────────────────────────────────────────
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(aircraft.router)
app.include_router(missions.router)
app.include_router(inspections.router)
app.include_router(defects.router)
app.include_router(reports.router)
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(processing.router)

# ─── Auth (hardcoded admin — keep as is) ─────────────────────────────────────
_PLAIN_PASSWORD = "Admin@Aero#2025!"
_PASSWORD_HASH  = bcrypt.hashpw(_PLAIN_PASSWORD.encode(), bcrypt.gensalt(12))

HARDCODED_USERS = {
    "admin": {
        "username"     : "admin",
        "name"         : "System Administrator",
        "role"         : "Admin",
        "email"        : "admin@aerosepct.io",
        "password_hash": _PASSWORD_HASH,
    }
}

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict

class UserResponse(BaseModel):
    username: str
    name: str
    role: str
    email: str

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status"   : "ok",
        "service"  : "Aerosepct API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    username = body.username.strip().lower()
    user = HARDCODED_USERS.get(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if not bcrypt.checkpw(body.password.encode("utf-8"), user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token_payload = {
        "sub"  : user["username"],
        "name" : user["name"],
        "role" : user["role"],
        "email": user["email"],
    }
    access_token = create_access_token(token_payload)

    return {
        "access_token": access_token,
        "token_type"  : "bearer",
        "expires_in"  : JWT_EXPIRE_HOURS * 3600,
        "user": {
            "username": user["username"],
            "name"    : user["name"],
            "role"    : user["role"],
            "email"   : user["email"],
        },
    }


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["sub"],
        "name"    : current_user["name"],
        "role"    : current_user["role"],
        "email"   : current_user["email"],
    }


@app.post("/auth/logout")
def logout():
    return {"message": "Logged out successfully"}
