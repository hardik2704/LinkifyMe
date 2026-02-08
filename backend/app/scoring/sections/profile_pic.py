"""
Profile Picture Scorer

AI-powered comprehensive profile picture analysis using OpenAI Vision API.
Evaluates: professionalism, face visibility, lighting, background, image quality.
"""

import base64
import httpx
from typing import Optional

from app.scoring.sections.base_sections import BaseSectionScorer
from app.config import settings


class ProfilePicScorer(BaseSectionScorer):
    """Score profile picture using AI vision analysis (1-10)."""
    
    key = "profile_pic"
    display_name = "Profile Pic Score"
    
    # Scoring criteria weights
    CRITERIA = {
        "face_visible": 2.0,       # Face clearly visible and centered
        "professional": 2.5,       # Professional appearance (attire, grooming)
        "lighting": 1.5,           # Good lighting, not too dark/bright
        "background": 1.5,         # Clean, non-distracting background
        "image_quality": 1.5,      # High resolution, not blurry
        "approachable": 1.0,       # Friendly, approachable expression
    }
    
    NO_PICTURE_SCORE = 0.0
    
    async def analyze_image_with_ai(self, image_url: str) -> dict:
        """
        Analyze profile picture using OpenAI Vision API.
        
        Returns dict with scores for each criterion (0-10 scale).
        """
        try:
            # Prepare the vision API request
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.openai_api_key}"
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": """You are an expert at analyzing LinkedIn profile pictures for professional quality.
                        
Analyze the image and rate each criterion on a scale of 0-10:
1. face_visible (0-10): Is the face clearly visible, centered, and takes up appropriate space?
2. professional (0-10): Does the person look professional? (appropriate attire, grooming, formal/semi-formal)
3. lighting (0-10): Is the lighting good? (well-lit, not too dark/bright, no harsh shadows)
4. background (0-10): Is the background clean and non-distracting? (solid color, blurred, office setting)
5. image_quality (0-10): Is the image high quality? (good resolution, not blurry, not pixelated)
6. approachable (0-10): Does the person appear friendly and approachable? (natural smile, open expression)

Return ONLY a JSON object with these keys and integer scores, nothing else:
{"face_visible": X, "professional": X, "lighting": X, "background": X, "image_quality": X, "approachable": X, "summary": "one-line assessment"}"""
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this LinkedIn profile picture for professional quality."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                    "detail": "low"  # Use low detail to save tokens
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 300,
                "temperature": 0.3
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    return None
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Parse the JSON response
                import json
                # Clean up the response (remove markdown code blocks if present)
                content = content.strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                content = content.strip()
                
                analysis = json.loads(content)
                return analysis
                
        except Exception as e:
            # Log the error but don't fail - return None to trigger fallback
            print(f"Profile picture AI analysis failed: {e}")
            return None
    
    def score(self, profile: dict) -> dict:
        """
        Score profile picture.
        
        For synchronous context, uses simple presence check.
        For async analysis, use score_async.
        """
        pic_url = profile.get("pictureUrl") or profile.get("profilePictureUrl") or ""
        
        if not pic_url:
            return self._result(
                self.NO_PICTURE_SCORE,
                ["No profile picture - critical for trust and credibility"],
                {"has_picture": False, "ai_analyzed": False}
            )
        
        # Default sync scoring (presence-based)
        # AI analysis should be called via score_async
        return self._result(
            7.0,  # Base score for having a picture (will be overridden by AI)
            ["Profile picture present - run AI analysis for detailed score"],
            {"has_picture": True, "url": pic_url[:100], "ai_analyzed": False}
        )
    
    async def score_async(self, profile: dict) -> dict:
        """
        Async version that performs full AI vision analysis.
        """
        pic_url = profile.get("pictureUrl") or profile.get("profilePictureUrl") or ""
        
        if not pic_url:
            return self._result(
                self.NO_PICTURE_SCORE,
                ["No profile picture - critical for trust and credibility"],
                {"has_picture": False, "ai_analyzed": False}
            )
        
        # Perform AI analysis
        analysis = await self.analyze_image_with_ai(pic_url)
        
        if analysis is None:
            # Fallback to presence-based scoring
            return self._result(
                6.0,
                ["Profile picture present (AI analysis unavailable)"],
                {"has_picture": True, "url": pic_url[:100], "ai_analyzed": False}
            )
        
        # Calculate weighted score
        total_weight = sum(self.CRITERIA.values())
        weighted_score = 0.0
        reasons = []
        
        criteria_scores = {}
        for criterion, weight in self.CRITERIA.items():
            score = analysis.get(criterion, 5)  # Default to 5 if missing
            criteria_scores[criterion] = score
            weighted_score += (score / 10.0) * weight
        
        # Normalize to 1-10 scale
        final_score = (weighted_score / total_weight) * 10.0
        final_score = max(0.0, min(10.0, round(final_score, 1)))
        
        # Build detailed reasons
        if final_score >= 8:
            reasons.append("Excellent professional photo")
        elif final_score >= 6:
            reasons.append("Good profile picture with room for improvement")
        elif final_score >= 4:
            reasons.append("Average profile picture - consider updating")
        else:
            reasons.append("Profile picture needs significant improvement")
        
        # Add specific feedback
        if criteria_scores.get("face_visible", 10) < 6:
            reasons.append("Face not clearly visible or centered")
        if criteria_scores.get("professional", 10) < 6:
            reasons.append("Consider more professional attire/appearance")
        if criteria_scores.get("lighting", 10) < 6:
            reasons.append("Improve lighting - too dark or harsh")
        if criteria_scores.get("background", 10) < 6:
            reasons.append("Use a cleaner, less distracting background")
        if criteria_scores.get("image_quality", 10) < 6:
            reasons.append("Use a higher quality image")
        if criteria_scores.get("approachable", 10) < 6:
            reasons.append("Try a more natural, friendly expression")
        
        # Add AI summary if available
        if analysis.get("summary"):
            reasons.append(f"AI: {analysis['summary']}")
        
        return self._result(
            final_score,
            reasons,
            {
                "has_picture": True,
                "url": pic_url[:100],
                "ai_analyzed": True,
                "criteria_scores": criteria_scores
            }
        )
