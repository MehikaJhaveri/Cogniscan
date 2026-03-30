"""Facial analysis service — uses OpenCV + MediaPipe Face Mesh.

Extracts:
  - Face presence percentage
  - Emotion variation (landmark-based approximation)
  - Attention tracking (face direction)
  - Overall Facial Engagement Score (0–100)
"""

import os
import math

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False


def _calculate_mouth_aspect_ratio(landmarks, h, w):
    """Approximate mouth openness from face landmarks."""
    # upper lip: 13, lower lip: 14
    upper = landmarks[13]
    lower = landmarks[14]
    mouth_height = abs(upper.y - lower.y) * h

    # mouth corners: 61, 291
    left = landmarks[61]
    right = landmarks[291]
    mouth_width = abs(right.x - left.x) * w

    if mouth_width == 0:
        return 0
    return mouth_height / mouth_width


def _calculate_eye_aspect_ratio(landmarks, h, w):
    """Approximate eye openness for attention detection."""
    # right eye: 159 (top), 145 (bottom), 33 (left), 133 (right)
    top = landmarks[159]
    bottom = landmarks[145]
    left = landmarks[33]
    right = landmarks[133]

    eye_height = abs(top.y - bottom.y) * h
    eye_width = abs(right.x - left.x) * w

    if eye_width == 0:
        return 0
    return eye_height / eye_width


def _estimate_face_direction(landmarks, h, w):
    """Estimate if face is roughly facing the camera (attention)."""
    # nose tip: 1, left cheek: 234, right cheek: 454
    nose = landmarks[1]
    left_cheek = landmarks[234]
    right_cheek = landmarks[454]

    left_dist = abs(nose.x - left_cheek.x) * w
    right_dist = abs(nose.x - right_cheek.x) * w

    if left_dist + right_dist == 0:
        return 1.0
    symmetry = min(left_dist, right_dist) / max(left_dist, right_dist)
    return symmetry  # 1.0 = perfectly centered


def analyze_facial(video_path: str) -> dict:
    """
    Analyze facial engagement from a video file.

    Returns dict with:
        - score (0–100)
        - face_presence_pct
        - emotion_variation
        - attention_score
        - frames_analyzed
    """
    result = {
        "score": 50.0,
        "face_presence_pct": 0.0,
        "emotion_variation": 0.0,
        "attention_score": 0.0,
        "frames_analyzed": 0,
    }

    if not CV2_AVAILABLE or not MP_AVAILABLE:
        result["score"] = 50.0
        result["error"] = "OpenCV or MediaPipe not available"
        return result

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        result["error"] = "Could not open video file"
        return result

    total_frames = 0
    face_detected_frames = 0
    mouth_ratios = []
    eye_ratios = []
    attention_scores = []

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_skip = max(1, int(fps / 5))  # analyze ~5 frames per second for efficiency

    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        if frame_idx % frame_skip != 0:
            continue

        total_frames += 1
        h, w = frame.shape[:2]

        # convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            face_detected_frames += 1
            landmarks = results.multi_face_landmarks[0].landmark

            # mouth aspect ratio (emotion proxy)
            mar = _calculate_mouth_aspect_ratio(landmarks, h, w)
            mouth_ratios.append(mar)

            # eye aspect ratio (attention proxy)
            ear = _calculate_eye_aspect_ratio(landmarks, h, w)
            eye_ratios.append(ear)

            # face direction (attention)
            direction = _estimate_face_direction(landmarks, h, w)
            attention_scores.append(direction)

    cap.release()
    face_mesh.close()

    if total_frames == 0:
        result["error"] = "No frames could be read"
        return result

    result["frames_analyzed"] = total_frames

    # ─── Metrics ────────────────────────────────────────────────────────

    # Face presence
    face_presence = (face_detected_frames / total_frames) * 100
    result["face_presence_pct"] = round(face_presence, 1)

    # Emotion variation (standard deviation of mouth ratios)
    if mouth_ratios:
        import numpy as np
        emotion_var = float(np.std(mouth_ratios)) * 100
        result["emotion_variation"] = round(min(emotion_var, 100), 1)

    # Attention score (average face-direction symmetry)
    if attention_scores:
        avg_attention = sum(attention_scores) / len(attention_scores) * 100
        result["attention_score"] = round(min(avg_attention, 100), 1)

    # ─── Compute Score ──────────────────────────────────────────────────

    score = 0.0

    # Face presence (40% weight)
    score += (face_presence / 100) * 40

    # Emotion variation (30% weight) — some variation is good
    if mouth_ratios:
        import numpy as np
        variation = float(np.std(mouth_ratios))
        # normalize: 0.01-0.1 is good range
        variation_score = min(variation / 0.05, 1.0) * 100
        score += (variation_score / 100) * 30
    else:
        score += 15  # neutral if no data

    # Attention (30% weight)
    if attention_scores:
        avg_attn = sum(attention_scores) / len(attention_scores)
        score += avg_attn * 30
    else:
        score += 15  # neutral if no data

    result["score"] = round(max(0, min(100, score)), 1)

    # cleanup
    try:
        os.remove(video_path)
    except OSError:
        pass

    return result
