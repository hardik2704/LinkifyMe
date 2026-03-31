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
    PaymentConfirmRequest,
    FeedbackRequest,
    FeedbackResponse,
    PersonaInfo,
    PersonasResponse,
    DashboardStats,
    # User Account System
    UserInfo,
    AttemptSummary,
    UserAttemptsResponse,
    ScoreComparison,
    ComparisonResponse,
    UserLookupResponse,
)
from app.graph.state import create_initial_state
from app.graph.workflow import get_workflow, get_scrape_only_workflow, get_scoring_only_workflow
from app.services.sheets import get_sheets_service
from app.scoring.calculator import get_pre_scores, get_all_personas
from app.services.logger import get_session_logger, log_info, log_error, log_event


router = APIRouter()


# In-memory store for quick status lookups (in production, use Redis/DB)
_status_cache: dict[str, dict] = {}


def run_workflow_background(state: dict, scrape_only: bool = False):
    """Run the workflow in background.
    
    Args:
        state: The workflow state dict
        scrape_only: If True, only run scraping (before payment).
                     If False, run the full workflow.
    """
    unique_id = state.get("unique_id", "unknown")
    linkedin_url = state.get("linkedin_url", "")
    mode = "scrape-only" if scrape_only else "full"
    
    log_event("workflow", "started", f"Starting {mode} workflow for {unique_id}", {
        "linkedin_url": linkedin_url,
        "mode": mode,
    })
    
    try:
        if scrape_only:
            workflow = get_scrape_only_workflow()
        else:
            workflow = get_workflow()
        final_state = workflow.invoke(state)
        
        # Update cache with final state
        _status_cache[unique_id] = final_state
        
        log_event("workflow", "completed", f"{mode} workflow completed for {unique_id}", {
            "scrape_status": final_state.get("scrape_status"),
            "has_scores": final_state.get("scores") is not None,
        })
        
    except Exception as e:
        log_error("workflow", f"{mode} workflow failed for {unique_id}: {str(e)}")
        _status_cache[unique_id] = {
            **state,
            "error_message": str(e),
            "scrape_status": "failed",
        }


def run_scoring_background(state: dict):
    """Run the AI scoring workflow on already-scraped data."""
    unique_id = state.get("unique_id", "unknown")
    
    log_event("workflow", "scoring_started", f"Starting AI scoring for {unique_id}")
    
    try:
        scoring_workflow = get_scoring_only_workflow()
        final_state = scoring_workflow.invoke(state)
        
        # Update cache with final state
        _status_cache[unique_id] = final_state
        
        log_event("workflow", "scoring_completed", f"AI scoring completed for {unique_id}", {
            "has_scores": final_state.get("scores") is not None,
        })
        
    except Exception as e:
        log_error("workflow", f"AI scoring failed for {unique_id}: {str(e)}")
        _status_cache[unique_id] = {
            **state,
            "error_message": str(e),
            "ai_scoring_status": "failed",
        }


