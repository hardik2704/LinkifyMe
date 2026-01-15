"""
URL Validation Utilities

Validates and normalizes LinkedIn profile URLs.
"""

import re
from typing import Optional
from urllib.parse import urlparse, urlunparse


# LinkedIn URL patterns
LINKEDIN_PROFILE_PATTERNS = [
    r"^https?://(?:www\.)?linkedin\.com/in/[\w\-\.%]+/?$",
    r"^https?://(?:\w+\.)?linkedin\.com/in/[\w\-\.%]+/?$",
]


def is_valid_linkedin_url(url: str) -> bool:
    """
    Check if a URL is a valid LinkedIn profile URL.
    
    Valid formats:
    - https://linkedin.com/in/username
    - https://www.linkedin.com/in/username
    - http://linkedin.com/in/username/
    - https://in.linkedin.com/in/username
    """
    if not url:
        return False
    
    url = url.strip().lower()
    
    for pattern in LINKEDIN_PROFILE_PATTERNS:
        if re.match(pattern, url, re.IGNORECASE):
            return True
    
    return False


def normalize_linkedin_url(url: str) -> Optional[str]:
    """
    Normalize a LinkedIn profile URL.
    
    - Converts to HTTPS
    - Uses www.linkedin.com
    - Removes tracking parameters
    - Removes trailing slashes
    - Extracts clean username path
    
    Returns None if URL is invalid.
    """
    if not url:
        return None
    
    url = url.strip()
    
    # Parse the URL
    try:
        parsed = urlparse(url)
    except Exception:
        return None
    
    # Check if it's a LinkedIn URL
    if "linkedin.com" not in parsed.netloc.lower():
        return None
    
    # Extract the path
    path = parsed.path.strip("/")
    
    # Check for /in/ pattern
    if not path.startswith("in/"):
        return None
    
    # Get username (everything after in/)
    parts = path.split("/")
    if len(parts) < 2:
        return None
    
    username = parts[1]
    
    # Clean username (remove any query params that might have merged)
    username = username.split("?")[0].split("#")[0]
    
    if not username:
        return None
    
    # Construct normalized URL
    return f"https://www.linkedin.com/in/{username}"


def extract_username_from_url(url: str) -> Optional[str]:
    """Extract the LinkedIn username from a profile URL."""
    normalized = normalize_linkedin_url(url)
    if not normalized:
        return None
    
    # Extract username from normalized URL
    parts = normalized.split("/")
    return parts[-1] if parts else None


def is_valid_email(email: str) -> bool:
    """Basic email validation."""
    if not email:
        return False
    
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email.strip()))


def is_valid_phone(phone: str) -> bool:
    """
    Basic phone validation.
    
    Accepts:
    - 10+ digit numbers
    - Optional + prefix
    - Spaces, dashes, parentheses allowed
    """
    if not phone:
        return True  # Phone is optional
    
    # Remove common separators
    cleaned = re.sub(r"[\s\-\(\)\.]", "", phone)
    
    # Check for valid format: optional + followed by 10-15 digits
    pattern = r"^\+?\d{10,15}$"
    return bool(re.match(pattern, cleaned))
