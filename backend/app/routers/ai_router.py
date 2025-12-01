from fastapi import APIRouter
from app.models.compare_model import CompareRequest
from app.services.ai_summarizer import summarize_diff
from app.services.diff_engine import compare_code

router = APIRouter(prefix="/ai", tags=["AI Summary"])

@router.post("/summary")
def ai_summary(payload: CompareRequest):
    diff = compare_code(payload.old_code, payload.new_code)
    diff_text = "\n".join(diff["diff"])
    return summarize_diff(diff_text)
