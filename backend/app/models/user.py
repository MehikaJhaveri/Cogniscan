"""User-related database models."""

import random
import string
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, Boolean
)
from sqlalchemy.orm import relationship

from app.database import Base


def _generate_link_code() -> str:
    return "".join(random.choices(string.digits, k=6))


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "patient" or "caregiver"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    patient_profile = relationship(
        "PatientProfile", back_populates="user", uselist=False
    )
    caregiver_links = relationship(
        "CaregiverLink",
        foreign_keys="CaregiverLink.caregiver_id",
        back_populates="caregiver",
    )


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    medical_history = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)  # JSON-encoded list
    baseline_completed = Column(Boolean, default=False)
    link_code = Column(String(6), unique=True, default=_generate_link_code)

    user = relationship("User", back_populates="patient_profile")


class CaregiverLink(Base):
    __tablename__ = "caregiver_links"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    linked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    caregiver = relationship(
        "User", foreign_keys=[caregiver_id], back_populates="caregiver_links"
    )
    patient = relationship("User", foreign_keys=[patient_id])
