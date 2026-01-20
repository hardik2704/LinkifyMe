"""
Structured Logging Service

Provides DevOps-friendly logging with:
- Session tracking for each profile check
- JSON-formatted logs for log aggregation
- File-based persistence for session history
- Console output with colors for development
"""

import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import uuid

from app.config import settings


# === Log Directory ===
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


class SessionLogger:
    """
    Logger that tracks individual analysis sessions.
    
    Each LinkedIn profile check gets a unique session ID
    and all logs for that session are grouped together.
    """
    
    def __init__(self):
        self._setup_logging()
        self._sessions_file = LOG_DIR / "sessions.jsonl"
        self._current_session: Optional[str] = None
    
    def _setup_logging(self):
        """Configure structured logging."""
        # Create formatters
        json_formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"module": "%(name)s", "message": "%(message)s"}'
        )
        
        console_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%H:%M:%S'
        )
        
        # Console handler with colors
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(console_formatter)
        console_handler.setLevel(logging.DEBUG if settings.debug else logging.INFO)
        
        # File handler - JSON lines format
        today = datetime.now().strftime("%Y-%m-%d")
        file_handler = logging.FileHandler(LOG_DIR / f"backend_{today}.log")
        file_handler.setFormatter(json_formatter)
        file_handler.setLevel(logging.DEBUG)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.DEBUG)
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)
        
        # Reduce noise from third-party libraries
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("httpcore").setLevel(logging.WARNING)
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("gspread").setLevel(logging.WARNING)
    
    def start_session(
        self,
        unique_id: str,
        linkedin_url: str,
        email: str,
        target_group: str,
    ) -> str:
        """
        Start a new analysis session.
        
        Returns session ID for tracking.
        """
        session_id = str(uuid.uuid4())[:8]
        self._current_session = session_id
        
        session_data = {
            "session_id": session_id,
            "unique_id": unique_id,
            "linkedin_url": linkedin_url,
            "email": email,
            "target_group": target_group,
            "started_at": datetime.utcnow().isoformat(),
            "status": "started",
            "events": [],
        }
        
        # Save to sessions file
        with open(self._sessions_file, "a") as f:
            f.write(json.dumps(session_data) + "\n")
        
        self.log("session", f"🚀 Session started: {session_id}", {
            "unique_id": unique_id,
            "linkedin_url": linkedin_url,
        })
        
        return session_id
    
    def log(
        self,
        component: str,
        message: str,
        data: Optional[dict] = None,
        level: str = "info",
    ):
        """
        Log a message with optional structured data.
        
        Args:
            component: Module/component name (e.g., "scraper", "scoring", "sheets")
            message: Human-readable message
            data: Optional structured data
            level: Log level (debug, info, warning, error)
        """
        logger = logging.getLogger(f"linkify.{component}")
        
        # Build log message
        log_msg = message
        if data:
            log_msg += f" | {json.dumps(data)}"
        
        # Add session prefix if active
        if self._current_session:
            log_msg = f"[{self._current_session}] {log_msg}"
        
        # Log at appropriate level
        log_method = getattr(logger, level.lower(), logger.info)
        log_method(log_msg)
    
    def log_event(
        self,
        event_type: str,
        status: str,
        message: str,
        data: Optional[dict] = None,
    ):
        """
        Log a workflow event (also saves to session history).
        """
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "status": status,
            "message": message,
            "data": data or {},
        }
        
        # Log to console/file
        emoji_map = {
            "intake": "📥",
            "scrape": "🔍",
            "scoring": "📊",
            "payment": "💰",
            "complete": "✅",
            "error": "❌",
        }
        emoji = emoji_map.get(event_type, "📌")
        
        level = "error" if status == "error" else "info"
        self.log(event_type, f"{emoji} {message}", data, level)
    
    def end_session(self, status: str = "completed", score: Optional[float] = None):
        """
        End the current session.
        """
        if self._current_session:
            self.log("session", f"🏁 Session ended: {status}", {
                "final_score": score,
            })
            self._current_session = None
    
    def get_recent_sessions(self, limit: int = 20) -> list[dict]:
        """
        Get recent sessions from the log file.
        """
        if not self._sessions_file.exists():
            return []
        
        sessions = []
        with open(self._sessions_file, "r") as f:
            for line in f:
                try:
                    sessions.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        
        return sessions[-limit:]
    
    def get_today_logs(self) -> list[str]:
        """
        Get today's log entries.
        """
        today = datetime.now().strftime("%Y-%m-%d")
        log_file = LOG_DIR / f"backend_{today}.log"
        
        if not log_file.exists():
            return []
        
        with open(log_file, "r") as f:
            return f.readlines()[-100:]  # Last 100 lines


# Singleton instance
_session_logger: Optional[SessionLogger] = None


def get_session_logger() -> SessionLogger:
    """Get the singleton SessionLogger instance."""
    global _session_logger
    if _session_logger is None:
        _session_logger = SessionLogger()
    return _session_logger


# Convenience functions
def log_info(component: str, message: str, data: Optional[dict] = None):
    get_session_logger().log(component, message, data, "info")


def log_error(component: str, message: str, data: Optional[dict] = None):
    get_session_logger().log(component, message, data, "error")


def log_debug(component: str, message: str, data: Optional[dict] = None):
    get_session_logger().log(component, message, data, "debug")


def log_warning(component: str, message: str, data: Optional[dict] = None):
    get_session_logger().log(component, message, data, "warning")


def log_event(event_type: str, status: str, message: str, data: Optional[dict] = None):
    get_session_logger().log_event(event_type, status, message, data)
