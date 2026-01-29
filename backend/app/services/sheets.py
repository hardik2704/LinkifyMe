"""
Google Sheets Service

Provides CRUD operations for the LinkifyMe sheets:
- Profile Information (PI)
- Profile Scoring (PS)
- Payment Confirmation (PC)
- Activity Log (AL)
"""

import json
from datetime import datetime
from typing import Any, Optional

import gspread
from google.oauth2.service_account import Credentials

from app.config import settings


# Sheet names
SHEET_PROFILE_INFO = "Profile Information"
SHEET_PROFILE_SCORING = "Profile Scoring"
SHEET_PAYMENT_CONFIRMATION = "Payment Confirmation"
SHEET_ACTIVITY_LOG = "Activity Log"
SHEET_FEEDBACK = "Feedback"

# Scopes for Google Sheets API
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


class GoogleSheetsService:
    """Service for interacting with Google Sheets."""
    
    def __init__(self):
        self._client: Optional[gspread.Client] = None
        self._spreadsheet: Optional[gspread.Spreadsheet] = None
    
    def _get_client(self) -> gspread.Client:
        """Get or create authenticated gspread client."""
        if self._client is None:
            creds_dict = settings.google_credentials
            if not creds_dict:
                raise ValueError("Google service account credentials not configured")
            
            credentials = Credentials.from_service_account_info(
                creds_dict,
                scopes=SCOPES,
            )
            self._client = gspread.authorize(credentials)
        
        return self._client
    
    def _get_spreadsheet(self) -> gspread.Spreadsheet:
        """Get the main spreadsheet."""
        if self._spreadsheet is None:
            client = self._get_client()
            self._spreadsheet = client.open_by_key(settings.google_sheet_id)
        return self._spreadsheet
    
    def _get_sheet(self, sheet_name: str) -> gspread.Worksheet:
        """Get a specific worksheet by name."""
        spreadsheet = self._get_spreadsheet()
        return spreadsheet.worksheet(sheet_name)
    
    # =========================================================================
    # Profile Information (PI) Operations
    # =========================================================================
    
    def get_next_attempt_id(self, customer_id: str) -> str:
        """Get next attempt ID for a customer. Format: ATT-{customer_id}-{N}"""
        # This is a simple implementation that counts rows for this customer
        # In a real DB, this would be a COUNT query
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        all_values = sheet.get_all_values()
        
        count = 0
        for row in all_values:
            # Check if column 1 (Customer ID) matches
            if len(row) > 1 and row[1] == customer_id:
                count += 1
        
        # Next attempt is count + 1
        return f"ATT-{customer_id}-{count + 1}"

    def create_profile_info(
        self,
        unique_id: str,
        linkedin_url: str,
        email: str,
        phone: Optional[str],
        target_group: str,
    ) -> int:
        """
        Create a new Profile Information row.
        Returns the row number.
        
        Column structure (25 columns):
        1. Customer ID | 2. Attempt ID | 3. LinkedIn Profile | 4. Scrape Status | 5. Date And Time |
        6. Email ID | 7. Mobile Number | 8. Target Group Preference | 9. Complete Scraped Data |
        10. First Name | 11. Last Name | 12. Headline | 13. Connection count | 14. Follower count |
        15. About | 16. Profile Pic | 17. Cover_picture | 18. GeoLocation Name | 19. BirthDay |
        20. Experience | 21. Education | 22. Skills | 23. Licenses & Certifications |
        24. Is Verified | 25. Is Premium
        """
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        now = datetime.utcnow().strftime("%d/%m/%Y, %I:%M:%S %p")  # User's preferred date format
        
        # Append row matching user's 25-column format
        row_data = [
            "",  # Customer ID - assigned later (column 1)
            "",  # Attempt ID - assigned later (column 2)
            linkedin_url,  # LinkedIn Profile (column 3)
            "pending",  # Scrape Status (column 4)
            now,  # Date And Time (column 5)
            email,  # Email ID (column 6)
            phone or "",  # Mobile Number (column 7)
            target_group,  # Target Group Preference (column 8)
            "",  # Complete Scraped Data (column 9) - raw JSON from Apify
            "",  # First Name (column 10)
            "",  # Last Name (column 11)
            "",  # Headline (column 12)
            "",  # Connection count (column 13)
            "",  # Follower count (column 14)
            "",  # About (column 15)
            "",  # Profile Pic (column 16)
            "",  # Cover_picture (column 17)
            "",  # GeoLocation Name (column 18)
            "",  # BirthDay (column 19)
            "",  # Experience (column 20)
            "",  # Education (column 21)
            "",  # Skills (column 22)
            "",  # Licenses & Certifications (column 23)
            "",  # Is Verified (column 24)
            "",  # Is Premium (column 25)
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        
        # Get the row number (last row)
        return len(sheet.get_all_values())
    
    def update_profile_info(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Profile Information row.
        
        Column structure (25 columns, 1-indexed):
        1. Customer ID | 2. Attempt ID | 3. LinkedIn Profile | 4. Scrape Status | 5. Date And Time |
        6. Email ID | 7. Mobile Number | 8. Target Group Preference | 9. Complete Scraped Data |
        10. First Name | 11. Last Name | 12. Headline | 13. Connection count | 14. Follower count |
        15. About | 16. Profile Pic | 17. Cover_picture | 18. GeoLocation Name | 19. BirthDay |
        20. Experience | 21. Education | 22. Skills | 23. Licenses & Certifications |
        24. Is Verified | 25. Is Premium
        """
        import logging
        logger = logging.getLogger("linkify.sheets")
        
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        
        # Column mapping matching user's 25-column format (1-indexed)
        column_map = {
            "customer_id": 1,
            "attempt_id": 2,
            "linkedin_url": 3,
            "scrape_status": 4,
            "date_time": 5,
            "email": 6,
            "phone": 7,
            "target_group": 8,
            "complete_scraped_data": 9,  # Raw JSON from Apify
            "first_name": 10,
            "last_name": 11,
            "headline": 12,
            "connection_count": 13,
            "follower_count": 14,
            "about": 15,
            "profile_picture_url": 16,
            "cover_picture_url": 17,
            "geo_location_name": 18,
            "birthday": 19,
            "experience_json": 20,
            "education_json": 21,
            "skills_json": 22,
            "certifications_json": 23,
            "is_verified": 24,
            "is_premium": 25,
        }
        
        try:
            for key, value in updates.items():
                if key in column_map:
                    col = column_map[key]
                    # Convert dicts/lists to JSON strings
                    if isinstance(value, (dict, list)):
                        value = json.dumps(value)
                    # Convert booleans to Yes/No
                    if isinstance(value, bool):
                        value = "Yes" if value else "No"
                    sheet.update_cell(row, col, value)
        except Exception as e:
            # Log error but don't fail - quota limits shouldn't break workflow
            logger.warning(f"Failed to update profile info (quota?): {e}")
    
    def get_profile_info(self, row: int) -> dict[str, Any]:
        """Get a Profile Information row by row number.
        
        Indices (0-based) for 25-column schema:
        0: Customer ID | 1: Attempt ID | 2: LinkedIn Profile | 3: Scrape Status | 4: Date Time |
        5: Email | 6: Phone | 7: Target Group | 8: Complete Scraped Data |
        9: First Name | 10: Last Name | 11: Headline | 12: Connection Count | 13: Follower Count |
        14: About | 15: Profile Pic | 16: Cover Pic | 17: Geo Name | 18: Birthday |
        19: Exp JSON | 20: Edu JSON | 21: Skills JSON | 22: Certs JSON | 23: Verified | 24: Premium
        """
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        values = sheet.row_values(row)
        
        # Pad with empty strings if row is shorter than expected (25 columns)
        while len(values) < 25:
            values.append("")
        
        return {
            "customer_id": values[0],
            "attempt_id": values[1],
            "linkedin_url": values[2],
            "scrape_status": values[3],
            "date_time": values[4],
            "email": values[5],
            "phone": values[6],
            "target_group": values[7],
            "complete_scraped_data": values[8],
            "first_name": values[9],
            "last_name": values[10],
            "headline": values[11],
            "connection_count": values[12],
            "follower_count": values[13],
            "about": values[14],
            "profile_picture_url": values[15],
            "cover_picture_url": values[16],
            "geo_location_name": values[17],
            "birthday": values[18],
            "experience_json": values[19],
            "education_json": values[20],
            "skills_json": values[21],
            "certifications_json": values[22],
            "is_verified": values[23],
            "is_premium": values[24],
        }
    
    def find_profile_by_unique_id(self, unique_id: str) -> Optional[tuple[int, dict]]:
        """Find a profile by unique_id. Returns (row_number, data) or None."""
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        all_values = sheet.get_all_values()
        
        for idx, row in enumerate(all_values):
            if row and row[0] == unique_id:
                return (idx + 1, self.get_profile_info(idx + 1))
        
        return None
    
    # =========================================================================
    # Profile Scoring (PS) Operations
    # =========================================================================
    
    def create_profile_scoring(self, customer_id: str) -> int:
        """Create a new Profile Scoring row. Returns row number."""
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        now = datetime.utcnow().isoformat()
        
        # Initialize with placeholders matching user's 31-column format
        # 1: Customer ID
        # 2: Attempt ID
        # 3: LinkedIn
        # ...
        # 30: Status
        # 31: Remarks
        
        row_data = [customer_id] + [""] * 30
        
        # Set specific default values
        row_data[29] = "pending" # Status (col 30, index 29)
        row_data[28] = now       # Timestamp (col 29, index 28)
        
        sheet.append_row(row_data, value_input_option="RAW")
        return len(sheet.get_all_values())
    
    def update_profile_scoring(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Profile Scoring row.
        
        Column structure matches user's required 31-column format:
        Customer ID | Attempt ID | LinkedIn Profile | First Name | Headline Score | Connection Score | 
        Follower Score | About Score | Profile Pic Score | Cover_picture Score | 
        Experience Score | Education Score | Skills Score | Licenses & Certifications Score | 
        Is Verified Score | Is Premium Score | Final Score | Headline Reasoning | 
        Connection Reasoning | Follower Reasoning | About Reasoning | Profile Pic Reasoning | 
        Cover_picture Reasoning | Experience Reasoning | Education Reasoning | Skills Reasoning | 
        Licenses & Certifications Reasoning | Final Score Reasoning | TimeStamp | Completion Status | Remarks
        """
        import logging
        logger = logging.getLogger("linkify.sheets")
        
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        
        # New column mapping matching user's required format (1-indexed)
        # Shifted by 1 due to Attempt ID insertion at col 2
        column_map = {
            "customer_id": 1,
            "attempt_id": 2,
            "linkedin_url": 3,
            "first_name": 4,
            "headline_score": 5,
            "connection_score": 6,
            "follower_score": 7,
            "about_score": 8,
            "profile_pic_score": 9,
            "cover_picture_score": 10,
            "experience_score": 11,
            "education_score": 12,
            "skills_score": 13,
            "licenses_certs_score": 14,
            "verified_score": 15,
            "premium_score": 16,
            "final_score": 17,
            "headline_reasoning": 18,
            "connection_reasoning": 19,
            "follower_reasoning": 20,
            "about_reasoning": 21,
            "profile_pic_reasoning": 22,
            "cover_picture_reasoning": 23,
            "experience_reasoning": 24,
            "education_reasoning": 25,
            "skills_reasoning": 26,
            "licenses_certs_reasoning": 27,
            "final_score_reasoning": 28,
            "timestamp": 29,
            "completion_status": 30,
            "remarks": 31,
        }
        
        try:
            for key, value in updates.items():
                if key in column_map:
                    col = column_map[key]
                    if isinstance(value, (dict, list)):
                        value = json.dumps(value)
                    sheet.update_cell(row, col, value)
        except Exception as e:
            # Log the error but don't fail - quota limits shouldn't break the workflow
            logger.warning(f"Failed to update profile scoring (quota?): {e}")
    
    def get_profile_scoring(self, row: int) -> dict[str, Any]:
        """Get a Profile Scoring row by row number.
        
        Column structure matches user's 31-column format:
        Customer ID | Attempt ID | LinkedIn Profile | First Name | [12 scores] | [11 reasonings] | Timestamp | Status | Remarks
        """
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        values = sheet.row_values(row)
        
        # Ensure we have at least 31 columns
        while len(values) < 31:
            values.append("")
        
        def safe_int(val):
            """Convert to int safely, return 0 for empty/invalid."""
            if not val:
                return 0
            try:
                return int(float(val))
            except (ValueError, TypeError):
                return 0
        
        return {
            # Basic info (columns 1-4)
            "customer_id": values[0],
            "attempt_id": values[1],
            "linkedin_url": values[2],
            "first_name": values[3],
            # Section scores (columns 5-17)
            "headline_score": safe_int(values[4]),
            "connection_score": safe_int(values[5]),
            "follower_score": safe_int(values[6]),
            "about_score": safe_int(values[7]),
            "profile_pic_score": safe_int(values[8]),
            "cover_picture_score": safe_int(values[9]),
            "experience_score": safe_int(values[10]),
            "education_score": safe_int(values[11]),
            "skills_score": safe_int(values[12]),
            "licenses_certs_score": safe_int(values[13]),
            "verified_score": safe_int(values[14]),
            "premium_score": safe_int(values[15]),
            "final_score": safe_int(values[16]),
            # Section reasonings (columns 18-28)
            "headline_reasoning": values[17],
            "connection_reasoning": values[18],
            "follower_reasoning": values[19],
            "about_reasoning": values[20],
            "profile_pic_reasoning": values[21],
            "cover_picture_reasoning": values[22],
            "experience_reasoning": values[23],
            "education_reasoning": values[24],
            "skills_reasoning": values[25],
            "licenses_certs_reasoning": values[26],
            "final_score_reasoning": values[27],
            # Metadata (columns 29-31)
            "timestamp": values[28],
            "completion_status": values[29],
            "remarks": values[30],
            # Computed fields for backward compatibility
            "overall_score": safe_int(values[16]),  # Same as final_score
            "profile_photo_score": safe_int(values[8]),  # Alias for profile_pic_score
        }
    
    def find_scoring_by_customer_id(self, customer_id: str) -> Optional[tuple[int, dict]]:
        """Find scoring by customer_id. Returns (row_number, data) or None."""
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        all_values = sheet.get_all_values()
        
        for idx, row in enumerate(all_values):
            if row and row[0] == customer_id:
                return (idx + 1, self.get_profile_scoring(idx + 1))
        
        return None
    
    # =========================================================================
    # Payment Confirmation (PC) Operations
    # =========================================================================
    
    DEFAULT_ATTEMPTS_PER_PAYMENT = 3
    
    def create_payment_confirmation(self, customer_id: str, payment_id: str = "") -> int:
        """Create a new Payment Confirmation row. Returns row number.
        
        Column structure (14 columns):
        payment_id | customer_id | payment_status | payment_gateway_id | amount |
        created_at | updated_at | payment_ids | payment_count | attempts_per_payment |
        attempts_granted_total | attempts_used_total | attempts_remaining | last_paid_at
        """
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        now = datetime.utcnow().isoformat()
        
        row_data = [
            payment_id,          # payment_id (col 1)
            customer_id,         # customer_id (col 2)
            "pending",           # payment_status (col 3)
            "",                  # payment_gateway_id (col 4)
            "",                  # amount (col 5)
            now,                 # created_at (col 6)
            now,                 # updated_at (col 7)
            "",                  # payment_ids (col 8)
            0,                   # payment_count (col 9)
            self.DEFAULT_ATTEMPTS_PER_PAYMENT,  # attempts_per_payment (col 10)
            0,                   # attempts_granted_total (col 11)
            0,                   # attempts_used_total (col 12)
            0,                   # attempts_remaining (col 13)
            "",                  # last_paid_at (col 14)
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        return len(sheet.get_all_values())
    
    def update_payment_confirmation(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Payment Confirmation row."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        
        column_map = {
            "payment_id": 1,
            "customer_id": 2,
            "payment_status": 3,
            "payment_gateway_id": 4,
            "amount": 5,
            "created_at": 6,
            "updated_at": 7,
            "payment_ids": 8,
            "payment_count": 9,
            "attempts_per_payment": 10,
            "attempts_granted_total": 11,
            "attempts_used_total": 12,
            "attempts_remaining": 13,
            "last_paid_at": 14,
        }
        
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        for key, value in updates.items():
            if key in column_map:
                sheet.update_cell(row, column_map[key], value)
    
    def get_payment_confirmation(self, row: int) -> dict[str, Any]:
        """Get a Payment Confirmation row by row number."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        values = sheet.row_values(row)
        
        # Ensure length up to col 14
        while len(values) < 14:
            values.append("")
        
        return {
            "payment_id": values[0],
            "customer_id": values[1],
            "payment_status": values[2],
            "payment_gateway_id": values[3],
            "amount": values[4],
            "created_at": values[5],
            "updated_at": values[6],
            "payment_ids": values[7],
            "payment_count": int(values[8] or 0),
            "attempts_per_payment": int(values[9] or self.DEFAULT_ATTEMPTS_PER_PAYMENT),
            "attempts_granted_total": int(values[10] or 0),
            "attempts_used_total": int(values[11] or 0),
            "attempts_remaining": int(values[12] or 0),
            "last_paid_at": values[13],
        }
    
    def _find_payment_confirmation_row_by_customer(self, customer_id: str) -> Optional[int]:
        """Find payment confirmation row by customer_id. Returns row number or None."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        all_vals = sheet.get_all_values()
        
        # Row 1 might be header, start from row 2
        for i in range(1, len(all_vals)):
            row_vals = all_vals[i]
            # customer_id is column 2 (index 1)
            if len(row_vals) >= 2 and row_vals[1] == customer_id:
                return i + 1  # 1-indexed row number
        return None
    
    def confirm_payment_success(
        self,
        customer_id: str,
        payment_id: str,
        gateway_id: str,
        amount: str,
        attempts_per_payment: int = None,
    ) -> int:
        """
        Upserts a customer row:
        - stores latest payment info
        - increments payment_count
        - unlocks attempts_per_payment new attempts
        Returns the row number.
        """
        if attempts_per_payment is None:
            attempts_per_payment = self.DEFAULT_ATTEMPTS_PER_PAYMENT
            
        now = datetime.utcnow().isoformat()
        row = self._find_payment_confirmation_row_by_customer(customer_id)
        
        # Create if not exists
        if row is None:
            row = self.create_payment_confirmation(customer_id=customer_id, payment_id=payment_id)
        
        pc = self.get_payment_confirmation(row)
        
        # Prevent double-credit if same payment_id already recorded
        existing_ids = [x.strip() for x in (pc["payment_ids"] or "").split(",") if x.strip()]
        if payment_id in existing_ids:
            # Still update status/gateway/amount timestamps, but don't unlock again
            self.update_payment_confirmation(row, {
                "payment_status": "success",
                "payment_gateway_id": gateway_id,
                "amount": amount,
                "last_paid_at": now,
            })
            return row
        
        # Append payment_id to history
        existing_ids.append(payment_id)
        new_payment_ids = ",".join(existing_ids)
        
        payment_count = int(pc["payment_count"] or 0) + 1
        attempts_used_total = int(pc["attempts_used_total"] or 0)
        attempts_granted_total = int(pc["attempts_granted_total"] or 0) + int(attempts_per_payment)
        attempts_remaining = attempts_granted_total - attempts_used_total
        
        self.update_payment_confirmation(row, {
            "payment_id": payment_id,  # keep latest at front
            "payment_status": "success",
            "payment_gateway_id": gateway_id,
            "amount": amount,
            "payment_ids": new_payment_ids,
            "payment_count": payment_count,
            "attempts_per_payment": int(attempts_per_payment),
            "attempts_granted_total": attempts_granted_total,
            "attempts_used_total": attempts_used_total,
            "attempts_remaining": attempts_remaining,
            "last_paid_at": now,
        })
        
        return row
    
    def consume_attempt(self, customer_id: str, attempts: int = 1) -> dict[str, Any]:
        """
        Deduct attempts from remaining.
        Returns:
          { ok: bool, attempts_remaining: int, upsell: bool }
        """
        row = self._find_payment_confirmation_row_by_customer(customer_id)
        if row is None:
            return {"ok": False, "attempts_remaining": 0, "upsell": True}
        
        pc = self.get_payment_confirmation(row)
        remaining = int(pc["attempts_remaining"] or 0)
        
        if remaining < attempts:
            return {"ok": False, "attempts_remaining": remaining, "upsell": True}
        
        used_total = int(pc["attempts_used_total"] or 0) + attempts
        granted_total = int(pc["attempts_granted_total"] or 0)
        new_remaining = granted_total - used_total
        
        self.update_payment_confirmation(row, {
            "attempts_used_total": used_total,
            "attempts_remaining": new_remaining,
        })
        
        return {"ok": True, "attempts_remaining": new_remaining, "upsell": (new_remaining <= 0)}
    
    # =========================================================================
    # Activity Log (AL) Operations
    # =========================================================================
    
    def append_activity_log(
        self,
        unique_id: str,
        customer_id: Optional[str],
        event_type: str,
        status: str,
        message: str,
    ) -> None:
        """Append an entry to the Activity Log.
        
        Catches quota errors gracefully to not fail the main workflow.
        """
        import logging
        logger = logging.getLogger("linkify.sheets")
        
        try:
            sheet = self._get_sheet(SHEET_ACTIVITY_LOG)
            
            row_data = [
                datetime.utcnow().isoformat(),
                unique_id,
                customer_id or "",
                event_type,
                status,
                message,
            ]
            
            sheet.append_row(row_data, value_input_option="RAW")
        except Exception as e:
            # Log the error but don't fail - quota limits shouldn't break the workflow
            logger.warning(f"Failed to write activity log (quota?): {e}")
    
    def get_recent_activity_logs(self, limit: int = 100) -> list[dict[str, Any]]:
        """Get the most recent activity log entries."""
        sheet = self._get_sheet(SHEET_ACTIVITY_LOG)
        all_values = sheet.get_all_values()
        
        # Skip header row if exists
        data_rows = all_values[1:] if all_values and all_values[0][0] == "Timestamp" else all_values
        
        # Get last N rows
        recent = data_rows[-limit:] if len(data_rows) > limit else data_rows
        
        logs = []
        for row in reversed(recent):  # Most recent first
            if len(row) >= 6:
                logs.append({
                    "timestamp": row[0],
                    "unique_id": row[1],
                    "customer_id": row[2],
                    "event_type": row[3],
                    "status": row[4],
                    "message": row[5],
                })
        
        return logs

    # =========================================================================
    # Feedback Operations
    # =========================================================================
    
    def _ensure_sheet_exists(self, sheet_name: str, headers: list[str]) -> gspread.Worksheet:
        """Ensure a sheet exists, create it if not."""
        spreadsheet = self._get_spreadsheet()
        try:
            return spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            # Create the sheet with headers
            sheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=len(headers))
            sheet.append_row(headers, value_input_option="RAW")
            return sheet
    
    def create_feedback(
        self,
        email: str,
        customer_id: str,
        would_refer: int,
        was_helpful: int,
        suggestions: Optional[str] = None,
    ) -> int:
        """
        Store user feedback in the Feedback sheet.
        
        Columns: Timestamp | Email | Customer ID | Would Refer (1-5) | Was Helpful (1-5) | Suggestions
        """
        headers = [
            "Timestamp",
            "Email",
            "Customer ID",
            "Would Refer (1-5)",
            "Was Helpful (1-5)",
            "Suggestions",
        ]
        
        sheet = self._ensure_sheet_exists(SHEET_FEEDBACK, headers)
        
        row_data = [
            datetime.utcnow().isoformat(),
            email,
            customer_id,
            would_refer,
            was_helpful,
            suggestions or "",
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        return len(sheet.get_all_values())


# Singleton instance
_sheets_service: Optional[GoogleSheetsService] = None


def get_sheets_service() -> GoogleSheetsService:
    """Get the singleton GoogleSheetsService instance."""
    global _sheets_service
    if _sheets_service is None:
        _sheets_service = GoogleSheetsService()
    return _sheets_service
