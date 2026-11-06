import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Date,
    ForeignKey, Enum, JSON, Boolean
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

def new_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id           = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    username     = Column(String, unique=True, nullable=False)
    name         = Column(String, nullable=False)
    email        = Column(String, unique=True, nullable=False)
    password_hash= Column(String, nullable=False)
    role         = Column(Enum("admin", "operator", "viewer", name="user_role"), nullable=False, default="operator")
    organization = Column(String, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)


class Aircraft(Base):
    __tablename__ = "aircraft"

    id                   = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    registration         = Column(String, unique=True, nullable=False)
    model                = Column(String, nullable=False)
    manufacturer         = Column(String, nullable=False)
    year_of_manufacture  = Column(Integer, nullable=False)
    total_flight_hours   = Column(Integer, default=0)
    last_inspection_date = Column(Date, nullable=True)
    next_inspection_due  = Column(Date, nullable=True)
    status               = Column(Enum("active", "grounded", "maintenance", name="aircraft_status"), default="active")
    location             = Column(String, nullable=True)

    missions    = relationship("Mission", back_populates="aircraft")
    inspections = relationship("Inspection", back_populates="aircraft")


class Mission(Base):
    __tablename__ = "missions"

    id                = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name              = Column(String, nullable=False)
    aircraft_id       = Column(UUID(as_uuid=False), ForeignKey("aircraft.id"), nullable=False)
    inspection_type   = Column(Enum("full_body", "fuselage", "wings", "tail", "landing_gear", "engine_nacelles", name="inspection_type"), nullable=False)
    altitude          = Column(Float, nullable=True)
    overlap           = Column(Float, nullable=True)
    assigned_operator = Column(String, nullable=True)
    assigned_uav      = Column(String, nullable=True)
    status            = Column(Enum("draft", "preflight", "flying", "uploading", "processing", "completed", "failed", name="mission_status"), default="draft")
    progress          = Column(Integer, default=0)
    image_count       = Column(Integer, nullable=True)
    data_size         = Column(String, nullable=True)
    created_at        = Column(DateTime, default=datetime.utcnow)
    started_at        = Column(DateTime, nullable=True)
    completed_at      = Column(DateTime, nullable=True)

    aircraft        = relationship("Aircraft", back_populates="missions")
    inspections     = relationship("Inspection", back_populates="mission")
    processing_jobs = relationship("ProcessingJob", back_populates="mission")


class Inspection(Base):
    __tablename__ = "inspections"

    id               = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    mission_id       = Column(UUID(as_uuid=False), ForeignKey("missions.id"), nullable=False)
    aircraft_id      = Column(UUID(as_uuid=False), ForeignKey("aircraft.id"), nullable=False)
    total_defects    = Column(Integer, default=0)
    critical_defects = Column(Integer, default=0)
    completed_at     = Column(DateTime, default=datetime.utcnow)
    operator         = Column(String, nullable=True)
    status           = Column(Enum("pending_review", "in_review", "approved", "action_required", name="inspection_status"), default="pending_review")
    mesh_url         = Column(String, nullable=True)

    mission  = relationship("Mission", back_populates="inspections")
    aircraft = relationship("Aircraft", back_populates="inspections")
    defects  = relationship("Defect", back_populates="inspection")
    reports  = relationship("Report", back_populates="inspection")


class Defect(Base):
    __tablename__ = "defects"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    inspection_id = Column(UUID(as_uuid=False), ForeignKey("inspections.id"), nullable=False)
    type          = Column(Enum("dent", "corrosion", "crack", "delamination", "scratch", "paint_loss", "impact_damage", name="defect_type"), nullable=False)
    severity      = Column(Enum("low", "medium", "high", "critical", name="defect_severity"), nullable=False)
    location      = Column(String, nullable=False)
    description   = Column(Text, nullable=True)
    x             = Column(Float, nullable=True)
    y             = Column(Float, nullable=True)
    width         = Column(Float, nullable=True)
    height        = Column(Float, nullable=True)
    area          = Column(Float, nullable=True)
    depth         = Column(Float, nullable=True)
    confidence    = Column(Float, nullable=True)
    detected_at   = Column(DateTime, default=datetime.utcnow)
    confirmed_by  = Column(String, nullable=True)
    notes         = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="defects")


class Report(Base):
    __tablename__ = "reports"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    inspection_id   = Column(UUID(as_uuid=False), ForeignKey("inspections.id"), nullable=False)
    generated_at    = Column(DateTime, default=datetime.utcnow)
    generated_by    = Column(String, nullable=False)
    status          = Column(Enum("draft", "finalized", "shared", name="report_status"), default="draft")
    summary         = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list)
    signed_by       = Column(String, nullable=True)
    signed_at       = Column(DateTime, nullable=True)

    inspection = relationship("Inspection", back_populates="reports")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    mission_id    = Column(UUID(as_uuid=False), ForeignKey("missions.id"), nullable=False)
    stage         = Column(Enum("queued", "uploading", "reconstructing", "mesh_generation", "texture_mapping", "defect_detection", "report_generation", "completed", name="processing_stage"), default="queued")
    progress      = Column(Integer, default=0)
    started_at    = Column(DateTime, default=datetime.utcnow)
    completed_at  = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    mission = relationship("Mission", back_populates="processing_jobs")
