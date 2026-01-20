"""
Base Section Scorer

Abstract base class for all section scorers.
"""

from abc import ABC, abstractmethod
from typing import Any

from app.scoring.helpers import clamp


class BaseSectionScorer(ABC):
    """
    Abstract base class for section scorers.
    
    All section scorers must inherit from this class and implement
    the score() method that returns a score between 1-10.
    """
    
    key: str  # e.g., "headline", "connections"
    display_name: str  # e.g., "Headline Score"
    
    @abstractmethod
    def score(self, profile: dict) -> dict:
        """
        Calculate the section score.
        
        Args:
            profile: The scraped LinkedIn profile data
            
        Returns:
            {
                "score_raw": float,  # 1-10, clamped
                "reasons": [str],    # Explanation for the score
                "signals": {...}     # Intermediate metrics (for debugging)
            }
        """
        pass
    
    def _result(
        self,
        score: float,
        reasons: list[str],
        signals: dict[str, Any] | None = None
    ) -> dict:
        """Helper to build a properly formatted result."""
        return {
            "score_raw": clamp(score),
            "reasons": reasons,
            "signals": signals or {},
        }
