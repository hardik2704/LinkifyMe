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
    # Import service
    from app.services.openai_scoring import get_scoring_service
    
    sheets = get_sheets_service()
    
    # Update cache immediately to indicate scoring has started
    unique_id = state.get("unique_id")
    if unique_id:
        _status_cache[unique_id] = {
            **state,
            "ai_scoring_status": "scoring",
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
    
    # Get user info for partial scoring optimization
    user_id = state.get("user_id")
    previous_profile = None
    previous_scores = None
    
    if user_id:
        try:
            # Fetch all attempts
            attempts = sheets.get_user_attempts(user_id)
            if attempts:
                # Get the latest completed attempt (not the current one)
                # Filter out current if it exists (by checking if final_score is > 0 or status is completed)
                valid_attempts = [a for a in attempts if a.get("final_score", 0) > 0]
                
                if valid_attempts:
                    last_attempt = valid_attempts[0] # Sorted newest first
                    attempt_id = last_attempt.get("attempt_id")
                    
                    # Fetch scores
                    previous_scores = sheets.get_scores_by_attempt_id(attempt_id)
                    
                    # Fetch profile
                    raw_prev_profile = sheets.get_profile_by_attempt_id(attempt_id)
                    
                    # Parse JSON strings in previous profile to match scraped_profile structure
                    if raw_prev_profile:
                        import json
                        previous_profile = raw_prev_profile.copy()
                        for key in ["experience_json", "education_json", "skills_json", "certifications_json"]:
                            val = raw_prev_profile.get(key)
                            target_key = key.replace("_json", "") # experience, education...
                            if key == "certifications_json": target_key = "certifications"
                            
                            if val and isinstance(val, str):
                                try:
                                    previous_profile[target_key] = json.loads(val)
                                except:
                                    previous_profile[target_key] = []
                            else:
                                previous_profile[target_key] = []
                        
                        # Map other keys to match Apify structure if needed
                        previous_profile["headline"] = raw_prev_profile.get("headline")
                        previous_profile["about"] = raw_prev_profile.get("about")
                        previous_profile["summary"] = raw_prev_profile.get("about")
                        previous_profile["pictureUrl"] = raw_prev_profile.get("profile_picture_url")
                        previous_profile["coverImageUrl"] = raw_prev_profile.get("cover_picture_url")
                        previous_profile["isVerified"] = raw_prev_profile.get("is_verified") == "Yes"
                        previous_profile["isPremium"] = raw_prev_profile.get("is_premium") == "Yes"
                        previous_profile["followerCount"] = raw_prev_profile.get("follower_count")
                        previous_profile["connectionCount"] = raw_prev_profile.get("connection_count")

        except Exception as e:
            # Log warning but proceed with full scoring
            print(f"Failed to fetch previous data for partial scoring: {e}")
            pass

    target_group = state.get("target_group", "recruiters")
    linkedin_url = state.get("linkedin_url", "")
    
    try:
        # Run AI scoring (Partial or Full)
        scoring_service = get_scoring_service()
        scores = scoring_service.score_profile(
            scraped_profile=scraped_profile,
            target_group=target_group,
            linkedin_url=linkedin_url,
            previous_profile=previous_profile,
            previous_scores=previous_scores,
        )
        
        overall_score = scores.get("Cumulative Sum of Score(100)", 0)
        executive_summary = scores.get("Cumulative Sum Reasoning", "")
        
        # Build section scores dict
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
        
        # Build section analyses/reasoning dict
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
        message=f"AI scoring complete. Overall score: {overall_score}/100",
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
        "section_scores": section_scores,
        "section_analyses": section_analyses,
        "ai_scoring_status": "completed",
        "activity_log": activity_log,
        "previous_scraped_profile": previous_profile, # Save for debug/future
        "previous_scores": previous_scores,
    }
