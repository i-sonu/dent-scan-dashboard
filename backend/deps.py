from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt
import os

load_dotenv()

JWT_SECRET      = os.getenv("JWT_SECRET", "Aer0$epct-JWT-Sup3r-S3cr3t-2025-D0-N0t-Shar3")
JWT_ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS= int(os.getenv("JWT_EXPIRE_HOURS", 24))

security = HTTPBearer()

def create_access_token(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    data["iat"] = datetime.now(timezone.utc)
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired — please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_access_token(credentials.credentials)
