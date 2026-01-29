"""
Scrape Nodes

Handles the LinkedIn profile scraping via Apify.
Contains: start_scrape, poll_apify, fetch_dataset
"""

import asyncio
from datetime import datetime
from typing import Any

from app.graph.state import LinkifyState
from app.services.sheets import get_sheets_service
from app.services.apify import get_apify_service


def start_scrape(state: LinkifyState) -> LinkifyState:
    """
    Start a LinkedIn profile scrape via Apify.
    
    Input: linkedin_url, pi_row
    Output: apify_run_id, scrape_attempt incremented
    """
    sheets = get_sheets_service()
    apify = get_apify_service()
    
    linkedin_url = state["linkedin_url"]
    scrape_attempt = state.get("scrape_attempt", 0) + 1
    
    # Start the Apify actor (sync wrapper around async)
    try:
        run_info = asyncio.run(apify.start_scrape(linkedin_url))
        apify_run_id = run_info["run_id"]
        apify_status = run_info["status"]
    except Exception as e:
        # Log error and return failed state
        error_message = f"Failed to start scrape: {str(e)}"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="scrape_start",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "scrape_attempt": scrape_attempt,
            "scrape_status": "failed",
            "error_message": error_message,
        }
    
    # Update Profile Information
    pi_row = state.get("pi_row")
    if pi_row:
        sheets.update_profile_info(pi_row, {
            "apify_run_id": apify_run_id,
            "scrape_attempt": scrape_attempt,
            "scrape_status": "scraping",
        })
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="scrape_start",
        status="success",
        message=f"Apify run started: {apify_run_id}",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "scrape_start",
        "status": "success",
        "message": f"Apify run started: {apify_run_id}",
    })
    
    return {
        **state,
        "apify_run_id": apify_run_id,
        "apify_status": apify_status,
        "scrape_attempt": scrape_attempt,
        "scrape_status": "scraping",
        "activity_log": activity_log,
    }


def poll_apify(state: LinkifyState) -> LinkifyState:
    """
    Poll Apify for scrape completion.
    
    Input: apify_run_id
    Output: apify_status updated
    """
    apify = get_apify_service()
    sheets = get_sheets_service()
    
    apify_run_id = state.get("apify_run_id")
    if not apify_run_id:
        return {**state, "scrape_status": "failed", "error_message": "No Apify run ID"}
    
    try:
        # Poll until complete
        final_status = asyncio.run(apify.poll_until_complete(apify_run_id))
        apify_status = final_status["status"]
    except Exception as e:
        error_message = f"Failed to poll Apify: {str(e)}"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="scrape_poll",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "scrape_status": "failed",
            "error_message": error_message,
        }
    
    # Log the activity
    status = "success" if apify_status == "SUCCEEDED" else "error"
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="scrape_poll",
        status=status,
        message=f"Apify run status: {apify_status}",
    )
    
    scrape_status = "completed" if apify_status == "SUCCEEDED" else "failed"
    
    return {
        **state,
        "apify_status": apify_status,
        "scrape_status": scrape_status if apify_status == "SUCCEEDED" else "failed",
    }


def fetch_dataset(state: LinkifyState) -> LinkifyState:
    """
    Fetch scraped data from Apify dataset.
    
    Input: apify_run_id
    Output: scraped_profile populated
    """
    apify = get_apify_service()
    sheets = get_sheets_service()
    
    apify_run_id = state.get("apify_run_id")
    if not apify_run_id:
        return {**state, "scrape_status": "failed", "error_message": "No Apify run ID"}
    
    try:
        # Get run status to get dataset ID
        run_status = asyncio.run(apify.get_run_status(apify_run_id))
        dataset_id = run_status.get("default_dataset_id")
        
        if not dataset_id:
            raise ValueError("No dataset ID found")
        
        # Get dataset items
        items = asyncio.run(apify.get_dataset_items(dataset_id))
        
        if not items:
            raise ValueError("No profile data in dataset")
        
        scraped_profile = items[0]
        
    except Exception as e:
        error_message = f"Failed to fetch dataset: {str(e)}"
        
        sheets.append_activity_log(
            unique_id=state["unique_id"],
            customer_id=state.get("customer_id"),
            event_type="fetch_dataset",
            status="error",
            message=error_message,
        )
        
        return {
            **state,
            "scrape_status": "failed",
            "error_message": error_message,
        }
    
    # Update Profile Information with scraped data
    pi_row = state.get("pi_row")
    if pi_row:
        # Extract all fields from Apify response
        # Note: Apify may use different key names, handle both possibilities
        update_data = {
            "scrape_status": "Completed",
            # Store complete raw JSON from Apify for reference
            "complete_scraped_data": scraped_profile,  # Will be JSON-serialized by update_profile_info
            "first_name": scraped_profile.get("firstName", ""),
            "last_name": scraped_profile.get("lastName", ""),
            "headline": scraped_profile.get("headline", ""),
            "about": scraped_profile.get("about", scraped_profile.get("summary", "")),
            "follower_count": str(
                scraped_profile.get("followerCount") or
                scraped_profile.get("followersCount") or 
                scraped_profile.get("followers") or 
                scraped_profile.get("numOfFollowers") or 
                ""
            ),
            "connection_count": str(scraped_profile.get("connectionsCount", scraped_profile.get("connections", ""))),
            "geo_location_name": scraped_profile.get("geoLocationName", scraped_profile.get("location", "")),
            # Profile picture - try multiple possible keys
            "profile_picture_url": (
                scraped_profile.get("profilePicture") or 
                scraped_profile.get("pictureUrl") or 
                scraped_profile.get("profilePictureUrl") or 
                scraped_profile.get("profilePicHighQuality") or
                ""
            ),
            # Cover picture - try multiple possible keys (Apify uses coverImageUrl)
            "cover_picture_url": (
                scraped_profile.get("coverImageUrl") or
                scraped_profile.get("backgroundImage") or
                scraped_profile.get("backgroundUrl") or 
                scraped_profile.get("coverImage") or
                scraped_profile.get("backgroundPicture") or
                scraped_profile.get("bgPic") or
                scraped_profile.get("bannerUrl") or
                ""
            ),
            # Birthday
            "birthday": scraped_profile.get("birthDate", "") or "",
            # Experience, Education, Skills - as JSON
            "experience_json": scraped_profile.get("experience", scraped_profile.get("positions", [])),
            "education_json": scraped_profile.get("education", scraped_profile.get("educations", [])),
            "skills_json": scraped_profile.get("skills", []),
            "certifications_json": list(
                scraped_profile.get("certifications") or 
                scraped_profile.get("licenses") or 
                scraped_profile.get("certificationsList") or 
                []
            ),
            # Verified and Premium status
            "is_verified": "Yes" if scraped_profile.get("isVerified", scraped_profile.get("verified", False)) else "No",
            "is_premium": "Yes" if scraped_profile.get("isPremium", scraped_profile.get("premium", False)) else "No",
        }
        sheets.update_profile_info(pi_row, update_data)
    
    # Log the activity
    sheets.append_activity_log(
        unique_id=state["unique_id"],
        customer_id=state.get("customer_id"),
        event_type="fetch_dataset",
        status="success",
        message=f"Profile data fetched: {scraped_profile.get('firstName', 'Unknown')} {scraped_profile.get('lastName', '')}",
    )
    
    # Update in-memory activity log
    activity_log = state.get("activity_log", [])
    activity_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "fetch_dataset",
        "status": "success",
        "message": f"Profile data fetched successfully",
    })
    
    return {
        **state,
        "scraped_profile": scraped_profile,
        "scrape_status": "completed",
        "activity_log": activity_log,
    }
