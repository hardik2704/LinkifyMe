"""
LangGraph Workflow

Compiles the full LinkedIn analysis workflow.
"""

from langgraph.graph import StateGraph, END

from app.graph.state import LinkifyState
from app.graph.edges import (
    route_after_validate,
    route_after_poll,
    route_after_fetch,
)
from app.graph.nodes.intake import intake_to_sheets
from app.graph.nodes.validate import validate_inputs
from app.graph.nodes.allocate import allocate_attempt_id
from app.graph.nodes.scrape import start_scrape, poll_apify, fetch_dataset
from app.graph.nodes.scoring import ai_scoring
from app.graph.nodes.persist import write_scores


def build_scrape_workflow() -> StateGraph:
    """
    Build the LangGraph workflow for LinkedIn scraping (Phase 1).

    This runs immediately after intake — before payment.
    Flow:
    1. intake_to_sheets - Create initial record
    2. validate_inputs - Validate LinkedIn URL
    3. allocate_attempt_id - Generate Attempt ID
    4. start_scrape - Start Apify scrape
    5. poll_apify - Wait for scrape completion
    6. fetch_dataset - Get scraped data

    AI scoring (Phase 2) is triggered separately after payment confirmation.
    """

    workflow = StateGraph(LinkifyState)

    # Add nodes
    workflow.add_node("intake_to_sheets", intake_to_sheets)
    workflow.add_node("validate_inputs", validate_inputs)
    workflow.add_node("allocate_attempt_id", allocate_attempt_id)
    workflow.add_node("start_scrape", start_scrape)
    workflow.add_node("poll_apify", poll_apify)
    workflow.add_node("fetch_dataset", fetch_dataset)

    # End nodes
    workflow.add_node("end_invalid", lambda s: {**s, "error_message": "Invalid URL"})
    workflow.add_node("end_scrape_failed", lambda s: {**s, "error_message": "Scrape failed"})
    workflow.add_node("end_data_error", lambda s: {**s, "error_message": "Data error"})

    # Set entry point
    workflow.set_entry_point("intake_to_sheets")

    # Edges
    workflow.add_edge("intake_to_sheets", "validate_inputs")

    workflow.add_conditional_edges(
        "validate_inputs",
        route_after_validate,
        {
            "allocate_attempt_id": "allocate_attempt_id",
            "end_invalid": "end_invalid",
        }
    )

    # Skip payment — go straight to scraping
    workflow.add_edge("allocate_attempt_id", "start_scrape")

    workflow.add_edge("start_scrape", "poll_apify")

    workflow.add_conditional_edges(
        "poll_apify",
        route_after_poll,
        {
            "fetch_dataset": "fetch_dataset",
            "end_scrape_failed": "end_scrape_failed",
        }
    )

    workflow.add_conditional_edges(
        "fetch_dataset",
        route_after_fetch,
        {
            "end_scrape_done": "end_scrape_done",
            "end_data_error": "end_data_error",
        }
    )

    # Scrape done — workflow pauses here until payment triggers scoring
    workflow.add_node("end_scrape_done", lambda s: {**s, "scrape_status": "completed"})

    # All terminal nodes go to END
    workflow.add_edge("end_scrape_done", END)
    workflow.add_edge("end_invalid", END)
    workflow.add_edge("end_scrape_failed", END)
    workflow.add_edge("end_data_error", END)

    return workflow


def build_scoring_workflow() -> StateGraph:
    """
    Build the LangGraph workflow for AI scoring (Phase 2).

    Runs after payment is confirmed and scraping is complete.
    """
    workflow = StateGraph(LinkifyState)

    workflow.add_node("ai_scoring", ai_scoring)
    workflow.add_node("write_scores", write_scores)

    workflow.set_entry_point("ai_scoring")
    workflow.add_edge("ai_scoring", "write_scores")
    workflow.add_edge("write_scores", END)

    return workflow


_compiled_scrape_workflow = None
_compiled_scoring_workflow = None


def get_scrape_workflow():
    """Get the singleton compiled scrape workflow (Phase 1)."""
    global _compiled_scrape_workflow
    if _compiled_scrape_workflow is None:
        _compiled_scrape_workflow = build_scrape_workflow().compile()
    return _compiled_scrape_workflow


def get_scoring_workflow():
    """Get the singleton compiled scoring workflow (Phase 2)."""
    global _compiled_scoring_workflow
    if _compiled_scoring_workflow is None:
        _compiled_scoring_workflow = build_scoring_workflow().compile()
    return _compiled_scoring_workflow
