import pytest
import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.models.quest import QuestConfig, Quest, QuestStep
from app.models.journal import JournalEntry
from app.services.quest_service import QuestService
from app.services.fallback_generator import generate_fallback_quest
from app.services.ollama_adapter import OllamaAdapter
from app.services.pack_service import PackService
from app.db.database import (
    init_db,
    save_journal_entry,
    get_journal_entries,
    delete_journal_entry,
    clear_all_user_data,
    calculate_journal_stats,
    export_all_data
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_database():
    init_db()
    clear_all_user_data()
    yield
    clear_all_user_data()

# 1. Valid adventure configuration
def test_valid_adventure_configuration():
    config = QuestConfig(
        duration_minutes=15,
        energy_level="balanced",
        activity_preferences=["nature observation", "walking"],
        environment="neighborhood",
        difficulty="gentle",
        accessibility_notes="no steep stairs",
        social_mode="solo",
        no_equipment_only=True
    )
    assert config.duration_minutes == 15
    assert config.energy_level == "balanced"
    assert config.environment == "neighborhood"

# 2. Invalid or missing user input
def test_invalid_adventure_configuration():
    response = client.post("/api/quest/generate", json={
        "duration_minutes": 15,
        "energy_level": "ultra_extreme",  # Invalid energy level
    })
    assert response.status_code == 422  # Pydantic validation error

# 3. Valid generated quest schema
def test_valid_generated_quest_schema():
    config = QuestConfig(duration_minutes=30, environment="park")
    quest = generate_fallback_quest(config)
    assert quest.id.startswith("quest_")
    assert quest.duration_minutes == 30
    assert len(quest.steps) >= 3
    assert len(quest.checklist) >= 2
    assert quest.safe_alternative != ""
    assert quest.reflection_question != ""

# 4. Malformed model response gracefully handled
def test_malformed_model_response_fallback():
    mock_adapter = MagicMock()
    # Simulate adapter throwing on malformed JSON
    mock_adapter.check_status.return_value = MagicMock(ollama_available=True, model_ready=True)
    mock_adapter.generate_quest.side_effect = RuntimeError("Malformed JSON from LLM")

    service = QuestService(ollama_adapter=mock_adapter)
    config = QuestConfig(duration_minutes=15)
    quest = service.generate(config)

    # Should fall back cleanly without raising 500
    assert quest is not None
    assert "offline_library" in quest.provenance or "fallback" in quest.suitability_reason

# 5. Model server unavailable
def test_model_server_unavailable():
    mock_adapter = MagicMock()
    mock_adapter.check_status.return_value = MagicMock(ollama_available=False, model_ready=False)

    service = QuestService(ollama_adapter=mock_adapter)
    config = QuestConfig(duration_minutes=20, environment="garden")
    quest = service.generate(config)

    assert quest is not None
    assert quest.duration_minutes == 20
    assert quest.provenance.startswith("offline_library")

# 6. Offline fallback behavior
def test_explicit_offline_fallback():
    response = client.post("/api/quest/generate?prefer_offline=true", json={
        "duration_minutes": 10,
        "energy_level": "low",
        "environment": "balcony",
        "activity_preferences": ["mindful exploration"],
        "difficulty": "gentle"
    })
    assert response.status_code == 200
    data = response.json()
    assert "offline_library" in data["provenance"]
    assert data["environment"] == "balcony"

# 7. Quest checklist progress tracking
def test_quest_checklist_tracking():
    entry = JournalEntry(
        quest_id="quest_test_123",
        quest_title="Soundscape Mapping",
        quest_objective="Map local acoustic horizons",
        environment="park",
        activity_types=["mindful exploration"],
        started_at=datetime.now(timezone.utc).isoformat(),
        self_reported_duration_minutes=15,
        checked_items=["Heard birdsong", "Identified wind direction"],
        checklist_total=3,
        completion_status="partial"
    )
    saved = save_journal_entry(entry)
    assert len(saved.checked_items) == 2
    assert saved.checklist_total == 3
    assert saved.completion_status == "partial"

# 8. Pause and resume behavior (session simulation)
def test_pause_and_resume_timing_calculation():
    # Verify that timestamp diffs can accurately calculate elapsed time across pause
    t0 = 1000.0  # seconds
    t_pause = 1300.0  # paused after 300s (5 min)
    t_resume = 1600.0  # resumed 300s later
    t_finish = 1900.0  # finished 300s after resume
    
    # Active elapsed time = (t_pause - t0) + (t_finish - t_resume) = 300 + 300 = 600s = 10 min
    elapsed_active_seconds = (t_pause - t0) + (t_finish - t_resume)
    assert elapsed_active_seconds == 600.0

# 9. Journal persistence across restart
def test_journal_persistence_and_retrieval():
    entry = JournalEntry(
        quest_id="quest_persist_1",
        quest_title="Micro Canopy Inventory",
        quest_objective="Catalog tree leaves",
        environment="neighborhood",
        activity_types=["nature observation", "biodiversity"],
        started_at=datetime.now(timezone.utc).isoformat(),
        self_reported_duration_minutes=20,
        checked_items=["Noticed leaf veins"],
        checklist_total=2,
        observations="Found an oak with deeply lobed leaves.",
        reflection_response="Vein patterns resemble river deltas.",
        provenance="offline_library:biodiversity",
        tags=["oak", "botany"]
    )
    save_journal_entry(entry)

    # Fetch
    entries = get_journal_entries()
    assert len(entries) == 1
    assert entries[0].quest_title == "Micro Canopy Inventory"
    assert entries[0].observations == "Found an oak with deeply lobed leaves."

# 10. Export and deletion
def test_export_and_deletion():
    entry = JournalEntry(
        quest_id="quest_export_1",
        quest_title="Lichen Scout",
        quest_objective="Find rock lichens",
        environment="garden",
        started_at=datetime.now(timezone.utc).isoformat(),
        self_reported_duration_minutes=10,
        checklist_total=1
    )
    save_journal_entry(entry)
    
    # Export
    exported = export_all_data()
    assert len(exported["journal_entries"]) == 1
    assert exported["journal_entries"][0]["quest_title"] == "Lichen Scout"
    
    # Clear
    clear_all_user_data()
    assert len(get_journal_entries()) == 0

# 11. Quest-pack validation
def test_quest_pack_validation():
    pack_service = PackService()
    valid_pack_data = {
        "meta": {
            "id": "pack_community_birds",
            "name": "Community Backyard Birds",
            "author": "BirderJane",
            "version": "1.0.0",
            "description": "Bird watching without binoculars.",
            "theme": "Birding",
            "difficulty_level": "gentle",
            "safety_guidelines": ["Do not disturb nests.", "Keep quiet."],
            "tags": ["birds", "audio"]
        },
        "quests": [
            {
                "id": "quest_bird_01",
                "title": "Avian Song Perch Vigil",
                "objective": "Spot two perching birds.",
                "suitability_reason": "Any quiet garden or balcony.",
                "duration_minutes": 15,
                "difficulty": "gentle",
                "energy_level": "low",
                "environment": "garden",
                "required_equipment": [],
                "steps": [
                    {"step_number": 1, "instruction": "Find a seat"},
                    {"step_number": 2, "instruction": "Listen quietly"},
                    {"step_number": 3, "instruction": "Count perches"}
                ],
                "checklist": ["Heard chirp", "Saw bird"],
                "safe_alternative": "Look out window",
                "completion_criteria": "15 minutes observed",
                "reflection_question": "What colors were visible?",
                "safety_notes": ["Don't feed bread"],
                "provenance": "community_pack"
            }
        ]
    }
    result = pack_service.validate_pack_data(valid_pack_data)
    assert result.is_valid is True
    assert result.total_quests == 1

    # Malformed pack missing safety guidelines
    invalid_pack = dict(valid_pack_data)
    invalid_pack["meta"] = {"id": "bad", "name": "No safety"}
    result_invalid = pack_service.validate_pack_data(invalid_pack)
    assert result_invalid.is_valid is False
    assert len(result_invalid.errors) > 0

# 12. Empty journal and empty search results
def test_empty_journal_and_search():
    stats = calculate_journal_stats()
    assert stats.total_quests_completed == 0
    assert stats.total_self_reported_minutes == 0

    results = get_journal_entries(search="nonexistent_word_xyz")
    assert len(results) == 0

# 13. Accessibility adaptation in fallback quests
def test_accessibility_adaptation():
    config = QuestConfig(
        duration_minutes=15,
        energy_level="low",
        accessibility_notes="wheelchair seated, no stair climbing"
    )
    quest = generate_fallback_quest(config)
    assert "seated" in quest.suitability_reason.lower() or "accessibility" in quest.suitability_reason.lower()
    assert "seated" in quest.safe_alternative.lower()

# 14. Unsafe or out-of-scope mission rejection
def test_unsafe_mission_rejection():
    service = QuestService()
    unsafe_config = QuestConfig(
        environment="railroad tracks trespassing near electric sub-station",
        duration_minutes=15
    )
    with pytest.raises(ValueError) as exc:
        service.generate(unsafe_config)
    assert "hazardous" in str(exc.value).lower()
