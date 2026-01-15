"""
Scoring Node

Runs AI-powered scoring on the scraped profile.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.services.openai_scoring import get_scoring_service


def ai_scoring(state: LinkifyState) -> LinkifyState:
    """
    Run AI scoring on the scraped profile.
    
    Input: scraped_profile, target_group
    Output: scores, executive_summary, section_scores, ai_rewrites
    """
    sheets = get_sheets_service()
    scoring_service = get_scoring_service()
    
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
    
    try:
        # Run the scoring
        scores = scoring_service.score_profile(scraped_profile, target_group)
        
        overall_score = scores.get("overall_score", 0)
        executive_summary = scores.get("executive_summary", "")
        sections = scores.get("sections", {})
        top_priorities = scores.get("top_priorities", [])
        
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
        "scores": scores,
        "executive_summary": executive_summary,
        "section_scores": {k: v.get("score", 0) for k, v in sections.items()},
        "section_analyses": {k: v.get("analysis", "") for k, v in sections.items()},
        "ai_rewrites": {k: v.get("ai_rewrite", "") for k, v in sections.items() if v.get("ai_rewrite")},
        "ai_scoring_status": "completed",
        "activity_log": activity_log,
    }
