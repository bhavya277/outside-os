import requests
import json
import logging
from typing import Dict, Any, List, Optional
from ..config import OLLAMA_BASE_URL, DEFAULT_MODEL, OLLAMA_TIMEOUT_SECONDS, MAX_RETRIES
from ..models.quest import Quest, QuestConfig
from ..models.system import ModelStatus

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are OUTSIDE//OS, a local-first outdoor adventure generator for Hacktoberfest.
Your mission: Generate safe, practical, concrete outdoor micro-quests that get users to leave their screens and experience the physical world.

CRITICAL CONSTRAINTS:
1. Output MUST be strictly valid JSON matching the exact schema requested. No markdown formatting, no code blocks, no preamble.
2. NEVER invent local geographic names, fake parks, fake trails, opening hours, or species. The user could be in any neighborhood, balcony, garden, or campus.
3. STRICT SAFETY:
   - Never encourage trespassing or crossing private boundaries.
   - Never instruct users to touch unknown plants, wild fungi, or hazardous trash.
   - Never encourage approaching wild animals or disturbing nests.
   - Never instruct crossing streets while looking at the phone.
   - If physical limitations or accessibility notes are given, strictly respect them (e.g. step-free, seated, slow pace).
4. Provide a practical "safe_alternative" (e.g. indoor window observation or stationary seated option) if weather turns bad or user feels unwell.
5. Provide 3-5 concrete steps and a 3-6 item checklist of physical things to notice or accomplish without equipment.
"""

class OllamaAdapter:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, default_model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    def check_status(self) -> ModelStatus:
        """Check if local Ollama daemon is active and what models are pulled."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=3.0)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                model_ready = any(self.default_model in m for m in models)
                
                status_msg = (
                    f"Ollama connected ({len(models)} local models found). "
                    f"Active model: {self.default_model if model_ready else (models[0] if models else 'None')}"
                )
                return ModelStatus(
                    ollama_available=True,
                    base_url=self.base_url,
                    active_model=self.default_model if model_ready else (models[0] if models else "none"),
                    available_models=models,
                    model_ready=model_ready or len(models) > 0,
                    status_message=status_msg,
                    offline_library_count=18,
                    license_info="Local Open Weights (e.g., Gemma 2 Community / Apache 2.0)",
                    privacy_mode="Strict Local-Only (Zero Telemetry)"
                )
        except Exception:
            pass

        return ModelStatus(
            ollama_available=False,
            base_url=self.base_url,
            active_model="offline_fallback",
            available_models=[],
            model_ready=False,
            status_message="Local AI daemon offline (Ollama not detected at localhost:11434). Operating seamlessly via verified offline field library.",
            offline_library_count=18,
            license_info="Deterministic Offline Library (MIT/Apache 2.0)",
            privacy_mode="Offline Local-Only (Zero Network Calls)"
        )

    def generate_quest(self, config: QuestConfig, model_name: Optional[str] = None) -> Quest:
        """Query local Ollama instance with bounded retries and schema validation."""
        selected_model = model_name or self.default_model
        
        prompt_content = f"""Generate an outdoor quest in JSON for these parameters:
- Duration: {config.duration_minutes} minutes
- Energy Level: {config.energy_level}
- Environment: {config.environment}
- Activities: {', '.join(config.activity_preferences)}
- Difficulty: {config.difficulty}
- Accessibility / Physical limitations: {config.accessibility_notes or 'Standard accessibility'}
- Social: {config.social_mode}
- No Equipment Required: {config.no_equipment_only}
- Context/Weather: {config.weather_context or 'Not specified'}

Return JSON conforming strictly to:
{{
  "title": "string",
  "objective": "one-sentence physical goal",
  "suitability_reason": "why this matches their time/energy/environment",
  "duration_minutes": {config.duration_minutes},
  "difficulty": "{config.difficulty}",
  "energy_level": "{config.energy_level}",
  "environment": "{config.environment}",
  "required_equipment": [],
  "steps": [
    {{"step_number": 1, "instruction": "string", "detail": "string"}},
    {{"step_number": 2, "instruction": "string", "detail": "string"}},
    {{"step_number": 3, "instruction": "string", "detail": "string"}}
  ],
  "checklist": ["string item 1", "string item 2", "string item 3"],
  "bonus_challenge": "string or null",
  "safe_alternative": "safe stationary or indoor window alternative",
  "completion_criteria": "one sentence",
  "reflection_question": "thought-provoking observation question",
  "safety_notes": ["safety tip 1", "safety tip 2"]
}}"""

        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                resp = requests.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": selected_model,
                        "system": SYSTEM_PROMPT,
                        "prompt": prompt_content,
                        "format": "json",
                        "stream": False,
                        "options": {
                            "temperature": 0.4,
                            "top_p": 0.9,
                        }
                    },
                    timeout=OLLAMA_TIMEOUT_SECONDS
                )
                if resp.status_code != 200:
                    raise RuntimeError(f"Ollama returned HTTP {resp.status_code}: {resp.text}")

                payload = resp.json()
                raw_response = payload.get("response", "")
                
                # Parse JSON
                parsed_json = json.loads(raw_response)
                parsed_json["provenance"] = f"ollama:{selected_model}"
                
                # Validate with Pydantic
                quest = Quest.model_validate(parsed_json)
                return quest

            except Exception as e:
                last_error = e
                logger.warning(f"Ollama generation attempt {attempt + 1} failed: {e}")

        raise RuntimeError(f"Ollama generation failed after {MAX_RETRIES} attempts: {last_error}")
