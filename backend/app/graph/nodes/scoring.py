"""
Scoring Node

Runs AI-powered scoring on the scraped profile.
Uses prompts aligned with app/scoring/ rubric.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.services.openai_scoring import get_scoring_service


def ai_scoring(state: LinkifyState) -> LinkifyState:
    """
    Run AI scoring on the scraped profile.
    
    Input: scraped_profile, target_group, linkedin_url
    Output: scores with section scores and reasonings
    """
    # Import routes to update cache for real-time status updates
    from app.api.routes import _status_cache
    
    sheets = get_sheets_service()
    scoring_service = get_scoring_service()
    
    # Update cache immediately to indicate AI scoring has started
    unique_id = state.get("unique_id")
    if unique_id:
        _status_cache[unique_id] = {
            **state,
            "ai_scoring_status": "scoring",  # Intermediate status
            "scrape_status": "completed",
        }
    
    scraped_profile = state.get("scraped_profile")
    if not scraped_profile:
        error_message = "No scraped profile data available for scoring"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="ai_scoring",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "ai_scoring_status": "failed",
            "error_message": error_message,
        }
    
    target_group = state.get("target_group", "recruiters")
    linkedin_url = state.get("linkedin_url", "")
    
    try:
        # Run the scoring with linkedin_url
        scores = scoring_service.score_profile(
            scraped_profile, 
            target_group,
            linkedin_url=linkedin_url
        )
        
        # Extract cumulative score from new schema
        overall_score = scores.get("Cumulative Sum of Score(100)", 0)
        executive_summary = scores.get("Cumulative Sum Reasoning", "")
        
        # Build section scores dict from new schema
        section_scores = {
            "headline": scores.get("Headline Score", 0),
            "connections": scores.get("Connection Count Score", 0),
            "followers": scores.get("Follower Count Score", 0),
            "about": scores.get("About Score", 0),
            "profile_pic": scores.get("Profile Pic Score", 0),
            "cover_picture": scores.get("Cover_picture Score", 0),
            "experience": scores.get("Experience Score", 0),
            "education": scores.get("Education Score", 0),
            "skills": scores.get("Skills Score", 0),
            "licenses_certs": scores.get("Licenses & Certifications Score", 0),
            "verified": scores.get("is Verified Score", 0),
            "premium": scores.get("is Premium Score", 0),
        }
        
        # Build section analyses/reasoning dict from new schema
        section_analyses = {
            "headline": scores.get("Headline Reasoning", ""),
            "connections": scores.get("Connection Reasoning", ""),
            "followers": scores.get("Follower Reasoning", ""),
            "about": scores.get("About Reasoning", ""),
            "profile_pic": scores.get("Profile Pic Reasoning", ""),
            "cover_picture": scores.get("Cover_picture Reasoning", ""),
            "experience": scores.get("Experience Reasoning", ""),
            "education": scores.get("Education Reasoning", ""),
            "skills": scores.get("Skills Reasoning", ""),
            "licenses_certs": scores.get("Licenses & Certifications Reasoning", ""),
        }
        
    except Exception as e:
        error_message = f"AI scoring failed: {str(e)}"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="ai_scoring",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "ai_scoring_status": "failed",
            "error_message": error_message,
        }
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="ai_scoring",
        status="success",
        message=f"Scoring complete. Overall score: {overall_score}/100",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "ai_scoring",
        "status": "success",
        "message": f"Scoring complete. Overall score: {overall_score}/100",
    })
    
    return {
        **state,
        "scores": scores,  # Full AI response with all scores and reasonings
        "executive_summary": executive_summary,
        "section_scores": section_scores,
        "section_analyses": section_analyses,
        "ai_scoring_status": "completed",
        "activity_log": activity_log,
    }
