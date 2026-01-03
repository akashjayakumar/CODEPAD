from fastapi import APIRouter
from app.models.code_model import CodeRequest
from app.services.syntax_engine import validate_syntax

router = APIRouter(
    prefix="/syntax",
    tags=["Syntax"]
)

@router.post("/")
def syntax(payload: CodeRequest):
    return validate_syntax(payload.code)
