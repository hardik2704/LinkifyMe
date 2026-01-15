"""
Apify Service

Handles LinkedIn profile scraping via Apify actors.
"""

import asyncio
from datetime import datetime
from typing import Any, Optional

import httpx

from app.config import settings


class ApifyService:
    """Service for interacting with Apify API."""
    
    BASE_URL = "https://api.apify.com/v2"
    
    def __init__(self):
        self.api_token = settings.apify_api_token
        self.actor_id = settings.apify_actor_id
    
    @property
    def headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
    
    async def start_scrape(self, linkedin_url: str) -> dict[str, Any]:
        """
        Start an Apify actor run to scrape a LinkedIn profile.
        
        Returns:
            dict with 'run_id' and 'status'
        """
        # URL encode the actor_id for the API call
        from urllib.parse import quote
        encoded_actor_id = quote(self.actor_id, safe='')
        url = f"{self.BASE_URL}/acts/{encoded_actor_id}/runs"
        
        payload = {
            "startUrls": [{"url": linkedin_url}],
            "proxyConfiguration": {"useApifyProxy": True},
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "run_id": data["data"]["id"],
                "status": data["data"]["status"],
                "started_at": data["data"]["startedAt"],
            }
    
    async def get_run_status(self, run_id: str) -> dict[str, Any]:
        """
        Get the status of an Apify run.
        
        Returns:
            dict with 'status', 'finished_at', etc.
        """
        url = f"{self.BASE_URL}/actor-runs/{run_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "run_id": run_id,
                "status": data["data"]["status"],
                "finished_at": data["data"].get("finishedAt"),
                "default_dataset_id": data["data"].get("defaultDatasetId"),
            }
    
    async def get_dataset_items(self, dataset_id: str) -> list[dict[str, Any]]:
        """
        Get items from an Apify dataset.
        
        Returns:
            List of scraped profile data
        """
        url = f"{self.BASE_URL}/datasets/{dataset_id}/items"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                params={"format": "json"},
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()
    
    async def poll_until_complete(
        self,
        run_id: str,
        max_attempts: int = 30,
        poll_interval: float = 10.0,
    ) -> dict[str, Any]:
        """
        Poll an Apify run until it completes.
        
        Returns:
            Final run status dict
        """
        for _ in range(max_attempts):
            status = await self.get_run_status(run_id)
            
            if status["status"] in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
                return status
            
            await asyncio.sleep(poll_interval)
        
        return {"run_id": run_id, "status": "TIMEOUT", "error": "Polling timeout exceeded"}
    
    async def scrape_profile(self, linkedin_url: str) -> Optional[dict[str, Any]]:
        """
        Full scrape workflow: start, poll, and get results.
        
        Returns:
            Scraped profile data or None on failure
        """
        # Start the scrape
        run_info = await self.start_scrape(linkedin_url)
        run_id = run_info["run_id"]
        
        # Poll until complete
        final_status = await self.poll_until_complete(run_id)
        
        if final_status["status"] != "SUCCEEDED":
            return None
        
        # Get the dataset
        dataset_id = final_status.get("default_dataset_id")
        if not dataset_id:
            return None
        
        items = await self.get_dataset_items(dataset_id)
        
        if not items:
            return None
        
        # Return first profile
        return items[0]


# Singleton instance
_apify_service: Optional[ApifyService] = None


def get_apify_service() -> ApifyService:
    """Get the singleton ApifyService instance."""
    global _apify_service
    if _apify_service is None:
        _apify_service = ApifyService()
    return _apify_service
