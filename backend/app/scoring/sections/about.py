"""
About Section Scorer

Evaluates: length, structure, quantification, keywords, buzzwords.
"""

import re
from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import count_metrics, has_keywords


class AboutScorer(BaseSectionScorer):
    """Score the About/Summary section (1-10)."""
    
    key = "about"
    display_name = "About Score"
    
    BANNED_BUZZWORDS = [
        'synergy', 'hardworking', 'team player', 'passionate',
        'results-driven', 'detail-oriented', 'go-getter', 'ninja',
        'rockstar', 'guru', 'wizard', 'motivated', 'self-starter'
    ]
    
    VALUABLE_KEYWORDS = [
        'python', 'java', 'javascript', 'react', 'aws', 'cloud',
        'data', 'ml', 'ai', 'led', 'built', 'grew', 'managed',
        'revenue', 'customers', 'users', 'launched'
    ]
    
    def score(self, profile: dict) -> dict:
        about = profile.get("about", "") or profile.get("summary", "") or ""
        reasons = []
        signals = {}
        
        if not about:
            return self._result(1.0, ["No about section"], signals)
        
        score = 1.0
        length = len(about)
        signals["length"] = length
        
        # Length scoring (optimal: 250-600 chars)
        if length >= 600:
            score += 2.5
            reasons.append("Comprehensive length")
        elif length >= 250:
            score += 1.5
            reasons.append("Good length")
        elif length >= 100:
            score += 0.5
            reasons.append("Minimal length")
        else:
            reasons.append("Too short")
        
        # Structure (bullets, line breaks, paragraphs)
        has_structure = bool(re.search(r'[\n•\-—]', about))
        if has_structure:
            score += 1.5
            reasons.append("Well-structured with formatting")
        signals["has_structure"] = has_structure
        
        # Quantified metrics
        metrics = count_metrics(about)
        if metrics >= 3:
            score += 2.5
            reasons.append(f"Multiple quantified achievements ({metrics})")
        elif metrics >= 1:
            score += 1.5
            reasons.append("Contains metrics")
        signals["metrics_count"] = metrics
        
        # Valuable keywords
        valuable = has_keywords(about, self.VALUABLE_KEYWORDS)
        if valuable >= 3:
            score += 1.5
            reasons.append("Rich with relevant keywords")
        elif valuable >= 1:
            score += 0.5
            reasons.append("Some relevant keywords")
        signals["valuable_keywords"] = valuable
        
        # Buzzword penalty
        buzzwords = has_keywords(about, self.BANNED_BUZZWORDS)
        if buzzwords >= 3:
            score -= 2.0
            reasons.append("Too many generic buzzwords")
        elif buzzwords >= 1:
            score -= 0.5
            reasons.append("Contains some buzzwords")
        signals["buzzword_count"] = buzzwords
        
        return self._result(score, reasons, signals)
