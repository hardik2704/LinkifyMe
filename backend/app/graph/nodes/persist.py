"""
Persist Node

Writes scores to the Profile Scoring sheet.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def write_scores(state: LinkifyState) -> LinkifyState:
    """
    Write scoring results to the Profile Scoring sheet.
    
    Input: scores, ps_row, customer_id
    Output: Sheet updated with scoring data
    """
    sheets = get_sheets_service()
    
    scores = state.get("scores", {})
    ps_row = state.get("ps_row")
    
    if not ps_row:
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="write_scores",
            status="error",
            message="No Profile Scoring row found",
        )
        return state
    
    # Extract section data
    sections = scores.get("sections", {})
    
    # Build update dict
    update_data = {
        "overall_score": scores.get("overall_score", 0),
        "executive_summary": scores.get("executive_summary", ""),
        "headline_score": sections.get("headline", {}).get("score", 0),
        "headline_analysis": sections.get("headline", {}).get("analysis", ""),
        "about_score": sections.get("about", {}).get("score", 0),
        "about_analysis": sections.get("about", {}).get("analysis", ""),
        "experience_score": sections.get("experience", {}).get("score", 0),
        "experience_analysis": sections.get("experience", {}).get("analysis", ""),
        "connections_score": sections.get("connections", {}).get("score", 0),
        "connections_analysis": sections.get("connections", {}).get("analysis", ""),
        "profile_photo_score": sections.get("profile_photo", {}).get("score", 0),
        "profile_photo_analysis": sections.get("profile_photo", {}).get("analysis", ""),
        "ai_rewrites_json": {
            "headline": sections.get("headline", {}).get("ai_rewrite", ""),
            "about": sections.get("about", {}).get("ai_rewrite", ""),
        },
        "scoring_status": "completed",
        "scored_at": datetime.utcnow().isoformat(),
    }
    
    sheets.update_profile_scoring(ps_row, update_data)
    
    # Also update PI sheet scrape status to completed
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {"scrape_status": "completed"})
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="write_scores",
        status="success",
        message=f"Scores written to sheet. Overall: {scores.get('overall_score', 0)}/100",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "write_scores",
        "status": "success",
        "message": "Scores written to Google Sheets",
    })
    
    return {
        **state,
        "activity_log": activity_log,
    }
