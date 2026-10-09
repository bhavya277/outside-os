from typing import List, Optional, Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class JournalEntry(BaseModel):
    id: str = Field(default_factory=lambda: f"entry_{uuid.uuid4().hex[:10]}")
    quest_id: str
    quest_title: str
    quest_objective: str
    environment: str
    activity_types: List[str] = Field(default_factory=list)
    completion_status: Literal["full", "partial", "curtailed"] = "full"
    started_at: str
    completed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    self_reported_duration_minutes: int
    checked_items: List[str] = Field(default_factory=list)
    checklist_total: int = 0
    observations: str = Field(default="")
    reflection_response: str = Field(default="")
    photo_data_url: Optional[str] = None
    provenance: str = "offline_library"
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False

class JournalStats(BaseModel):
    total_quests_completed: int = 0
    total_self_reported_minutes: int = 0
    distinct_activity_types: List[str] = Field(default_factory=list)
    recent_discoveries: List[str] = Field(default_factory=list)
    calculated_streak_days: int = 0
    last_quest_date: Optional[str] = None
