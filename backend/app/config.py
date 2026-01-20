"""
LinkifyMe Backend Configuration

Loads environment variables and provides typed configuration.
"""

import json
import os
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
    # === Application ===
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    # === Server ===
    host: str = "0.0.0.0"
    port: int = 8000
    
    # === Google Sheets ===
    google_service_account_json: str = Field(default="")
    google_sheet_id: str = Field(default="")
    
    # === Apify ===
    apify_api_token: str = Field(default="")
    apify_actor_id: str = Field(default="supreme_coder~linkedin-profile-scraper")
    
    # === OpenAI ===
    openai_api_key: str = Field(default="")
    
    # === PDF Generation ===
    pdfshift_api_key: str = Field(default="")
    
    @property
    def google_credentials(self) -> dict | None:
        """Parse Google service account JSON string to dict."""
        if not self.google_service_account_json:
            return None
        try:
            return json.loads(self.google_service_account_json)
        except json.JSONDecodeError:
            return None
    
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"
    
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Convenience export
settings = get_settings()
