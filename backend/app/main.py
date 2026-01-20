"""
LinkifyMe Backend - FastAPI Main Application
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import settings
from app.api.routes import router as api_router
from app.services.logger import get_session_logger, log_info


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup - initialize logging
    logger = get_session_logger()
    log_info("startup", f"🚀 Starting LinkifyMe Backend v{__version__}", {
        "environment": settings.app_env,
        "debug": settings.debug,
    })
    print(f"🚀 Starting LinkifyMe Backend v{__version__}")
    print(f"   Environment: {settings.app_env}")
    print(f"   Debug: {settings.debug}")
    print(f"   Logs: ./logs/")
    yield
    # Shutdown
    log_info("shutdown", "👋 Shutting down LinkifyMe Backend")
    print("👋 Shutting down LinkifyMe Backend")


app = FastAPI(
    title="LinkifyMe API",
    description="LinkedIn Profile Optimization Backend",
    version=__version__,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev server
        "http://127.0.0.1:3000",
        "https://linkifyme.com",       # Production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": __version__,
        "environment": settings.app_env,
    }


# Mount API routes
app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
    )
