"""
Payment Node

Handles the payment interruption point in the workflow.
For now, this is a passthrough that simulates payment success.

In production, this would use LangGraph's interrupt() feature
to pause execution until payment webhook is received.
"""

from datetime import datetime

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service


def wait_payment_interrupt(state: LinkifyState) -> LinkifyState:
    """
    Payment gate node.
    
    In production: Uses interrupt() to pause until payment webhook.
    For MVP: Auto-succeeds payment for testing.
    
    Input: customer_id, pc_row
    Output: payment_status updated
    """
    sheets = get_sheets_service()
    
    # For MVP, auto-succeed payment
    # In production, this would use:
    # from langgraph.types import interrupt
    # payment_result = interrupt("Waiting for payment...")
    
    payment_status = "succeeded"  # Auto-succeed for MVP
    
    # Update Payment Confirmation sheet
    pc_row = state.get("pc_row")
    if pc_row:
        sheets.update_payment_confirmation(pc_row, {
            "payment_status": payment_status,
        })
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="payment",
        status="success",
        message=f"Payment {payment_status}",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "payment",
        "status": "success",
        "message": f"Payment {payment_status}",
    })
    
    return {
        **state,
        "payment_status": payment_status,
        "activity_log": activity_log,
    }
