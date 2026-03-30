"""Assessment router — upload audio/video, submit game results, compute risk."""

import json
import os
import shutil
import uuid
from datetime import datetime, date, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.auth.auth import require_role
from app.models.user import User, PatientProfile
from app.models.assessment import Assessment, CognitiveGameResult, DailyStreak, Alert
from app.schemas.schemas import (
    CognitiveGameSubmit,
    AssessmentOut,
    RiskScoreResponse,
)
from app.services.speech_analysis import analyze_speech
from app.services.facial_analysis import analyze_facial
from app.services.risk_scoring import compute_risk_score, generate_insights, generate_recommendations

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _update_streak(db: Session, patient_id: int):
    """Update daily streak for a patient."""
    today = date.today()
    streak = db.query(DailyStreak).filter(DailyStreak.patient_id == patient_id).first()
    if not streak:
        streak = DailyStreak(patient_id=patient_id, current_streak=1, longest_streak=1, last_completed=today)
        db.add(streak)
    else:
        if streak.last_completed == today:
            return  # already counted today
        elif streak.last_completed == today - __import__('datetime').timedelta(days=1):
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_completed = today
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    db.commit()


def _check_and_create_alerts(db: Session, patient_id: int, assessment: Assessment):
    """Check for significant score drops and create alerts for linked caregivers."""
    from app.models.user import CaregiverLink

    # get previous assessment
    prev = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == patient_id,
            Assessment.id != assessment.id,
            Assessment.risk_score.isnot(None),
        )
        .order_by(desc(Assessment.date))
        .first()
    )

    if not prev or not assessment.risk_score:
        return

    drop = prev.risk_score - assessment.risk_score
    if drop >= 15:
        # significant drop — create alert for all linked caregivers
        links = db.query(CaregiverLink).filter(CaregiverLink.patient_id == patient_id).all()
        for link in links:
            alert = Alert(
                patient_id=patient_id,
                caregiver_id=link.caregiver_id,
                alert_type="risk_drop",
                title="Significant Risk Score Drop",
                message=f"Risk score dropped by {drop:.0f} points (from {prev.risk_score:.0f} to {assessment.risk_score:.0f}). Immediate attention may be needed.",
                severity="critical" if drop >= 25 else "warning",
            )
            db.add(alert)
        db.commit()


@router.post("/upload")
async def upload_assessment(
    audio: UploadFile = File(None),
    video: UploadFile = File(None),
    assessment_type: str = Form("daily"),
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    """Upload audio and/or video for speech + facial analysis."""

    speech_score = None
    facial_score = None
    details = {}

    # save and process audio
    if audio:
        audio_filename = f"{uuid.uuid4()}_{audio.filename}"
        audio_path = os.path.join(UPLOAD_DIR, audio_filename)
        with open(audio_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)
        try:
            speech_result = analyze_speech(audio_path)
            speech_score = speech_result["score"]
            details["speech"] = speech_result
        except Exception as e:
            details["speech_error"] = str(e)
            speech_score = 50.0  # fallback

    # save and process video
    if video:
        video_filename = f"{uuid.uuid4()}_{video.filename}"
        video_path = os.path.join(UPLOAD_DIR, video_filename)
        with open(video_path, "wb") as f:
            shutil.copyfileobj(video.file, f)
        try:
            facial_result = analyze_facial(video_path)
            facial_score = facial_result["score"]
            details["facial"] = facial_result
        except Exception as e:
            details["facial_error"] = str(e)
            facial_score = 50.0  # fallback

    # create assessment record
    assessment = Assessment(
        patient_id=user.id,
        assessment_type=assessment_type,
        speech_score=speech_score,
        facial_score=facial_score,
        details_json=json.dumps(details),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "assessment_id": assessment.id,
        "speech_score": speech_score,
        "facial_score": facial_score,
        "details": details,
    }


@router.post("/cognitive")
def submit_cognitive_results(
    results: list[CognitiveGameSubmit],
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    """Submit cognitive game results (batch — all 3 games at once or individually)."""

    saved = []
    for r in results:
        game = CognitiveGameResult(
            patient_id=user.id,
            game_type=r.game_type,
            score=r.score,
            accuracy=r.accuracy,
            time_taken=r.time_taken,
        )
        db.add(game)
        saved.append({"game_type": r.game_type, "score": r.score})

    db.commit()

    # compute average cognitive score
    total = sum(r.score for r in results)
    cognitive_score = total / len(results) if results else 0

    return {
        "cognitive_score": cognitive_score,
        "games": saved,
    }


@router.post("/compute-risk", response_model=RiskScoreResponse)
def compute_risk(
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    """Compute multimodal risk score from latest speech, facial, and cognitive scores."""

    # latest assessment with speech/facial
    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.patient_id == user.id)
        .order_by(desc(Assessment.date))
        .first()
    )

    speech_score = latest_assessment.speech_score if latest_assessment and latest_assessment.speech_score else 50.0
    facial_score = latest_assessment.facial_score if latest_assessment and latest_assessment.facial_score else 50.0

    # latest cognitive games (today's)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_games = (
        db.query(CognitiveGameResult)
        .filter(
            CognitiveGameResult.patient_id == user.id,
            CognitiveGameResult.played_at >= today_start,
        )
        .all()
    )

    if today_games:
        cognitive_score = sum(g.score for g in today_games) / len(today_games)
    else:
        # fallback to latest games
        latest_games = (
            db.query(CognitiveGameResult)
            .filter(CognitiveGameResult.patient_id == user.id)
            .order_by(desc(CognitiveGameResult.played_at))
            .limit(3)
            .all()
        )
        cognitive_score = sum(g.score for g in latest_games) / len(latest_games) if latest_games else 50.0

    # compute risk
    risk_result = compute_risk_score(speech_score, facial_score, cognitive_score)

    # get baseline for comparison
    baseline = (
        db.query(Assessment)
        .filter(Assessment.patient_id == user.id, Assessment.assessment_type == "baseline")
        .first()
    )

    insights = generate_insights(
        speech_score, facial_score, cognitive_score,
        baseline_speech=baseline.speech_score if baseline else None,
        baseline_facial=baseline.facial_score if baseline else None,
        baseline_cognitive=baseline.cognitive_score if baseline else None,
    )

    recommendations = generate_recommendations(risk_result["risk_level"])

    # update the assessment record
    if latest_assessment:
        latest_assessment.cognitive_score = cognitive_score
        latest_assessment.risk_score = risk_result["risk_score"]
        latest_assessment.risk_level = risk_result["risk_level"]

    # mark baseline complete if this is first assessment
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    if profile and not profile.baseline_completed:
        profile.baseline_completed = True
        if latest_assessment:
            latest_assessment.assessment_type = "baseline"

    db.commit()

    # update streak
    _update_streak(db, user.id)

    # check for alerts
    if latest_assessment:
        _check_and_create_alerts(db, user.id, latest_assessment)

    return RiskScoreResponse(
        risk_score=risk_result["risk_score"],
        risk_level=risk_result["risk_level"],
        speech_score=speech_score,
        facial_score=facial_score,
        cognitive_score=cognitive_score,
        insights=insights,
        recommendations=recommendations,
    )


@router.get("/history", response_model=list[AssessmentOut])
def get_history(
    limit: int = 30,
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    assessments = (
        db.query(Assessment)
        .filter(Assessment.patient_id == user.id)
        .order_by(desc(Assessment.date))
        .limit(limit)
        .all()
    )
    return assessments
