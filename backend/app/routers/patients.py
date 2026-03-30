"""Patient router — profile, dashboard, recommendations, streak, daily question."""

import json
import random
from datetime import datetime, timedelta, timezone, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.auth.auth import require_role
from app.models.user import User, PatientProfile
from app.models.assessment import Assessment, DailyStreak
from app.schemas.schemas import (
    PatientProfileCreate,
    PatientProfileOut,
    DashboardResponse,
    AssessmentOut,
    StreakOut,
    DailyQuestionOut,
)

router = APIRouter(prefix="/api/patients", tags=["Patients"])

# ─── Question bank by topic ───────────────────────────────────────────────────

QUESTION_BANK = {
    "movies": [
        "Tell me about your all-time favorite movie scene and why it moved you.",
        "If you could live inside any movie world, which would you choose and why?",
        "Describe the last movie you watched that made you laugh out loud.",
        "Who is your favorite movie character of all time? What makes them special?",
        "If you were a movie director, what kind of film would you make?",
    ],
    "sports": [
        "Tell me about the most exciting sports moment you've ever witnessed.",
        "Which sport do you enjoy watching the most, and why?",
        "Describe a time when your favorite team had an unforgettable victory.",
        "If you could meet any athlete, who would it be and what would you ask?",
        "What's your favorite memory of playing a sport?",
    ],
    "travel": [
        "Describe your most memorable travel experience in detail.",
        "If you could visit any place in the world right now, where would you go?",
        "Tell me about a trip that completely changed your perspective on life.",
        "What's the most delicious meal you've had while traveling?",
        "Describe the most beautiful landscape you've ever seen.",
    ],
    "music": [
        "Tell me about a song that brings back special memories for you.",
        "If you could attend any concert in history, which would you choose?",
        "Describe how music makes you feel on a typical day.",
        "Who is your favorite musician, and what draws you to their work?",
        "What kind of music do you listen to when you need to relax?",
    ],
    "food": [
        "Tell me about your favorite home-cooked meal and who used to make it.",
        "Describe the most interesting dish you've ever tasted.",
        "If you could have dinner with anyone, who would it be and what would you eat?",
        "What's your go-to comfort food, and why does it make you feel good?",
        "Tell me about a cooking experience that didn't go as planned.",
    ],
    "nature": [
        "Describe your favorite outdoor place and what makes it special.",
        "Tell me about a time you felt truly connected to nature.",
        "What's your favorite season, and what do you love about it?",
        "If you could wake up anywhere in nature tomorrow, where would it be?",
        "Describe an animal encounter that left an impression on you.",
    ],
}

DEFAULT_TOPICS = ["movies", "travel", "music", "food", "nature", "sports"]


@router.post("/profile", response_model=PatientProfileOut)
def create_or_update_profile(
    data: PatientProfileCreate,
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.user_id == user.id)
        .first()
    )
    if not profile:
        profile = PatientProfile(user_id=user.id)
        db.add(profile)

    if data.age is not None:
        profile.age = data.age
    if data.gender is not None:
        profile.gender = data.gender
    if data.medical_history is not None:
        profile.medical_history = data.medical_history
    if data.interests is not None:
        profile.interests = json.dumps(data.interests)

    db.commit()
    db.refresh(profile)

    interests = json.loads(profile.interests) if profile.interests else []
    return PatientProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        age=profile.age,
        gender=profile.gender,
        medical_history=profile.medical_history,
        interests=interests,
        baseline_completed=profile.baseline_completed,
        link_code=profile.link_code,
        full_name=user.full_name,
    )


