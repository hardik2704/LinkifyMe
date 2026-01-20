# Rules module init

from pathlib import Path
from typing import Any
import re
import yaml

from app.scoring.helpers import clamp


RULES_DIR = Path(__file__).parent


def load_rules_file(filepath: Path) -> dict[str, Any]:
    """Load a YAML rules file."""
    if not filepath.exists():
        return {"version": 1, "rules": []}
    
    with open(filepath) as f:
        return yaml.safe_load(f) or {"version": 1, "rules": []}


def check_rule_condition(rule: dict, section_key: str, text: str) -> bool:
    """
    Check if a rule condition matches.
    
    Supports:
    - any_regex: matches if any regex pattern matches
    - all_regex: matches if all regex patterns match
    - min_length: matches if text length >= value
    - max_length: matches if text length <= value
    - contains: matches if any substring is present
    """
    when = rule.get("when", {})
    rule_section = rule.get("section", "")
    
    # Check if rule applies to this section
    if rule_section and rule_section != section_key:
        return False
    
    # any_regex
    if "any_regex" in when:
        patterns = when["any_regex"]
        if any(re.search(p, text, re.IGNORECASE) for p in patterns):
            return True
        return False
    
    # all_regex
    if "all_regex" in when:
        patterns = when["all_regex"]
        if all(re.search(p, text, re.IGNORECASE) for p in patterns):
            return True
        return False
    
    # min_length
    if "min_length" in when:
        if len(text) >= when["min_length"]:
            return True
        return False
    
    # max_length
    if "max_length" in when:
        if len(text) <= when["max_length"]:
            return True
        return False
    
    # contains
    if "contains" in when:
        substrings = when["contains"]
        if any(s.lower() in text.lower() for s in substrings):
            return True
        return False
    
    return False


def apply_rules(
    section_key: str,
    score: float,
    profile: dict,
    persona: str = "big_company_recruiter"
) -> tuple[float, list[str]]:
    """
    Apply rules to modify a section score.
    
    Order: base_rules -> persona_rules -> hr_insights_compiled
    
    Returns: (modified_score, list of rule reasons)
    """
    reasons = []
    
    # Get text for this section (for pattern matching)
    text = _get_section_text(section_key, profile)
    
    # Load rule files in order
    rule_files = [
        RULES_DIR / "base_rules.yaml",
        RULES_DIR / "persona_rules" / f"{persona}.yaml",
        RULES_DIR / "hr_insights_compiled.yaml",
    ]
    
    for rule_file in rule_files:
        rules_config = load_rules_file(rule_file)
        
        for rule in rules_config.get("rules", []):
            if rule.get("section", "") != section_key:
                continue
            
            if check_rule_condition(rule, section_key, text):
                effect = rule.get("effect", {})
                delta = effect.get("delta", 0)
                
                if delta != 0:
                    score += delta
                    reasons.append(f"{rule.get('reason', 'Rule applied')} ({'+' if delta > 0 else ''}{delta})")
    
    return clamp(score), reasons


def _get_section_text(section_key: str, profile: dict) -> str:
    """Extract the relevant text for a section from the profile."""
    mapping = {
        "headline": profile.get("headline", ""),
        "about": profile.get("about", "") or profile.get("summary", ""),
        "experience": " ".join(
            p.get("description", "") for p in profile.get("positions", [])
        ),
        "education": " ".join(
            e.get("schoolName", "") + " " + e.get("degreeName", "")
            for e in profile.get("educations", [])
        ),
        "skills": " ".join(
            s.get("name", "") if isinstance(s, dict) else str(s)
            for s in profile.get("skills", [])
        ),
    }
    return mapping.get(section_key, "")


__all__ = ["apply_rules", "load_rules_file"]
