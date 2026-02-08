"""
Scoring Node

Runs DETERMINISTIC scoring on the scraped profile.
Uses rule-based scorers from app/scoring/sections/ for strict, predictable scores.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.scoring.calculator import get_pre_scores


def ai_scoring(state: LinkifyState) -> LinkifyState:
    """
    Run DETERMINISTIC scoring on the scraped profile.
    
    Uses rule-based scorers from app/scoring/sections/ - no AI randomness.
    
    Input: scraped_profile, target_group, linkedin_url, customer_id
    Output: scores with section scores and reasonings
    """
    # Import routes to update cache for real-time status updates
    from app.api.routes import _status_cache
    
    sheets = get_sheets_service()
    
    # Update cache immediately to indicate scoring has started
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
            event_type="deterministic_scoring",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "ai_scoring_status": "failed",
            "error_message": error_message,
        }
    
    # Map target_group to persona
    target_group = state.get("target_group", "recruiters")
    persona_map = {
        "recruiters": "big_company_recruiter",
        "vcs": "vc",
        "founders": "personal_brand_pros",
    }
    persona = persona_map.get(target_group, "big_company_recruiter")
    
    linkedin_url = state.get("linkedin_url", "")
    customer_id = state.get("customer_id", "")
    
    try:
        # Run DETERMINISTIC scoring using rule-based scorers
        scores = get_pre_scores(
            profile=scraped_profile,
            linkedin_url=linkedin_url,
            customer_id=customer_id,
            persona=persona
        )
        
        # Map output format to match expected schema
        # The persist node expects keys like "Headline Score", "is Premium Score", etc.
        formatted_scores = {
            "LinkedIn URL": linkedin_url,
            "Headline Score": scores.get("Headline Score", 0),
            "Connection Count Score": scores.get("Connection Score", 0),
            "Follower Count Score": scores.get("Follower Score", 0),
            "About Score": scores.get("About Score", 0),
            "Profile Pic Score": scores.get("Profile Pic Score", 0),
            "Cover_picture Score": scores.get("Cover_picture Score", 0),
            "Experience Score": scores.get("Experience Score", 0),
            "Education Score": scores.get("Education Score", 0),
            "Skills Score": scores.get("Skills Score", 0),
            "Licenses & Certifications Score": scores.get("Licenses & Certifications Score", 0),
            "is Verified Score": scores.get("Is Verified Score", 0),
            "is Premium Score": scores.get("Is Premium Score", 0),
            "Cumulative Sum of Score(100)": scores.get("Final Score", 0),
            # Reasonings from debug info
            "Headline Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("headline", {}).get("reasons", [])),
            "Connection Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("connections", {}).get("reasons", [])),
            "Follower Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("followers", {}).get("reasons", [])),
            "About Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("about", {}).get("reasons", [])),
            "Profile Pic Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("profile_pic", {}).get("reasons", [])),
            "Cover_picture Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("cover_picture", {}).get("reasons", [])),
            "Experience Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("experience", {}).get("reasons", [])),
            "Education Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("education", {}).get("reasons", [])),
            "Skills Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("skills", {}).get("reasons", [])),
            "Licenses & Certifications Reasoning": "; ".join(scores.get("_debug", {}).get("sections", {}).get("licenses_certs", {}).get("reasons", [])),
            "Cumulative Sum Reasoning": f"Deterministic scoring using {persona} persona. Quality gates: {'; '.join(scores.get('_debug', {}).get('quality_gates_applied', []) or ['None'])}",
        }
        
        overall_score = formatted_scores["Cumulative Sum of Score(100)"]
        executive_summary = formatted_scores["Cumulative Sum Reasoning"]
        
        # Build section scores dict
        section_scores = {
            "headline": formatted_scores["Headline Score"],
            "connections": formatted_scores["Connection Count Score"],
            "followers": formatted_scores["Follower Count Score"],
            "about": formatted_scores["About Score"],
            "profile_pic": formatted_scores["Profile Pic Score"],
            "cover_picture": formatted_scores["Cover_picture Score"],
            "experience": formatted_scores["Experience Score"],
            "education": formatted_scores["Education Score"],
            "skills": formatted_scores["Skills Score"],
            "licenses_certs": formatted_scores["Licenses & Certifications Score"],
            "verified": formatted_scores["is Verified Score"],
            "premium": formatted_scores["is Premium Score"],
        }
        
        # Build section analyses/reasoning dict
        section_analyses = {
            "headline": formatted_scores["Headline Reasoning"],
            "connections": formatted_scores["Connection Reasoning"],
            "followers": formatted_scores["Follower Reasoning"],
            "about": formatted_scores["About Reasoning"],
            "profile_pic": formatted_scores["Profile Pic Reasoning"],
            "cover_picture": formatted_scores["Cover_picture Reasoning"],
            "experience": formatted_scores["Experience Reasoning"],
            "education": formatted_scores["Education Reasoning"],
            "skills": formatted_scores["Skills Reasoning"],
            "licenses_certs": formatted_scores["Licenses & Certifications Reasoning"],
        }
        
    except Exception as e:
        error_message = f"Deterministic scoring failed: {str(e)}"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="deterministic_scoring",
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
        event_type="deterministic_scoring",
        status="success",
        message=f"Deterministic scoring complete. Overall score: {overall_score}/100 (persona: {persona})",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "deterministic_scoring",
        "status": "success",
        "message": f"Scoring complete. Overall score: {overall_score}/100",
    })
    
    return {
        **state,
        "scores": formatted_scores,  # Full response with all scores and reasonings
        "executive_summary": executive_summary,
        "section_scores": section_scores,
        "section_analyses": section_analyses,
        "ai_scoring_status": "completed",
        "activity_log": activity_log,
    }
