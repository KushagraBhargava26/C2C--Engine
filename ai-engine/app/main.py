import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import analyze, health
from app.services.sentiment_service import SentimentService
from app.services.risk_service import RiskService

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("c2c_brain")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Model warm-up on startup (roadmap stretch goal) instead of on first
    # request -- avoids a slow first call during the live demo.
    logger.info("Loading FinBERT + risk classifier...")
    app.state.sentiment_service = SentimentService()
    app.state.risk_service = RiskService()
    logger.info("Models loaded. Ready to serve.")

    import psutil
    process = psutil.Process(os.getpid())
    mem_mb = process.memory_info().rss / (1024 * 1024)
    logger.info(f"Memory after model load: {mem_mb:.1f} MB")

    yield
    app.state.sentiment_service = None
    app.state.risk_service = None


app = FastAPI(
    title="C2C Brain -- Sentiment & Risk Analysis",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:8080,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router)


def _error_body(status_code: int, error: str, message: str) -> dict:
    # Matches CONTRACT.md's Error Shape exactly, used across all endpoints.
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status_code,
        "error": error,
        "message": message,
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    message = first_error.get("msg", "Invalid request payload")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_body(422, "Unprocessable Entity", message),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak a raw stack trace to the API consumer.
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(500, "Internal Server Error", "An unexpected error occurred."),
    )