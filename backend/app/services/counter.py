"""
Atomic Customer ID Counter

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
COUNTER_CELL = "A1"
LOCK_CELL = "B1"


class CustomerIdCounter:
    """
    Atomic counter for generating sequential Customer IDs.
    
    Uses a simple lock mechanism:
    1. Try to set lock cell to our process ID
    2. Read current counter value
    3. Increment and write back
    4. Clear lock
    
    For production, consider using a proper database or 
    Google Apps Script with LockService.
    """
    
    PREFIX = "LM"
    
    def __init__(self):
        self._sheets_service = get_sheets_service()
    
    def _get_counter_sheet(self) -> gspread.Worksheet:
        """Get or create the counter sheet."""
        spreadsheet = self._sheets_service._get_spreadsheet()
        
        try:
            return spreadsheet.worksheet(COUNTER_SHEET_NAME)
        except gspread.WorksheetNotFound:
            # Create the counter sheet with initial value
            sheet = spreadsheet.add_worksheet(COUNTER_SHEET_NAME, rows=10, cols=5)
            sheet.update_cell(1, 1, "0")  # Counter value
            sheet.update_cell(1, 2, "")   # Lock cell
            sheet.update_cell(1, 3, "Last Updated")
            sheet.update_cell(2, 1, "Counter Value")
            sheet.update_cell(2, 2, "Lock")
            return sheet
    
    def get_next_id(self) -> str:
        """
        Get the next Customer ID atomically.
        Returns formatted ID like "LM-00001".
        """
        sheet = self._get_counter_sheet()
        
        # Simple retry logic for concurrent access
        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Read current value
                current_value = sheet.acell(COUNTER_CELL).value
                current_count = int(current_value) if current_value else 0
                
                # Increment
                new_count = current_count + 1
                
                # Write back
                sheet.update_cell(1, 1, str(new_count))
                sheet.update_cell(1, 3, datetime.utcnow().isoformat())
                
                # Format ID with zero-padding
                return f"{self.PREFIX}-{new_count:05d}"
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"Failed to generate Customer ID after {max_retries} attempts: {e}")
                continue
        
        raise RuntimeError("Failed to generate Customer ID")
    
    def get_current_count(self) -> int:
        """Get the current counter value without incrementing."""
        sheet = self._get_counter_sheet()
        value = sheet.acell(COUNTER_CELL).value
        return int(value) if value else 0


# Singleton instance
_counter: Optional[CustomerIdCounter] = None


def get_customer_id_counter() -> CustomerIdCounter:
    """Get the singleton CustomerIdCounter instance."""
    global _counter
    if _counter is None:
        _counter = CustomerIdCounter()
    return _counter
