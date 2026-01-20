"""
Scoring Helper Functions

Utility functions for profile scoring calculations.
"""

import re
from typing import Any


def clamp(value: float, min_val: float = 1.0, max_val: float = 10.0) -> float:
    """Clamp a value to the 1-10 range and round to 1 decimal."""
    clamped = max(min_val, min(max_val, value))
    return round(clamped, 1)


def safe_get(obj: Any, path: str, default: Any = None) -> Any:
    """Safely get nested object properties using dot notation."""
    try:
        for part in path.split('.'):
            if isinstance(obj, dict):
                obj = obj.get(part, default)
            else:
                obj = getattr(obj, part, default)
            if obj is None:
                return default
        return obj
    except (KeyError, AttributeError, TypeError):
        return default


def is_true(val: Any) -> bool:
    """Check boolean truthiness from various formats."""
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.lower().strip() in ('true', 'yes', '1')
    return bool(val)


def count_metrics(text: str) -> int:
    """
    Count quantified metrics in text.
    Looks for: percentages, dollar/rupee amounts, multipliers, numeric impact.
    """
    if not text:
        return 0
    
    patterns = [
        r'\d+%',                                    # percentages
        r'\$[\d,]+',                                # dollar amounts
        r'₹[\d,]+',                                 # rupee amounts
        r'\d+[xX]\s',                               # multipliers (2x, 10x)
        r'\d+\+?\s*(users|customers|clients|projects|leads|members)',
        r'\d+\s*(hours?|days?|weeks?|months?)\s*(saved|reduced)',
    ]
    
    count = 0
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        count += len(matches)
    
    return count


def count_action_verbs(text: str) -> dict:
    """
    Count action verbs at start of sentences/bullets.
    Returns: {total: int, action_count: int, ratio: float}
    """
    if not text:
        return {"total": 0, "action_count": 0, "ratio": 0.0}
    
    action_verbs = {
        'built', 'led', 'designed', 'developed', 'created', 'implemented',
        'managed', 'launched', 'reduced', 'increased', 'improved', 'achieved',
        'delivered', 'orchestrated', 'spearheaded', 'architected', 'optimized',
        'automated', 'scaled', 'established', 'transformed', 'pioneered',
        'executed', 'drove', 'accelerated', 'streamlined', 'mentored'
    }
    
    # Split by sentence/bullet markers
    sentences = re.split(r'[.•\n]', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    action_count = 0
    for sentence in sentences:
        first_word = sentence.split()[0].lower() if sentence.split() else ''
        if first_word in action_verbs:
            action_count += 1
    
    total = len(sentences)
    ratio = action_count / total if total > 0 else 0.0
    
    return {"total": total, "action_count": action_count, "ratio": ratio}


def is_custom_url(url: str) -> bool:
    """Check if LinkedIn URL is custom (not default numeric)."""
    if not url:
        return False
    
    match = re.search(r'linkedin\.com/in/([^/?]+)', url, re.IGNORECASE)
    if not match:
        return False
    
    username = match.group(1)
    # Default URLs often have many numbers or pattern like name-name-12345678
    if re.match(r'^\d+$', username):
        return False
    if re.match(r'^[a-z]+-[a-z]+-\d{8,}$', username, re.IGNORECASE):
        return False
    
    return True


def is_standard_title(title: str) -> bool:
    """Check if job title is industry-standard."""
    if not title:
        return False
    
    standard_titles = {
        'software engineer', 'product manager', 'data scientist',
        'data analyst', 'developer', 'designer', 'consultant',
        'analyst', 'manager', 'director', 'engineer', 'architect',
        'lead', 'founder', 'co-founder', 'ceo', 'cto', 'cfo', 'coo',
        'intern', 'associate', 'specialist', 'coordinator', 'executive',
        'head', 'vp', 'vice president', 'senior', 'principal', 'staff'
    }
    
    lower = title.lower()
    return any(t in lower for t in standard_titles)


def has_keywords(text: str, keywords: list[str]) -> int:
    """Count how many keywords are present in text."""
    if not text:
        return 0
    
    lower = text.lower()
    return sum(1 for kw in keywords if kw.lower() in lower)


def calculate_length_score(
    text: str,
    optimal_min: int,
    optimal_max: int,
    max_score: float = 10.0
) -> float:
    """
    Calculate a score based on text length.
    Returns higher score when length is in optimal range.
    """
    if not text:
        return 1.0
    
    length = len(text)
    
    if optimal_min <= length <= optimal_max:
        return max_score
    elif length < optimal_min:
        # Too short - linear scale from 1 to max_score
        ratio = length / optimal_min
        return clamp(1.0 + (max_score - 1.0) * ratio)
    else:
        # Too long - slight penalty but not too harsh
        overage = length - optimal_max
        penalty = min(overage / 500, 2.0)  # Max 2 point penalty
        return clamp(max_score - penalty)


def map_count_to_score(count: int, thresholds: list[tuple[int, float]]) -> float:
    """
    Map a count to a score using threshold ranges.
    thresholds: list of (min_count, score) sorted ascending by min_count
    """
    score = 1.0
    for min_count, threshold_score in thresholds:
        if count >= min_count:
            score = threshold_score
        else:
            break
    return clamp(score)
