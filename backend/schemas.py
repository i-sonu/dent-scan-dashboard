from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# ─── Aircraft ────────────────────────────────────────────────────────────────
class AircraftCreate(BaseModel):
    registration: str
    model: str
    manufacturer: str
    year_of_manufacture: int
    total_flight_hours: int = 0
    last_inspection_date: Optional[date] = None
    next_inspection_due: Optional[date] = None
    status: str = "active"
    location: Optional[str] = None

class AircraftUpdate(BaseModel):
    registration: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    total_flight_hours: Optional[int] = None
    last_inspection_date: Optional[date] = None
    next_inspection_due: Optional[date] = None
    status: Optional[str] = None
    location: Optional[str] = None

class AircraftOut(BaseModel):
    id: str
    registration: str
    model: str
    manufacturer: str
    year_of_manufacture: int
    total_flight_hours: int
    last_inspection_date: Optional[date]
    next_inspection_due: Optional[date]
    status: str
    location: Optional[str]
    class Config:
        from_attributes = True


# ─── Mission ─────────────────────────────────────────────────────────────────
class MissionCreate(BaseModel):
    name: str
    aircraft_id: str
    inspection_type: str
    altitude: Optional[float] = None
    overlap: Optional[float] = None
    assigned_operator: Optional[str] = None
    assigned_uav: Optional[str] = None

class MissionUpdate(BaseModel):
    name: Optional[str] = None
    inspection_type: Optional[str] = None
    altitude: Optional[float] = None
    overlap: Optional[float] = None
    assigned_operator: Optional[str] = None
    assigned_uav: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class MissionOut(BaseModel):
    id: str
    name: str
    aircraft_id: str
    aircraft: Optional[AircraftOut] = None
    inspection_type: str
    altitude: Optional[float]
    overlap: Optional[float]
    assigned_operator: Optional[str]
    assigned_uav: Optional[str]
    status: str
    progress: int
    image_count: Optional[int]
    data_size: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    class Config:
        from_attributes = True


# ─── Defect ──────────────────────────────────────────────────────────────────
class DefectCreate(BaseModel):
    type: str
    severity: str
    location: str
    description: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    area: Optional[float] = None
    depth: Optional[float] = None
    confidence: Optional[float] = None
    notes: Optional[str] = None

class DefectUpdate(BaseModel):
    type: Optional[str] = None
    severity: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class DefectOut(BaseModel):
    id: str
    inspection_id: str
    type: str
    severity: str
    location: str
    description: Optional[str]
    x: Optional[float]
    y: Optional[float]
    width: Optional[float]
    height: Optional[float]
    area: Optional[float]
    depth: Optional[float]
    confidence: Optional[float]
    detected_at: datetime
    confirmed_by: Optional[str]
    notes: Optional[str]
    class Config:
        from_attributes = True


# ─── Inspection ───────────────────────────────────────────────────────────────
class InspectionOut(BaseModel):
    id: str
    mission_id: str
    aircraft_id: str
    aircraft: Optional[AircraftOut] = None
    total_defects: int
    critical_defects: int
    completed_at: datetime
    operator: Optional[str]
    status: str
    mesh_url: Optional[str]
    defects: List[DefectOut] = []
    class Config:
        from_attributes = True

class InspectionUpdate(BaseModel):
    status: Optional[str] = None
    operator: Optional[str] = None


# ─── Report ──────────────────────────────────────────────────────────────────
class ReportCreate(BaseModel):
    inspection_id: str
    generated_by: str
    summary: Optional[str] = None
    recommendations: Optional[List[str]] = []

class ReportOut(BaseModel):
    id: str
    inspection_id: str
    generated_at: datetime
    generated_by: str
    status: str
    summary: Optional[str]
    recommendations: Optional[List[str]]
    signed_by: Optional[str]
    signed_at: Optional[datetime]
    class Config:
        from_attributes = True


# ─── User ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    name: str
    email: str
    password: str
    role: str = "operator"
    organization: Optional[str] = None

class UserOut(BaseModel):
    id: str
    username: str
    name: str
    email: str
    role: str
    organization: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    password: str


# ─── Processing ──────────────────────────────────────────────────────────────
class ProcessingJobOut(BaseModel):
    id: str
    mission_id: str
    stage: str
    progress: int
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    class Config:
        from_attributes = True


# ─── Analytics ───────────────────────────────────────────────────────────────
class AnalyticsSummary(BaseModel):
    total_inspections: int
    active_missions: int
    total_defects: int
    total_aircraft: int
