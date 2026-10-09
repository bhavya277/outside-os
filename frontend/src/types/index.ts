export type ScreenType =
  | 'home'
  | 'builder'
  | 'quest'
  | 'expedition'
  | 'reflect'
  | 'journal'
  | 'dashboard'
  | 'library';

export interface QuestStep {
  step_number: number;
  instruction: string;
  detail?: string;
}

export interface QuestConfig {
  duration_minutes: number;
  energy_level: 'low' | 'balanced' | 'high';
  activity_preferences: string[];
  environment: string;
  difficulty: 'gentle' | 'moderate' | 'adventurous';
  accessibility_notes?: string;
  social_mode: 'solo' | 'pair' | 'group';
  no_equipment_only: boolean;
  weather_context?: string;
  season?: string;
}

export interface Quest {
  id: string;
  title: string;
  objective: string;
  suitability_reason: string;
  duration_minutes: number;
  difficulty: 'gentle' | 'moderate' | 'adventurous';
  energy_level: 'low' | 'balanced' | 'high';
  environment: string;
  required_equipment: string[];
  steps: QuestStep[];
  checklist: string[];
  bonus_challenge?: string;
  safe_alternative: string;
  completion_criteria: string;
  reflection_question: string;
  safety_notes: string[];
  provenance: string;
  created_at: string;
}

export interface ActiveSession {
  quest: Quest;
  startedAt: string; // ISO string
  startTimestamp: number; // Date.now()
  pausedAt?: number;
  accumulatedElapsedSeconds: number;
  isPaused: boolean;
  checkedItems: string[];
  completedSteps: number[];
}

export interface JournalEntry {
  id: string;
  quest_id: string;
  quest_title: string;
  quest_objective: string;
  environment: string;
  activity_types: string[];
  completion_status: 'full' | 'partial' | 'curtailed';
  started_at: string;
  completed_at: string;
  self_reported_duration_minutes: number;
  checked_items: string[];
  checklist_total: number;
  observations: string;
  reflection_response: string;
  photo_data_url?: string;
  provenance: string;
  tags: string[];
  is_favorite?: boolean;
}

export interface JournalStats {
  total_quests_completed: number;
  total_self_reported_minutes: number;
  distinct_activity_types: string[];
  recent_discoveries: string[];
  calculated_streak_days: number;
  last_quest_date?: string;
}

export interface QuestPackMeta {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  theme: string;
  difficulty_level: string;
  safety_guidelines: string[];
  tags: string[];
}

export interface QuestPack {
  meta: QuestPackMeta;
  quests: Quest[];
}

export interface QuestPackValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  pack_name?: string;
  total_quests: number;
}

export interface ModelStatus {
  ollama_available: boolean;
  base_url: string;
  active_model: string;
  available_models: string[];
  model_ready: boolean;
  status_message: string;
  offline_library_count: number;
  license_info: string;
  privacy_mode: string;
}
