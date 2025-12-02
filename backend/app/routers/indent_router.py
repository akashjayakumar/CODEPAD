from fastapi import APIRouter
from app.models.code_input_model import CodeInput
from app.services.indent_checker import check_indentation

router = APIRouter(prefix="/indent", tags=["Indent Checker"])

@router.post("/")
def indent_check(payload: CodeInput):
    return check_indentation(payload.code)
