"""
FastAPI Routes

All API endpoints for LinkifyMe backend.
"""

import json
from typing import Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.schemas import (
    IntakeRequest,
    IntakeResponse,
    StatusResponse,
    ReportResponse,
    LogsResponse,
    ActivityLogEntry,
    SectionScore,
    PaymentWebhookRequest,
)
from app.graph.state import create_initial_state
from app.graph.workflow import get_workflow
from app.services.sheets import get_sheets_service


router = APIRouter()


# In-memory store for quick status lookups (in production, use Redis/DB)
_status_cache: dict[str, dict] = {}


def run_workflow_background(state: dict):
    """Run the workflow in background."""
    try:
        workflow = get_workflow()
        final_state = workflow.invoke(state)
        
        # Update cache with final state
        unique_id = state["unique_id"]
        _status_cache[unique_id] = final_state
        
    except Exception as e:
        unique_id = state.get("unique_id", "unknown")
        _status_cache[unique_id] = {
            **state,
            "error_message": str(e),
            "scrape_status": "failed",
        }


@router.post("/intake", response_model=IntakeResponse)
async def start_intake(
    request: IntakeRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a new LinkedIn profile analysis.
    
    Creates initial records and starts the analysis workflow.
    """
    # Create initial state
    state = create_initial_state(
        linkedin_url=request.linkedin_url,
        email=request.email,
        phone=request.phone,
        target_group=request.target_group,
    )
    
    # Store in cache
    _status_cache[state["unique_id"]] = state
    
    # Run workflow in background
    background_tasks.add_task(run_workflow_background, state)
    
    return IntakeResponse(
        unique_id=state["unique_id"],
        message="Analysis started",
        status="pending",
    )


@router.get("/status/{unique_id}", response_model=StatusResponse)
async def get_status(unique_id: str):
    """
    Check the status of an analysis.
    """
    # Check cache first
    if unique_id in _status_cache:
        state = _status_cache[unique_id]
    else:
        # Try to find in sheets
        sheets = get_sheets_service()
        result = sheets.find_profile_by_unique_id(unique_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        _, data = result
        state = data
    
    # Calculate progress
    scrape_status = state.get("scrape_status", "pending")
    payment_status = state.get("payment_status", "pending")
    ai_status = state.get("ai_scoring_status", "")
    
    if scrape_status == "completed" and ai_status == "completed":
        current_step = "complete"
        progress = 100
    elif ai_status:
        current_step = "scoring"
        progress = 80
    elif scrape_status == "completed":
        current_step = "scoring"
        progress = 70
    elif scrape_status == "scraping":
        current_step = "scraping"
        progress = 40
    elif payment_status == "succeeded":
        current_step = "scraping"
        progress = 30
    elif state.get("customer_id"):
        current_step = "payment"
        progress = 20
    elif state.get("is_valid"):
        current_step = "allocating"
        progress = 15
    elif state.get("pi_row"):
        current_step = "validating"
        progress = 10
    else:
        current_step = "intake"
        progress = 5
    
    return StatusResponse(
        unique_id=unique_id,
        customer_id=state.get("customer_id"),
        scrape_status=scrape_status,
        payment_status=payment_status,
        current_step=current_step,
        progress_percent=progress,
        error_message=state.get("error_message"),
    )


@router.get("/report/{customer_id}", response_model=ReportResponse)
async def get_report(customer_id: str):
    """
    Get the full analysis report for a customer.
    """
    sheets = get_sheets_service()
    
    # Find scoring data
    scoring_result = sheets.find_scoring_by_customer_id(customer_id)
    if not scoring_result:
        raise HTTPException(status_code=404, detail="Report not found")
    
    _, scoring = scoring_result
    
    # Find profile info (for name, etc.)
    # For now, we'll use a placeholder
    profile = {
        "name": customer_id,
        "initial": customer_id[0].upper() if customer_id else "?",
        "url": "",
    }
    
    # Build sections
    sections = []
    
    # Helper to determine status
    def get_status(score: int, max_score: int) -> str:
        ratio = score / max_score if max_score > 0 else 0
        if ratio >= 0.7:
            return "optimized"
        elif ratio >= 0.4:
            return "needs_improvement"
        return "critical"
    
    # Profile Photo
    score = int(scoring.get("profile_photo_score") or 0)
    sections.append(SectionScore(
        id="profile-photo",
        title="Profile Photo",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("profile_photo_analysis"),
    ))
    
    # Headline
    score = int(scoring.get("headline_score") or 0)
    ai_rewrites = scoring.get("ai_rewrites_json", "{}")
    if isinstance(ai_rewrites, str):
        try:
            ai_rewrites = json.loads(ai_rewrites)
        except:
            ai_rewrites = {}
    
    sections.append(SectionScore(
        id="headline",
        title="Headline",
        score=score,
        max_score=15,
        status=get_status(score, 15),
        analysis=scoring.get("headline_analysis"),
        ai_rewrite=ai_rewrites.get("headline"),
        tags=["Keywords", "Value Proposition", "Clarity"],
    ))
    
    # About
    score = int(scoring.get("about_score") or 0)
    sections.append(SectionScore(
        id="about",
        title="About",
        score=score,
        max_score=20,
        status=get_status(score, 20),
        analysis=scoring.get("about_analysis"),
        ai_rewrite=ai_rewrites.get("about"),
        tags=["Storytelling", "Keywords", "Call to Action"],
    ))
    
    # Experience
    score = int(scoring.get("experience_score") or 0)
    sections.append(SectionScore(
        id="experience",
        title="Experience",
        score=score,
        max_score=20,
        status=get_status(score, 20),
        analysis=scoring.get("experience_analysis"),
    ))
    
    # Connections
    score = int(scoring.get("connections_score") or 0)
    sections.append(SectionScore(
        id="connections",
        title="Connections",
        score=score,
        max_score=5,
        status=get_status(score, 5),
        analysis=scoring.get("connections_analysis"),
    ))
    
    # Determine grade
    overall_score = scoring.get("overall_score", 0)
    if overall_score >= 80:
        grade = "EXCELLENT"
    elif overall_score >= 60:
        grade = "GOOD"
    elif overall_score >= 40:
        grade = "AVERAGE"
    else:
        grade = "NEEDS WORK"
    
    # Top priorities
    top_priorities = ["Improve About", "Optimize Headline", "Add Skills"]
    
    return ReportResponse(
        customer_id=customer_id,
        profile=profile,
        overall_score=overall_score,
        grade_label=grade,
        executive_summary=scoring.get("executive_summary", ""),
        sections=sections,
        top_priorities=top_priorities,
        generated_at=datetime.utcnow(),
    )


@router.get("/logs", response_model=LogsResponse)
async def get_logs(limit: int = 100):
    """
    Get activity logs for WarRoom dashboard.
    """
    sheets = get_sheets_service()
    logs = sheets.get_recent_activity_logs(limit)
    
    return LogsResponse(
        logs=[ActivityLogEntry(**log) for log in logs],
        total_count=len(logs),
    )


@router.post("/payment/webhook")
async def payment_webhook(request: PaymentWebhookRequest):
    """
    Handle payment gateway webhook.
    
    Updates payment status and resumes workflow if needed.
    """
    sheets = get_sheets_service()
    
    # Find the payment confirmation record
    # This is a simplified version - in production, you'd look up by payment gateway ID
    
    sheets.append_activity_log(
        unique_id="webhook",
        customer_id=request.customer_id,
        event_type="payment_webhook",
        status="success" if request.status == "succeeded" else "error",
        message=f"Payment {request.status} for {request.customer_id}",
    )
    
    return {"status": "received", "customer_id": request.customer_id}
