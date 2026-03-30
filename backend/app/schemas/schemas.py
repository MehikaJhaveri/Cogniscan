"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# ─── Auth ──────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(patient|caregiver)$")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    baseline_completed: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


# ─── Patient Profile ──────────────────────────────────────────────────────────

class PatientProfileCreate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    interests: Optional[List[str]] = None


class PatientProfileOut(BaseModel):
    id: int
    user_id: int
    age: Optional[int]
    gender: Optional[str]
    medical_history: Optional[str]
    interests: Optional[List[str]]
    baseline_completed: bool
    link_code: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Assessments ───────────────────────────────────────────────────────────────

class CognitiveGameSubmit(BaseModel):
    game_type: str = Field(..., pattern="^(memory_recall|pattern_match|reaction_time)$")
    score: float = Field(..., ge=0, le=100)
    accuracy: Optional[float] = Field(None, ge=0, le=100)
    time_taken: Optional[float] = None


class AssessmentOut(BaseModel):
    id: int
    date: datetime
    assessment_type: str
    speech_score: Optional[float]
    facial_score: Optional[float]
    cognitive_score: Optional[float]
    risk_score: Optional[float]
    risk_level: Optional[str]

    class Config:
        from_attributes = True


class RiskScoreResponse(BaseModel):
    risk_score: float
    risk_level: str
    speech_score: float
    facial_score: float
    cognitive_score: float
    insights: List[str]
    recommendations: List[str]


class DashboardResponse(BaseModel):
    today: Optional[AssessmentOut]
    weekly: List[AssessmentOut]
    streak: int
    longest_streak: int
    risk_level: str
    risk_score: float


# ─── Caregiver ─────────────────────────────────────────────────────────────────

class LinkPatientRequest(BaseModel):
    link_code: str = Field(..., min_length=6, max_length=6)


class PatientSummary(BaseModel):
    patient_id: int
    full_name: str
    age: Optional[int]
    gender: Optional[str]
    latest_risk_score: Optional[float]
    latest_risk_level: Optional[str]
    link_code: str

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    patient_id: int
    alert_type: str
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InsightOut(BaseModel):
    category: str
    message: str
    trend: str  # "improving", "stable", "declining"


class RecommendationOut(BaseModel):
    category: str
    title: str
    description: str
    priority: str  # "low", "medium", "high"


# ─── Streak ────────────────────────────────────────────────────────────────────

class StreakOut(BaseModel):
    current_streak: int
    longest_streak: int
    last_completed: Optional[str]


# ─── Question ──────────────────────────────────────────────────────────────────

class DailyQuestionOut(BaseModel):
    question: str
    topic: str
