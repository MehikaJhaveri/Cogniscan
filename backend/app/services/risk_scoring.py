"""Risk scoring service — multimodal weighted scoring + insight generation."""

from typing import Optional, List


def compute_risk_score(
    speech_score: float,
    facial_score: float,
    cognitive_score: float,
) -> dict:
    """
    Compute overall risk score using weighted formula.

    Weights:
        Speech: 35%
        Facial: 25%
        Cognitive: 40%

    Risk Levels:
        70–100: Low
        40–69: Moderate
        0–39: High
    """
    risk_score = (
        0.35 * speech_score
        + 0.25 * facial_score
        + 0.40 * cognitive_score
    )

    risk_score = round(max(0, min(100, risk_score)), 1)

    if risk_score >= 70:
        risk_level = "low"
    elif risk_score >= 40:
        risk_level = "moderate"
    else:
        risk_level = "high"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "breakdown": {
            "speech_contribution": round(0.35 * speech_score, 1),
            "facial_contribution": round(0.25 * facial_score, 1),
            "cognitive_contribution": round(0.40 * cognitive_score, 1),
        },
    }


def generate_insights(
    speech_score: float,
    facial_score: float,
    cognitive_score: float,
    baseline_speech: Optional[float] = None,
    baseline_facial: Optional[float] = None,
    baseline_cognitive: Optional[float] = None,
) -> List[str]:
    """Generate human-readable insights by comparing current scores with baseline."""
    insights = []

    # Speech insights
    if baseline_speech is not None:
        diff = speech_score - baseline_speech
        if diff < -15:
            insights.append(f"Speech quality decreased significantly ({abs(diff):.0f}% below baseline). Increased pauses or reduced vocabulary detected.")
        elif diff < -5:
            insights.append(f"Speech quality slightly below baseline ({abs(diff):.0f}% decrease).")
        elif diff > 5:
            insights.append(f"Speech quality improved by {diff:.0f}% compared to baseline.")
        else:
            insights.append("Speech patterns are consistent with your baseline.")
    else:
        if speech_score < 40:
            insights.append("Speech analysis shows potential concerns — reduced speech rate or increased pauses detected.")
        elif speech_score < 70:
            insights.append("Speech patterns are within moderate range.")
        else:
            insights.append("Speech quality is good with healthy vocabulary and fluency.")

    # Facial insights
    if baseline_facial is not None:
        diff = facial_score - baseline_facial
        if diff < -15:
            insights.append(f"Facial engagement dropped significantly ({abs(diff):.0f}% below baseline). Reduced expression variation observed.")
        elif diff < -5:
            insights.append(f"Facial engagement slightly below baseline ({abs(diff):.0f}% decrease).")
        elif diff > 5:
            insights.append(f"Facial engagement improved by {diff:.0f}% compared to baseline.")
        else:
            insights.append("Facial engagement is consistent with your baseline.")
    else:
        if facial_score < 40:
            insights.append("Facial engagement appears reduced — less expression variation or attention detected.")
        elif facial_score < 70:
            insights.append("Facial engagement is within moderate range.")
        else:
            insights.append("Good facial engagement with healthy expression variation.")

    # Cognitive insights
    if baseline_cognitive is not None:
        diff = cognitive_score - baseline_cognitive
        if diff < -15:
            insights.append(f"Cognitive performance declined significantly ({abs(diff):.0f}% below baseline). Memory and reaction scores affected.")
        elif diff < -5:
            insights.append(f"Cognitive performance slightly below baseline ({abs(diff):.0f}% decrease).")
        elif diff > 5:
            insights.append(f"Cognitive performance improved by {diff:.0f}% — excellent progress!")
        else:
            insights.append("Cognitive performance is consistent with your baseline.")
    else:
        if cognitive_score < 40:
            insights.append("Cognitive game scores suggest potential concerns — accuracy or reaction time may need attention.")
        elif cognitive_score < 70:
            insights.append("Cognitive performance is within moderate range.")
        else:
            insights.append("Cognitive performance is strong across all game types.")

    return insights


def generate_recommendations(risk_level: str) -> List[str]:
    """Generate recommendations based on risk level."""
    if risk_level == "low":
        return [
            "Continue your daily assessment routine to maintain cognitive health.",
            "Try challenging yourself with harder difficulty levels in the games.",
            "Stay physically active — exercise benefits brain health.",
        ]
    elif risk_level == "moderate":
        return [
            "Complete all three cognitive games daily for best tracking.",
            "Focus on sleep quality — aim for 7-8 hours per night.",
            "Practice mindfulness or meditation to reduce stress.",
            "Consider discussing your trends with a healthcare provider.",
        ]
    else:
        return [
            "Please schedule an appointment with your healthcare provider.",
            "Share your assessment data with your caregiver or family member.",
            "Continue daily assessments for consistent tracking.",
            "Focus on structured routines and familiar activities.",
            "Ensure you have adequate social support.",
        ]
