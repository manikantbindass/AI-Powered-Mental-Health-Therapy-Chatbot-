import os
import re
from typing import Dict, Any

POSITIVE_WORDS = {"calm", "peaceful", "grateful", "happy", "hopeful", "relieved", "good", "great", "energized", "proud", "relaxed", "joy", "excited", "content", "better"}
NEGATIVE_WORDS = {"sad", "anxious", "overwhelmed", "stressed", "exhausted", "lonely", "angry", "frustrated", "worried", "afraid", "hopeless", "tired", "upset", "down", "bad", "panic"}
EMOTION_MAP = {
    "anxious": "anxiety", "worried": "anxiety", "panic": "anxiety",
    "stressed": "stress", "overwhelmed": "stress",
    "sad": "sadness", "lonely": "sadness", "down": "sadness",
    "angry": "frustration", "frustrated": "frustration",
    "calm": "calmness", "peaceful": "calmness", "relaxed": "calmness",
    "grateful": "gratitude", "hopeful": "hope", "happy": "joy", "excited": "joy"
}
NEGATIONS = {"not", "never", "no", "hardly", "barely", "don't", "didn't", "isn't", "wasn't", "can't"}

class SentimentAnalyzer:
    MAX_CHARS = 5000

    def __init__(self, model_path: str = ""):
        self.model_path = model_path or os.environ.get("TF_SENTIMENT_MODEL_PATH", "")
        self.tf_model = None
        self.engine_used = "deterministic_fallback"
        if self.model_path and os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                self.tf_model = tf.keras.models.load_model(self.model_path)
                self.engine_used = "tensorflow_keras"
            except Exception:
                self.tf_model = None

    def analyze(self, text: str) -> Dict[str, Any]:
        if not isinstance(text, str):
            return {"sentiment": "neutral", "confidence": 0.0, "emotions": [], "engine": self.engine_used, "error": "unsupported_input_type"}
        cleaned = text.strip()
        if not cleaned:
            return {"sentiment": "neutral", "confidence": 0.0, "emotions": [], "engine": self.engine_used}
        truncated = cleaned[:self.MAX_CHARS]
        tokens = re.findall(r"[a-zA-Z']+", truncated.lower())
        if not tokens:
            return {"sentiment": "neutral", "confidence": 0.5, "emotions": [], "engine": self.engine_used}

        pos, neg, emotions = 0.0, 0.0, []
        for idx, tok in enumerate(tokens):
            negated = idx > 0 and tokens[idx - 1] in NEGATIONS
            if tok in POSITIVE_WORDS:
                if negated: neg += 1.0
                else: pos += 1.0
            elif tok in NEGATIVE_WORDS:
                if negated: pos += 0.5
                else: neg += 1.0
            if not negated and tok in EMOTION_MAP and EMOTION_MAP[tok] not in emotions:
                emotions.append(EMOTION_MAP[tok])

        total = pos + neg
        if total == 0:
            cat, conf = "neutral", 0.55
        elif pos > neg:
            cat, conf = "positive", min(0.95, round(0.55 + (pos - neg) / (total + 2), 2))
        elif neg > pos:
            cat, conf = "negative", min(0.95, round(0.55 + (neg - pos) / (total + 2), 2))
        else:
            cat, conf = "mixed", 0.60

        return {"sentiment": cat, "confidence": conf, "emotions": emotions[:4], "engine": self.engine_used}
