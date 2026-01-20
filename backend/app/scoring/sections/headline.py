"""
Headline Scorer

Evaluates: length, role keywords, seniority keywords, quantified signals, clarity.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import has_keywords, count_metrics


class HeadlineScorer(BaseSectionScorer):
    """Score the LinkedIn headline (1-10)."""
    
    key = "headline"
    display_name = "Headline Score"
    
    # Keyword categories
    ROLE_KEYWORDS = [
        'engineer', 'developer', 'manager', 'analyst', 'designer',
        'founder', 'consultant', 'architect', 'lead', 'specialist',
        'scientist', 'director', 'head', 'vp', 'president', 'chief'
    ]
    
    SKILL_KEYWORDS = [
        'python', 'java', 'react', 'aws', 'cloud', 'ai', 'ml',
        'data', 'product', 'ux', 'ui', 'agile', 'devops', 'sql',
        'node', 'kubernetes', 'docker', 'blockchain', 'saas'
    ]
    
    SENIORITY_KEYWORDS = [
        'senior', 'staff', 'principal', 'lead', 'head', 'director',
        'vp', 'chief', 'founder', 'co-founder', 'cto', 'ceo', 'coo'
    ]
    
    def score(self, profile: dict) -> dict:
        headline = profile.get("headline", "") or ""
        reasons = []
        signals = {"length": len(headline)}
        
        if not headline:
            return self._result(1.0, ["No headline provided"], signals)
        
        score = 1.0  # Start at minimum
        
        # Length check (optimal: 60-120 chars)
        length = len(headline)
        if length >= 60 and length <= 120:
            score += 2.0
            reasons.append("Optimal headline length")
        elif length >= 30:
            score += 1.0
            reasons.append("Decent headline length")
        else:
            reasons.append("Headline too short")
        
        signals["length"] = length
        
        # Role keywords
        role_matches = has_keywords(headline, self.ROLE_KEYWORDS)
        if role_matches >= 1:
            score += 2.0
            reasons.append(f"Contains role keyword(s)")
        signals["role_keywords"] = role_matches
        
        # Skill keywords
        skill_matches = has_keywords(headline, self.SKILL_KEYWORDS)
        if skill_matches >= 2:
            score += 2.0
            reasons.append(f"Multiple skill keywords")
        elif skill_matches >= 1:
            score += 1.0
            reasons.append(f"Contains skill keyword")
        signals["skill_keywords"] = skill_matches
        
        # Seniority indicators
        seniority_matches = has_keywords(headline, self.SENIORITY_KEYWORDS)
        if seniority_matches >= 1:
            score += 1.5
            reasons.append("Seniority level indicated")
        signals["seniority_keywords"] = seniority_matches
        
        # Quantified metrics (%, $, x)
        metrics = count_metrics(headline)
        if metrics >= 1:
            score += 1.5
            reasons.append("Contains quantified impact")
        signals["metrics_count"] = metrics
        
        # Clarity - no excessive punctuation or emojis
        emoji_count = sum(1 for c in headline if ord(c) > 127)
        if emoji_count > 3:
            score -= 1.0
            reasons.append("Too many emojis/special chars")
        signals["emoji_count"] = emoji_count
        
        return self._result(score, reasons, signals)
