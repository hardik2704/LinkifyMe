"""
Allocate Customer ID Node

Generates a sequential Customer ID and creates records in PS and PC sheets.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.services.counter import get_customer_id_counter


def allocate_customer_id(state: LinkifyState) -> LinkifyState:
    """
    Allocate a unique Customer ID and create PS/PC records.
    
    Input: unique_id, pi_row
    Output: customer_id, ps_row, pc_row
    """
    sheets = get_sheets_service()
    counter = get_customer_id_counter()
    
    # Generate new Customer ID
    customer_id = counter.get_next_id()
    
    # Generate Attempt ID (e.g. ATT-LM-00042-1)
    attempt_id = sheets.get_next_attempt_id(customer_id)
    
    # Update Profile Information with Customer ID and Attempt ID
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {
            "customer_id": customer_id,
            "attempt_id": attempt_id,
        })
    
    # Create Profile Scoring record
    ps_row = sheets.create_profile_scoring(customer_id)
    
    # Update Profile Scoring with Attempt ID
    sheets.update_profile_scoring(ps_row, {
        "attempt_id": attempt_id,
    })
    
    # Create Payment Confirmation record
    pc_row = sheets.create_payment_confirmation(customer_id)
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=customer_id,
        event_type="allocate_id",
        status="success",
        message=f"Customer ID {customer_id} allocated, Attempt {attempt_id}",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "allocate_id",
        "status": "success",
        "message": f"Customer ID {customer_id} allocated, Attempt {attempt_id}",
    })
    
    return {
        **state,
        "customer_id": customer_id,
        "attempt_id": attempt_id,
        "ps_row": ps_row,
        "pc_row": pc_row,
        "payment_status": "pending",
        "activity_log": activity_log,
    }
