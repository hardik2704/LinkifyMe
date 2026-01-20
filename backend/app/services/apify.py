"""
Apify Service

Handles LinkedIn profile scraping via Apify actors.
"""

import asyncio
from datetime import datetime
from typing import Any, Optional

import httpx

from app.config import settings
from app.services.logger import log_info, log_error, log_debug, log_warning


class ApifyService:
    """Service for interacting with Apify API."""
    
    BASE_URL = "https://api.apify.com/v2"
    
    def __init__(self):
        self.api_token = settings.apify_api_token
        self.actor_id = settings.apify_actor_id
        log_debug("apify", f"Apify service initialized", {
            "actor_id": self.actor_id,
            "has_token": bool(self.api_token),
        })
    
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
        from urllib.parse import quote
        encoded_actor_id = quote(self.actor_id, safe='')
        url = f"{self.BASE_URL}/acts/{encoded_actor_id}/runs"
        
        # Different actors have different input schemas
        # supreme_coder~linkedin-profile-scraper uses 'urls' with object format
        # curious_coder/linkedin-profile-scraper uses 'startUrls'
        if "supreme_coder" in self.actor_id:
            payload = {
                "urls": [{"url": linkedin_url}],
            }
        else:
            payload = {
                "startUrls": [{"url": linkedin_url}],
                "proxyConfiguration": {"useApifyProxy": True},
            }
        
        log_info("apify", f"Starting scrape for {linkedin_url}", {
            "actor_id": self.actor_id,
            "url": url,
        })
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0,
                )
                
                # Log response details for debugging
                log_debug("apify", f"Apify API response", {
                    "status_code": response.status_code,
                    "url": url,
                })
                
                if response.status_code != 201:
                    error_text = response.text
                    log_error("apify", f"Apify API error: {response.status_code}", {
                        "status_code": response.status_code,
                        "response": error_text[:500],
                    })
                    raise Exception(f"Apify API error: {response.status_code} - {error_text}")
                
                response.raise_for_status()
                data = response.json()
                
                run_id = data["data"]["id"]
                status = data["data"]["status"]
                
                log_info("apify", f"Scrape started successfully", {
                    "run_id": run_id,
                    "status": status,
                })
                
                return {
                    "run_id": run_id,
                    "status": status,
                    "started_at": data["data"]["startedAt"],
                }
                
            except httpx.HTTPStatusError as e:
                log_error("apify", f"HTTP error starting scrape: {str(e)}", {
                    "status_code": e.response.status_code if e.response else None,
                    "response": e.response.text[:500] if e.response else None,
                })
                raise
            except Exception as e:
                log_error("apify", f"Error starting scrape: {str(e)}")
                raise
    
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
            
            status = data["data"]["status"]
            log_debug("apify", f"Run status: {status}", {"run_id": run_id})
            
            return {
                "run_id": run_id,
                "status": status,
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
        
        log_debug("apify", f"Fetching dataset items", {"dataset_id": dataset_id})
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                params={"format": "json"},
                timeout=30.0,
            )
            response.raise_for_status()
            items = response.json()
            
            log_info("apify", f"Retrieved {len(items)} items from dataset", {
                "dataset_id": dataset_id,
                "item_count": len(items),
            })
            
            return items
    
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
        log_info("apify", f"Polling run until complete", {
            "run_id": run_id,
            "max_attempts": max_attempts,
        })
        
        for attempt in range(max_attempts):
            status = await self.get_run_status(run_id)
            
            if status["status"] in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
                log_info("apify", f"Run completed with status: {status['status']}", {
                    "run_id": run_id,
                    "attempts": attempt + 1,
                })
                return status
            
            await asyncio.sleep(poll_interval)
        
        log_error("apify", f"Polling timeout exceeded", {"run_id": run_id})
        return {"run_id": run_id, "status": "TIMEOUT", "error": "Polling timeout exceeded"}
    
    async def scrape_profile(
        self, 
        linkedin_url: str,
        max_retries: int = 3,
    ) -> Optional[dict[str, Any]]:
        """
        Full scrape workflow: start, poll, and get results.
        
        Includes retry logic for empty datasets (known issue with LinkedIn scrapers).
        
        Args:
            linkedin_url: LinkedIn profile URL
            max_retries: Number of retries if dataset is empty (default 3)
        
        Returns:
            Scraped profile data or None on failure
        """
        log_info("apify", f"🔍 Starting full scrape workflow", {"linkedin_url": linkedin_url})
        
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    log_info("apify", f"Retry attempt {attempt + 1}/{max_retries}", {
                        "linkedin_url": linkedin_url,
                    })
                    # Wait before retrying
                    await asyncio.sleep(5)
                
                # Start the scrape
                run_info = await self.start_scrape(linkedin_url)
                run_id = run_info["run_id"]
                
                # Poll until complete
                final_status = await self.poll_until_complete(run_id)
                
                if final_status["status"] != "SUCCEEDED":
                    log_error("apify", f"Scrape failed with status: {final_status.get('status')}", {
                        "run_id": run_id,
                        "status": final_status.get("status"),
                    })
                    continue  # Retry on non-success status
                
                # Get the dataset
                dataset_id = final_status.get("default_dataset_id")
                if not dataset_id:
                    log_error("apify", f"No dataset ID in completed run", {"run_id": run_id})
                    continue  # Retry if no dataset
                
                items = await self.get_dataset_items(dataset_id)
                
                if not items:
                    log_warning("apify", f"Empty dataset returned (attempt {attempt + 1}/{max_retries})", {
                        "dataset_id": dataset_id,
                        "run_id": run_id,
                    })
                    if attempt < max_retries - 1:
                        continue  # Retry on empty dataset
                    else:
                        log_error("apify", f"All retry attempts returned empty dataset", {
                            "linkedin_url": linkedin_url,
                        })
                        return None
                
                log_info("apify", f"✅ Scrape completed successfully", {
                    "linkedin_url": linkedin_url,
                    "profile_name": items[0].get("firstName", "") + " " + items[0].get("lastName", ""),
                    "attempt": attempt + 1,
                })
                
                # Return first profile
                return items[0]
                
            except Exception as e:
                log_error("apify", f"❌ Scrape workflow failed (attempt {attempt + 1}/{max_retries}): {str(e)}", {
                    "linkedin_url": linkedin_url,
                    "error": str(e),
                })
                if attempt < max_retries - 1:
                    continue  # Retry on exception
                return None
        
        log_error("apify", f"All {max_retries} retry attempts failed", {"linkedin_url": linkedin_url})
        return None


# Singleton instance
_apify_service: Optional[ApifyService] = None


def get_apify_service() -> ApifyService:
    """Get the singleton ApifyService instance."""
    global _apify_service
    if _apify_service is None:
        _apify_service = ApifyService()
    return _apify_service

