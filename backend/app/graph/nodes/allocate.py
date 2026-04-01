"""
Allocate Attempt ID Node

Generates a sequential Attempt ID and creates records in PS and PC sheets.
Uses User ID as the primary identifier across all sheets.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def allocate_attempt_id(state: LinkifyState) -> LinkifyState:
    """
    Allocate a unique Attempt ID and create PS/PC records.
    Uses User ID as the primary identifier everywhere.
    
    Input: unique_id, pi_row, user_id
    Output: attempt_id, ps_row, pc_row
    """
    sheets = get_sheets_service()
    
    # Get user_id from state (set during intake via find_or_create_user)
    user_id = state.get("user_id")
    
    # Generate Attempt ID based on User ID (e.g. ATT-USR-00042-01)
    attempt_id = sheets.get_next_attempt_id(user_id) if user_id else f"ATT-UNKNOWN-01"
    
    # Update Profile Information with User ID (column 1) and Attempt ID (column 2)
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {
            "user_id": user_id,
            "attempt_id": attempt_id,
        })
    
    # Create Profile Scoring record with User ID
    ps_row = sheets.create_profile_scoring(user_id)
    
    # Update Profile Scoring with Attempt ID
    sheets.update_profile_scoring(ps_row, {
        "attempt_id": attempt_id,
    })
    
    # Create Payment Confirmation record keyed by user_id
    pc_row = sheets.create_payment_confirmation(user_id)
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        user_id=user_id,
        event_type="allocate_id",
        status="success",
        message=f"User {user_id}, Attempt {attempt_id} allocated",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "allocate_id",
        "status": "success",
        "message": f"User {user_id}, Attempt {attempt_id} allocated",
    })
    
    return {
        **state,
        "user_id": user_id,
        "attempt_id": attempt_id,
        "ps_row": ps_row,
        "pc_row": pc_row,
        "payment_status": "pending",
        "activity_log": activity_log,
    }
