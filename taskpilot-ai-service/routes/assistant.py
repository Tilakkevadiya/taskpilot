from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import parse_intent, ParseRequest, ParseResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/parse", response_model=ParseResponse)
def parse_command(request: ParseRequest):
    return parse_intent(request)
