"""Speech analysis service — uses librosa + faster-whisper (tiny model).

Extracts:
  - Speech rate (words/sec)
  - Pause frequency
  - Vocabulary diversity (unique words / total words)
  - Overall Speech Score (0–100)
"""

import os
import re
import numpy as np

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
    # Load the tiny model once at module level (CPU, int8 for speed)
    _whisper_model = None
except ImportError:
    WHISPER_AVAILABLE = False
    _whisper_model = None


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None and WHISPER_AVAILABLE:
        _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _whisper_model


def _transcribe(audio_path: str) -> dict:
    """Transcribe audio and extract word-level timing."""
    model = _get_whisper_model()
    if model is None:
        return {"text": "", "words": [], "duration": 0}

    segments, info = model.transcribe(audio_path, word_timestamps=True)

    full_text = ""
    words = []
    for segment in segments:
        full_text += segment.text + " "
        if segment.words:
            for w in segment.words:
                words.append({
                    "word": w.word.strip(),
                    "start": w.start,
                    "end": w.end,
                })

    return {
        "text": full_text.strip(),
        "words": words,
        "duration": info.duration if hasattr(info, 'duration') else 0,
    }


def _detect_pauses(words: list, threshold: float = 1.0) -> list:
    """Detect pauses (gaps > threshold seconds between words)."""
    pauses = []
    for i in range(1, len(words)):
        gap = words[i]["start"] - words[i - 1]["end"]
        if gap > threshold:
            pauses.append({"duration": gap, "after_word": words[i - 1]["word"]})
    return pauses


def analyze_speech(audio_path: str) -> dict:
    """
    Analyze speech from an audio file.

    Returns dict with:
        - score (0–100)
        - speech_rate (words/sec)
        - pause_count
        - vocabulary_diversity
        - word_count
        - transcript
    """
    result = {
        "score": 50.0,
        "speech_rate": 0.0,
        "pause_count": 0,
        "pause_frequency": 0.0,
        "vocabulary_diversity": 0.0,
        "word_count": 0,
        "transcript": "",
    }

    # Get audio duration via librosa (even if whisper unavailable)
    duration = 0
    if LIBROSA_AVAILABLE:
        try:
            y, sr = librosa.load(audio_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
        except Exception:
            duration = 30.0  # default assumption
    else:
        duration = 30.0

    # Transcribe
    if WHISPER_AVAILABLE:
        transcription = _transcribe(audio_path)
        result["transcript"] = transcription["text"]
        if transcription["duration"] > 0:
            duration = transcription["duration"]
    else:
        # fallback: simulate with librosa features
        result["transcript"] = "[whisper not available — using acoustic features only]"

    # Compute metrics from transcript
    text = result["transcript"]
    all_words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    word_count = len(all_words)
    result["word_count"] = word_count

    # Speech rate
    if duration > 0:
        speech_rate = word_count / duration
    else:
        speech_rate = 0
    result["speech_rate"] = round(speech_rate, 2)

    # Vocabulary diversity
    if word_count > 0:
        unique_words = len(set(all_words))
        vocab_diversity = unique_words / word_count
    else:
        vocab_diversity = 0
    result["vocabulary_diversity"] = round(vocab_diversity, 3)

    # Pause detection
    if WHISPER_AVAILABLE and "words" in transcription and transcription["words"]:
        pauses = _detect_pauses(transcription["words"], threshold=0.8)
        result["pause_count"] = len(pauses)
        result["pause_frequency"] = round(len(pauses) / max(duration, 1) * 60, 2)  # pauses per minute

    # ─── Compute Score ──────────────────────────────────────────────────
    # Normal speech rate: 2.0–3.5 words/sec
    # Normal vocab diversity: 0.4–0.7
    # Normal pause frequency: 0–5 per minute

    score = 100.0

    # Speech rate scoring (ideal: 2.0–3.5 wps)
    if speech_rate < 0.5:
        score -= 30
    elif speech_rate < 1.5:
        score -= 20
    elif speech_rate < 2.0:
        score -= 10
    elif speech_rate > 5.0:
        score -= 10  # too fast can also indicate issues

    # Vocabulary diversity scoring (ideal: > 0.4)
    if vocab_diversity < 0.2:
        score -= 25
    elif vocab_diversity < 0.3:
        score -= 15
    elif vocab_diversity < 0.4:
        score -= 10

    # Pause frequency scoring
    pause_freq = result["pause_frequency"]
    if pause_freq > 15:
        score -= 25
    elif pause_freq > 10:
        score -= 15
    elif pause_freq > 5:
        score -= 5

    # Word count (should have at least some words in 30-60 sec)
    if word_count < 10:
        score -= 20
    elif word_count < 30:
        score -= 10

    result["score"] = round(max(0, min(100, score)), 1)

    # cleanup
    try:
        os.remove(audio_path)
    except OSError:
        pass

    return result
