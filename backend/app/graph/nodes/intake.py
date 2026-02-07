"""
Intake Node

Creates the initial Profile Information record in Google Sheets.
Also looks up or creates the User record for returning user detection.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def intake_to_sheets(state: LinkifyState) -> LinkifyState:
    """
    Create initial record in Profile Information sheet.
    Also handles User lookup/creation for returning user tracking.
    
    Input: linkedin_url, email, phone, target_group
    Output: pi_row, user_id, is_returning_user, previous_attempts_count, activity_log updated
    """
    sheets = get_sheets_service()
    
    # Step 1: Find or create user by LinkedIn URL
    user_id, is_returning_user, total_attempts = sheets.find_or_create_user(
        linkedin_url=state["linkedin_url"],
        email=state["email"],
        phone=state.get("phone"),
        name=None,  # Will be extracted from scraped profile later
    )
    
    # Step 2: Get previous attempt info for comparison (if returning user)
    previous_attempt_id = None
    if is_returning_user:
        attempts = sheets.get_user_attempts(user_id)
        if attempts:
            # Get the most recent (first in list since sorted by timestamp desc)
            previous_attempt_id = attempts[0].get("attempt_id")
    
    # Step 3: Create the profile information row linked to user
    pi_row = sheets.create_profile_info(
        unique_id=state["unique_id"],
        linkedin_url=state["linkedin_url"],
        email=state["email"],
        phone=state.get("phone"),
        target_group=state["target_group"],
        user_id=user_id,
    )
    
    # Step 4: Log the activity
    log_message = f"Intake received for {state['linkedin_url']}"
    if is_returning_user:
        log_message += f" (returning user, attempt #{total_attempts})"
    
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=None,
        event_type="intake",
        status="success",
        message=log_message,
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "intake",
        "status": "success",
        "message": log_message,
    })
    
    return {
        **state,
        "pi_row": pi_row,
        "user_id": user_id,
        "is_returning_user": is_returning_user,
        "previous_attempt_id": previous_attempt_id,
        "previous_attempts_count": total_attempts - 1 if is_returning_user else 0,
        "activity_log": activity_log,
    }

