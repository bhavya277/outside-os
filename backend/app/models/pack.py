from typing import List, Optional
from pydantic import BaseModel, Field
from .quest import Quest

class QuestPackMeta(BaseModel):
    id: str
    name: str
    author: str = "OUTSIDE//OS Open Source Community"
    version: str = "1.0.0"
    description: str
    theme: str
    difficulty_level: str = "all levels"
    safety_guidelines: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class QuestPack(BaseModel):
    meta: QuestPackMeta
    quests: List[Quest] = Field(min_length=1)

class QuestPackValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    pack_name: Optional[str] = None
    total_quests: int = 0
