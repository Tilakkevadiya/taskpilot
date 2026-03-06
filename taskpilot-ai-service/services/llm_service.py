from pydantic import BaseModel
from typing import Dict, Any
import os
import json
import re
from google import genai
from google.genai import types

# -------------------------------
# Gemini Client Setup
# -------------------------------
api_key = os.environ.get("GEMINI_API_KEY")
print("Loaded API Key:", api_key[:10] if api_key else "None")
client = genai.Client(api_key=api_key) if api_key else None


# -------------------------------
# Request / Response Models
# -------------------------------
class ParseRequest(BaseModel):
    text: str


class ParseResponse(BaseModel):
    intent: str
    entities: Dict[str, Any]
    reply: str


# -------------------------------
# Intent Parser Function
# -------------------------------
def parse_intent(request: ParseRequest) -> ParseResponse:
    text = request.text.lower()

    # -------------------------------
    # Try Gemini AI
    # -------------------------------
    if client:
        try:
            print("\n✅ Gemini client detected — sending request...")

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    """You are TaskPilot AI, a smart voice assistant like Jarvis.

Your job:
1. Detect user's intent
2. Extract useful entities
3. Generate a NATURAL spoken reply

Rules:
- Sound like a real human assistant
- Be friendly and professional
- Replies should vary each time
- Avoid robotic confirmations
- Keep replies short and conversational

Return ONLY valid JSON:
{
  "intent": "...",
  "entities": { ... },
  "reply": "..."
}
""",
                    request.text,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.9,  # 🔥 Higher = more natural variation
                ),
            )

            print("🧠 Gemini RAW RESPONSE:\n", response.text)

            # -------------------------------
            # Safe JSON extraction
            # -------------------------------
            raw = response.text.strip()
            match = re.search(r"\{.*\}", raw, re.DOTALL)

            if not match:
                raise ValueError("No JSON found in Gemini response")

            parsed = json.loads(match.group())

            print("✅ Parsed Gemini JSON:", parsed)

            return ParseResponse(
                intent=parsed.get("intent", "UNKNOWN"),
                entities=parsed.get("entities", {}),
                reply=parsed.get("reply", "Done!")
            )

        except Exception as e:
            print("❌ Gemini Exception:", e)
            print("⚠ Switching to fallback mode...\n")

    # -------------------------------
    # Fallback Logic (only if Gemini fails)
    # -------------------------------
    if "mail" in text or "email" in text:
        return ParseResponse(
            intent="SEND_EMAIL",
            entities={"email": "example@email.com", "message": "Example message"},
            reply="Got it! I've prepared the email for you."
        )

    elif "meeting" in text or "schedule" in text:
        return ParseResponse(
            intent="CREATE_MEETING",
            entities={"date": "2026-03-04", "time": "10:00"},
            reply="Done! Your meeting has been added to the calendar."
        )

    elif "task" in text or "remind" in text:
        return ParseResponse(
            intent="CREATE_TASK",
            entities={"title": "New Task", "priority": "high"},
            reply="All set! I've created that task for you."
        )

    return ParseResponse(
        intent="UNKNOWN",
        entities={},
        reply="Hmm, I'm not sure how to help with that yet."
    )