#!/usr/bin/env python3
"""
Update Demo User Script

Updates the demo user account to fix the total_attempts count.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.sheets import get_sheets_service


def fix_demo_user():
    """Fix the demo user's total_attempts to match actual attempts."""
    
    DEMO_LINKEDIN_URL = "https://www.linkedin.com/in/hardik-mahendru/"
    
    print("🔧 Fixing Demo User Account...")
    print(f"   LinkedIn: {DEMO_LINKEDIN_URL}")
    print()
    
    sheets = get_sheets_service()
    
    # Find the demo user
    existing = sheets.find_user_by_linkedin_url(DEMO_LINKEDIN_URL)
    
    if not existing:
        print("❌ Demo user not found!")
        return
    
    row, user_data = existing
    user_id = user_data["user_id"]
    
    print(f"✅ Found demo user: {user_id} (row {row})")
    print(f"   Current total_attempts: {user_data.get('total_attempts', 0)}")
    
    # Get actual attempts from Profile Info
    attempts = sheets.get_user_attempts(user_id)
    actual_count = len(attempts)
    
    print(f"   Actual attempts found: {actual_count}")
    
    if attempts:
        print("   Attempts:")
        for a in attempts:
            print(f"      - {a['attempt_id']}: Score {a['final_score']} ({a['timestamp']})")
    
    # Update the user with correct count - note: row number, not user_id
    updates = {"total_attempts": actual_count}
    if actual_count == 0:
        updates["last_attempt_at"] = ""
    elif attempts:
        # Use the most recent attempt's timestamp
        updates["last_attempt_at"] = attempts[0].get("timestamp", "")
    
    sheets.update_user(row, updates)
    
    print()
    print(f"✅ Updated total_attempts to {actual_count}")
    print()
    print("The profile page should now correctly show the attempts.")


if __name__ == "__main__":
    fix_demo_user()
