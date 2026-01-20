"""
Profile Picture Scorer

Simple presence check - 10 if present, low if missing.
"""

from app.scoring.sections.base_sections import BaseSectionScorer


class ProfilePicScorer(BaseSectionScorer):
    """Score based on profile picture presence (1-10)."""
    
    key = "profile_pic"
    display_name = "Profile Pic Score"
    
    def score(self, profile: dict) -> dict:
        pic_url = profile.get("pictureUrl") or profile.get("profilePictureUrl") or ""
        
        if pic_url:
            return self._result(
                10.0,
                ["Profile picture present"],
                {"has_picture": True, "url": pic_url[:50]}
            )
        else:
            return self._result(
                2.0,
                ["No profile picture - critical for trust"],
                {"has_picture": False}
            )
