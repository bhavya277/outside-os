import {
  Quest,
  QuestConfig,
  JournalEntry,
  JournalStats,
  QuestPack,
  QuestPackValidationResult,
  ModelStatus,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export async function getModelStatus(): Promise<ModelStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/model/status`);
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch {
    return {
      ollama_available: false,
      base_url: 'http://localhost:11434',
      active_model: 'offline_fallback',
      available_models: [],
      model_ready: false,
      status_message: 'Backend or Ollama offline. Operating via local field library.',
      offline_library_count: 18,
      license_info: 'Offline Verified Quests',
      privacy_mode: '100% Local Device Only',
    };
  }
}

export async function generateQuest(
  config: QuestConfig,
  preferOffline: boolean = false,
  modelOverride?: string
): Promise<Quest> {
  const url = new URL(`${API_BASE}/api/quest/generate`);
  if (preferOffline) url.searchParams.set('prefer_offline', 'true');
  if (modelOverride) url.searchParams.set('model_override', modelOverride);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
    throw new Error(err.detail || 'Failed to generate quest');
  }

  return await res.json();
}

export async function getQuestPacks(): Promise<QuestPack[]> {
  try {
    const res = await fetch(`${API_BASE}/api/quest/packs`);
    if (!res.ok) throw new Error('Packs failed');
    return await res.json();
  } catch {
    return [];
  }
}

export async function validateQuestPack(data: unknown): Promise<QuestPackValidationResult> {
  const res = await fetch(`${API_BASE}/api/quest/packs/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Validation request failed');
  }
  return await res.json();
}

export async function importQuestPack(data: unknown): Promise<{ message: string; pack_id: string }> {
  const res = await fetch(`${API_BASE}/api/quest/packs/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail?.errors?.join(', ') || 'Import failed');
  }
  return await res.json();
}

export async function addJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/api/journal/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to save journal entry');
  return await res.json();
}

export async function getJournalEntries(search?: string, tag?: string): Promise<JournalEntry[]> {
  try {
    const url = new URL(`${API_BASE}/api/journal/entries`);
    if (search) url.searchParams.set('search', search);
    if (tag) url.searchParams.set('tag', tag);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Entries fetch failed');
    return await res.json();
  } catch {
    return [];
  }
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/journal/entry/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function getJournalStats(): Promise<JournalStats> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/stats`);
    if (!res.ok) throw new Error('Stats failed');
    return await res.json();
  } catch {
    return {
      total_quests_completed: 0,
      total_self_reported_minutes: 0,
      distinct_activity_types: [],
      recent_discoveries: [],
      calculated_streak_days: 0,
    };
  }
}

export async function exportJournalData(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/journal/export`);
  if (!res.ok) throw new Error('Export failed');
  return await res.json();
}

export async function clearUserData(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/journal/clear`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Clear data failed');
}
