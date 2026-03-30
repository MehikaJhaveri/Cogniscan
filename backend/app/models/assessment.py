"""Assessment & streak database models."""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, Float, String, DateTime, ForeignKey, Text, Date
)
from sqlalchemy.orm import relationship

from app.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    assessment_type = Column(String(30), nullable=False)  # "baseline", "daily"

    speech_score = Column(Float, nullable=True)
    facial_score = Column(Float, nullable=True)
    cognitive_score = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)  # "low", "moderate", "high"

    # JSON blob with detailed breakdown
    details_json = Column(Text, nullable=True)

    patient = relationship("User")


class CognitiveGameResult(Base):
    __tablename__ = "cognitive_game_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    game_type = Column(String(30), nullable=False)  # memory_recall, pattern_match, reaction_time
    score = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    time_taken = Column(Float, nullable=True)  # seconds
    played_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DailyStreak(Base):
    __tablename__ = "daily_streaks"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_completed = Column(Date, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caregiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # risk_drop, missed_task, abnormal_change
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info")  # info, warning, critical
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("User", foreign_keys=[patient_id])
