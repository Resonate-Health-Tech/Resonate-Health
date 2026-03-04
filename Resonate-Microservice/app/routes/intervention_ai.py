"""
AI Intervention effectiveness analysis route.
"""
from fastapi import APIRouter, HTTPException, Depends, Request

from app.models.schemas import InterventionEffectivenessRequest
from app.services import openai_service
from app.core.logger import log_request, log_error
from app.core.auth import verify_internal_secret
from app.core.limiter import limiter

router = APIRouter(dependencies=[Depends(verify_internal_secret)])


@router.post("/analyze-intervention")
@limiter.limit("20/minute")
async def analyze_intervention(request: Request, req: InterventionEffectivenessRequest):
    """
    AI-powered intervention effectiveness analysis.

    Accepts an intervention's details and outcome history, returns whether
    it worked, a 0-100 effectiveness score, and a narrative summary.
    """
    log_request("/analyze-intervention")

    try:
        result = await openai_service.analyze_intervention(
            intervention_type=req.type,
            recommendation=req.recommendation,
            rationale=req.rationale,
            target_metric=req.targetMetric,
            target_value=req.targetValue,
            duration_days=req.durationDays,
            start_date=req.startDate,
            outcomes=req.outcomes,
            status=req.status,
        )
        return {"status": "success", "effectiveness": result}
    except ValueError as e:
        log_error("Intervention analysis", e)
        raise HTTPException(status_code=500, detail="AI analysis failed to produce valid JSON")
    except Exception as e:
        log_error("Intervention analysis", e)
        raise HTTPException(status_code=500, detail="Intervention analysis failed")
