from fastapi import APIRouter
from app.models.code_input_model import CodeInput
from app.services.syntax_validator import validate_syntax

router = APIRouter(prefix="/syntax", tags=["Syntax Validator"])

@router.post("/syntax")
def syntax_check(payload: CodeInput):
    return validate_syntax(payload.code)
