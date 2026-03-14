from fastapi import APIRouter, Request
from pydantic import BaseModel
from services.llm_service import parse_intent, ParseRequest, ParseResponse
import uuid

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/parse", response_model=ParseResponse)
def parse_command(request: ParseRequest, fastapi_req: Request):
    request_id = f"REQ-{str(uuid.uuid4())[:8]}"  # type: ignore
    context = {
        "request_id": request_id,
        "endpoint_name": fastapi_req.url.path,
        "groq_calls_count": 0
    }
    
    response = parse_intent(request, context)
    
    print(f"\nRequest ID: {request_id}")
    print(f"Total Groq Calls: {context['groq_calls_count']}\n")
    
    return response
