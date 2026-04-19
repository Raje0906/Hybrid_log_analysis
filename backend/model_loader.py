"""
Singleton model loader for TinyLlama + LoRA adapter.
Loads once at startup to avoid repeated cold loads.
"""

import os
import logging
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configuration — update ADAPTER_PATH if needed
# ──────────────────────────────────────────────
BASE_MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Allow override via env var for portability
ADAPTER_PATH = os.environ.get(
    "ADAPTER_PATH",
    r"C:\Users\Rajea\OneDrive\Desktop\INTERN TE\llm-log-finetuned-20260419T161242Z-3-001\llm-log-finetuned"
)

# ──────────────────────────────────────────────
# Globals (populated once)
# ──────────────────────────────────────────────
_model = None
_tokenizer = None
_device = None
_model_ready = False
_load_error: str | None = None


def get_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def load_model():
    """Load base model + LoRA adapter. Called once at startup."""
    global _model, _tokenizer, _device, _model_ready, _load_error

    try:
        _device = get_device()
        logger.info(f"Loading model on device: {_device}")
        logger.info(f"Base model: {BASE_MODEL_ID}")
        logger.info(f"Adapter path: {ADAPTER_PATH}")

        # ── Tokenizer ──────────────────────────────
        _tokenizer = AutoTokenizer.from_pretrained(
            ADAPTER_PATH,
            trust_remote_code=True,
        )
        if _tokenizer.pad_token is None:
            _tokenizer.pad_token = _tokenizer.eos_token

        # ── Base model ─────────────────────────────
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            torch_dtype=torch.float16 if _device == "cuda" else torch.float32,
            device_map="auto" if _device == "cuda" else None,
            trust_remote_code=True,
        )

        # ── Apply LoRA adapter ──────────────────────
        _model = PeftModel.from_pretrained(
            base_model,
            ADAPTER_PATH,
            torch_dtype=torch.float16 if _device == "cuda" else torch.float32,
        )

        if _device == "cpu":
            _model = _model.to("cpu")

        _model.eval()
        _model_ready = True
        logger.info("✅ Model loaded successfully")

    except Exception as e:
        _load_error = str(e)
        logger.error(f"❌ Model load failed: {e}")
        # Don't re-raise — let the API report the error gracefully


def get_model():
    return _model


def get_tokenizer():
    return _tokenizer


def get_device_str():
    return _device


def is_ready() -> bool:
    return _model_ready


def get_error() -> str | None:
    return _load_error


def generate(prompt: str, max_new_tokens: int = 256) -> str:
    """Run inference and return only the newly generated text."""
    if not _model_ready:
        raise RuntimeError(f"Model not loaded: {_load_error or 'unknown error'}")

    inputs = _tokenizer(prompt, return_tensors="pt").to(_device if _device else "cpu")

    with torch.no_grad():
        outputs = _model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,           # deterministic for analysis
            temperature=1.0,
            repetition_penalty=1.15,
            pad_token_id=_tokenizer.eos_token_id,
            eos_token_id=_tokenizer.eos_token_id,
        )

    # Decode only the new tokens (after the prompt)
    input_len = inputs["input_ids"].shape[1]
    new_tokens = outputs[0][input_len:]
    result = _tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    return result
