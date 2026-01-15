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
    message: str = "Analysis started"
    status: str = "pending"


class StatusResponse(BaseModel):
    """Response for status check."""
    
    unique_id: str
    customer_id: Optional[str] = None
    scrape_status: str
    payment_status: str
    current_step: str
    progress_percent: int
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
