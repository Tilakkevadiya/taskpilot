from pydantic import BaseModel
from typing import Dict, Any, Optional, cast
import os
import json
import re
import time

# -------------------------------
api_key = os.environ.get("GROQ_API_KEY")
if api_key:
    # Ensure it's a string for slicing
    key_str = str(api_key)
    print(f"Loaded Groq API Key: {(str(api_key))[:10]}...")
else:
    print("Loaded Groq API Key: None")
from groq import Groq
client = Groq(api_key=api_key) if api_key else None

# -------------------------------
# Global Usage Tracking
# -------------------------------
groq_stats: Dict[str, Any] = {
    "total_calls": 0,
    "failed_calls": 0,
    "durations": [],
    "endpoints": {}
}

# -------------------------------
# Prompt Caching
# -------------------------------
# Format: { "prompt_text": { "response": ParseResponse, "timestamp": 1234567890 } }
prompt_cache = {}
CACHE_TTL = 60  # Cache duration in seconds

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
def parse_intent(request: ParseRequest, context: Optional[Dict[str, Any]] = None) -> ParseResponse:
    if context is None:
        context = { "request_id": "UNKNOWN", "endpoint_name": "/unknown", "groq_calls_count": 0 }
        
    raw_text: str = request.text
    text: str = raw_text.lower()

    # -------------------------------
    # Try Groq AI
    # -------------------------------
    if client:
        # 1. Check Cache
        current_time = time.time()
        if text in prompt_cache:
            cache_entry = prompt_cache[text]
            if current_time - cache_entry["timestamp"] < CACHE_TTL:
                print(f"[CACHE HIT] Returning recent response for prompt: {text[:30]}...")
                return cache_entry["response"]

        # 2. Rate Limiting based on request intent complexity
        max_calls = 2 if any(k in text for k in ["workflow", "complex", "plan"]) else 1
        current_calls = int(context.get("groq_calls_count", 0))
        if current_calls >= max_calls:
            print("WARNING: Rate limit exceeded for request", context["request_id"])
            return ParseResponse(
                intent="ERROR",
                entities={},
                reply="AI usage limit exceeded for this request"
            )
            
        context["groq_calls_count"] = current_calls + 1

        print("\n Groq client detected — sending request...")

        start_time = time.time()
        retries: int = 0
        success = False
        parsed_intent: Optional[ParseResponse] = None

        while retries < 2 and not success:  # Max 1 retry
            try:
                # Update global endpoint stats
                ep = str(context.get("endpoint_name", "/unknown"))
                groq_stats["endpoints"][ep] = groq_stats["endpoints"].get(ep, 0) + 1
                
                groq_stats["total_calls"] += 1
                
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are TaskPilot AI, a smart voice assistant like Jarvis.

Your job:
1. Detect user's intent (CREATE_TASK, SEND_EMAIL, CREATE_MEETING, UNKNOWN)
2. Extract useful entities
3. Generate a NATURAL spoken reply

Rules:
- Sound like a real human assistant
- Be friendly and professional
- Keep replies short and conversational

Return ONLY valid JSON:
{
  "intent": "...",
  "entities": { ... },
  "reply": "..."
}
"""
                        },
                        {
                            "role": "user",
                            "content": raw_text
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.8,
                )

                duration = time.time() - start_time
                groq_stats["durations"].append(duration)

                # Safe JSON extraction
                raw_json = response.choices[0].message.content
                if not raw_json:
                    raise ValueError("Empty response from Groq")
                
                parsed = json.loads(raw_json)

                parsed_intent = ParseResponse(
                    intent=str(parsed.get("intent", "UNKNOWN")),
                    entities=cast(Dict[str, Any], parsed.get("entities", {})),
                    reply=str(parsed.get("reply", "Done!"))
                )  # type: ignore
                
                # Update cache
                prompt_cache[text] = {
                    "response": parsed_intent,
                    "timestamp": current_time
                }
                
                success = True

                # Print Formatted Call Log
                print("\n[GROQ CALL]")
                print(f"Endpoint: {ep}")
                print(f"Function: parse_intent")
                print(f"Request ID: {context.get('request_id', 'UNKNOWN')}")
                print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}")
                print(f"Duration: {duration:.2f}s\n")

            except Exception as e:
                retries = retries + 1  # type: ignore
                error_msg = str(e).lower()
                
                if retries >= 2 or "429" in error_msg:
                    groq_stats["failed_calls"] += 1
                    
                    print("\n[GROQ CALL] FAILED")
                    print(f"Status: Failure ({e})")
                    print(f"Duration: {time.time() - start_time:.2f}s\n")
                    
                    if "429" in error_msg:
                        return ParseResponse(
                            intent="ERROR",
                            entities={},
                            reply="AI service busy (Rate limit). Please try again in a few seconds."
                        )
                    break
                else:
                    print(f"WARNING: Retry loop triggered ({retries}/1)")
                    time.sleep(1)
                    
        if success and parsed_intent:
            return parsed_intent

    # -------------------------------
    # Fallback Logic (only if Groq fails)
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