"""
Premium Account Scorer

Simple presence check - 10 if premium, 0 if not.
Low weight generally but can matter for VCs.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import is_true


class PremiumScorer(BaseSectionScorer):
    """Score based on Premium account status (1-10)."""
    
    key = "premium"
    display_name = "Is Premium Score"
    
    # Configurable scores
    PREMIUM_SCORE = 10.0
    NOT_PREMIUM_SCORE = 0.0
    
    def score(self, profile: dict) -> dict:
        is_premium = is_true(profile.get("premium", False))
        
        if is_premium:
            return self._result(
                self.PREMIUM_SCORE,
                ["LinkedIn Premium - shows investment in professional presence"],
                {"is_premium": True}
            )
        else:
            return self._result(
                self.NOT_PREMIUM_SCORE,
                ["Free account - Premium not required but beneficial"],
                {"is_premium": False}
            )
