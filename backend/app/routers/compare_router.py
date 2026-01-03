from fastapi import APIRouter
from app.models.compare_model import CompareRequest
from app.services.diff_engine import compare_code

router = APIRouter(
    prefix="/compare",
    tags=["Compare"]
)

@router.post("/")
def compare(payload: CompareRequest):
    return compare_code(payload.old_code, payload.new_code)
