"""
LangGraph Workflow

Compiles the full LinkedIn analysis workflow.
"""

from langgraph.graph import StateGraph, END

from app.graph.state import LinkifyState
from app.graph.edges import (
    route_after_validate,
    route_after_payment,
    route_after_poll,
    route_after_fetch,
)
from app.graph.nodes.intake import intake_to_sheets
from app.graph.nodes.validate import validate_inputs
from app.graph.nodes.allocate import allocate_customer_id
from app.graph.nodes.payment import wait_payment_interrupt
from app.graph.nodes.scrape import start_scrape, poll_apify, fetch_dataset
from app.graph.nodes.scoring import ai_scoring
from app.graph.nodes.persist import write_scores


def build_workflow() -> StateGraph:
    """
    Build the LangGraph workflow for LinkedIn analysis.
    
    Flow:
    1. intake_to_sheets - Create initial record
    2. validate_inputs - Validate LinkedIn URL
    3. allocate_customer_id - Generate Customer ID
    4. wait_payment_interrupt - Wait for payment (auto-succeeds in MVP)
    5. start_scrape - Start Apify scrape
    6. poll_apify - Wait for scrape completion
    7. fetch_dataset - Get scraped data
    8. ai_scoring - Run AI scoring
    9. write_scores - Persist results
    """
    
    # Create the graph
    workflow = StateGraph(LinkifyState)
    
    # Add nodes
    workflow.add_node("intake_to_sheets", intake_to_sheets)
    workflow.add_node("validate_inputs", validate_inputs)
    workflow.add_node("allocate_customer_id", allocate_customer_id)
    workflow.add_node("wait_payment_interrupt", wait_payment_interrupt)
    workflow.add_node("start_scrape", start_scrape)
    workflow.add_node("poll_apify", poll_apify)
    workflow.add_node("fetch_dataset", fetch_dataset)
    workflow.add_node("ai_scoring", ai_scoring)
    workflow.add_node("write_scores", write_scores)
    
    # End nodes (for different termination paths)
    workflow.add_node("end_invalid", lambda s: {**s, "error_message": "Invalid URL"})
    workflow.add_node("end_payment_failed", lambda s: {**s, "error_message": "Payment failed"})
    workflow.add_node("end_scrape_failed", lambda s: {**s, "error_message": "Scrape failed"})
    workflow.add_node("end_data_error", lambda s: {**s, "error_message": "Data error"})
    
    # Set entry point
    workflow.set_entry_point("intake_to_sheets")
    
    # Add edges
    workflow.add_edge("intake_to_sheets", "validate_inputs")
    
    workflow.add_conditional_edges(
        "validate_inputs",
        route_after_validate,
        {
            "allocate_customer_id": "allocate_customer_id",
            "end_invalid": "end_invalid",
        }
    )
    
    workflow.add_edge("allocate_customer_id", "wait_payment_interrupt")
    
    workflow.add_conditional_edges(
        "wait_payment_interrupt",
        route_after_payment,
        {
            "start_scrape": "start_scrape",
            "end_payment_failed": "end_payment_failed",
        }
    )
    
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
            "ai_scoring": "ai_scoring",
            "end_data_error": "end_data_error",
        }
    )
    
    workflow.add_edge("ai_scoring", "write_scores")
    
    # All end nodes go to END
    workflow.add_edge("write_scores", END)
    workflow.add_edge("end_invalid", END)
    workflow.add_edge("end_payment_failed", END)
    workflow.add_edge("end_scrape_failed", END)
    workflow.add_edge("end_data_error", END)
    
    return workflow


def get_compiled_workflow():
    """Get the compiled workflow graph."""
    workflow = build_workflow()
    return workflow.compile()


# Global compiled workflow
_compiled_workflow = None


def get_workflow():
    """Get the singleton compiled workflow."""
    global _compiled_workflow
    if _compiled_workflow is None:
        _compiled_workflow = get_compiled_workflow()
    return _compiled_workflow
