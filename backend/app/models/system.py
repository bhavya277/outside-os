from typing import List, Optional
from pydantic import BaseModel, Field

class ModelStatus(BaseModel):
    ollama_available: bool = False
    base_url: str
    active_model: str
    available_models: List[str] = Field(default_factory=list)
    model_ready: bool = False
    status_message: str
    offline_library_count: int = 0
    license_info: str = "Gemma Open License / Apache 2.0 (Model dependent)"
    privacy_mode: str = "Strict Local-Only (Zero Telemetry)"
