"""
Atomic Counter Service

Uses Google Apps Script-style locking via a dedicated cell
in the spreadsheet to provide atomic increment operations.
"""

from datetime import datetime
from typing import Optional

import gspread

from app.config import settings
from app.services.sheets import get_sheets_service


# Counter sheet name and cell
COUNTER_SHEET_NAME = "Counter"
USER_COUNTER_CELL = "A3"  # Counter for User IDs


class UserIdCounter:
    """
    Atomic counter for generating sequential User IDs.
    
    Uses a dedicated cell in the Counter sheet.
    Format: USR-00001
    """
    
    PREFIX = "USR"
    
    def __init__(self):
        self._sheets_service = get_sheets_service()
    
    def _get_counter_sheet(self) -> gspread.Worksheet:
        """Get or create the counter sheet."""
        spreadsheet = self._sheets_service._get_spreadsheet()
        
        try:
            sheet = spreadsheet.worksheet(COUNTER_SHEET_NAME)
            # Ensure user counter row exists
            try:
                sheet.acell(USER_COUNTER_CELL).value
            except:
                sheet.update_cell(3, 1, "0")
                sheet.update_cell(4, 1, "User Counter")
            return sheet
        except gspread.WorksheetNotFound:
            # Create the counter sheet with initial values
            sheet = spreadsheet.add_worksheet(COUNTER_SHEET_NAME, rows=10, cols=5)
            sheet.update_cell(3, 1, "0")  # User Counter
            sheet.update_cell(4, 1, "User Counter")
            return sheet
    
    def get_next_id(self) -> str:
        """
        Get the next User ID atomically.
        Returns formatted ID like "USR-00001".
        """
        sheet = self._get_counter_sheet()
        
        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Read current user counter value (row 3)
                current_value = sheet.acell(USER_COUNTER_CELL).value
                current_count = int(current_value) if current_value else 0
                
                # Increment
                new_count = current_count + 1
                
                # Write back
                sheet.update_cell(3, 1, str(new_count))
                sheet.update_cell(3, 3, datetime.utcnow().isoformat())
                
                # Format ID with zero-padding
                return f"{self.PREFIX}-{new_count:05d}"
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"Failed to generate User ID after {max_retries} attempts: {e}")
                continue
        
        raise RuntimeError("Failed to generate User ID")
    
    def get_current_count(self) -> int:
        """Get the current user counter value without incrementing."""
        sheet = self._get_counter_sheet()
        value = sheet.acell(USER_COUNTER_CELL).value
        return int(value) if value else 0


# Singleton instance
_user_counter: Optional[UserIdCounter] = None


def get_user_id_counter() -> UserIdCounter:
    """Get the singleton UserIdCounter instance."""
    global _user_counter
    if _user_counter is None:
        _user_counter = UserIdCounter()
    return _user_counter

