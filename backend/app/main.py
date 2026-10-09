from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from .config import DEFAULT_MODEL
from .db.database import (
    init_db,
    save_journal_entry,
    get_journal_entries,
    delete_journal_entry,
    calculate_journal_stats,
    export_all_data,
    clear_all_user_data
)
from .models.quest import Quest, QuestConfig
from .models.journal import JournalEntry, JournalStats
from .models.pack import QuestPack, QuestPackValidationResult
from .models.system import ModelStatus
from .services.ollama_adapter import OllamaAdapter
from .services.quest_service import QuestService
from .services.pack_service import PackService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite schema
    init_db()
    yield

app = FastAPI(
    title="OUTSIDE//OS API",
    description="Local-first AI Outdoor Adventure Engine for Hacktoberfest",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ollama_adapter = OllamaAdapter()
quest_service = QuestService(ollama_adapter)
pack_service = PackService()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OUTSIDE//OS",
        "philosophy": "Generate a quest. Leave the screen. Experience the world."
    }

@app.get("/api/model/status", response_model=ModelStatus)
def get_model_status():
    return ollama_adapter.check_status()

@app.post("/api/quest/generate", response_model=Quest)
def generate_quest(
    config: QuestConfig,
    prefer_offline: bool = Query(default=False),
    model_override: Optional[str] = Query(default=None)
):
    try:
        quest = quest_service.generate(
            config=config,
            prefer_offline=prefer_offline,
            model_override=model_override
        )
        return quest
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quest generation failed: {str(e)}")

@app.get("/api/quest/packs", response_model=List[QuestPack])
def get_quest_packs():
    return pack_service.load_starter_packs()

@app.post("/api/quest/packs/validate", response_model=QuestPackValidationResult)
def validate_quest_pack(data: Dict[str, Any] = Body(...)):
    return pack_service.validate_pack_data(data)

@app.post("/api/quest/packs/import")
def import_quest_pack(data: Dict[str, Any] = Body(...)):
    val = pack_service.validate_pack_data(data)
    if not val.is_valid:
        raise HTTPException(status_code=400, detail={"errors": val.errors})
    pack = QuestPack.model_validate(data)
    pack_service.save_custom_pack(pack)
    return {"message": f"Successfully imported quest pack '{pack.meta.name}'", "pack_id": pack.meta.id}

@app.post("/api/journal/entry", response_model=JournalEntry)
def add_journal_entry(entry: JournalEntry):
    return save_journal_entry(entry)

@app.get("/api/journal/entries", response_model=List[JournalEntry])
def list_journal_entries(
    search: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None)
):
    return get_journal_entries(search=search, tag=tag)

@app.delete("/api/journal/entry/{entry_id}")
def remove_journal_entry(entry_id: str):
    success = delete_journal_entry(entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Entry removed successfully"}

@app.get("/api/journal/stats", response_model=JournalStats)
def get_journal_stats():
    return calculate_journal_stats()

@app.get("/api/journal/export")
def export_journal_data():
    return export_all_data()

@app.delete("/api/journal/clear")
def clear_user_data():
    clear_all_user_data()
    return {"message": "All local journal and custom pack records have been permanently cleared."}
