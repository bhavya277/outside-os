import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..config import PACKS_DIR
from ..models.pack import QuestPack, QuestPackValidationResult
from ..models.quest import Quest
from ..db.database import get_connection

logger = logging.getLogger(__name__)

class PackService:
    def __init__(self, packs_dir: Path = PACKS_DIR):
        self.packs_dir = Path(packs_dir)

    def load_starter_packs(self) -> List[QuestPack]:
        """Loads and validates all starter packs from disk."""
        packs = []
        if not self.packs_dir.exists():
            return packs

        for p_file in self.packs_dir.glob("*.json"):
            try:
                with open(p_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                pack = QuestPack.model_validate(data)
                packs.append(pack)
            except Exception as e:
                logger.error(f"Failed to load quest pack {p_file.name}: {e}")

        # Also load custom packs from database
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT pack_data FROM custom_packs")
            for row in cursor.fetchall():
                try:
                    cdata = json.loads(row["pack_data"])
                    pack = QuestPack.model_validate(cdata)
                    packs.append(pack)
                except Exception:
                    pass
            conn.close()
        except Exception as e:
            logger.warning(f"Could not load custom packs from DB: {e}")

        return packs

    def validate_pack_data(self, data: Dict[str, Any]) -> QuestPackValidationResult:
        """Validates community quest pack against OUTSIDE//OS schema and safety requirements."""
        errors = []
        warnings = []
        pack_name = None
        total_quests = 0

        # Validate meta
        meta = data.get("meta")
        if not meta or not isinstance(meta, dict):
            errors.append("Missing required 'meta' object.")
        else:
            pack_name = meta.get("name")
            if not meta.get("id"):
                errors.append("Meta is missing 'id'.")
            if not pack_name:
                errors.append("Meta is missing 'name'.")
            if not meta.get("safety_guidelines") or len(meta.get("safety_guidelines", [])) == 0:
                errors.append("Meta must include at least one safety guideline.")

        # Validate quests
        quests_raw = data.get("quests")
        if not isinstance(quests_raw, list) or len(quests_raw) == 0:
            errors.append("Pack must contain at least one quest in 'quests' array.")
        else:
            total_quests = len(quests_raw)
            for idx, q in enumerate(quests_raw):
                q_id = q.get("id", f"quest_{idx}")
                try:
                    Quest.model_validate(q)
                except Exception as q_err:
                    errors.append(f"Quest #{idx+1} ('{q_id}') schema validation failed: {str(q_err)[:180]}")

                # Safety checks
                if not q.get("safe_alternative"):
                    warnings.append(f"Quest '{q_id}' is missing a safe_alternative for bad weather or mobility.")
                if not q.get("safety_notes"):
                    warnings.append(f"Quest '{q_id}' has no explicit safety_notes.")

        is_valid = len(errors) == 0
        return QuestPackValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            pack_name=pack_name or "Unnamed Pack",
            total_quests=total_quests
        )

    def save_custom_pack(self, pack: QuestPack) -> bool:
        """Persists a validated community quest pack to SQLite."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO custom_packs (id, pack_data, created_at)
            VALUES (?, ?, datetime('now'))
        """, (pack.meta.id, json.dumps(pack.model_dump())))
        conn.commit()
        conn.close()
        return True
