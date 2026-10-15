import os
from typing import List, Dict, Any
from .safety import evaluate_safety
from .sentiment import SentimentAnalyzer

SYSTEM_PROMPT = (
    "You are MindCare AI, an empathetic, nonjudgmental mental wellness companion. "
    "You are NOT a licensed therapist or doctor. Never diagnose conditions or prescribe medication. "
    "Validate emotions warmly, ask gentle reflective questions, and suggest grounding or breathing exercises."
)

class WellnessCompanionService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        self.model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()
        self.max_context = int(os.environ.get("AI_MAX_CONTEXT_MESSAGES", "10"))
        self.timeout = int(os.environ.get("AI_REQUEST_TIMEOUT_SECONDS", "15"))
        self.sentiment_analyzer = SentimentAnalyzer()

    def generate_reply(self, user_message: str, history: List[Dict[str, str]], region_code: str = "IN", ai_consent_given: bool = True) -> Dict[str, Any]:
        safety = evaluate_safety(user_message, region_code=region_code)
        sentiment = self.sentiment_analyzer.analyze(user_message)
        if safety["is_crisis"]:
            return {
                "reply": safety["safe_response"],
                "is_crisis": True,
                "crisis_category": safety["category"],
                "crisis_resources": safety["resources"],
                "sentiment": sentiment,
                "provider": "safety_gate_interception",
                "is_mock": False,
            }
        if not self.api_key or not ai_consent_given:
            return {
                "reply": self._fallback(sentiment, ai_consent_given),
                "is_crisis": False,
                "crisis_category": "none",
                "crisis_resources": None,
                "sentiment": sentiment,
                "provider": "local_mock_companion",
                "is_mock": True,
            }
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key, timeout=self.timeout, max_retries=1)
            msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
            for m in (history or [])[-self.max_context:]:
                msgs.append({"role": "assistant" if m.get("sender") == "ai" else "user", "content": str(m.get("content", ""))[:2000]})
            msgs.append({"role": "user", "content": user_message[:2000]})
            resp = client.chat.completions.create(model=self.model, messages=msgs, temperature=0.7, max_tokens=400)
            content = resp.choices[0].message.content.strip()
            return {
                "reply": content,
                "is_crisis": False,
                "crisis_category": "none",
                "crisis_resources": None,
                "sentiment": sentiment,
                "provider": f"openai:{self.model}",
                "is_mock": False,
            }
        except Exception:
            return {
                "reply": self._fallback(sentiment, ai_consent_given=True, err=True),
                "is_crisis": False,
                "crisis_category": "none",
                "crisis_resources": None,
                "sentiment": sentiment,
                "provider": "fallback_on_error",
                "is_mock": True,
            }

    def _fallback(self, sentiment: Dict[str, Any], ai_consent_given: bool = True, err: bool = False) -> str:
        prefix = "[Local Companion Mode — Set OPENAI_API_KEY in .env for live GPT responses]\n\n"
        if not ai_consent_given:
            prefix = "[Local Privacy Mode — External AI transmission disabled in your settings]\n\n"
        elif err:
            prefix = "[Fallback Mode — External AI temporarily unreachable]\n\n"
        emo = sentiment.get("emotions", [])
        emo_str = f"I notice signals of {', '.join(emo)} in what you shared. " if emo else ""
        if sentiment.get("sentiment") == "negative":
            return prefix + f"Thank you for sharing that openly with me. {emo_str}When things feel heavy, pausing to acknowledge the feeling without judgment is an important first step. Would you like to explore what triggered this today, or try a 2-minute Box Breathing exercise together?"
        if sentiment.get("sentiment") == "positive":
            return prefix + f"I appreciate you sharing this brighter moment! {emo_str}Noticing what brings us calm or gratitude helps anchor resilience. What do you think helped most today?"
        return prefix + f"Thank you for checking in. {emo_str}I'm here to listen without judgment. What has been occupying the most space in your thoughts today?"
