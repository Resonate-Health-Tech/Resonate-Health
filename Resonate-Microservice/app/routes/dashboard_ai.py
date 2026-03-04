"""
AI Dashboard analysis route.
"""
from fastapi import APIRouter, HTTPException, Depends, Request

from app.models.schemas import DashboardAnalysisRequest
from app.services import openai_service
from app.core.logger import log_request, log_error
from app.core.auth import verify_internal_secret
from app.core.limiter import limiter

router = APIRouter(dependencies=[Depends(verify_internal_secret)])


@router.post("/analyze-dashboard")
@limiter.limit("20/minute")
async def analyze_dashboard(request: Request, req: DashboardAnalysisRequest):
    """
    Generate AI-powered health analysis for the dashboard.

    Accepts raw health data (biomarkers, sleep, workouts, daily logs, nutrition)
    and returns: health score, recovery status, training balance classification,
    and a weekly narrative — all AI-generated rather than rule-based.
    """
    log_request("/analyze-dashboard")

    try:
        result = await openai_service.analyze_dashboard(
            biomarkers=req.biomarkers,
            sleep_history=req.sleepHistory,
            recent_workouts=req.recentWorkouts,
            daily_logs=req.dailyLogs,
            nutrition_summary=req.nutritionSummary,
            gender=req.gender,
            age=req.age,
        )
        return {"status": "success", "analysis": result}
    except ValueError as e:
        log_error("Dashboard analysis", e)
        raise HTTPException(status_code=500, detail="AI analysis failed to produce valid JSON")
    except Exception as e:
        log_error("Dashboard analysis", e)
        raise HTTPException(status_code=500, detail="Dashboard analysis failed")
