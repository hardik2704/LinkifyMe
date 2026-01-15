"""
Intake Node

Creates the initial Profile Information record in Google Sheets.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def intake_to_sheets(state: LinkifyState) -> LinkifyState:
    """
    Create initial record in Profile Information sheet.
    
    Input: linkedin_url, email, phone, target_group
    Output: pi_row, activity_log updated
    """
    sheets = get_sheets_service()
    
    # Create the profile information row
    pi_row = sheets.create_profile_info(
        unique_id=state["unique_id"],
        linkedin_url=state["linkedin_url"],
        email=state["email"],
        phone=state.get("phone"),
        target_group=state["target_group"],
    )
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=None,
        event_type="intake",
        status="success",
        message=f"Intake received for {state['linkedin_url']}",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "intake",
        "status": "success",
        "message": f"Intake received for {state['linkedin_url']}",
    })
    
    return {
        **state,
        "pi_row": pi_row,
        "activity_log": activity_log,
    }
