"""
RentBasket API Integration Service

Handles JWT token generation and lead creation for Razorpay payment flow.
Uses testapi.rentbasket.com (test) — switch to production URLs via env vars.
"""

import os
import time
import httpx
from typing import Optional
from app.services.logger import log_info, log_error


# API base URL — configurable via env var for test vs production
RENTBASKET_API_BASE = os.getenv("RENTBASKET_API_BASE", "https://testapi.rentbasket.com")

# JWT token cache (avoid fetching on every request)
_jwt_cache: dict = {
    "token": None,
    "fetched_at": 0,
    "ttl": 3600,  # Cache for 1 hour
}


async def get_jwt_token() -> str:
    """
    Fetch a JWT token from the RentBasket API.
    
    Caches the token for 1 hour to avoid repeated calls.
    Tries POST first (since GET returned 405), falls back to GET.
    
    Returns:
        JWT token string
    
    Raises:
        Exception if unable to obtain token
    """
    # Check cache
    now = time.time()
    if _jwt_cache["token"] and (now - _jwt_cache["fetched_at"]) < _jwt_cache["ttl"]:
        return _jwt_cache["token"]
    
    url = f"{RENTBASKET_API_BASE}/get-jwt-token"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try POST first
        try:
            response = await client.post(url)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token") or data.get("jwt") or data.get("access_token") or data.get("data", {}).get("token", "")
                if token:
                    _jwt_cache["token"] = token
                    _jwt_cache["fetched_at"] = now
                    log_info("rentbasket", f"JWT token obtained via POST")
                    return token
                # If we got 200 but no recognized token field, log the response for debugging
                log_info("rentbasket", f"JWT response structure: {list(data.keys())}")
                # Sometimes the entire response IS the token or it's nested differently
                if isinstance(data, str):
                    _jwt_cache["token"] = data
                    _jwt_cache["fetched_at"] = now
                    return data
                # Store whatever we got — the token might be the top-level value
                token_str = str(data) if data else ""
                if token_str:
                    _jwt_cache["token"] = token_str
                    _jwt_cache["fetched_at"] = now
                    return token_str
        except Exception as e:
            log_error("rentbasket", f"POST JWT failed: {str(e)}, trying GET...")
        
        # Fallback: try GET
        try:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token") or data.get("jwt") or data.get("access_token") or data.get("data", {}).get("token", "")
                if token:
                    _jwt_cache["token"] = token
                    _jwt_cache["fetched_at"] = now
                    log_info("rentbasket", f"JWT token obtained via GET")
                    return token
        except Exception as e:
            log_error("rentbasket", f"GET JWT also failed: {str(e)}")
    
    raise Exception("Failed to obtain JWT token from RentBasket API")


async def create_lead(
    name: str,
    email: str,
    mobile: str,
    jwt_token: Optional[str] = None,
) -> dict:
    """
    Create a lead in RentBasket and get the Razorpay payment link.
    
    Calls: GET /insert-sm-leads?name=...&email=...&mobile=...
    
    Args:
        name: Customer name
        email: Customer email
        mobile: Customer mobile number (digits only, no country code prefix for API)
        jwt_token: Optional JWT token (will fetch if not provided)
    
    Returns:
        Dict with keys: payment_link, unique_id, id, and full API response data
    
    Raises:
        Exception on API failure
    """
    if not jwt_token:
        jwt_token = await get_jwt_token()
    
    url = f"{RENTBASKET_API_BASE}/insert-sm-leads"
    params = {
        "name": name,
        "email": email,
        "mobile": mobile,
    }
    headers = {
        "Authorization": f"Bearer {jwt_token}",
    }
    
    log_info("rentbasket", f"Creating lead for {email}", {
        "name": name,
        "mobile": mobile[:4] + "****",  # Partial mobile for privacy
    })
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            
            if response.status_code != 200:
                error_msg = f"RentBasket API returned {response.status_code}: {response.text[:200]}"
                log_error("rentbasket", error_msg)
                raise Exception(error_msg)
            
            data = response.json()
            
            if data.get("status") != "success":
                error_msg = f"RentBasket API error: {data.get('message', 'Unknown error')}"
                log_error("rentbasket", error_msg)
                raise Exception(error_msg)
            
            lead_data = data.get("data", {})
            payment_link = lead_data.get("payment_link", "")
            rb_unique_id = str(lead_data.get("unique_id", ""))
            
            if not payment_link:
                raise Exception("No payment_link in RentBasket response")
            
            log_info("rentbasket", f"Lead created successfully", {
                "rb_unique_id": rb_unique_id,
                "lead_id": lead_data.get("id"),
                "has_payment_link": bool(payment_link),
            })
            
            return {
                "payment_link": payment_link,
                "rb_unique_id": rb_unique_id,
                "lead_id": lead_data.get("id"),
                "full_response": lead_data,
            }
            
        except httpx.HTTPError as e:
            error_msg = f"HTTP error calling RentBasket: {str(e)}"
            log_error("rentbasket", error_msg)
            raise Exception(error_msg)
