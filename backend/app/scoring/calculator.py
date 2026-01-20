"""
Scoring Calculator

The main entry point for deterministic profile scoring.
Computes section scores, applies rules, and calculates final weighted score.
"""

from typing import Any, Optional

from app.scoring.helpers import clamp
from app.scoring.sections import SCORER_MAP
from app.scoring.personas import load_persona, list_personas
from app.scoring.rules import apply_rules


# Quality gates - hard caps on final score
QUALITY_GATES = {
    "no_profile_photo": 7.0,   # Max 7 if no photo
    "no_headline": 7.5,        # Max 7.5 if no headline
    "no_experience": 4.5,      # Max 4.5 if no experience
}


def get_pre_scores(
    profile: dict,
    linkedin_url: str,
    customer_id: Optional[str] = None,
    persona: str = "big_company_recruiter"
) -> dict[str, Any]:
    """
    Calculate deterministic pre-scores for a LinkedIn profile.
    
    Args:
        profile: Scraped LinkedIn profile data
        linkedin_url: The LinkedIn profile URL
        customer_id: Optional customer ID
        persona: Which persona weights to use (default: big_company_recruiter)
        
    Returns:
        Dict with all section scores and final weighted score.
        Matches Google Sheets column format.
    """
    # Validate persona
    available_personas = list_personas()
    if persona not in available_personas:
        persona = "big_company_recruiter"
    
    # Load persona config
    persona_config = load_persona(persona)
    weights = persona_config["weights"]
    
    # Calculate raw section scores
    section_results = {}
    for key, scorer in SCORER_MAP.items():
        result = scorer.score(profile)
        section_results[key] = {
            "raw": result["score_raw"],
            "reasons": result["reasons"],
            "signals": result["signals"],
        }
    
    # Apply rules to each section
    rules_applied = []
    for key in section_results:
        raw_score = section_results[key]["raw"]
        modified_score, rule_reasons = apply_rules(key, raw_score, profile, persona)
        section_results[key]["after_rules"] = modified_score
        section_results[key]["reasons"].extend(rule_reasons)
        rules_applied.extend(rule_reasons)
    
    # Apply quality gates
    gates_applied = []
    score_cap = 10.0
    
    if not profile.get("pictureUrl"):
        score_cap = min(score_cap, QUALITY_GATES["no_profile_photo"])
        gates_applied.append("No profile photo (capped at 7.0)")
    
    if not profile.get("headline"):
        score_cap = min(score_cap, QUALITY_GATES["no_headline"])
        gates_applied.append("No headline (capped at 7.5)")
    
    positions = profile.get("positions", []) or profile.get("experience", [])
    if not positions:
        score_cap = min(score_cap, QUALITY_GATES["no_experience"])
        gates_applied.append("No experience (capped at 4.5)")
    
    # Calculate weighted final score
    weighted_sum = 0.0
    section_contributions = {}
    
    for key, weight in weights.items():
        score = section_results.get(key, {}).get("after_rules", 5.0)
        contribution = score * weight
        weighted_sum += contribution
        section_contributions[key] = {
            "score": score,
            "weight": weight,
            "contribution": round(contribution, 3),
        }
    
    # Apply cap and clamp
    final_score = clamp(min(weighted_sum, score_cap))
    
    # Build API response
    first_name = profile.get("firstName", "") or profile.get("first_name", "") or "Unknown"
    
    result = {
        # Required output columns
        "Customer ID": customer_id or "PENDING",
        "LinkedIn Profile": linkedin_url,
        "First Name": first_name,
        "Headline Score": section_results["headline"]["after_rules"],
        "Connection Score": section_results["connections"]["after_rules"],
        "Follower Score": section_results["followers"]["after_rules"],
        "About Score": section_results["about"]["after_rules"],
        "Profile Pic Score": section_results["profile_pic"]["after_rules"],
        "Cover_picture Score": section_results["cover_picture"]["after_rules"],
        "Experience Score": section_results["experience"]["after_rules"],
        "Education Score": section_results["education"]["after_rules"],
        "Skills Score": section_results["skills"]["after_rules"],
        "Licenses & Certifications Score": section_results["licenses_certs"]["after_rules"],
        "Is Verified Score": section_results["verified"]["after_rules"],
        "Is Premium Score": section_results["premium"]["after_rules"],
        "Final Score": final_score,
        
        # Debug info
        "_debug": {
            "persona": persona,
            "weights": weights,
            "quality_gates_applied": gates_applied,
            "rules_applied": rules_applied,
            "sections": {
                key: {
                    "raw": data["raw"],
                    "after_rules": data["after_rules"],
                    "reasons": data["reasons"],
                }
                for key, data in section_results.items()
            },
            "contributions": section_contributions,
            "weighted_sum_before_cap": round(weighted_sum, 2),
        }
    }
    
    return result


def validate_persona_weights(persona: str) -> bool:
    """Validate that a persona's weights sum to 1.0."""
    try:
        config = load_persona(persona)
        total = sum(config["weights"].values())
        return 0.99 <= total <= 1.01
    except Exception:
        return False


def get_all_personas() -> list[dict]:
    """Get all available personas with their descriptions."""
    result = []
    for name in list_personas():
        try:
            config = load_persona(name)
            result.append({
                "name": name,
                "description": config.get("description", ""),
                "priorities": config.get("priorities", []),
            })
        except Exception:
            continue
    return result
