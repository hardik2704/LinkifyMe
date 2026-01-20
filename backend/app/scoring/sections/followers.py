"""
Followers Scorer

Maps follower count to 1-10 score using thresholds.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import map_count_to_score


class FollowersScorer(BaseSectionScorer):
    """Score based on follower count (1-10)."""
    
    key = "followers"
    display_name = "Follower Score"
    
    # Thresholds: (min_count, score)
    THRESHOLDS = [
        (0, 1.0),
        (100, 2.5),
        (200, 4.0),
        (500, 5.5),
        (1000, 7.0),
        (2500, 8.0),
        (5000, 9.0),
        (10000, 10.0),
    ]
    
    def score(self, profile: dict) -> dict:
        count = profile.get("followersCount", 0) or profile.get("followerCount", 0) or 0
        
        if isinstance(count, str):
            count = int(count.replace("+", "").replace(",", "").replace("K", "000")) if count else 0
        
        score = map_count_to_score(count, self.THRESHOLDS)
        
        reasons = []
        if count >= 5000:
            reasons.append(f"Influencer level ({count:,} followers)")
        elif count >= 1000:
            reasons.append(f"Strong following ({count:,} followers)")
        elif count >= 500:
            reasons.append(f"Growing audience ({count:,} followers)")
        else:
            reasons.append(f"Building audience ({count} followers)")
        
        return self._result(score, reasons, {"count": count})
