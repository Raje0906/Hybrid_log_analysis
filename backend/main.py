"""
FastAPI backend for AI Log Analysis Dashboard.
Exposes:
  POST /analyze  — run LLM inference on a log entry
  GET  /health   — model readiness check
"""

import time
import logging
from contextlib import asynccontextmanager

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import model_loader
from prompt_templates import build_prompt, parse_severity

# Path to the built React frontend (relative to this file)
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Lifespan — load model once at startup
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting model load...")
    model_loader.load_model()
    yield
    logger.info("🛑 Shutting down.")


# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
app = FastAPI(
    title="SOC Log Analysis API",
    description="AI-powered log anomaly detection and RCA using TinyLlama + LoRA",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Static frontend (must be mounted AFTER all API routes)
# ──────────────────────────────────────────────
@app.on_event("startup")
async def mount_frontend():
    """Mount React build folder if it exists (after npm run build)."""
    if FRONTEND_DIST.exists():
        app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
        logger.info(f"✅ Frontend served from {FRONTEND_DIST}")
    else:
        logger.warning(f"⚠️  Frontend build not found at {FRONTEND_DIST}. Run 'npm run build' in the frontend folder.")


# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    log: str = Field(..., min_length=1, max_length=8000, description="Raw log text")
    mode: str = Field(
        ...,
        pattern="^(anomaly|rca|nl2sql)$",
        description="Analysis mode: anomaly | rca | nl2sql",
    )
    max_new_tokens: int = Field(default=256, ge=32, le=512)


class AnalyzeResponse(BaseModel):
    result: str
    severity: str          # NORMAL | WARNING | CRITICAL
    elapsed_ms: float
    mode: str
    model_ready: bool


class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    device: str | None
    error: str | None


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    return HealthResponse(
        status="ok" if model_loader.is_ready() else "loading",
        model_ready=model_loader.is_ready(),
        device=model_loader.get_device_str(),
        error=model_loader.get_error(),
    )


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
async def analyze(req: AnalyzeRequest):
    if not model_loader.is_ready():
        err = model_loader.get_error()
        if err:
            raise HTTPException(
                status_code=503,
                detail=f"Model failed to load: {err}",
            )
        raise HTTPException(status_code=503, detail="Model is still loading. Please retry.")

    tokenizer = model_loader.get_tokenizer()
    if tokenizer is None:
        raise HTTPException(status_code=503, detail="Tokenizer not available.")

    try:
        prompt = build_prompt(req.mode, req.log, tokenizer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    t0 = time.perf_counter()
    try:
        result = model_loader.generate(prompt, max_new_tokens=req.max_new_tokens)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Inference error")
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    elapsed_ms = (time.perf_counter() - t0) * 1000
    severity = parse_severity(req.mode, result)

    logger.info(
        f"[{req.mode.upper()}] severity={severity} elapsed={elapsed_ms:.0f}ms"
    )

    return AnalyzeResponse(
        result=result,
        severity=severity,
        elapsed_ms=round(elapsed_ms, 1),
        mode=req.mode,
        model_ready=True,
    )
