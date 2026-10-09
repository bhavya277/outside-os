import sqlite3
import json
from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Dict, Any
from pathlib import Path
from ..config import DB_PATH
from ..models.journal import JournalEntry, JournalStats

def get_connection():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        quest_id TEXT NOT NULL,
        quest_title TEXT NOT NULL,
        quest_objective TEXT NOT NULL,
        environment TEXT NOT NULL,
        activity_types TEXT NOT NULL,
        completion_status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        self_reported_duration_minutes INTEGER NOT NULL,
        checked_items TEXT NOT NULL,
        checklist_total INTEGER NOT NULL,
        observations TEXT,
        reflection_response TEXT,
        photo_data_url TEXT,
        provenance TEXT NOT NULL,
        tags TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS custom_packs (
        id TEXT PRIMARY KEY,
        pack_data TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_quests (
        id TEXT PRIMARY KEY,
        quest_data TEXT NOT NULL,
        saved_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()

def save_journal_entry(entry: JournalEntry) -> JournalEntry:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO journal_entries (
            id, quest_id, quest_title, quest_objective, environment,
            activity_types, completion_status, started_at, completed_at,
            self_reported_duration_minutes, checked_items, checklist_total,
            observations, reflection_response, photo_data_url, provenance,
            tags, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry.id,
        entry.quest_id,
        entry.quest_title,
        entry.quest_objective,
        entry.environment,
        json.dumps(entry.activity_types),
        entry.completion_status,
        entry.started_at,
        entry.completed_at,
        entry.self_reported_duration_minutes,
        json.dumps(entry.checked_items),
        entry.checklist_total,
        entry.observations,
        entry.reflection_response,
        entry.photo_data_url,
        entry.provenance,
        json.dumps(entry.tags),
        1 if entry.is_favorite else 0
    ))
    conn.commit()
    conn.close()
    return entry

def get_journal_entries(search: Optional[str] = None, tag: Optional[str] = None) -> List[JournalEntry]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM journal_entries ORDER BY completed_at DESC"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    entries = []
    for row in rows:
        act_types = json.loads(row["activity_types"]) if row["activity_types"] else []
        checked = json.loads(row["checked_items"]) if row["checked_items"] else []
        tags = json.loads(row["tags"]) if row["tags"] else []

        entry = JournalEntry(
            id=row["id"],
            quest_id=row["quest_id"],
            quest_title=row["quest_title"],
            quest_objective=row["quest_objective"],
            environment=row["environment"],
            activity_types=act_types,
            completion_status=row["completion_status"],
            started_at=row["started_at"],
            completed_at=row["completed_at"],
            self_reported_duration_minutes=row["self_reported_duration_minutes"],
            checked_items=checked,
            checklist_total=row["checklist_total"],
            observations=row["observations"] or "",
            reflection_response=row["reflection_response"] or "",
            photo_data_url=row["photo_data_url"],
            provenance=row["provenance"],
            tags=tags,
            is_favorite=bool(row["is_favorite"])
        )

        if search:
            s_lower = search.lower()
            matches = (
                s_lower in entry.quest_title.lower() or
                s_lower in entry.quest_objective.lower() or
                s_lower in entry.observations.lower() or
                s_lower in entry.environment.lower()
            )
            if not matches:
                continue

        if tag:
            if tag.lower() not in [t.lower() for t in entry.tags] and tag.lower() not in [a.lower() for a in entry.activity_types]:
                continue

        entries.append(entry)
    return entries

def delete_journal_entry(entry_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def calculate_journal_stats() -> JournalStats:
    entries = get_journal_entries()
    if not entries:
        return JournalStats()

    total_quests = len(entries)
    total_minutes = sum(e.self_reported_duration_minutes for e in entries)
    
    activity_set = set()
    for e in entries:
        for a in e.activity_types:
            activity_set.add(a)

    discoveries = []
    for e in entries:
        if e.observations and e.observations.strip():
            # grab the first 80 chars of user note
            snippet = e.observations.strip().split("\n")[0][:90]
            discoveries.append(f"{e.quest_title}: \"{snippet}\"")
        if len(discoveries) >= 6:
            break

    # Calculate streak from completed_at dates
    dates = []
    for e in entries:
        try:
            d = datetime.fromisoformat(e.completed_at.replace("Z", "+00:00")).date()
            dates.append(d)
        except Exception:
            pass

    sorted_dates = sorted(list(set(dates)), reverse=True)
    streak = 0
    if sorted_dates:
        today = date.today()
        # streak is active if last completed was today or yesterday
        if sorted_dates[0] == today or sorted_dates[0] == today - timedelta(days=1):
            streak = 1
            curr = sorted_dates[0]
            for prev in sorted_dates[1:]:
                if curr - prev == timedelta(days=1):
                    streak += 1
                    curr = prev
                else:
                    break

    return JournalStats(
        total_quests_completed=total_quests,
        total_self_reported_minutes=total_minutes,
        distinct_activity_types=sorted(list(activity_set)),
        recent_discoveries=discoveries,
        calculated_streak_days=streak,
        last_quest_date=entries[0].completed_at if entries else None
    )

def export_all_data() -> Dict[str, Any]:
    entries = get_journal_entries()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM saved_quests")
    saved = [json.loads(row["quest_data"]) for row in cursor.fetchall()]
    conn.close()

    return {
        "outside_os_version": "1.0.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "journal_entries": [e.model_dump() for e in entries],
        "saved_quests": saved,
        "privacy_notice": "Exported from local SQLite database on your machine. Zero cloud storage."
    }

def clear_all_user_data() -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM journal_entries")
    cursor.execute("DELETE FROM custom_packs")
    cursor.execute("DELETE FROM saved_quests")
    conn.commit()
    conn.close()
    return True
