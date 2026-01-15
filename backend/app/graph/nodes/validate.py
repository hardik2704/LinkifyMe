"""
Validate Node

Validates the LinkedIn URL and other inputs.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.utils.validators import is_valid_linkedin_url, is_valid_email, normalize_linkedin_url


def validate_inputs(state: LinkifyState) -> LinkifyState:
    """
    Validate the LinkedIn URL and other inputs.
    
    Input: linkedin_url, email, phone, pi_row
    Output: is_valid, error_message, normalized linkedin_url
    """
    sheets = get_sheets_service()
    errors = []
    
    # Validate LinkedIn URL
    linkedin_url = state.get("linkedin_url", "")
    if not is_valid_linkedin_url(linkedin_url):
        errors.append("Invalid LinkedIn profile URL format")
    else:
        # Normalize the URL
        normalized = normalize_linkedin_url(linkedin_url)
        if normalized:
            state["linkedin_url"] = normalized
    
    # Validate email
    email = state.get("email", "")
    if not is_valid_email(email):
        errors.append("Invalid email address")
    
    is_valid = len(errors) == 0
    error_message = "; ".join(errors) if errors else None
    
    # Update sheet with validation result
    pi_row = state.get("pi_row")
    if pi_row:
        if is_valid:
            sheets.update_profile_info(pi_row, {
                "linkedin_url": state["linkedin_url"],  # Update with normalized URL
                "scrape_status": "pending",
            })
        else:
            sheets.update_profile_info(pi_row, {
                "scrape_status": "invalid_url",
                "error_message": error_message,
            })
    
    # Log the activity
    status = "success" if is_valid else "error"
    message = "Validation passed" if is_valid else f"Validation failed: {error_message}"
    
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="validate",
        status=status,
        message=message,
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "validate",
        "status": status,
        "message": message,
    })
    
    return {
        **state,
        "is_valid": is_valid,
        "error_message": error_message,
        "scrape_status": "pending" if is_valid else "invalid_url",
        "activity_log": activity_log,
    }
