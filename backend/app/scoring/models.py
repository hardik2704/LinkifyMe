"""
Scoring Models

Pydantic schemas for scoring data structures.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class SectionResult(BaseModel):
    """Result from a single section scorer."""
    
    score_raw: float = Field(ge=1.0, le=10.0, description="Raw score 1-10")
    reasons: list[str] = Field(default_factory=list)
    signals: dict[str, Any] = Field(default_factory=dict)


class SectionFinal(BaseModel):
    """Final section score after rules applied."""
    
    raw: float = Field(ge=1.0, le=10.0)
    after_rules: float = Field(ge=1.0, le=10.0)
    weight: float = Field(ge=0.0, le=1.0)
    weighted_contribution: float
    reasons: list[str] = Field(default_factory=list)


class DebugInfo(BaseModel):
    """Debug information for scoring."""
    
    persona: str
    weights: dict[str, float]
    sections: dict[str, SectionFinal]
    rules_applied: list[str] = Field(default_factory=list)


class ScoringResult(BaseModel):
    """Complete scoring result for API/Google Sheets."""
    
    customer_id: str = Field(alias="Customer ID")
    linkedin_profile: str = Field(alias="LinkedIn Profile")
    first_name: str = Field(alias="First Name")
    headline_score: float = Field(ge=1.0, le=10.0, alias="Headline Score")
    connection_score: float = Field(ge=1.0, le=10.0, alias="Connection Score")
    follower_score: float = Field(ge=1.0, le=10.0, alias="Follower Score")
    about_score: float = Field(ge=1.0, le=10.0, alias="About Score")
    profile_pic_score: float = Field(ge=1.0, le=10.0, alias="Profile Pic Score")
    cover_picture_score: float = Field(ge=1.0, le=10.0, alias="Cover_picture Score")
    experience_score: float = Field(ge=1.0, le=10.0, alias="Experience Score")
    education_score: float = Field(ge=1.0, le=10.0, alias="Education Score")
    skills_score: float = Field(ge=1.0, le=10.0, alias="Skills Score")
    licenses_certs_score: float = Field(ge=1.0, le=10.0, alias="Licenses & Certifications Score")
    is_verified_score: float = Field(ge=1.0, le=10.0, alias="Is Verified Score")
    is_premium_score: float = Field(ge=1.0, le=10.0, alias="Is Premium Score")
    final_score: float = Field(ge=1.0, le=10.0, alias="Final Score")
    debug: Optional[DebugInfo] = Field(default=None, alias="_debug")

    class Config:
        populate_by_name = True


class PersonaConfig(BaseModel):
    """Persona weight configuration."""
    
    name: str
    weights: dict[str, float]
    
    def validate_weights(self) -> bool:
        """Check that weights sum to 1.0."""
        total = sum(self.weights.values())
        return 0.99 <= total <= 1.01  # Allow small floating point variance


class Rule(BaseModel):
    """Single scoring rule."""
    
    id: str
    section: str
    when: dict[str, Any]  # any_regex, all_regex, etc.
    effect: dict[str, float]  # delta: +/- value
    reason: str


class RulesConfig(BaseModel):
    """Rules configuration."""
    
    version: int = 1
    rules: list[Rule] = Field(default_factory=list)
