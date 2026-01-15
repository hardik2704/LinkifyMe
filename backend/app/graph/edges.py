"""
Conditional Edges

Routing logic for the LangGraph workflow.
"""

from typing import Literal

from app.graph.state import LinkifyState


def route_after_validate(state: LinkifyState) -> Literal["allocate_customer_id", "end_invalid"]:
    """Route based on validation result."""
    if state.get("is_valid", False):
        return "allocate_customer_id"
    return "end_invalid"


def route_after_payment(state: LinkifyState) -> Literal["start_scrape", "end_payment_failed"]:
    """Route based on payment status."""
    payment_status = state.get("payment_status", "")
    if payment_status == "succeeded":
        return "start_scrape"
    return "end_payment_failed"


def route_after_poll(state: LinkifyState) -> Literal["fetch_dataset", "end_scrape_failed"]:
    """Route based on Apify scrape status."""
    apify_status = state.get("apify_status", "")
    if apify_status == "SUCCEEDED":
        return "fetch_dataset"
    return "end_scrape_failed"


def route_after_fetch(state: LinkifyState) -> Literal["ai_scoring", "end_data_error"]:
    """Route based on fetched data validity."""
    scraped_profile = state.get("scraped_profile")
    if scraped_profile:
        return "ai_scoring"
    return "end_data_error"
