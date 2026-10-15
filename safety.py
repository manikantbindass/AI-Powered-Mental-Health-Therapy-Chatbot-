import re
from typing import Dict, Any

CRISIS_RESOURCES_REGISTRY: Dict[str, Dict[str, Any]] = {
    "IN": {
        "region_name": "India",
        "emergency_number": "112",
        "verified_date": "2026-10-01",
        "helplines": [
            {"name": "Tele-MANAS (Govt. of India)", "phone": "14416 / 1800-891-4416", "hours": "24/7, Free", "url": "https://telemanas.mohfw.gov.in/"},
            {"name": "KIRAN Helpline (Govt. of India)", "phone": "1800-599-0019", "hours": "24/7", "url": "https://depwd.gov.in/"},
            {"name": "Vandrevala Foundation", "phone": "+91 9999 666 555", "hours": "24/7", "url": "https://www.vandrevalafoundation.com/"},
            {"name": "iCall (TISS Mumbai)", "phone": "+91 9152987821", "hours": "Mon-Sat, 8 AM - 10 PM IST", "url": "https://icallhelpline.org/"}
        ]
    },
    "US": {
        "region_name": "United States",
        "emergency_number": "911",
        "verified_date": "2026-10-01",
        "helplines": [
            {"name": "988 Suicide & Crisis Lifeline", "phone": "988", "hours": "24/7", "url": "https://988lifeline.org/"}
        ]
    },
    "GLOBAL": {
        "region_name": "International Directory",
        "emergency_number": "112 / 911 / 999",
        "verified_date": "2026-10-01",
        "helplines": [
            {"name": "Find A Helpline (IASP)", "phone": "Online Directory", "hours": "24/7", "url": "https://findahelpline.com/"}
        ]
    }
}

SELF_HARM_PATTERNS = [
    r"\b(want|going|plan|planning|thinking\s+about|ready)\s+to\s+(die|kill\s+myself|end\s+my\s+life|end\s+it\s+all|hurt\s+myself|harm\s+myself)\b",
    r"\b(suicide|suicidal|kill\s+myself|end\s+my\s+life|take\s+my\s+own\s+life|slit\s+my\s+wrists|overdose\s+on)\b",
    r"\b(better\s+off\s+dead|no\s+reason\s+to\s+live|can'?t\s+go\s+on\s+living|wish\s+i\s+were\s+dead|wish\s+i\s+was\s+dead)\b",
    r"\b(self[- ]?harm|cutting\s+myself|burning\s+myself)\b",
]

VIOLENCE_OR_ABUSE_PATTERNS = [
    r"\b(going\s+to\s+kill|want\s+to\s+kill|plan\s+to\s+murder|shoot\s+up|stab\s+someone)\b",
    r"\b(partner\s+is\s+hitting\s+me|being\s+abused\s+right\s+now|in\s+immediate\s+danger)\b",
]

BENIGN_IDIOM_EXCLUSIONS = [
    r"\b(dying\s+of\s+laughter|kill\s+time|killing\s+it|dead\s+tired|homework\s+is\s+killing\s+me|traffic\s+is\s+killing\s+me)\b"
]

def get_crisis_resources(region_code: str = "IN") -> Dict[str, Any]:
    code = (region_code or "IN").upper().strip()
    return CRISIS_RESOURCES_REGISTRY.get(code, CRISIS_RESOURCES_REGISTRY["GLOBAL"])

def evaluate_safety(text: str, region_code: str = "IN") -> Dict[str, Any]:
    if not text or not isinstance(text, str):
        return {"is_crisis": False, "category": "none", "resources": None, "safe_response": None}
    cleaned = text.strip().lower()
    for ex in BENIGN_IDIOM_EXCLUSIONS:
        cleaned = re.sub(ex, "", cleaned)
    for pat in SELF_HARM_PATTERNS:
        if re.search(pat, cleaned):
            res = get_crisis_resources(region_code)
            return {"is_crisis": True, "category": "self_harm_or_suicide", "resources": res, "safe_response": _format_msg(res)}
    for pat in VIOLENCE_OR_ABUSE_PATTERNS:
        if re.search(pat, cleaned):
            res = get_crisis_resources(region_code)
            return {"is_crisis": True, "category": "immediate_danger_or_violence", "resources": res, "safe_response": _format_msg(res)}
    return {"is_crisis": False, "category": "none", "resources": None, "safe_response": None}

def _format_msg(resources: Dict[str, Any]) -> str:
    lines = [f"• {h['name']}: {h['phone']} ({h['hours']}) — {h['url']}" for h in resources.get("helplines", [])]
    return (
        "I hear how much pain you are carrying right now, and your safety matters deeply. "
        "Because I am an AI wellness companion—not a human clinician or emergency responder—I cannot provide crisis intervention or contact emergency services on your behalf.\n\n"
        f"If you are in immediate danger, please call your local emergency number ({resources.get('emergency_number', '112')}) immediately.\n\n"
        f"Verified 24/7 Crisis Helplines ({resources.get('region_name', 'Regional')}):\n" + "\n".join(lines) + "\n\n"
        "Please reach out to one of these free, confidential services or a trusted person right now."
    )
