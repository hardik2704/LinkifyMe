"""
Allocate Customer ID Node

Generates a sequential Customer ID and creates records in PS and PC sheets.
Now uses User ID for attempt tracking.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.services.counter import get_customer_id_counter


def allocate_customer_id(state: LinkifyState) -> LinkifyState:
    """
    Allocate a unique Customer ID and create PS/PC records.
    Uses User ID for attempt tracking (format: ATT-{user_id}-01).
    
    Input: unique_id, pi_row, user_id
    Output: customer_id, attempt_id, ps_row, pc_row
    """
    sheets = get_sheets_service()
    counter = get_customer_id_counter()
    
    # Get user_id from state (set during intake via find_or_create_user)
    user_id = state.get("user_id")
    
    # Generate new Customer ID (legacy - still used for some references)
    customer_id = counter.get_next_id()
    
    # Generate Attempt ID based on User ID (e.g. ATT-USR-00042-01)
    attempt_id = sheets.get_next_attempt_id(user_id) if user_id else f"ATT-{customer_id}-01"
    
    # Update Profile Information with User ID (column 1) and Attempt ID (column 2)
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {
            "user_id": user_id,  # Column 1 is now User ID
            "attempt_id": attempt_id,
        })
    
    # Create Profile Scoring record with User ID
    ps_row = sheets.create_profile_scoring(user_id or customer_id)
    
    # Update Profile Scoring with Attempt ID
    sheets.update_profile_scoring(ps_row, {
        "attempt_id": attempt_id,
    })
    
    # Create Payment Confirmation record (still uses customer_id for payment tracking)
    pc_row = sheets.create_payment_confirmation(customer_id)
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=customer_id,
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
        "customer_id": customer_id,  # Legacy - kept for payment tracking
        "user_id": user_id,  # Primary identifier
        "attempt_id": attempt_id,
        "ps_row": ps_row,
        "pc_row": pc_row,
        "payment_status": "pending",
        "activity_log": activity_log,
    }
