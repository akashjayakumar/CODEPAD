from fastapi import APIRouter, HTTPException
import traceback
from typing import Dict, Any
from app.models.compare_model import CompareRequest
from app.services.ai_summarizer import summarize_diff
from app.services.diff_engine import compare_code

router = APIRouter(prefix="/ai", tags=["AI Summary"])

@router.post("/summary/", response_model=Dict[str, Any])
async def ai_summary(payload: CompareRequest) -> Dict[str, Any]:
    try:
        diff = compare_code(payload.old_code, payload.new_code)
        diff_text = "\n".join(diff["diff"])

        result = summarize_diff(diff_text)

        if not result.get("success", True):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to generate summary")
            )

        return {
            "summary": result.get("summary", ""),
            "model": result.get("model", "unknown"),
            "diff_stats": {
                "additions": diff.get("additions_count", 0),
                "deletions": diff.get("deletions_count", 0),
                "total_changes": diff.get("total_changes", 0)
            }
        }

    except HTTPException:
        raise  # don't convert 400 into 500

    except Exception:
        print("Error in ai_summary:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to process request"
        )

@router.post("/summary/")
async def ai_summary(payload: CompareRequest):
    try:
        diff = compare_code(payload.old_code, payload.new_code)
        diff_text = "\n".join(diff["diff"])

        result = summarize_diff(diff_text)

        if not result.get("success", True):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to generate summary")
            )

        return {
            "summary": result.get("summary", ""),
            "model": result.get("model", "unknown"),
            "diff_stats": {
                "additions": diff.get("additions_count", 0),
                "deletions": diff.get("deletions_count", 0),
                "total_changes": diff.get("total_changes", 0)
            }
        }

    except HTTPException:
        raise  # DO NOT WRAP again into 500

    except Exception as e:
        print("Error in ai_summary:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Failed to process request"
        )