@router.post("/intake", response_model=IntakeResponse)
async def start_intake(
    request: IntakeRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a new LinkedIn profile analysis.
    
    Creates initial records, calls RentBasket API for payment link,
    and starts scraping in the background (before payment).
    AI scoring is deferred until payment is confirmed via /payment/confirm.
    """
    import asyncio
    from app.services.rentbasket import create_lead
    
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
    
    # Check if this is a returning user (quick lookup before workflow starts)
    sheets = get_sheets_service()
    existing_user = sheets.find_user_by_linkedin_url(request.linkedin_url)
    is_returning_user = existing_user is not None
    user_id = existing_user[1]["user_id"] if existing_user else None
    previous_attempts = len(sheets.get_user_attempts(user_id)) if is_returning_user else 0
    
    log_event("intake", "received", f"New analysis request for {request.linkedin_url}", {
        "unique_id": state["unique_id"],
        "target_group": request.target_group,
        "is_returning_user": is_returning_user,
    })
    
    # Store in cache
    _status_cache[state["unique_id"]] = state
    
    # === Call RentBasket API to create lead and get payment link ===
    payment_link = None
    rb_unique_id = None
    
    try:
        # Extract name from LinkedIn URL username as fallback
        # Phone: strip country code prefix for RentBasket API (expects 10-digit mobile)
        phone_digits = request.phone.replace("+", "").replace(" ", "").replace("-", "")
        # If phone has country code (e.g., +911234567890), try to extract last 10 digits
        if len(phone_digits) > 10:
            phone_digits = phone_digits[-10:]
        
        # Use email username as name placeholder since intake form may not have name field
        name = request.email.split("@")[0].replace(".", " ").replace("_", " ").title()
        
        lead_result = await create_lead(
            name=name,
            email=request.email,
            mobile=phone_digits,
        )
        
        payment_link = lead_result.get("payment_link")
        rb_unique_id = lead_result.get("rb_unique_id")
        
        log_event("intake", "payment_link_created", f"Payment link generated for {state['unique_id']}", {
            "rb_unique_id": rb_unique_id,
            "has_payment_link": bool(payment_link),
        })
        
    except Exception as e:
        log_error("intake", f"Failed to create RentBasket lead: {str(e)}")
        # Don't fail the intake — we can still proceed without payment for now
        # In production, this should be a hard failure
    
    # Run SCRAPE-ONLY workflow in background (before payment)
    # AI scoring will be triggered separately after payment confirmation
    background_tasks.add_task(run_workflow_background, state, True)  # scrape_only=True
    
    return IntakeResponse(
        unique_id=state["unique_id"],
        user_id=user_id,
        is_returning_user=is_returning_user,
        previous_attempts_count=previous_attempts,
        message="Welcome back!" if is_returning_user else "Analysis started",
        status="pending",
        payment_link=payment_link,
        rb_unique_id=rb_unique_id,
    )


@router.post("/payment/confirm")
async def confirm_payment(
    request: PaymentConfirmRequest,
    background_tasks: BackgroundTasks,
):
    """
    Confirm payment and trigger AI scoring.
    
    Called by the frontend after the user returns from Razorpay payment.
    Picks up the already-scraped data and runs AI analysis.
    """
    unique_id = request.unique_id
    
    log_event("payment", "confirm_received", f"Payment confirmation for {unique_id}", {
        "payment_status": request.payment_status,
        "rb_unique_id": request.rb_unique_id,
    })
    
    # Get the cached state (should have scraped data)
    state = _status_cache.get(unique_id)
    
    if not state:
        raise HTTPException(status_code=404, detail="Analysis not found. Please start a new analysis.")
    
    if request.payment_status == "failed":
        # Update state with payment failure
        _status_cache[unique_id] = {
            **state,
            "payment_status": "failed",
        }
        return {"status": "payment_failed", "message": "Payment was not completed."}
    
    # Payment succeeded — update state
    state["payment_status"] = "succeeded"
    _status_cache[unique_id] = state
    
    # Check if scraping is done
    scrape_status = state.get("scrape_status", "pending")
    scraped_profile = state.get("scraped_profile")
    
    if scrape_status == "completed" and scraped_profile:
        # Scraping already done — start AI scoring immediately
        log_event("payment", "scoring_triggered", f"Starting AI scoring for {unique_id} (scrape was ready)")
        background_tasks.add_task(run_scoring_background, state)
    elif scrape_status == "failed":
        # Scraping failed — can't proceed
        return {
            "status": "scrape_failed",
            "message": "Profile scraping failed. Please try again.",
        }
    else:
        # Scraping still in progress — start a poller that waits then triggers scoring
        log_event("payment", "waiting_for_scrape", f"Waiting for scrape to complete for {unique_id}")
        background_tasks.add_task(_wait_and_score, unique_id)
    
    return {
        "status": "success",
        "message": "Payment confirmed. AI analysis is starting.",
        "unique_id": unique_id,
    }


def _wait_and_score(unique_id: str):
    """Wait for scraping to complete, then trigger AI scoring."""
    import time
    
    max_wait = 300  # 5 minutes max
    poll_interval = 5  # Check every 5 seconds
    elapsed = 0
    
    while elapsed < max_wait:
        state = _status_cache.get(unique_id, {})
        scrape_status = state.get("scrape_status", "pending")
        scraped_profile = state.get("scraped_profile")
        
        if scrape_status == "completed" and scraped_profile:
            # Scraping done — trigger AI scoring
            log_event("payment", "scrape_ready", f"Scrape completed, starting AI scoring for {unique_id}")
            run_scoring_background(state)
            return
        elif scrape_status == "failed":
            log_error("payment", f"Scrape failed while waiting for {unique_id}")
            return
        
        time.sleep(poll_interval)
        elapsed += poll_interval
    
    log_error("payment", f"Timed out waiting for scrape to complete for {unique_id}")


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
    
    scrape_status = state.get("scrape_status", "pending")
    payment_status = state.get("payment_status", "pending")
    ai_status = state.get("ai_scoring_status", "")
    error_message = state.get("error_message")
    has_scores = state.get("scores") is not None
    persistence_status = state.get("persistence_status", "")
    
    # Determine current step and progress
    if scrape_status == "failed":
        current_step = "failed"
        progress = 0
    elif (scrape_status == "completed" and ai_status == "completed" and persistence_status == "completed") or has_scores:
        # Complete when AI is done AND persistence is finished (or we found scores in Sheets)
        current_step = "complete"
        progress = 100
    elif ai_status == "scoring":
        # AI scoring in progress
        current_step = "scoring"
        progress = 75
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
        attempt_id=state.get("attempt_id"),  # ATT-LM-XXXXX-X for report URL
        scrape_status=scrape_status,
        payment_status=payment_status,
        current_step=current_step,
        progress_percent=progress,
        has_scores=has_scores,
        error_message=error_message,
    )


@router.get("/report/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    """
    Get the full analysis report.
    Accepts attempt_id (ATT-LM-XXXXX-X) - this is the primary lookup key now.
    """
    sheets = get_sheets_service()
    
    # Use get_scores_by_attempt_id for lookup (attempt_id is column 2)
    scoring = sheets.get_scores_by_attempt_id(report_id)
    if not scoring:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Get user_id from scoring (now column 1)
    user_id = scoring.get("user_id", "")
    
    # Find profile info by user_id (column 1 in Profile Information)
    profile_info = None
    pi_sheet = sheets._get_sheet("Profile Information")
    all_values = pi_sheet.get_all_values()
    for idx, row in enumerate(all_values):
        # User ID is column 1 (index 0), Attempt ID is column 2 (index 1)
        # Match by attempt_id first for accurate profile fetch
        if len(row) > 1 and row[1] == report_id:
            profile_info = sheets.get_profile_info(idx + 1)
            break

    
    # Build profile dict with actual data or fallback
    if profile_info and profile_info.get("first_name"):
        full_name = f"{profile_info.get('first_name', '')} {profile_info.get('last_name', '')}".strip()
        profile = {
            "name": full_name or user_id,
            "initial": full_name[0].upper() if full_name else (user_id[0].upper() if user_id else "?"),
            "url": profile_info.get("linkedin_url", ""),
        }
    else:
        profile = {
            "name": user_id or report_id,
            "initial": user_id[0].upper() if user_id else "?",
            "url": "",
        }
    
    # Extract profile photo, cover photo, phone, connection/follower counts
    profile_photo_url = None
    cover_photo_url = None
    phone = None
    connection_count = None
    follower_count = None
    report_generation_minutes = None
    
    if profile_info:
        profile_photo_url = profile_info.get("profile_picture_url") or None
        cover_photo_url = profile_info.get("cover_picture_url") or None
        phone = profile_info.get("phone") or None
        connection_count = profile_info.get("connection_count") or None
        follower_count = profile_info.get("follower_count") or None
        
        # Calculate report generation time
        completed_seconds = scoring.get("completed_within_seconds")
        try:
            if completed_seconds is not None and str(completed_seconds).strip() != "":
                report_generation_minutes = float(completed_seconds) / 60.0
            else:
                date_time_str = profile_info.get("date_time", "")
                scoring_timestamp = scoring.get("timestamp", "")
                if date_time_str and scoring_timestamp:
                    from datetime import datetime as dt
                    try:
                        intake_time = dt.strptime(date_time_str, "%d/%m/%Y, %I:%M:%S %p")
                    except ValueError:
                        intake_time = None
                    try:
                        scoring_time = dt.fromisoformat(scoring_timestamp.replace("Z", "+00:00").replace("+00:00", ""))
                    except ValueError:
                        scoring_time = None
                    
                    if intake_time and scoring_time:
                        delta = (scoring_time - intake_time).total_seconds()
                        report_generation_minutes = round(delta / 60, 2)
                        if report_generation_minutes < 0:
                            report_generation_minutes = None
        except Exception:
            pass
    
    # Build sections
    sections = []
    
    # Helper to determine status
    def get_status(score: float, max_score: int) -> str:
        ratio = score / max_score if max_score > 0 else 0
        if ratio >= 0.7:
            return "optimized"
        elif ratio >= 0.4:
            return "needs_improvement"
        return "critical"
        
    import json
    def safe_parse_json(jstr):
        if not jstr: return []
        try:
            return json.loads(jstr)
        except:
            return []

    def format_experience(exprs):
        if not exprs: return None
        if isinstance(exprs, str): exprs = safe_parse_json(exprs)
        text_items = []
        for exp in exprs[:5]:
            company = exp.get("companyName", "") or exp.get("subtitle", "") or (exp.get("company", {}).get("name", "") if isinstance(exp.get("company"), dict) else "")
            nested_positions = exp.get("positions", [])
            if nested_positions:
                for pos in nested_positions[:2]:
                    title = pos.get("title", "")
                    text_items.append(f"• {title} at {company}")
            else:
                title = exp.get("title", "")
                text_items.append(f"• {title} at {company}")
        return "\n".join(text_items) + ("\n..." if len(exprs) > 5 else "") if text_items else None

    def format_education(edus):
        if not edus: return None
        if isinstance(edus, str): edus = safe_parse_json(edus)
        text_items = []
        for ed in edus[:3]:
            deg = ed.get("degreeName", "")
            school = ed.get("schoolName", "") or ed.get("title", "")
            if deg and school: text_items.append(f"• {deg} from {school}")
            elif school: text_items.append(f"• {school}")
        return "\n".join(text_items) + ("\n..." if len(edus) > 3 else "") if text_items else None

    def format_skills(skills):
        if not skills: return None
        if isinstance(skills, str): skills = safe_parse_json(skills)
        skill_names = []
        for s in skills:
            if isinstance(s, dict):
                skill_names.append(str(s.get("name", "")))
            else:
                skill_names.append(str(s))
        skill_names = [s for s in skill_names if s]
        return ", ".join(skill_names[:15]) + ("..." if len(skill_names) > 15 else "") if skill_names else None

    def format_certs(certs):
        if not certs: return None
        if isinstance(certs, str): certs = safe_parse_json(certs)
        text_items = []
        for c in certs[:4]:
            name = c.get("name", "") or c.get("title", "")
            org = c.get("authority", "") or c.get("subtitle", "")
            if name and org: text_items.append(f"• {name} ({org})")
            elif name: text_items.append(f"• {name}")
        return "\n".join(text_items) + ("\n..." if len(certs) > 4 else "") if text_items else None
    
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
        current_status=profile_info.get("headline") if profile_info else None,
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
        current_status=profile_info.get("about") if profile_info else None,
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
        current_status=format_experience(profile_info.get("experience_json")) if profile_info else None,
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
        current_status=format_education(profile_info.get("education_json")) if profile_info else None,
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
        current_status=format_skills(profile_info.get("skills_json")) if profile_info else None,
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
        current_status=format_certs(profile_info.get("certifications_json")) if profile_info else None,
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
    section_scores = []
    for s in sections:
        priority_score = s.score / s.max_score if s.max_score > 0 else 0
        # Heavily deprioritize "Is Premium" unless it's the only one
        if s.id == "premium":
            priority_score += 10.0
        section_scores.append((s, priority_score))
        
    sorted_sections = sorted(section_scores, key=lambda x: x[1])
    
    # Filter out optimized sections, but fallback to them if none are bad
    needs_work = [s[0] for s in sorted_sections if s[0].status != "optimized"]
    if not needs_work:
        needs_work = [s[0] for s in sorted_sections]
        
    top_priorities = [f"Improve {s.title}" for s in needs_work[:3]]
    
    return ReportResponse(
        customer_id=user_id or report_id,  # Using user_id (from scoring) or fallback to report_id
        profile=profile,
        overall_score=overall_score,
        grade_label=grade,
        executive_summary=scoring.get("final_score_reasoning", ""),
        sections=sections,
        top_priorities=top_priorities,
        generated_at=datetime.utcnow(),
        profile_photo_url=profile_photo_url,
        cover_photo_url=cover_photo_url,
        report_generation_minutes=report_generation_minutes,
        connection_count=connection_count,
        follower_count=follower_count,
        phone=phone,
        attempt_id=report_id,
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
    Note: customer_id parameter kept for backward compatibility, but now expects attempt_id.
    """
    sheets = get_sheets_service()
    
    # Find profile info
    result = sheets.find_profile_by_unique_id(customer_id)
    if not result:
        # Try finding by attempt_id in scoring sheet
        scoring_data = sheets.get_scores_by_attempt_id(customer_id)
        if not scoring_data:
            raise HTTPException(status_code=404, detail="Customer not found")
        data = scoring_data
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
    
    # Get scoring data by attempt_id
    scoring_data = sheets.get_scores_by_attempt_id(customer_id)
    if not scoring_data:
        raise HTTPException(status_code=404, detail="Scoring data not found")
    
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


# =============================================================================
# User Account System Endpoints
# =============================================================================

@router.get("/user/lookup", response_model=UserLookupResponse)
async def lookup_user(linkedin_url: str = None, email: str = None):
    """
    Look up an existing user by LinkedIn URL or email.
    
    Returns user info if found, for pre-filling intake forms
    and showing returning user status.
    """
    if not linkedin_url and not email:
        raise HTTPException(
            status_code=400,
            detail="Either linkedin_url or email must be provided"
        )
    
    sheets = get_sheets_service()
    
    # Try LinkedIn URL first (primary identifier)
    result = None
    if linkedin_url:
        result = sheets.find_user_by_linkedin_url(linkedin_url)
    
    # Fall back to email
    if not result and email:
        result = sheets.find_user_by_email(email)
    
    if result:
        _, user_data = result
        return UserLookupResponse(
            found=True,
            user=UserInfo(
                user_id=user_data["user_id"],
                linkedin_url=user_data["linkedin_url"],
                email=user_data["email"],
                phone=user_data.get("phone"),
                name=user_data.get("name"),
                total_attempts=len(sheets.get_user_attempts(user_data["user_id"])),
                last_attempt_at=user_data.get("last_attempt_at"),
                created_at=user_data.get("created_at"),
            ),
            message="User found"
        )
    
    return UserLookupResponse(
        found=False,
        user=None,
        message="No user found with provided credentials"
    )


@router.get("/user/{user_id}/attempts", response_model=UserAttemptsResponse)
async def get_user_attempts(user_id: str):
    """
    Get attempt history for a user.
    
    Returns all analysis attempts (newest first) with scores.
    """
    sheets = get_sheets_service()
    
    # Get user info
    user_data = sheets.get_user(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    # Get attempts
    attempts = sheets.get_user_attempts(user_id)
    
    return UserAttemptsResponse(
        user=UserInfo(
            user_id=user_data["user_id"],
            linkedin_url=user_data["linkedin_url"],
            email=user_data["email"],
            phone=user_data.get("phone"),
            name=user_data.get("name"),
            total_attempts=len(attempts),
            last_attempt_at=user_data.get("last_attempt_at"),
            created_at=user_data.get("created_at"),
        ),
        attempts=[
            AttemptSummary(
                attempt_id=a["attempt_id"],
                customer_id=a["customer_id"],
                final_score=a["final_score"],
                timestamp=a["timestamp"],
                linkedin_url=a["linkedin_url"],
                first_name=a.get("first_name"),
                status=a.get("status"),
            )
            for a in attempts
        ]
    )


@router.get("/comparison/{current_attempt_id}/{previous_attempt_id}", response_model=ComparisonResponse)
async def compare_attempts(current_attempt_id: str, previous_attempt_id: str):
    """
    Compare two analysis attempts to show score progression.
    
    Returns section-by-section comparison with delta indicators.
    """
    sheets = get_sheets_service()
    
    # Get scoring data for both attempts
    current_scoring = sheets.get_scores_by_attempt_id(current_attempt_id)
    previous_scoring = sheets.get_scores_by_attempt_id(previous_attempt_id)
    
    if not current_scoring:
        raise HTTPException(
            status_code=404,
            detail=f"Current attempt {current_attempt_id} not found"
        )
    if not previous_scoring:
        raise HTTPException(
            status_code=404,
            detail=f"Previous attempt {previous_attempt_id} not found"
        )
    
    # Build section comparisons
    sections_to_compare = [
        ("profile_picture", "Profile Picture"),
        ("cover_image", "Cover Image"),
        ("headline", "Headline"),
        ("about", "About Section"),
        ("experience", "Experience"),
        ("education", "Education"),
        ("skills", "Skills"),
        ("connections", "Connections"),
        ("recommendations", "Recommendations"),
    ]
    
    comparisons = []
    for section_key, section_name in sections_to_compare:
        curr_score = current_scoring.get(f"{section_key}_score", 0) or 0
        prev_score = previous_scoring.get(f"{section_key}_score", 0) or 0
        delta = curr_score - prev_score
        
        if delta > 0:
            direction = "improved"
        elif delta < 0:
            direction = "declined"
        else:
            direction = "unchanged"
        
        comparisons.append(ScoreComparison(
            section=section_name,
            current_score=curr_score,
            previous_score=prev_score,
            delta=delta,
            change_direction=direction,
        ))
    
    # Overall delta
    curr_total = current_scoring.get("final_score", 0) or 0
    prev_total = previous_scoring.get("final_score", 0) or 0
    overall_delta = curr_total - prev_total
    
    # Generate summary
    improved = sum(1 for c in comparisons if c.change_direction == "improved")
    declined = sum(1 for c in comparisons if c.change_direction == "declined")
    
    if overall_delta > 0:
        summary = f"Overall improvement of {overall_delta} points! {improved} sections improved."
    elif overall_delta < 0:
        summary = f"Score decreased by {abs(overall_delta)} points. {declined} sections need attention."
    else:
        summary = "No overall change in score between attempts."
    
    return ComparisonResponse(
        current_attempt=AttemptSummary(
            attempt_id=current_attempt_id,
            customer_id=current_scoring.get("customer_id", ""),
            final_score=curr_total,
            timestamp=current_scoring.get("timestamp", ""),
            linkedin_url=current_scoring.get("linkedin_url", ""),
            first_name=current_scoring.get("first_name"),
        ),
        previous_attempt=AttemptSummary(
            attempt_id=previous_attempt_id,
            customer_id=previous_scoring.get("customer_id", ""),
            final_score=prev_total,
            timestamp=previous_scoring.get("timestamp", ""),
            linkedin_url=previous_scoring.get("linkedin_url", ""),
            first_name=previous_scoring.get("first_name"),
        ),
        overall_delta=overall_delta,
        sections=comparisons,
        summary=summary,
    )
