"""
Persist Node

Writes scores to the Profile Scoring sheet.
Uses the new flat scoring format from openai_scoring.py.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def write_scores(state: LinkifyState) -> LinkifyState:
    """
    Write scoring results to the Profile Scoring sheet.
    
    Uses the new flat format with section scores and reasonings.
    
    Input: scores, ps_row, customer_id, scraped_profile
    Output: Sheet updated with scoring data
    """
    sheets = get_sheets_service()
    
    scores = state.get("scores", {})
    ps_row = state.get("ps_row")
    scraped_profile = state.get("scraped_profile", {})
    
    if not ps_row:
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="write_scores",
            status="error",
            message="No Profile Scoring row found",
        )
        return state
    
    # Extract data from new flat format
    # Scores come directly from the AI response with keys like "Headline Score"
    linkedin_url = scores.get("LinkedIn URL", state.get("linkedin_url", ""))
    first_name = scraped_profile.get("firstName", "")
    
    # Build update dict matching the new column structure
    update_data = {
        "customer_id": state.get("customer_id", ""),
        "linkedin_url": linkedin_url,
        "first_name": first_name,
        # Section scores
        "headline_score": scores.get("Headline Score", 0),
        "connection_score": scores.get("Connection Count Score", 0),
        "follower_score": scores.get("Follower Count Score", 0),
        "about_score": scores.get("About Score", 0),
        "profile_pic_score": scores.get("Profile Pic Score", 0),
        "cover_picture_score": scores.get("Cover_picture Score", 0),
        "experience_score": scores.get("Experience Score", 0),
        "education_score": scores.get("Education Score", 0),
        "skills_score": scores.get("Skills Score", 0),
        "licenses_certs_score": scores.get("Licenses & Certifications Score", 0),
        "verified_score": scores.get("is Verified Score", 0),
        "premium_score": scores.get("is Premium Score", 0),
        "final_score": scores.get("Cumulative Sum of Score(100)", 0),
        # Section reasonings
        "headline_reasoning": scores.get("Headline Reasoning", ""),
        "connection_reasoning": scores.get("Connection Reasoning", ""),
        "follower_reasoning": scores.get("Follower Reasoning", ""),
        "about_reasoning": scores.get("About Reasoning", ""),
        "profile_pic_reasoning": scores.get("Profile Pic Reasoning", ""),
        "cover_picture_reasoning": scores.get("Cover_picture Reasoning", ""),
        "experience_reasoning": scores.get("Experience Reasoning", ""),
        "education_reasoning": scores.get("Education Reasoning", ""),
        "skills_reasoning": scores.get("Skills Reasoning", ""),
        "licenses_certs_reasoning": scores.get("Licenses & Certifications Reasoning", ""),
        "final_score_reasoning": scores.get("Cumulative Sum Reasoning", ""),
        # Metadata
        "timestamp": datetime.utcnow().isoformat(),
        "completion_status": "completed",
    }
    
    sheets.update_profile_scoring(ps_row, update_data)
    
    # Also update PI sheet scrape status to completed
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {"scrape_status": "completed"})
    
    # Log the activity
    final_score = scores.get("Cumulative Sum of Score(100)", 0)
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="write_scores",
        status="success",
        message=f"Scores written to sheet. Final Score: {final_score}/100",
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
