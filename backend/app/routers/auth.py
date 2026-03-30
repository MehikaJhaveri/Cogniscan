"""Auth router — signup & login for patients and caregivers."""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, PatientProfile
from app.models.assessment import DailyStreak
from app.auth.auth import hash_password, verify_password, create_access_token
from app.schemas.schemas import SignupRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    # check existing
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    baseline_completed = None

    # create patient profile + streak if patient
    if req.role == "patient":
        profile = PatientProfile(user_id=user.id)
        db.add(profile)
        streak = DailyStreak(patient_id=user.id)
        db.add(streak)
        db.commit()
        baseline_completed = False

    token = create_access_token({"user_id": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        baseline_completed=baseline_completed,
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    baseline_completed = None
    if user.role == "patient":
        profile = (
            db.query(PatientProfile)
            .filter(PatientProfile.user_id == user.id)
            .first()
        )
        baseline_completed = profile.baseline_completed if profile else False

    token = create_access_token({"user_id": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        baseline_completed=baseline_completed,
    )
