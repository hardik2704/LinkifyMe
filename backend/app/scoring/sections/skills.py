"""
Skills Scorer

Evaluates: count, relevance, endorsements.
"""

from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.helpers import has_keywords


class SkillsScorer(BaseSectionScorer):
    """Score the Skills section (1-10)."""
    
    key = "skills"
    display_name = "Skills Score"
    
    HIGH_VALUE_SKILLS = [
        'python', 'java', 'javascript', 'react', 'sql', 'aws',
        'data analysis', 'machine learning', 'project management',
        'leadership', 'communication', 'node.js', 'typescript',
        'docker', 'kubernetes', 'system design', 'product management'
    ]
    
    def score(self, profile: dict) -> dict:
        skills = profile.get("skills", []) or []
        reasons = []
        signals = {}
        
        if not skills:
            return self._result(1.5, ["No skills listed"], signals)
        
        score = 1.0
        skill_count = len(skills)
        signals["skill_count"] = skill_count
        
        # Count scoring
        if skill_count >= 30:
            score += 3.0
            reasons.append(f"Comprehensive skills list ({skill_count})")
        elif skill_count >= 20:
            score += 2.5
            reasons.append(f"Strong skills list ({skill_count})")
        elif skill_count >= 10:
            score += 1.5
            reasons.append(f"Good skills list ({skill_count})")
        elif skill_count >= 5:
            score += 0.5
            reasons.append(f"Basic skills list ({skill_count})")
        
        # Extract skill names
        skill_names = []
        for skill in skills:
            if isinstance(skill, dict):
                skill_names.append(skill.get("name", "").lower())
            elif isinstance(skill, str):
                skill_names.append(skill.lower())
        
        skills_text = " ".join(skill_names)
        
        # High-value skill alignment
        valuable = has_keywords(skills_text, self.HIGH_VALUE_SKILLS)
        signals["high_value_skills"] = valuable
        if valuable >= 5:
            score += 3.0
            reasons.append("Excellent skill alignment")
        elif valuable >= 3:
            score += 2.0
            reasons.append("Good skill alignment")
        elif valuable >= 1:
            score += 1.0
            reasons.append("Some relevant skills")
        
        # Endorsements
        total_endorsements = 0
        skills_with_endorsements = 0
        for skill in skills:
            if isinstance(skill, dict):
                endorsements = skill.get("endorsementCount", 0) or skill.get("endorsements", 0) or 0
                if endorsements > 0:
                    skills_with_endorsements += 1
                    total_endorsements += endorsements
        
        signals["total_endorsements"] = total_endorsements
        signals["skills_with_endorsements"] = skills_with_endorsements
        
        if skills_with_endorsements >= 5:
            score += 2.0
            reasons.append(f"Well-endorsed skills ({total_endorsements} endorsements)")
        elif skills_with_endorsements >= 2:
            score += 1.0
            reasons.append("Some skill endorsements")
        
        return self._result(score, reasons, signals)
