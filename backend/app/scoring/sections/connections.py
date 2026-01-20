"""
Connections Scorer

Maps connection count to 1-10 score using thresholds.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import map_count_to_score


class ConnectionsScorer(BaseSectionScorer):
    """Score based on connection count (1-10)."""
    
    key = "connections"
    display_name = "Connection Score"
    
    # Thresholds: (min_count, score)
    THRESHOLDS = [
        (0, 1.0),
        (50, 3.0),
        (100, 4.0),
        (150, 5.0),
        (250, 6.0),
        (350, 7.0),
        (500, 8.5),
        (750, 9.5),
        (1000, 10.0),  # 500+ is typically shown as "500+"
    ]
    
    def score(self, profile: dict) -> dict:
        count = profile.get("connectionsCount", 0) or 0
        
        # Handle string values like "500+"
        if isinstance(count, str):
            count = int(count.replace("+", "").replace(",", "")) if count else 0
        
        score = map_count_to_score(count, self.THRESHOLDS)
        
        reasons = []
        if count >= 500:
            reasons.append(f"Strong network ({count}+ connections)")
        elif count >= 200:
            reasons.append(f"Growing network ({count} connections)")
        elif count >= 50:
            reasons.append(f"Building network ({count} connections)")
        else:
            reasons.append(f"Limited network ({count} connections)")
        
        return self._result(score, reasons, {"count": count})
