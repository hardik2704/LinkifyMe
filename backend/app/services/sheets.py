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
        """
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        now = datetime.utcnow().isoformat()
        
        # Append row: [unique_id, customer_id, linkedin_url, email, phone, target_group, 
        #              scrape_status, apify_run_id, scrape_attempt, ..., error_message, created_at, updated_at]
        row_data = [
            unique_id,
            "",  # customer_id - assigned later
            linkedin_url,
            email,
            phone or "",
            target_group,
            "pending",  # scrape_status
            "",  # apify_run_id
            0,   # scrape_attempt
            "",  # firstName
            "",  # lastName
            "",  # headline
            "",  # about
            "",  # followerCount
            "",  # connectionCount
            "",  # geoLocationName
            "",  # profilePictureUrl
            "",  # experienceJson
            "",  # educationJson
            "",  # skillsJson
            "",  # certificationsJson
            "",  # error_message
            now,  # created_at
            now,  # updated_at
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        
        # Get the row number (last row)
        return len(sheet.get_all_values())
    
    def update_profile_info(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Profile Information row."""
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        
        # Column mapping (1-indexed for gspread)
        column_map = {
            "unique_id": 1,
            "customer_id": 2,
            "linkedin_url": 3,
            "email": 4,
            "phone": 5,
            "target_group": 6,
            "scrape_status": 7,
            "apify_run_id": 8,
            "scrape_attempt": 9,
            "first_name": 10,
            "last_name": 11,
            "headline": 12,
            "about": 13,
            "follower_count": 14,
            "connection_count": 15,
            "geo_location_name": 16,
            "profile_picture_url": 17,
            "experience_json": 18,
            "education_json": 19,
            "skills_json": 20,
            "certifications_json": 21,
            "error_message": 22,
            "created_at": 23,
            "updated_at": 24,
        }
        
        # Always update the updated_at timestamp
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        for key, value in updates.items():
            if key in column_map:
                col = column_map[key]
                # Convert dicts/lists to JSON strings
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)
                sheet.update_cell(row, col, value)
    
    def get_profile_info(self, row: int) -> dict[str, Any]:
        """Get a Profile Information row by row number."""
        sheet = self._get_sheet(SHEET_PROFILE_INFO)
        values = sheet.row_values(row)
        
        # Pad with empty strings if row is shorter than expected
        while len(values) < 24:
            values.append("")
        
        return {
            "unique_id": values[0],
            "customer_id": values[1],
            "linkedin_url": values[2],
            "email": values[3],
            "phone": values[4],
            "target_group": values[5],
            "scrape_status": values[6],
            "apify_run_id": values[7],
            "scrape_attempt": int(values[8]) if values[8] else 0,
            "first_name": values[9],
            "last_name": values[10],
            "headline": values[11],
            "about": values[12],
            "follower_count": values[13],
            "connection_count": values[14],
            "geo_location_name": values[15],
            "profile_picture_url": values[16],
            "experience_json": values[17],
            "education_json": values[18],
            "skills_json": values[19],
            "certifications_json": values[20],
            "error_message": values[21],
            "created_at": values[22],
            "updated_at": values[23],
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
        
        row_data = [
            customer_id,
            0,    # overall_score
            "",   # executive_summary
            "",   # headline_score
            "",   # headline_analysis
            "",   # about_score
            "",   # about_analysis
            "",   # experience_score
            "",   # experience_analysis
            "",   # connections_score
            "",   # connections_analysis
            "",   # profile_photo_score
            "",   # profile_photo_analysis
            "",   # ai_rewrites_json
            "pending",  # scoring_status
            now,  # scored_at
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        return len(sheet.get_all_values())
    
    def update_profile_scoring(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Profile Scoring row."""
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        
        column_map = {
            "customer_id": 1,
            "overall_score": 2,
            "executive_summary": 3,
            "headline_score": 4,
            "headline_analysis": 5,
            "about_score": 6,
            "about_analysis": 7,
            "experience_score": 8,
            "experience_analysis": 9,
            "connections_score": 10,
            "connections_analysis": 11,
            "profile_photo_score": 12,
            "profile_photo_analysis": 13,
            "ai_rewrites_json": 14,
            "scoring_status": 15,
            "scored_at": 16,
        }
        
        for key, value in updates.items():
            if key in column_map:
                col = column_map[key]
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)
                sheet.update_cell(row, col, value)
    
    def get_profile_scoring(self, row: int) -> dict[str, Any]:
        """Get a Profile Scoring row by row number."""
        sheet = self._get_sheet(SHEET_PROFILE_SCORING)
        values = sheet.row_values(row)
        
        while len(values) < 16:
            values.append("")
        
        return {
            "customer_id": values[0],
            "overall_score": int(values[1]) if values[1] else 0,
            "executive_summary": values[2],
            "headline_score": values[3],
            "headline_analysis": values[4],
            "about_score": values[5],
            "about_analysis": values[6],
            "experience_score": values[7],
            "experience_analysis": values[8],
            "connections_score": values[9],
            "connections_analysis": values[10],
            "profile_photo_score": values[11],
            "profile_photo_analysis": values[12],
            "ai_rewrites_json": values[13],
            "scoring_status": values[14],
            "scored_at": values[15],
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
    
    def create_payment_confirmation(self, customer_id: str) -> int:
        """Create a new Payment Confirmation row. Returns row number."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        now = datetime.utcnow().isoformat()
        
        row_data = [
            customer_id,
            "pending",  # payment_status
            "",         # payment_gateway_id
            "",         # amount
            now,        # created_at
            now,        # updated_at
        ]
        
        sheet.append_row(row_data, value_input_option="RAW")
        return len(sheet.get_all_values())
    
    def update_payment_confirmation(self, row: int, updates: dict[str, Any]) -> None:
        """Update specific columns in a Payment Confirmation row."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        
        column_map = {
            "customer_id": 1,
            "payment_status": 2,
            "payment_gateway_id": 3,
            "amount": 4,
            "created_at": 5,
            "updated_at": 6,
        }
        
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        for key, value in updates.items():
            if key in column_map:
                sheet.update_cell(row, column_map[key], value)
    
    def get_payment_confirmation(self, row: int) -> dict[str, Any]:
        """Get a Payment Confirmation row by row number."""
        sheet = self._get_sheet(SHEET_PAYMENT_CONFIRMATION)
        values = sheet.row_values(row)
        
        while len(values) < 6:
            values.append("")
        
        return {
            "customer_id": values[0],
            "payment_status": values[1],
            "payment_gateway_id": values[2],
            "amount": values[3],
            "created_at": values[4],
            "updated_at": values[5],
        }
    
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
        """Append an entry to the Activity Log."""
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


# Singleton instance
_sheets_service: Optional[GoogleSheetsService] = None


def get_sheets_service() -> GoogleSheetsService:
    """Get the singleton GoogleSheetsService instance."""
    global _sheets_service
    if _sheets_service is None:
        _sheets_service = GoogleSheetsService()
    return _sheets_service
