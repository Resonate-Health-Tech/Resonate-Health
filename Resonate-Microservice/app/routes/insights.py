"""
AI-powered insights generation route.
"""
from fastapi import APIRouter, HTTPException, Depends, Request

from app.models.schemas import InsightsRequest
from app.services import openai_service
from app.core.logger import log_request, log_error
from app.core.auth import verify_internal_secret
from app.core.limiter import limiter

router = APIRouter(dependencies=[Depends(verify_internal_secret)])


@router.post("/generate-insights")
@limiter.limit("20/minute")
async def generate_insights(request: Request, req: InsightsRequest):
    """
    Generate personalised health insights based on user memory context.

    Takes the structured memoryContext built by the server's MemoryContextBuilder
    (including numeric trends like avg_energy_level, avg_stress_level etc.)
    and returns 3-5 AI-generated, prioritised insight cards.
    """
    log_request("/generate-insights")

    try:
        result = await openai_service.generate_insights(
            memory_context=req.memoryContext,
            gender=req.gender,
            age=req.age,
        )
        return {"status": "success", "insights": result.get("insights", [])}
    except ValueError as e:
        log_error("Insights generation", e)
        raise HTTPException(status_code=500, detail="AI generation failed to produce valid JSON")
    except Exception as e:
        log_error("Insights generation", e)
        raise HTTPException(status_code=500, detail="Insights generation failed")
