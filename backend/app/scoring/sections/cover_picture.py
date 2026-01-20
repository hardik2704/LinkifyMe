"""
Cover Picture Scorer

Simple presence check - medium-high if present, medium-low if missing.
"""

from app.scoring.sections.base_sections import BaseSectionScorer


class CoverPictureScorer(BaseSectionScorer):
    """Score based on cover picture presence (1-10)."""
    
    key = "cover_picture"
    display_name = "Cover_picture Score"
    
    def score(self, profile: dict) -> dict:
        cover_url = profile.get("coverImageUrl") or profile.get("backgroundImageUrl") or ""
        
        if cover_url:
            return self._result(
                9.0,
                ["Custom cover image - shows effort"],
                {"has_cover": True}
            )
        else:
            return self._result(
                4.0,
                ["Default cover image - missed opportunity"],
                {"has_cover": False}
            )
