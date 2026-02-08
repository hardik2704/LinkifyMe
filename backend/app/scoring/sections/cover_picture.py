"""
Cover Picture Scorer

AI-powered comprehensive cover/banner image analysis using OpenAI Vision API.
Evaluates: relevance, branding, professionalism, quality, and visual appeal.
"""

import httpx
from typing import Optional

from app.scoring.sections.base_sections import BaseSectionScorer
from app.config import settings


class CoverPictureScorer(BaseSectionScorer):
    """Score cover/banner image using AI vision analysis (1-10)."""
    
    key = "cover_picture"
    display_name = "Cover_picture Score"
    
    # Scoring criteria weights (softer than profile pic - less strict)
    CRITERIA = {
        "relevance": 2.5,          # Relevant to profession/industry
        "branding": 2.0,           # Personal branding elements (name, tagline, logo)
        "professionalism": 2.0,    # Professional appearance, not casual/personal
        "visual_quality": 2.0,     # High resolution, good composition
        "uniqueness": 1.5,         # Not a default/stock LinkedIn banner
    }
    
    NO_COVER_SCORE = 0.0
    
    async def analyze_image_with_ai(self, image_url: str) -> dict:
        """
        Analyze cover image using OpenAI Vision API.
        
        Returns dict with scores for each criterion (0-10 scale).
        Note: Scoring is intentionally lenient to avoid being too deterministic.
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.openai_api_key}"
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": """You are an expert at analyzing LinkedIn cover/banner images for professional quality.

IMPORTANT: Be reasonably lenient in scoring. Not everyone needs a perfect corporate banner.
A decent, professional-looking cover should score 6-7. Reserve 9-10 for exceptional branding.

Analyze the image and rate each criterion on a scale of 0-10:

1. relevance (0-10): Does it relate to the person's profession/industry? 
   - Score 5+ for generic but professional images
   - Score 7+ for industry-relevant imagery
   - Score 9+ for highly specific professional branding

2. branding (0-10): Does it include personal branding elements?
   - Score 5+ for clean, professional look (even without text)
   - Score 7+ for subtle branding (company logo, industry symbols)
   - Score 9+ for clear personal brand (name, tagline, contact info)

3. professionalism (0-10): Does it look professional?
   - Score 5+ for non-personal, work-appropriate images
   - Score 7+ for polished, business-appropriate imagery
   - Score 9+ for exceptional, corporate-quality design

4. visual_quality (0-10): Is the image high quality?
   - Score 5+ for decent resolution, not blurry
   - Score 7+ for good composition and clarity
   - Score 9+ for exceptional quality and design

5. uniqueness (0-10): Is it a custom image (not default LinkedIn)?
   - Score 4+ for any non-default image
   - Score 6+ for clearly customized images
   - Score 9+ for original, professionally designed banners

Return ONLY a JSON object with these keys and integer scores, nothing else:
{"relevance": X, "branding": X, "professionalism": X, "visual_quality": X, "uniqueness": X, "summary": "one-line assessment"}"""
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this LinkedIn cover/banner image for professional quality and branding."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                    "detail": "low"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 300,
                "temperature": 0.4  # Slightly higher for less deterministic scoring
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
                
                import json
                content = content.strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                content = content.strip()
                
                analysis = json.loads(content)
                return analysis
                
        except Exception as e:
            print(f"Cover picture AI analysis failed: {e}")
            return None
    
    def score(self, profile: dict) -> dict:
        """
        Score cover picture (sync version).
        
        For async AI analysis, use score_async.
        """
        cover_url = profile.get("coverImageUrl") or profile.get("backgroundImageUrl") or ""
        
        if not cover_url:
            return self._result(
                self.NO_COVER_SCORE,
                ["No custom cover image - missed branding opportunity"],
                {"has_cover": False, "ai_analyzed": False}
            )
        
        # Default sync scoring - base score for having a cover
        return self._result(
            6.5,  # Base score (will be overridden by AI)
            ["Custom cover image present - run AI analysis for detailed score"],
            {"has_cover": True, "url": cover_url[:100], "ai_analyzed": False}
        )
    
    async def score_async(self, profile: dict) -> dict:
        """
        Async version that performs full AI vision analysis.
        """
        cover_url = profile.get("coverImageUrl") or profile.get("backgroundImageUrl") or ""
        
        if not cover_url:
            return self._result(
                self.NO_COVER_SCORE,
                ["No custom cover image - missed branding opportunity"],
                {"has_cover": False, "ai_analyzed": False}
            )
        
        # Perform AI analysis
        analysis = await self.analyze_image_with_ai(cover_url)
        
        if analysis is None:
            # Fallback: Give decent score for having a cover
            return self._result(
                6.0,
                ["Custom cover image (AI analysis unavailable)"],
                {"has_cover": True, "url": cover_url[:100], "ai_analyzed": False}
            )
        
        # Calculate weighted score
        total_weight = sum(self.CRITERIA.values())
        weighted_score = 0.0
        
        criteria_scores = {}
        for criterion, weight in self.CRITERIA.items():
            score = analysis.get(criterion, 6)  # Default to 6 (generous)
            criteria_scores[criterion] = score
            weighted_score += (score / 10.0) * weight
        
        # Normalize to 1-10 scale
        final_score = (weighted_score / total_weight) * 10.0
        final_score = max(1.0, min(10.0, round(final_score, 1)))
        
        # Build reasons (constructive feedback)
        reasons = []
        
        if final_score >= 8:
            reasons.append("Excellent cover image with strong branding")
        elif final_score >= 6:
            reasons.append("Good cover image - consider adding personal branding")
        elif final_score >= 4:
            reasons.append("Basic cover - opportunity to showcase expertise")
        else:
            reasons.append("Cover image needs improvement")
        
        # Add specific suggestions (only for scores below 7)
        if criteria_scores.get("relevance", 10) < 7:
            reasons.append("Consider imagery that reflects your industry")
        if criteria_scores.get("branding", 10) < 6:
            reasons.append("Add your name, tagline, or contact info")
        if criteria_scores.get("professionalism", 10) < 6:
            reasons.append("Use a more professional/corporate style")
        if criteria_scores.get("visual_quality", 10) < 6:
            reasons.append("Use a higher resolution image")
        if criteria_scores.get("uniqueness", 10) < 5:
            reasons.append("Create a custom banner instead of stock images")
        
        # Add AI summary if available
        if analysis.get("summary"):
            reasons.append(f"AI: {analysis['summary']}")
        
        return self._result(
            final_score,
            reasons,
            {
                "has_cover": True,
                "url": cover_url[:100],
                "ai_analyzed": True,
                "criteria_scores": criteria_scores
            }
        )
