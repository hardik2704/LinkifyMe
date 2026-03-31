"""
RentBasket API Service

Handles JWT authentication and lead creation for Razorpay payment links.
"""

import time
import httpx

from app.config import get_settings
from app.services.logger import log_info, log_error


# Cached JWT token and expiry
_jwt_token: str | None = None
_jwt_expiry: float = 0


async def get_jwt_token() -> str:
    """
    Get a valid JWT token from the RentBasket API.
    Caches the token and refreshes when expired (1 hour TTL).
    """
    global _jwt_token, _jwt_expiry

    if _jwt_token and time.time() < _jwt_expiry:
        return _jwt_token

    settings = get_settings()

    # If a static token is configured, use it directly
    if settings.rentbasket_jwt_token:
        _jwt_token = settings.rentbasket_jwt_token
        _jwt_expiry = time.time() + 3600  # 1 hour
        return _jwt_token

    # Otherwise fetch from the API
    url = f"{settings.rentbasket_api_base}/get-jwt-token"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    token = data.get("token") or data.get("access_token") or data.get("jwt")
    if not token:
        raise ValueError(f"No token found in JWT response: {list(data.keys())}")

    _jwt_token = token
    _jwt_expiry = time.time() + 3600  # Cache for 1 hour
    log_info("rentbasket", f"JWT token refreshed, expires in 1 hour")
    return _jwt_token


async def create_payment_link(name: str, email: str, mobile: str) -> dict:
    """
    Create a lead in RentBasket and get a Razorpay payment link.

    Returns the full response data including payment_link.
    """
    settings = get_settings()
    token = await get_jwt_token()

    url = f"{settings.rentbasket_api_base}/insert-sm-leads"
    payload = {
        "name": name or "Customer",
        "email": email,
        "mobile": mobile,
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    log_info("rentbasket", f"Creating payment link for {email}")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    if data.get("status") != "success":
        log_error("rentbasket", f"Lead creation failed: {data}")
        raise ValueError(f"RentBasket API error: {data.get('message', 'Unknown error')}")

    payment_link = data.get("data", {}).get("payment_link")
    if not payment_link:
        raise ValueError("No payment_link in RentBasket response")

    log_info("rentbasket", f"Payment link created for {email}: {payment_link}")
    return {
        "payment_link": payment_link,
        "unique_id": data.get("data", {}).get("unique_id"),
        "lead_id": data.get("data", {}).get("id"),
    }
