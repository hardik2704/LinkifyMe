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
    Calculates weighted final score and builds Remarks with contribution breakdown.
    
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
    linkedin_url = scores.get("LinkedIn URL", state.get("linkedin_url", ""))
    first_name = scraped_profile.get("firstName", "")
    
    # Get all section scores (each is 1-10 scale)
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
        "certifications": scores.get("Licenses & Certifications Score", 0),
        "verified": scores.get("is Verified Score", 0),
        "premium": scores.get("is Premium Score", 0),
    }
    
    # Weightages for each section (must sum to 100%)
    # These determine contribution to the final 100-point score
    WEIGHTS = {
        "headline": 10,       # 10% -> max 10 pts
        "connections": 5,     # 5% -> max 5 pts
        "followers": 5,       # 5% -> max 5 pts
        "about": 15,          # 15% -> max 15 pts
        "profile_pic": 10,    # 10% -> max 10 pts
        "cover_picture": 5,   # 5% -> max 5 pts
        "experience": 20,     # 20% -> max 20 pts
        "education": 10,      # 10% -> max 10 pts
        "skills": 10,         # 10% -> max 10 pts
        "certifications": 5,  # 5% -> max 5 pts
        "verified": 3,        # 3% -> max 3 pts
        "premium": 2,         # 2% -> max 2 pts
    }  # Total: 100%
    
    # Calculate weighted contributions for each section
    contributions = []
    total_weighted_score = 0
    
    # Display names for cleaner output
    display_names = {
        "headline": "Headline",
        "connections": "Connections",
        "followers": "Followers",
        "about": "About",
        "profile_pic": "Profile Pic",
        "cover_picture": "Cover Photo",
        "experience": "Experience",
        "education": "Education",
        "skills": "Skills",
        "certifications": "Certifications",
        "verified": "Verified",
        "premium": "Premium",
    }
    
    for section, weight in WEIGHTS.items():
        raw_score = section_scores.get(section, 0)
        # Normalize: (score/10) * weight = contribution to 100
        # e.g., 8/10 * 20 weight = 16 points contributed
        contribution = (raw_score / 10) * weight
        total_weighted_score += contribution
        contributions.append(f"{display_names[section]}: {raw_score}/10 → {contribution:.1f}pts")
    
    # Round the final score
    final_weighted_score = round(total_weighted_score)
    
    # Build Remarks string with breakdown
    remarks = f"Weighted Score: {final_weighted_score}/100 | " + " | ".join(contributions)
    
    # Build update dict matching the column structure
    update_data = {
        "customer_id": state.get("customer_id", ""),
        "attempt_id": state.get("attempt_id", ""),
        "linkedin_url": linkedin_url,
        "first_name": first_name,
        # Section scores (all /10)
        "headline_score": section_scores["headline"],
        "connection_score": section_scores["connections"],
        "follower_score": section_scores["followers"],
        "about_score": section_scores["about"],
        "profile_pic_score": section_scores["profile_pic"],
        "cover_picture_score": section_scores["cover_picture"],
        "experience_score": section_scores["experience"],
        "education_score": section_scores["education"],
        "skills_score": section_scores["skills"],
        "licenses_certs_score": section_scores["certifications"],
        "verified_score": section_scores["verified"],
        "premium_score": section_scores["premium"],
        # Use weighted final score instead of AI cumulative sum
        "final_score": final_weighted_score,
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
        "remarks": remarks,  # Contribution breakdown
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
        message=f"Scores written to sheet. Weighted Final Score: {final_weighted_score}/100",
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
        "final_weighted_score": final_weighted_score,
        "activity_log": activity_log,
    }
