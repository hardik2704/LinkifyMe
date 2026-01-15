"""
LangGraph State Schema

Defines the LinkifyState TypedDict that travels between nodes.
"""

from typing import Any, Literal, Optional, TypedDict


# Status types
ScrapeStatus = Literal["pending", "scraping", "completed", "failed", "invalid_url"]
PaymentStatus = Literal["pending", "initiated", "succeeded", "failed"]
TargetGroup = Literal["recruiters", "clients", "vcs"]


class ActivityLogEntry(TypedDict):
    """Single activity log entry."""
    timestamp: str
    event_type: str
    status: str
    message: str


class LinkifyState(TypedDict, total=False):
    """
    The state that flows through the LangGraph workflow.
    
    All fields are optional (total=False) to allow partial updates.
    """
    
    # === Identifiers ===
    unique_id: str              # UUID for this request
    customer_id: Optional[str]  # Sequential ID (e.g., "LM-00042")
    
    # === Input Data ===
    linkedin_url: str
    email: str
    phone: Optional[str]
    target_group: TargetGroup
    
    # === Sheet Row Pointers ===
    pi_row: Optional[int]       # Profile Information row
    ps_row: Optional[int]       # Profile Scoring row
    pc_row: Optional[int]       # Payment Confirmation row
    
    # === Statuses ===
    scrape_status: ScrapeStatus
    payment_status: PaymentStatus
    
    # === Scraping Data ===
    scrape_attempt: int
    apify_run_id: Optional[str]
    apify_status: Optional[str]
    scraped_profile: Optional[dict[str, Any]]
    
    # === Scoring Data ===
    scores: Optional[dict[str, Any]]
    executive_summary: Optional[str]
    ai_scoring_status: Optional[str]
    section_scores: Optional[dict[str, int]]
    section_analyses: Optional[dict[str, str]]
    ai_rewrites: Optional[dict[str, str]]
    
    # === Error Handling ===
    error_message: Optional[str]
    is_valid: Optional[bool]
    
    # === Activity Log (in-memory for current run) ===
    activity_log: list[ActivityLogEntry]


def create_initial_state(
    linkedin_url: str,
    email: str,
    phone: Optional[str],
    target_group: TargetGroup,
) -> LinkifyState:
    """Create an initial state for a new workflow run."""
    import uuid
    
    return LinkifyState(
        unique_id=str(uuid.uuid4()),
        linkedin_url=linkedin_url,
        email=email,
        phone=phone,
        target_group=target_group,
        scrape_status="pending",
        payment_status="pending",
        scrape_attempt=0,
        activity_log=[],
    )