@router.get("/profile", response_model=PatientProfileOut)
def get_profile(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.user_id == user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    interests = json.loads(profile.interests) if profile.interests else []
    return PatientProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        age=profile.age,
        gender=profile.gender,
        medical_history=profile.medical_history,
        interests=interests,
        baseline_completed=profile.baseline_completed,
        link_code=profile.link_code,
        full_name=user.full_name,
    )


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    # today's assessment
    today_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == user.id,
            Assessment.date >= today_start,
        )
        .order_by(desc(Assessment.date))
        .first()
    )

    # weekly assessments
    weekly = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == user.id,
            Assessment.date >= week_start,
        )
        .order_by(Assessment.date)
        .all()
    )

    # streak
    streak_row = (
        db.query(DailyStreak)
        .filter(DailyStreak.patient_id == user.id)
        .first()
    )
    current_streak = streak_row.current_streak if streak_row else 0
    longest_streak = streak_row.longest_streak if streak_row else 0

    # latest risk
    latest = (
        db.query(Assessment)
        .filter(Assessment.patient_id == user.id, Assessment.risk_score.isnot(None))
        .order_by(desc(Assessment.date))
        .first()
    )
    risk_level = latest.risk_level if latest else "unknown"
    risk_score = latest.risk_score if latest else 0.0

    return DashboardResponse(
        today=today_assessment,
        weekly=weekly,
        streak=current_streak,
        longest_streak=longest_streak,
        risk_level=risk_level,
        risk_score=risk_score,
    )


@router.get("/streak", response_model=StreakOut)
def get_streak(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    streak = (
        db.query(DailyStreak)
        .filter(DailyStreak.patient_id == user.id)
        .first()
    )
    if not streak:
        return StreakOut(current_streak=0, longest_streak=0, last_completed=None)
    return StreakOut(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_completed=str(streak.last_completed) if streak.last_completed else None,
    )


@router.get("/daily-question", response_model=DailyQuestionOut)
def get_daily_question(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.user_id == user.id)
        .first()
    )
    interests = []
    if profile and profile.interests:
        interests = json.loads(profile.interests)

    # pick a topic the user is interested in (or random)
    valid_topics = [t.lower() for t in interests if t.lower() in QUESTION_BANK]
    if not valid_topics:
        valid_topics = DEFAULT_TOPICS

    topic = random.choice(valid_topics)
    question = random.choice(QUESTION_BANK[topic])

    return DailyQuestionOut(question=question, topic=topic)


@router.get("/recommendations")
def get_recommendations(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    latest = (
        db.query(Assessment)
        .filter(Assessment.patient_id == user.id, Assessment.risk_score.isnot(None))
        .order_by(desc(Assessment.date))
        .first()
    )

    risk_score = latest.risk_score if latest else 100.0
    risk_level = latest.risk_level if latest else "low"

    recommendations = []

    if risk_level == "low" or risk_score >= 70:
        recommendations = [
            {"category": "lifestyle", "title": "Keep Up the Great Work!", "description": "Your cognitive health looks excellent. Maintain your daily activities and social connections.", "priority": "low"},
            {"category": "exercise", "title": "Brain Exercise", "description": "Try learning a new skill or hobby to keep your mind sharp.", "priority": "low"},
            {"category": "social", "title": "Stay Social", "description": "Regular social interactions help maintain cognitive health. Call a friend today!", "priority": "low"},
        ]
    elif risk_level == "moderate" or risk_score >= 40:
        recommendations = [
            {"category": "exercise", "title": "Daily Brain Training", "description": "Complete all three cognitive games daily to strengthen mental agility.", "priority": "medium"},
            {"category": "lifestyle", "title": "Sleep & Nutrition", "description": "Ensure 7-8 hours of sleep and a balanced diet rich in omega-3 fatty acids.", "priority": "medium"},
            {"category": "monitoring", "title": "Track Your Progress", "description": "Pay attention to your weekly trends. Consistent practice leads to improvement.", "priority": "medium"},
            {"category": "social", "title": "Engage in Conversations", "description": "Have meaningful conversations daily to exercise language and memory skills.", "priority": "medium"},
        ]
    else:
        recommendations = [
            {"category": "medical", "title": "Consult a Healthcare Professional", "description": "Your scores suggest you should schedule a cognitive health check-up with your doctor.", "priority": "high"},
            {"category": "exercise", "title": "Structured Brain Training", "description": "Complete all daily assessments and games. Consistency is key to improvement.", "priority": "high"},
            {"category": "lifestyle", "title": "Lifestyle Adjustments", "description": "Focus on regular sleep schedules, physical exercise, and stress reduction.", "priority": "high"},
            {"category": "social", "title": "Caregiver Support", "description": "Share your link code with a trusted family member or caregiver for monitoring support.", "priority": "high"},
            {"category": "monitoring", "title": "Daily Monitoring", "description": "Complete assessments at the same time each day for the most accurate tracking.", "priority": "high"},
        ]

    return {"risk_level": risk_level, "risk_score": risk_score, "recommendations": recommendations}
