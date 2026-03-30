"""Caregiver router — link patients, view dashboards, alerts, insights, recommendations."""

import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.auth.auth import require_role
from app.models.user import User, PatientProfile, CaregiverLink
from app.models.assessment import Assessment, DailyStreak, Alert, CognitiveGameResult
from app.schemas.schemas import (
    LinkPatientRequest,
    PatientSummary,
    AlertOut,
    AssessmentOut,
)

router = APIRouter(prefix="/api/caregivers", tags=["Caregivers"])


@router.post("/link-patient")
def link_patient(
    req: LinkPatientRequest,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Link a patient to this caregiver using a 6-digit code."""
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.link_code == req.link_code)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Invalid link code")

    # check if already linked
    existing = (
        db.query(CaregiverLink)
        .filter(
            CaregiverLink.caregiver_id == user.id,
            CaregiverLink.patient_id == profile.user_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Patient already linked")

    link = CaregiverLink(caregiver_id=user.id, patient_id=profile.user_id)
    db.add(link)
    db.commit()

    patient_user = db.query(User).filter(User.id == profile.user_id).first()
    return {
        "message": "Patient linked successfully",
        "patient_name": patient_user.full_name,
        "patient_id": profile.user_id,
    }


@router.get("/patients", response_model=list[PatientSummary])
def get_linked_patients(
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Get all patients linked to this caregiver."""
    links = (
        db.query(CaregiverLink)
        .filter(CaregiverLink.caregiver_id == user.id)
        .all()
    )

    patients = []
    for link in links:
        patient = db.query(User).filter(User.id == link.patient_id).first()
        profile = (
            db.query(PatientProfile)
            .filter(PatientProfile.user_id == link.patient_id)
            .first()
        )
        latest = (
            db.query(Assessment)
            .filter(
                Assessment.patient_id == link.patient_id,
                Assessment.risk_score.isnot(None),
            )
            .order_by(desc(Assessment.date))
            .first()
        )
        patients.append(
            PatientSummary(
                patient_id=link.patient_id,
                full_name=patient.full_name if patient else "Unknown",
                age=profile.age if profile else None,
                gender=profile.gender if profile else None,
                latest_risk_score=latest.risk_score if latest else None,
                latest_risk_level=latest.risk_level if latest else None,
                link_code=profile.link_code if profile else "",
            )
        )
    return patients


@router.get("/patients/{patient_id}/dashboard")
def get_patient_dashboard(
    patient_id: int,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """View a linked patient's trend dashboard."""
    # verify link
    link = (
        db.query(CaregiverLink)
        .filter(
            CaregiverLink.caregiver_id == user.id,
            CaregiverLink.patient_id == patient_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=403, detail="Patient not linked to you")

    now = datetime.now(timezone.utc)
    month_start = now - timedelta(days=30)

    # patient info
    patient = db.query(User).filter(User.id == patient_id).first()
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()

    # assessments over last 30 days
    assessments = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == patient_id,
            Assessment.date >= month_start,
        )
        .order_by(Assessment.date)
        .all()
    )

    # streak
    streak = db.query(DailyStreak).filter(DailyStreak.patient_id == patient_id).first()

    # daily performance summary
    daily_scores = []
    for a in assessments:
        daily_scores.append({
            "date": a.date.isoformat(),
            "speech_score": a.speech_score,
            "facial_score": a.facial_score,
            "cognitive_score": a.cognitive_score,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
        })

    return {
        "patient": {
            "id": patient_id,
            "full_name": patient.full_name if patient else "Unknown",
            "age": profile.age if profile else None,
            "gender": profile.gender if profile else None,
            "medical_history": profile.medical_history if profile else None,
            "interests": json.loads(profile.interests) if profile and profile.interests else [],
        },
        "streak": {
            "current": streak.current_streak if streak else 0,
            "longest": streak.longest_streak if streak else 0,
            "last_completed": str(streak.last_completed) if streak and streak.last_completed else None,
        },
        "daily_scores": daily_scores,
        "total_assessments": len(assessments),
    }


@router.get("/patients/{patient_id}/alerts", response_model=list[AlertOut])
def get_patient_alerts(
    patient_id: int,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Get alerts for a linked patient."""
    link = (
        db.query(CaregiverLink)
        .filter(
            CaregiverLink.caregiver_id == user.id,
            CaregiverLink.patient_id == patient_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=403, detail="Patient not linked to you")

    alerts = (
        db.query(Alert)
        .filter(Alert.patient_id == patient_id)
        .order_by(desc(Alert.created_at))
        .limit(50)
        .all()
    )
    return alerts


@router.get("/alerts", response_model=list[AlertOut])
def get_all_alerts(
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Get all alerts across all linked patients."""
    links = db.query(CaregiverLink).filter(CaregiverLink.caregiver_id == user.id).all()
    patient_ids = [l.patient_id for l in links]

    if not patient_ids:
        return []

    alerts = (
        db.query(Alert)
        .filter(Alert.patient_id.in_(patient_ids))
        .order_by(desc(Alert.created_at))
        .limit(100)
        .all()
    )
    return alerts


@router.put("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = 1
    db.commit()
    return {"message": "Alert marked as read"}


@router.get("/patients/{patient_id}/insights")
def get_patient_insights(
    patient_id: int,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Get risk insights for a linked patient."""
    link = (
        db.query(CaregiverLink)
        .filter(
            CaregiverLink.caregiver_id == user.id,
            CaregiverLink.patient_id == patient_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=403, detail="Patient not linked to you")

    # get last 7 assessments
    assessments = (
        db.query(Assessment)
        .filter(
            Assessment.patient_id == patient_id,
            Assessment.risk_score.isnot(None),
        )
        .order_by(desc(Assessment.date))
        .limit(7)
        .all()
    )

    if not assessments:
        return {"insights": [{"category": "general", "message": "No assessments available yet.", "trend": "stable"}]}

    insights = []

    # speech trend
    speech_scores = [a.speech_score for a in assessments if a.speech_score is not None]
    if len(speech_scores) >= 2:
        avg_recent = sum(speech_scores[:3]) / min(3, len(speech_scores[:3]))
        avg_older = sum(speech_scores[3:]) / max(1, len(speech_scores[3:]))
        diff = avg_recent - avg_older
        if diff < -10:
            insights.append({"category": "speech", "message": f"Speech quality declined by {abs(diff):.0f}% recently. Speech pauses may have increased.", "trend": "declining"})
        elif diff > 10:
            insights.append({"category": "speech", "message": f"Speech quality improved by {diff:.0f}% — great progress!", "trend": "improving"})
        else:
            insights.append({"category": "speech", "message": "Speech patterns remain stable.", "trend": "stable"})

    # facial trend
    facial_scores = [a.facial_score for a in assessments if a.facial_score is not None]
    if len(facial_scores) >= 2:
        avg_recent = sum(facial_scores[:3]) / min(3, len(facial_scores[:3]))
        avg_older = sum(facial_scores[3:]) / max(1, len(facial_scores[3:]))
        diff = avg_recent - avg_older
        if diff < -10:
            insights.append({"category": "facial", "message": f"Facial engagement dropped by {abs(diff):.0f}%. Expression variation may have decreased.", "trend": "declining"})
        elif diff > 10:
            insights.append({"category": "facial", "message": f"Facial engagement improved by {diff:.0f}%.", "trend": "improving"})
        else:
            insights.append({"category": "facial", "message": "Facial engagement is consistent.", "trend": "stable"})

    # cognitive trend
    cog_scores = [a.cognitive_score for a in assessments if a.cognitive_score is not None]
    if len(cog_scores) >= 2:
        avg_recent = sum(cog_scores[:3]) / min(3, len(cog_scores[:3]))
        avg_older = sum(cog_scores[3:]) / max(1, len(cog_scores[3:]))
        diff = avg_recent - avg_older
        if diff < -10:
            insights.append({"category": "cognitive", "message": f"Memory and cognitive scores declined by {abs(diff):.0f}%. Consider more frequent brain exercises.", "trend": "declining"})
        elif diff > 10:
            insights.append({"category": "cognitive", "message": f"Cognitive performance improved by {diff:.0f}%.", "trend": "improving"})
        else:
            insights.append({"category": "cognitive", "message": "Cognitive performance is stable.", "trend": "stable"})

    # overall risk
    risk_scores = [a.risk_score for a in assessments if a.risk_score is not None]
    if risk_scores:
        latest_risk = risk_scores[0]
        if latest_risk < 40:
            insights.append({"category": "overall", "message": "Overall risk level is HIGH. Medical consultation is recommended.", "trend": "declining"})
        elif latest_risk < 70:
            insights.append({"category": "overall", "message": "Overall risk is MODERATE. Increased monitoring is advised.", "trend": "stable"})
        else:
            insights.append({"category": "overall", "message": "Overall cognitive health looks good.", "trend": "improving"})

    return {"insights": insights}


@router.get("/patients/{patient_id}/recommendations")
def get_caregiver_recommendations(
    patient_id: int,
    user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    """Get caregiver-specific recommendations for a patient."""
    link = (
        db.query(CaregiverLink)
        .filter(
            CaregiverLink.caregiver_id == user.id,
            CaregiverLink.patient_id == patient_id,
        )
        .first()
    )
    if not link:
        raise HTTPException(status_code=403, detail="Patient not linked to you")

    latest = (
        db.query(Assessment)
        .filter(Assessment.patient_id == patient_id, Assessment.risk_score.isnot(None))
        .order_by(desc(Assessment.date))
        .first()
    )

    risk_level = latest.risk_level if latest else "unknown"
    risk_score = latest.risk_score if latest else None

    recommendations = []

    if risk_level == "high" or (risk_score and risk_score < 40):
        recommendations = [
            {"category": "medical", "title": "Seek Medical Evaluation", "description": "Schedule a comprehensive cognitive assessment with a neurologist or geriatric specialist.", "priority": "high"},
            {"category": "monitoring", "title": "Increase Monitoring Frequency", "description": "Ensure the patient completes all daily assessments. Consider accompanying them during tasks.", "priority": "high"},
            {"category": "intervention", "title": "Structured Activities", "description": "Introduce structured daily routines with memory exercises, puzzles, and social interaction.", "priority": "high"},
            {"category": "safety", "title": "Safety Check", "description": "Review the patient's living environment for safety. Ensure medication adherence.", "priority": "high"},
        ]
    elif risk_level == "moderate" or (risk_score and risk_score < 70):
        recommendations = [
            {"category": "monitoring", "title": "Regular Check-ins", "description": "Have daily conversations and observe any changes in speech or behavior patterns.", "priority": "medium"},
            {"category": "activity", "title": "Encourage Brain Games", "description": "Motivate the patient to play all three cognitive games daily.", "priority": "medium"},
            {"category": "lifestyle", "title": "Promote Healthy Habits", "description": "Encourage regular exercise, balanced nutrition, and consistent sleep schedules.", "priority": "medium"},
            {"category": "social", "title": "Social Engagement", "description": "Arrange social activities to keep the patient mentally stimulated.", "priority": "medium"},
        ]
    else:
        recommendations = [
            {"category": "preventive", "title": "Maintain Current Routine", "description": "The patient is doing well. Continue with the current assessment routine.", "priority": "low"},
            {"category": "activity", "title": "Challenge with New Activities", "description": "Introduce new hobbies or learning tasks to further stimulate cognitive function.", "priority": "low"},
            {"category": "monitoring", "title": "Weekly Review", "description": "Review weekly trends to catch any early signs of change.", "priority": "low"},
        ]

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendations": recommendations,
    }
