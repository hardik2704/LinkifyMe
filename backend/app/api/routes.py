"""
FastAPI Routes

All API endpoints for LinkifyMe backend.
"""

import json
from typing import Any
from datetime import datetime, date

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from app.models.schemas import (
    IntakeRequest,
    IntakeResponse,
    StatusResponse,
    ReportResponse,
    LogsResponse,
    ActivityLogEntry,
    SectionScore,
    PaymentWebhookRequest,
    FeedbackRequest,
    FeedbackResponse,
    PersonaInfo,
    PersonasResponse,
    DashboardStats,
)
from app.graph.state import create_initial_state
from app.graph.workflow import get_workflow
from app.services.sheets import get_sheets_service
from app.scoring.calculator import get_pre_scores, get_all_personas
from app.services.logger import get_session_logger, log_info, log_error, log_event


router = APIRouter()


# In-memory store for quick status lookups (in production, use Redis/DB)
_status_cache: dict[str, dict] = {}


def run_workflow_background(state: dict):
    """Run the workflow in background."""
    unique_id = state.get("unique_id", "unknown")
    linkedin_url = state.get("linkedin_url", "")
    
    log_event("workflow", "started", f"Starting workflow for {unique_id}", {
        "linkedin_url": linkedin_url,
    })
    
    try:
        workflow = get_workflow()
        final_state = workflow.invoke(state)
        
        # Update cache with final state
        _status_cache[unique_id] = final_state
        
        log_event("workflow", "completed", f"Workflow completed for {unique_id}", {
            "scrape_status": final_state.get("scrape_status"),
            "has_scores": final_state.get("scores") is not None,
        })
        
    except Exception as e:
        log_error("workflow", f"Workflow failed for {unique_id}: {str(e)}")
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
    # Start session logging
    session_logger = get_session_logger()
    
    # Create initial state
    state = create_initial_state(
        linkedin_url=request.linkedin_url,
        email=request.email,
        phone=request.phone,
        target_group=request.target_group,
    )
    
    # Start session tracking
    session_logger.start_session(
        unique_id=state["unique_id"],
        linkedin_url=request.linkedin_url,
        email=request.email,
        target_group=request.target_group,
    )
    
    log_event("intake", "received", f"New analysis request for {request.linkedin_url}", {
        "unique_id": state["unique_id"],
        "target_group": request.target_group,
    })
    
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
async def get_status(unique_id: str, force_sheets: bool = False):
    """
    Check the status of an analysis.
    
    CACHE-FIRST: Returns from in-memory cache for fast polling.
    Only hits Sheets on explicit request (force_sheets=true) for recovery.
    """
    state = None
    from_cache = False
    
    # Always check cache first (hot path - no Sheets read)
    if unique_id in _status_cache:
        state = _status_cache[unique_id]
        from_cache = True
    elif force_sheets:
        # Only hit Sheets if explicitly requested (cache miss recovery)
        try:
            sheets = get_sheets_service()
            result = sheets.find_profile_by_unique_id(unique_id)
            if result:
                _, data = result
                state = data
                # Store in cache for future requests
                _status_cache[unique_id] = state
        except Exception as e:
            log_error("status", f"Sheets read failed (rate limit?): {str(e)[:100]}")
            # Don't fail - just return not found
            pass
    
    # Debug logging for status check
    if state:
        log_info("status", f"Status check for {unique_id}", {
            "scrape_status": state.get("scrape_status"),
            "ai_status": state.get("ai_scoring_status"),
            "has_scores": state.get("scores") is not None,
            "progress": state.get("progress_percent", 0)
        })
    
    if not state:
        # Return "not found" status instead of raising exception
        # This prevents 404 spam in logs
        return StatusResponse(
            unique_id=unique_id,
            customer_id=None,
            scrape_status="not_found",
            payment_status="pending",
            current_step="unknown",
            progress_percent=0,
            error_message="Analysis not found in cache. Try force_sheets=true to check storage.",
        )
    
    # Calculate progress
    scrape_status = state.get("scrape_status", "pending")
    payment_status = state.get("payment_status", "pending")
    ai_status = state.get("ai_scoring_status", "")
    error_message = state.get("error_message")
    
    # Determine current step and progress
    if scrape_status == "failed":
        current_step = "failed"
        progress = 0
    elif scrape_status == "completed" and ai_status == "completed":
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
        error_message=error_message,
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
    
    # Find profile info (fetch from Profile Information sheet)
    profile_info = None
    pi_sheet = sheets._get_sheet("Profile Information")
    all_values = pi_sheet.get_all_values()
    for idx, row in enumerate(all_values):
        # Customer ID is column 1 (index 0)
        if len(row) > 0 and row[0] == customer_id:
            profile_info = sheets.get_profile_info(idx + 1)
            break
    
    # Build profile dict with actual data or fallback
    if profile_info and profile_info.get("first_name"):
        full_name = f"{profile_info.get('first_name', '')} {profile_info.get('last_name', '')}".strip()
        profile = {
            "name": full_name or customer_id,
            "initial": full_name[0].upper() if full_name else customer_id[0].upper(),
            "url": profile_info.get("linkedin_url", ""),
        }
    else:
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
    score = scoring.get("profile_pic_score", 0)
    sections.append(SectionScore(
        id="profile-photo",
        title="Profile Photo",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("profile_pic_reasoning"),
    ))
    
    # Cover Photo
    score = scoring.get("cover_picture_score", 0)
    sections.append(SectionScore(
        id="cover-photo",
        title="Cover Photo",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("cover_picture_reasoning"),
    ))
    
    # Headline
    score = scoring.get("headline_score", 0)
    sections.append(SectionScore(
        id="headline",
        title="Headline",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("headline_reasoning"),
        tags=["Keywords", "Value Proposition", "Clarity"],
    ))
    
    # About
    score = scoring.get("about_score", 0)
    sections.append(SectionScore(
        id="about",
        title="About",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("about_reasoning"),
        tags=["Storytelling", "Keywords", "Call to Action"],
    ))
    
    # Experience
    score = scoring.get("experience_score", 0)
    sections.append(SectionScore(
        id="experience",
        title="Experience",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("experience_reasoning"),
    ))
    
    # Education
    score = scoring.get("education_score", 0)
    sections.append(SectionScore(
        id="education",
        title="Education",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("education_reasoning"),
    ))
    
    # Skills
    score = scoring.get("skills_score", 0)
    sections.append(SectionScore(
        id="skills",
        title="Skills",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("skills_reasoning"),
    ))
    
    # Connections
    score = scoring.get("connection_score", 0)
    sections.append(SectionScore(
        id="connections",
        title="Connections",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("connection_reasoning"),
    ))
    
    # Followers
    score = scoring.get("follower_score", 0)
    sections.append(SectionScore(
        id="followers",
        title="Followers",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("follower_reasoning"),
    ))
    
    # Licenses & Certifications
    score = scoring.get("licenses_certs_score", 0)
    sections.append(SectionScore(
        id="certifications",
        title="Licenses & Certifications",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis=scoring.get("licenses_certs_reasoning"),
    ))
    
    # Is Verified
    score = scoring.get("verified_score", 0)
    sections.append(SectionScore(
        id="verified",
        title="Is Verified",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis="LinkedIn verification badge indicates authenticity and builds trust with recruiters.",
    ))
    
    # Is Premium
    score = scoring.get("premium_score", 0)
    sections.append(SectionScore(
        id="premium",
        title="Is Premium",
        score=score,
        max_score=10,
        status=get_status(score, 10),
        analysis="LinkedIn Premium provides additional visibility and InMail features beneficial for job seekers.",
    ))
    
    # Determine grade based on final_score
    overall_score = scoring.get("final_score", 0)
    if overall_score >= 80:
        grade = "EXCELLENT"
    elif overall_score >= 60:
        grade = "GOOD"
    elif overall_score >= 40:
        grade = "AVERAGE"
    else:
        grade = "NEEDS WORK"
    
    # Top priorities based on lowest scoring sections
    section_scores = [(s.title, s.score, s.max_score) for s in sections]
    sorted_sections = sorted(section_scores, key=lambda x: x[1]/x[2] if x[2] > 0 else 0)
    top_priorities = [f"Improve {s[0]}" for s in sorted_sections[:3]]
    
    return ReportResponse(
        customer_id=customer_id,
        profile=profile,
        overall_score=overall_score,
        grade_label=grade,
        executive_summary=scoring.get("final_score_reasoning", ""),
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


# === Pre-Scoring Endpoints ===

@router.get("/pre-scores/{customer_id}")
async def get_customer_pre_scores(customer_id: str, persona: str = "big_company_recruiter"):
    """
    Get deterministic pre-scores for a customer.
    
    Uses rule-based scoring (no AI API call).
    """
    sheets = get_sheets_service()
    
    # Find profile info
    result = sheets.find_profile_by_unique_id(customer_id)
    if not result:
        # Try finding by customer_id in scoring sheet
        scoring_result = sheets.find_scoring_by_customer_id(customer_id)
        if not scoring_result:
            raise HTTPException(status_code=404, detail="Customer not found")
        _, data = scoring_result
        # We need the scraped profile - check cache
        if customer_id in _status_cache:
            profile = _status_cache[customer_id].get("scraped_profile", {})
            linkedin_url = _status_cache[customer_id].get("linkedin_url", "")
        else:
            raise HTTPException(status_code=404, detail="Profile data not found")
    else:
        _, data = result
        # Check cache for scraped profile
        unique_id = data.get("unique_id", customer_id)
        if unique_id in _status_cache:
            profile = _status_cache[unique_id].get("scraped_profile", {})
            linkedin_url = _status_cache[unique_id].get("linkedin_url", "")
        else:
            profile = {}
            linkedin_url = data.get("linkedin_url", "")
    
    if not profile:
        raise HTTPException(status_code=400, detail="No scraped profile available")
    
    try:
        scores = get_pre_scores(
            profile=profile,
            linkedin_url=linkedin_url,
            customer_id=customer_id,
            persona=persona
        )
        return scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/personas", response_model=PersonasResponse)
async def list_personas():
    """
    List all available scoring personas.
    """
    personas = get_all_personas()
    return PersonasResponse(
        personas=[
            PersonaInfo(
                name=p["name"],
                description=p.get("description", "")[:200],  # Truncate long descriptions
                priorities=p.get("priorities", [])[:5]
            )
            for p in personas
        ]
    )


@router.get("/scoring/rules")
async def get_scoring_rules():
    """
    Get loaded scoring rules for debugging.
    """
    from app.scoring.rules import load_rules_file
    from pathlib import Path
    
    rules_dir = Path(__file__).parent.parent / "scoring" / "rules"
    
    return {
        "base_rules": load_rules_file(rules_dir / "base_rules.yaml"),
        "hr_insights": load_rules_file(rules_dir / "hr_insights_compiled.yaml"),
    }


# === Feedback Endpoint ===

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """
    Submit user feedback after analysis.
    
    Stores in Google Sheets Feedback tab.
    """
    sheets = get_sheets_service()
    
    try:
        sheets.create_feedback(
            email=request.email,
            customer_id=request.customer_id,
            would_refer=request.would_refer,
            was_helpful=request.was_helpful,
            suggestions=request.suggestions,
        )
        
        return FeedbackResponse(
            success=True,
            message="Thank you for your feedback!"
        )
    except Exception as e:
        return FeedbackResponse(
            success=False,
            message=f"Failed to save feedback: {str(e)}"
        )


# === Dashboard Stats ===

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get dashboard statistics for DevOps monitoring.
    """
    sheets = get_sheets_service()
    
    try:
        # Get recent activity
        logs = sheets.get_recent_activity_logs(limit=100)
        
        # Calculate stats
        today = date.today().isoformat()
        today_logs = [l for l in logs if l.get("timestamp", "").startswith(today)]
        
        # Get scoring data for average
        # This is a simplified version - in production, query the scoring sheet
        average_score = 0.0
        recent_jobs = []
        
        # Group logs by unique_id for recent jobs
        job_ids = set()
        for log in logs[:20]:
            uid = log.get("unique_id", "")
            if uid and uid not in job_ids and uid != "webhook":
                job_ids.add(uid)
                recent_jobs.append({
                    "unique_id": uid,
                    "customer_id": log.get("customer_id", ""),
                    "event": log.get("event_type", ""),
                    "status": log.get("status", ""),
                    "timestamp": log.get("timestamp", ""),
                })
                if len(recent_jobs) >= 10:
                    break
        
        return DashboardStats(
            total_analyses=len(set(l.get("unique_id") for l in logs if l.get("unique_id"))),
            today_count=len(set(l.get("unique_id") for l in today_logs if l.get("unique_id"))),
            average_score=average_score,
            recent_jobs=recent_jobs,
            service_health={
                "google_sheets": "healthy",
                "scoring_engine": "healthy",
                "apify": "healthy",
            }
        )
    except Exception as e:
        return DashboardStats(
            total_analyses=0,
            today_count=0,
            average_score=0.0,
            recent_jobs=[],
            service_health={
                "google_sheets": "error",
                "error_message": str(e),
            }
        )


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check for all services.
    """
    from app.config import settings
    from app import __version__
    
    health = {
        "status": "healthy",
        "version": __version__,
        "environment": settings.app_env,
        "services": {}
    }
    
    # Check Google Sheets
    try:
        sheets = get_sheets_service()
        sheets._get_client()
        health["services"]["google_sheets"] = {"status": "healthy"}
    except Exception as e:
        health["services"]["google_sheets"] = {"status": "error", "message": str(e)}
        health["status"] = "degraded"
    
    # Check scoring module
    try:
        from app.scoring.personas import list_personas
        personas = list_personas()
        health["services"]["scoring"] = {
            "status": "healthy",
            "personas_loaded": len(personas)
        }
    except Exception as e:
        health["services"]["scoring"] = {"status": "error", "message": str(e)}
        health["status"] = "degraded"
    
    return health


# === PDF Generation (Standalone - NOT part of agent workflow) ===

@router.post("/generate-pdf/{customer_id}")
async def generate_pdf_report(customer_id: str, persona: str = "big_company_recruiter"):
    """
    Generate PDF report for a customer.
    
    This is a STANDALONE endpoint - NOT part of the agentic workflow.
    Called when user clicks "Export Report" button.
    """
    from fastapi.responses import Response
    from app.services.pdf_service import get_pdf_service
    
    sheets = get_sheets_service()
    
    # Get scoring data
    scoring_result = sheets.find_scoring_by_customer_id(customer_id)
    if not scoring_result:
        raise HTTPException(status_code=404, detail="Scoring data not found")
    
    _, scoring_data = scoring_result
    
    # Get profile data from cache or sheets
    profile = {}
    if customer_id in _status_cache:
        profile = _status_cache[customer_id].get("scraped_profile", {})
        linkedin_url = _status_cache[customer_id].get("linkedin_url", "")
    else:
        # Try to find by unique_id
        profile_result = sheets.find_profile_by_unique_id(customer_id)
        if profile_result:
            _, profile_data = profile_result
            profile = {
                "firstName": profile_data.get("first_name", ""),
                "lastName": profile_data.get("last_name", ""),
            }
            linkedin_url = profile_data.get("linkedin_url", "")
        else:
            linkedin_url = ""
    
    # Generate pre-scores if we have profile data
    if profile:
        try:
            scores = get_pre_scores(profile, linkedin_url, customer_id, persona)
        except Exception:
            # Fallback to stored scoring data
            scores = {
                "Final Score": scoring_data.get("overall_score", 5),
                "Headline Score": float(scoring_data.get("headline_score") or 5),
                "About Score": float(scoring_data.get("about_score") or 5),
                "Experience Score": float(scoring_data.get("experience_score") or 5),
                "Connection Score": float(scoring_data.get("connections_score") or 5),
            }
    else:
        # Use stored scoring data
        scores = {
            "Final Score": scoring_data.get("overall_score", 5),
            "Headline Score": float(scoring_data.get("headline_score") or 5),
            "About Score": float(scoring_data.get("about_score") or 5),
            "Experience Score": float(scoring_data.get("experience_score") or 5),
            "Connection Score": float(scoring_data.get("connections_score") or 5),
        }
        profile = {"firstName": customer_id}
    
    # Generate PDF
    pdf_service = get_pdf_service()
    try:
        pdf_bytes, filename = await pdf_service.generate_report(scores, profile, customer_id)
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("/generate-pdf-preview/{customer_id}")
async def preview_pdf_html(customer_id: str, persona: str = "big_company_recruiter"):
    """
    Preview the HTML that would be used for PDF generation.
    
    Useful for testing/debugging the report template.
    """
    from fastapi.responses import HTMLResponse
    from app.services.pdf_service import get_pdf_service
    
    profile = {"firstName": "Preview", "lastName": "User"}
    scores = {
        "Final Score": 7.2,
        "Headline Score": 8.5,
        "Connection Score": 6.0,
        "Follower Score": 5.5,
        "About Score": 7.0,
        "Profile Pic Score": 10.0,
        "Cover_picture Score": 9.0,
        "Experience Score": 7.5,
        "Education Score": 6.0,
        "Skills Score": 6.5,
        "Licenses & Certifications Score": 5.0,
        "Is Verified Score": 10.0,
        "Is Premium Score": 5.0,
    }
    
    pdf_service = get_pdf_service()
    html = pdf_service.generate_report_html(scores, profile, customer_id)
    
    return HTMLResponse(content=html)


@router.get("/debug/cache/{unique_id}")
async def debug_get_cache(unique_id: str):
    """Debug endpoint to view cached scores for a workflow."""
    if unique_id not in _status_cache:
        raise HTTPException(status_code=404, detail="Not in cache")
    
    state = _status_cache[unique_id]
    return {
        "unique_id": unique_id,
        "customer_id": state.get("customer_id"),
        "scrape_status": state.get("scrape_status"),
        "ai_scoring_status": state.get("ai_scoring_status"),
        "scores": state.get("scores", {}),
        "section_scores": state.get("section_scores", {}),
        "section_analyses": state.get("section_analyses", {}),
        "executive_summary": state.get("executive_summary"),
    }
