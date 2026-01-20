"""
Experience Scorer

Evaluates: number of roles, recency, bullet count, action verbs, metrics, impact.
This is typically the highest-weighted section for recruiters.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import count_metrics, count_action_verbs, has_keywords, is_standard_title


class ExperienceScorer(BaseSectionScorer):
    """Score the Experience section (1-10)."""
    
    key = "experience"
    display_name = "Experience Score"
    
    TECH_TOOLS = [
        'python', 'java', 'react', 'aws', 'docker', 'kubernetes', 'sql',
        'node', 'typescript', 'javascript', 'mongodb', 'redis', 'graphql',
        'git', 'terraform', 'jenkins', 'spark', 'kafka', 'postgresql'
    ]
    
    IMPACT_KEYWORDS = [
        'revenue', 'growth', 'scale', 'led', 'managed', 'built',
        'launched', 'optimized', 'reduced', 'increased', 'improved',
        'saved', 'generated', 'achieved', 'delivered'
    ]
    
    def score(self, profile: dict) -> dict:
        positions = profile.get("positions", []) or profile.get("experience", []) or []
        reasons = []
        signals = {}
        
        if not positions:
            return self._result(1.5, ["No experience entries"], signals)
        
        score = 1.0
        pos_count = len(positions)
        signals["position_count"] = pos_count
        
        # Position count
        if pos_count >= 5:
            score += 2.0
            reasons.append(f"Rich experience ({pos_count} roles)")
        elif pos_count >= 3:
            score += 1.5
            reasons.append(f"Good experience ({pos_count} roles)")
        elif pos_count >= 1:
            score += 0.5
            reasons.append(f"Some experience ({pos_count} roles)")
        
        # Aggregate all descriptions
        all_descriptions = ""
        positions_with_desc = 0
        for pos in positions[:5]:  # Analyze first 5
            desc = pos.get("description", "") or ""
            if len(desc) > 20:
                positions_with_desc += 1
            all_descriptions += " " + desc
        
        signals["positions_with_description"] = positions_with_desc
        
        # Description completeness
        if pos_count > 0 and positions_with_desc == pos_count:
            score += 1.5
            reasons.append("All positions have descriptions")
        elif positions_with_desc > 0:
            score += 0.5
            reasons.append(f"{positions_with_desc}/{pos_count} positions have descriptions")
        else:
            reasons.append("No descriptions in experience entries")
        
        # Metrics in descriptions
        metrics = count_metrics(all_descriptions)
        signals["metrics_count"] = metrics
        if metrics >= 5:
            score += 2.0
            reasons.append(f"Strong quantified impact ({metrics} metrics)")
        elif metrics >= 2:
            score += 1.0
            reasons.append("Some quantified results")
        
        # Action verbs
        verb_analysis = count_action_verbs(all_descriptions)
        signals["action_verb_ratio"] = verb_analysis["ratio"]
        if verb_analysis["ratio"] >= 0.6:
            score += 1.5
            reasons.append("Excellent action verb usage")
        elif verb_analysis["ratio"] >= 0.3:
            score += 0.5
            reasons.append("Good action verb usage")
        
        # Tech tools mentioned
        tools = has_keywords(all_descriptions, self.TECH_TOOLS)
        signals["tech_tools_count"] = tools
        if tools >= 3:
            score += 1.0
            reasons.append("Multiple technologies mentioned")
        
        # Title standardization (current role)
        if positions:
            current_title = positions[0].get("title", "")
            if is_standard_title(current_title):
                score += 0.5
                reasons.append("Clear, standard job title")
        
        return self._result(score, reasons, signals)
