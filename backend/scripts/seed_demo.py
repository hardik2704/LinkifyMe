#!/usr/bin/env python3
"""
Seed Demo User Script

Creates a demo user account in the Users sheet with predefined data.
This script should be run once to set up the demo account.

Demo Account Details:
- LinkedIn URL: https://www.linkedin.com/in/hardik-mahendru/
- Email: hardymahen2704@gmail.com  
- Phone: 9958448250
- Target Group: recruiters
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from app.services.sheets import get_sheets_service
from app.services.counter import get_user_id_counter


def seed_demo_user():
    """Create the demo user account."""
    
    # Demo account details
    DEMO_LINKEDIN_URL = "https://www.linkedin.com/in/hardik-mahendru/"
    DEMO_EMAIL = "hardymahen2704@gmail.com"
    DEMO_PHONE = "9958448250"
    DEMO_NAME = "Hardik Mahendru"
    
    print("🌱 Seeding Demo User Account...")
    print(f"   LinkedIn: {DEMO_LINKEDIN_URL}")
    print(f"   Email: {DEMO_EMAIL}")
    print(f"   Phone: {DEMO_PHONE}")
    print()
    
    sheets = get_sheets_service()
    
    # Check if user already exists
    existing = sheets.find_user_by_linkedin_url(DEMO_LINKEDIN_URL)
    
    if existing:
        row, user_data = existing
        print(f"✅ Demo user already exists!")
        print(f"   User ID: {user_data['user_id']}")
        print(f"   Total Attempts: {user_data['total_attempts']}")
        print(f"   Created At: {user_data['created_at']}")
        return user_data
    
    # Create new demo user
    row, user_id = sheets.create_user(
        linkedin_url=DEMO_LINKEDIN_URL,
        email=DEMO_EMAIL,
        phone=DEMO_PHONE,
        name=DEMO_NAME,
    )
    
    print(f"✅ Demo user created successfully!")
    print(f"   User ID: {user_id}")
    print(f"   Row: {row}")
    print()
    print("🎉 Demo account is ready!")
    print()
    print("You can now test with:")
    print(f'   curl "http://localhost:8000/api/user/lookup?linkedin_url={DEMO_LINKEDIN_URL}"')
    
    return {
        "user_id": user_id,
        "linkedin_url": DEMO_LINKEDIN_URL,
        "email": DEMO_EMAIL,
        "phone": DEMO_PHONE,
        "name": DEMO_NAME,
    }


if __name__ == "__main__":
    seed_demo_user()
