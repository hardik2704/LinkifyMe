"""
Pydantic Schemas for API Requests and Responses
"""

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator


# === Request Schemas ===

class IntakeRequest(BaseModel):
    """Request body for starting a new analysis."""
    
    linkedin_url: str = Field(..., description="LinkedIn profile URL")
    email: EmailStr = Field(..., description="User email address")
    phone: Optional[str] = Field(None, description="Optional phone number")
    target_group: Literal["recruiters", "clients", "vcs"] = Field(
        ..., description="Target audience for optimization"
    )
    
    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin_url(cls, v: str) -> str:
        from app.utils.validators import normalize_linkedin_url
        
        normalized = normalize_linkedin_url(v)
        if not normalized:
            raise ValueError("Invalid LinkedIn profile URL")
        return normalized


class PaymentWebhookRequest(BaseModel):
    """Request body for payment webhook."""
    
    customer_id: str = Field(..., description="Customer ID")
    status: Literal["succeeded", "failed"] = Field(..., description="Payment status")
    payment_gateway_id: Optional[str] = Field(None, description="External payment reference")
    amount: Optional[float] = Field(None, description="Payment amount")


# === Response Schemas ===

class IntakeResponse(BaseModel):
    """Response after starting analysis."""
    
    unique_id: str
    user_id: Optional[str] = None  # USR-XXXXX format
    is_returning_user: bool = False
    previous_attempts_count: int = 0
    message: str = "Analysis started"
    status: str = "pending"


class StatusResponse(BaseModel):
    """Response for status check."""
    
    unique_id: str
    customer_id: Optional[str] = None
    attempt_id: Optional[str] = None  # ATT-LM-XXXXX-X format for report URL
    scrape_status: str
    payment_status: str
    current_step: str
    progress_percent: int
    has_scores: bool = False  # True when AI scoring is complete
    error_message: Optional[str] = None


class SectionScore(BaseModel):
    """Individual section score."""
    
    id: str
    title: str
    score: int
    max_score: int
    status: Literal["optimized", "needs_improvement", "critical"]
    current_status: Optional[str] = None
    analysis: Optional[str] = None
    ai_rewrite: Optional[str] = None
    tags: Optional[list[str]] = None


class ReportResponse(BaseModel):
    """Full report response."""
    
    customer_id: str
    profile: dict[str, Any]
    overall_score: int
    grade_label: str
    executive_summary: str
    sections: list[SectionScore]
    top_priorities: list[str]
    generated_at: datetime


class ActivityLogEntry(BaseModel):
    """Single activity log entry."""
    
    timestamp: str
    unique_id: str
    customer_id: Optional[str] = None
    event_type: str
    status: str
    message: str


class LogsResponse(BaseModel):
    """Response for WarRoom logs."""
    
    logs: list[ActivityLogEntry]
    total_count: int


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str = "healthy"
    version: str
    environment: str


# === New Schemas for Pre-Scoring & Feedback ===

class FeedbackRequest(BaseModel):
    """Request body for submitting feedback."""
    
    email: EmailStr = Field(..., description="User email address")
    customer_id: str = Field(..., description="Customer ID from analysis")
    would_refer: int = Field(..., ge=1, le=5, description="Would refer rating 1-5")
    was_helpful: int = Field(..., ge=1, le=5, description="Was helpful rating 1-5")
    suggestions: Optional[str] = Field(None, description="Optional suggestions")


class FeedbackResponse(BaseModel):
    """Response after submitting feedback."""
    
    success: bool
    message: str


class PreScoresRequest(BaseModel):
    """Request for pre-scores calculation."""
    
    persona: str = Field(
        default="big_company_recruiter",
        description="Persona for scoring weights"
    )


class PersonaInfo(BaseModel):
    """Information about a scoring persona."""
    
    name: str
    description: str
    priorities: list[str]


class PersonasResponse(BaseModel):
    """Response listing available personas."""
    
    personas: list[PersonaInfo]


class DashboardStats(BaseModel):
    """Dashboard statistics response."""
    
    total_analyses: int
    today_count: int
    average_score: float
    recent_jobs: list[dict[str, Any]]
    service_health: dict[str, str]


# === User Account System Schemas ===

class UserInfo(BaseModel):
    """User account information."""
    
    user_id: str
    linkedin_url: str
    email: str
    phone: Optional[str] = None
    name: Optional[str] = None
    total_attempts: int = 0
    last_attempt_at: Optional[str] = None
    created_at: Optional[str] = None


class AttemptSummary(BaseModel):
    """Summary of a single analysis attempt."""
    
    attempt_id: str
    customer_id: str
    final_score: int
    timestamp: str
    linkedin_url: str
    first_name: Optional[str] = None
    status: Optional[str] = None


class UserAttemptsResponse(BaseModel):
    """Response for user's attempt history."""
    
    user: UserInfo
    attempts: list[AttemptSummary]


class ScoreComparison(BaseModel):
    """Comparison of a single section between two attempts."""
    
    section: str
    current_score: int
    previous_score: int
    delta: int  # positive or negative
    change_direction: Literal["improved", "declined", "unchanged"]


class ComparisonResponse(BaseModel):
    """Response for comparing two attempts."""
    
    current_attempt: AttemptSummary
    previous_attempt: AttemptSummary
    overall_delta: int
    sections: list[ScoreComparison]
    summary: str


class UserLookupResponse(BaseModel):
    """Response for user lookup."""
    
    found: bool
    user: Optional[UserInfo] = None
    message: str
