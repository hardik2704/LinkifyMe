"""
LangGraph Workflow

Compiles the full LinkedIn analysis workflow.
Supports two modes:
  1. scrape_only=True: Runs just scraping (triggered at intake, before payment)
  2. scrape_only=False: Runs the full pipeline (scrape + AI scoring)
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


def build_workflow(scrape_only: bool = False) -> StateGraph:
    """
    Build the LangGraph workflow for LinkedIn analysis.
    
    Args:
        scrape_only: If True, builds a workflow that stops after scraping
                     (used at intake time, before payment).
                     If False, builds the full pipeline.
    
    Scrape-Only Flow (started at intake, before payment):
    1. intake_to_sheets - Create initial record
    2. validate_inputs - Validate LinkedIn URL
    3. allocate_customer_id - Generate Customer ID
    4. start_scrape - Start Apify scrape (skipping payment gate)
    5. poll_apify - Wait for scrape completion
    6. fetch_dataset - Get scraped data → END
    
    Full Flow (legacy, used if no payment integration):
    1. intake_to_sheets → validate → allocate → payment → scrape → poll → fetch → ai_scoring → write_scores
    """
    
    # Create the graph
    workflow = StateGraph(LinkifyState)
    
    # Add common nodes
    workflow.add_node("intake_to_sheets", intake_to_sheets)
    workflow.add_node("validate_inputs", validate_inputs)
    workflow.add_node("allocate_customer_id", allocate_customer_id)
    workflow.add_node("start_scrape", start_scrape)
    workflow.add_node("poll_apify", poll_apify)
    workflow.add_node("fetch_dataset", fetch_dataset)
    
    # End nodes for error paths
    workflow.add_node("end_invalid", lambda s: {**s, "error_message": "Invalid URL"})
    workflow.add_node("end_scrape_failed", lambda s: {**s, "error_message": "Scrape failed"})
    workflow.add_node("end_data_error", lambda s: {**s, "error_message": "Data error"})
    
    # Set entry point
    workflow.set_entry_point("intake_to_sheets")
    
    # Common edges
    workflow.add_edge("intake_to_sheets", "validate_inputs")
    
    workflow.add_conditional_edges(
        "validate_inputs",
        route_after_validate,
        {
            "allocate_customer_id": "allocate_customer_id",
            "end_invalid": "end_invalid",
        }
    )
    
    if scrape_only:
        # Scrape-only mode: skip payment, go straight to scraping
        workflow.add_edge("allocate_customer_id", "start_scrape")
    else:
        # Full mode: include payment gate
        workflow.add_node("wait_payment_interrupt", wait_payment_interrupt)
        workflow.add_node("end_payment_failed", lambda s: {**s, "error_message": "Payment failed"})
        
        workflow.add_edge("allocate_customer_id", "wait_payment_interrupt")
        
        workflow.add_conditional_edges(
            "wait_payment_interrupt",
            route_after_payment,
            {
                "start_scrape": "start_scrape",
                "end_payment_failed": "end_payment_failed",
            }
        )
        workflow.add_edge("end_payment_failed", END)
    
    workflow.add_edge("start_scrape", "poll_apify")
    
    workflow.add_conditional_edges(
        "poll_apify",
        route_after_poll,
        {
            "fetch_dataset": "fetch_dataset",
            "end_scrape_failed": "end_scrape_failed",
        }
    )
    
    if scrape_only:
        # In scrape-only mode, stop after fetching data
        workflow.add_conditional_edges(
            "fetch_dataset",
            route_after_fetch,
            {
                "ai_scoring": END,  # Don't run AI scoring yet — END here
                "end_data_error": "end_data_error",
            }
        )
    else:
        # Full mode: continue to AI scoring
        workflow.add_node("ai_scoring", ai_scoring)
        workflow.add_node("write_scores", write_scores)
        
        workflow.add_conditional_edges(
            "fetch_dataset",
            route_after_fetch,
            {
                "ai_scoring": "ai_scoring",
                "end_data_error": "end_data_error",
            }
        )
        workflow.add_edge("ai_scoring", "write_scores")
        workflow.add_edge("write_scores", END)
    
    # All end nodes go to END
    workflow.add_edge("end_invalid", END)
    workflow.add_edge("end_scrape_failed", END)
    workflow.add_edge("end_data_error", END)
    
    return workflow


def build_scoring_workflow() -> StateGraph:
    """
    Build a minimal workflow that only runs AI scoring + persistence.
    
    Used after payment confirmation on already-scraped data.
    
    Flow:
    1. ai_scoring - Run AI analysis on scraped profile
    2. write_scores - Persist results to sheets
    """
    workflow = StateGraph(LinkifyState)
    
    workflow.add_node("ai_scoring", ai_scoring)
    workflow.add_node("write_scores", write_scores)
    
    workflow.set_entry_point("ai_scoring")
    workflow.add_edge("ai_scoring", "write_scores")
    workflow.add_edge("write_scores", END)
    
    return workflow


def get_compiled_workflow(scrape_only: bool = False):
    """Get a compiled workflow graph."""
    workflow = build_workflow(scrape_only=scrape_only)
    return workflow.compile()


def get_compiled_scoring_workflow():
    """Get the compiled scoring-only workflow."""
    workflow = build_scoring_workflow()
    return workflow.compile()


# Global compiled workflows (cached singletons)
_compiled_workflow = None
_compiled_scrape_only_workflow = None
_compiled_scoring_workflow = None


def get_workflow():
    """Get the singleton compiled full workflow."""
    global _compiled_workflow
    if _compiled_workflow is None:
        _compiled_workflow = get_compiled_workflow(scrape_only=False)
    return _compiled_workflow


def get_scrape_only_workflow():
    """Get the singleton compiled scrape-only workflow."""
    global _compiled_scrape_only_workflow
    if _compiled_scrape_only_workflow is None:
        _compiled_scrape_only_workflow = get_compiled_workflow(scrape_only=True)
    return _compiled_scrape_only_workflow


def get_scoring_only_workflow():
    """Get the singleton compiled scoring-only workflow."""
    global _compiled_scoring_workflow
    if _compiled_scoring_workflow is None:
        _compiled_scoring_workflow = get_compiled_scoring_workflow()
    return _compiled_scoring_workflow
