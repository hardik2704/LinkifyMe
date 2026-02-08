"""
Verified Badge Scorer

Simple presence check - 10 if verified, 0 if not.
Configurable thresholds.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import is_true


class VerifiedScorer(BaseSectionScorer):
    """Score based on verification status (1-10)."""
    
    key = "verified"
    display_name = "Is Verified Score"
    
    # Configurable scores
    VERIFIED_SCORE = 10.0
    NOT_VERIFIED_SCORE = 0.0
    
    def score(self, profile: dict) -> dict:
        is_verified = is_true(profile.get("isVerified", False))
        
        if is_verified:
            return self._result(
                self.VERIFIED_SCORE,
                ["LinkedIn verified badge - high trust signal"],
                {"is_verified": True}
            )
        else:
            return self._result(
                self.NOT_VERIFIED_SCORE,
                ["Not verified - consider adding verification"],
                {"is_verified": False}
            )
