import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
PACKS_DIR = BASE_DIR / "packs"
PACKS_DIR.mkdir(exist_ok=True)

# Database
DB_PATH = os.getenv("OUTSIDE_DB_PATH", str(DATA_DIR / "outside_os.db"))

# Ollama inference configuration
# Default recommended model: gemma2:2b (or qwen2.5:1.5b / qwen2.5:3b)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("OUTSIDE_MODEL", "gemma2:2b")
OLLAMA_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT", "25.0"))
MAX_RETRIES = int(os.getenv("OLLAMA_MAX_RETRIES", "2"))

# Fallback deterministic provider name
FALLBACK_PROVIDER = "offline_library"
