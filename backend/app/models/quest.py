from typing import List, Optional, Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class QuestStep(BaseModel):
    step_number: int
    instruction: str
    detail: Optional[str] = None

class QuestConfig(BaseModel):
    duration_minutes: int = Field(default=15, description="Available time in minutes: 10, 15, 30, 45, or 60")
    energy_level: Literal["low", "balanced", "high"] = Field(default="balanced")
    activity_preferences: List[str] = Field(
        default_factory=lambda: ["nature observation", "mindful exploration"]
    )
    environment: str = Field(
        default="neighborhood",
        description="garden, park, neighborhood, balcony, campus, or custom setting"
    )
    difficulty: Literal["gentle", "moderate", "adventurous"] = Field(default="gentle")
    accessibility_notes: Optional[str] = Field(
        default="",
        description="Mobility constraints, step-free requirements, seated exploration, etc."
    )
    social_mode: Literal["solo", "pair", "group"] = Field(default="solo")
    no_equipment_only: bool = Field(default=True)
    weather_context: Optional[str] = Field(default=None)
    season: Optional[str] = Field(default=None)

class Quest(BaseModel):
    id: str = Field(default_factory=lambda: f"quest_{uuid.uuid4().hex[:10]}")
    title: str
    objective: str = Field(description="One-sentence objective")
    suitability_reason: str = Field(description="Why this mission suits user inputs")
    duration_minutes: int
    difficulty: Literal["gentle", "moderate", "adventurous"]
    energy_level: Literal["low", "balanced", "high"]
    environment: str
    required_equipment: List[str] = Field(default_factory=list)
    steps: List[QuestStep] = Field(min_length=3, max_length=6)
    checklist: List[str] = Field(min_length=2, max_length=8)
    bonus_challenge: Optional[str] = None
    safe_alternative: str = Field(description="Indoor or seated alternative if conditions change")
    completion_criteria: str
    reflection_question: str
    safety_notes: List[str] = Field(default_factory=list)
    provenance: str = Field(
        default="offline_library",
        description="Source identifier (e.g. ollama:gemma2:2b or offline_library)"
    )
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ActiveQuestSession(BaseModel):
    quest_id: str
    quest: Quest
    started_at: str
    status: Literal["in_progress", "paused", "completed", "abandoned"] = "in_progress"
    paused_at: Optional[str] = None
    completed_steps: List[int] = Field(default_factory=list)
    checked_items: List[int] = Field(default_factory=list)
