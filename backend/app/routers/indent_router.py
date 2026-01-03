from fastapi import APIRouter
from app.models.code_model import CodeRequest
from app.services.indent_engine import check_indentation

router = APIRouter(
    prefix="/indent",
    tags=["Indentation"]
)

@router.post("/")
def indent(payload: CodeRequest):
    return check_indentation(payload.code)
