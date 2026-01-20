"""
Education Scorer

Evaluates: presence, completeness, degree info.
"""

from app.scoring.sections.base_sections import BaseSectionScorer


class EducationScorer(BaseSectionScorer):
    """Score the Education section (1-10)."""
    
    key = "education"
    display_name = "Education Score"
    
    def score(self, profile: dict) -> dict:
        educations = profile.get("educations", []) or profile.get("education", []) or []
        reasons = []
        signals = {}
        
        if not educations:
            return self._result(2.0, ["No education entries"], signals)
        
        score = 1.0
        edu_count = len(educations)
        signals["education_count"] = edu_count
        
        # Count complete entries
        complete_entries = 0
        for edu in educations:
            # Check for essential fields
            has_school = bool(edu.get("schoolName") or edu.get("school"))
            has_degree = bool(edu.get("degreeName") or edu.get("degree"))
            has_dates = bool(edu.get("startDate") or edu.get("timePeriod"))
            
            if has_school and has_degree:
                complete_entries += 1
        
        signals["complete_entries"] = complete_entries
        
        # Scoring
        if complete_entries >= 2:
            score += 6.0
            reasons.append(f"Multiple complete education entries")
        elif complete_entries >= 1:
            score += 4.0
            reasons.append("Complete education entry")
        elif edu_count >= 1:
            score += 2.0
            reasons.append("Partial education entry")
        
        # Field of study bonus
        has_field = any(
            edu.get("fieldOfStudy") or edu.get("field") 
            for edu in educations
        )
        if has_field:
            score += 1.5
            reasons.append("Field of study specified")
        signals["has_field_of_study"] = has_field
        
        # Dates bonus
        has_dates = any(
            edu.get("startDate") or edu.get("endDate") or edu.get("timePeriod")
            for edu in educations
        )
        if has_dates:
            score += 1.5
            reasons.append("Education timeline provided")
        signals["has_dates"] = has_dates
        
        return self._result(score, reasons, signals)
