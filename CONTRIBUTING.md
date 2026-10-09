# Contributing to OUTSIDE//OS 🌿

Welcome to **OUTSIDE//OS**, an open-source real-world adventure engine built for the Hacktoberfest "Touch Grass" theme!

Our core philosophy:
> **"Your AI should get you out of the app, not keep you inside it."**

We welcome code contributions, community quest packs, accessibility improvements, model adapters, and localization.

---

## 🧭 How to Author a Community Quest Pack

The easiest and most impactful way to contribute is by authoring a **Community Quest Pack**.

Quest packs live in `backend/packs/<pack_id>.json` and allow anyone to share safe, sensory-rich expeditions for specific ecosystems, urban areas, or accessibility profiles.

### 1. Quest Pack JSON Schema

Every pack must adhere to the following schema:

```json
{
  "meta": {
    "id": "pack_unique_snake_case_id",
    "name": "Human-Readable Pack Title",
    "author": "Your GitHub Handle or Organization",
    "version": "1.0.0",
    "description": "A 1-2 sentence description of what explorers will experience.",
    "theme": "Theme classification (e.g., Birding, Urban Botany, Night Soundscapes)",
    "difficulty_level": "gentle | moderate | adventurous",
    "safety_guidelines": [
      "Explicit safety rule 1 (e.g., stay on pedestrian sidewalks)",
      "Explicit safety rule 2 (e.g., never touch unknown fungi or plants)"
    ],
    "tags": ["tag1", "tag2", "tag3"]
  },
  "quests": [
    {
      "id": "quest_id_001",
      "title": "Evocative Quest Title",
      "objective": "One-sentence physical goal achievable in ordinary surroundings.",
      "suitability_reason": "Why this quest fits the explorer's time and energy.",
      "duration_minutes": 15,
      "difficulty": "gentle",
      "energy_level": "balanced",
      "environment": "neighborhood",
      "required_equipment": [],
      "steps": [
        {
          "step_number": 1,
          "instruction": "Concrete step 1 instruction",
          "detail": "Helpful sensory tip"
        },
        {
          "step_number": 2,
          "instruction": "Concrete step 2 instruction",
          "detail": "Helpful sensory tip"
        },
        {
          "step_number": 3,
          "instruction": "Concrete step 3 instruction",
          "detail": "Helpful sensory tip"
        }
      ],
      "checklist": [
        "Concrete observation 1 to notice",
        "Concrete observation 2 to notice",
        "Concrete observation 3 to notice"
      ],
      "bonus_challenge": "Optional extra challenge without gear",
      "safe_alternative": "Indoor window or seated alternative if conditions change",
      "completion_criteria": "Clear condition for what constitutes completion",
      "reflection_question": "Thoughtful question for the field journal afterwards",
      "safety_notes": [
        "Safety note 1",
        "Safety note 2"
      ],
      "provenance": "community_pack:your_pack_id",
      "created_at": "2026-10-01T00:00:00Z"
    }
  ]
}
```

### 2. Physical Safety Rules for Quest Packs
- **No Trespassing:** Never direct explorers across fences, onto private properties, or into restricted zones.
- **No Hazardous Contact:** Never instruct users to touch poison ivy, wild mushrooms, stinging insects, or broken glass.
- **No Road Distractions:** Never instruct users to look at their phone while crossing streets.
- **No Equipment Mandates:** Ensure quests can be completed with ordinary shoes and clothing.
- **Always Provide a Safe Alternative:** Include a stationary or indoor window observation alternative for bad weather or mobility needs.

### 3. Testing Your Pack
You can test your pack JSON immediately inside the running app:
1. Open the app and navigate to **Packs & Settings** (`Screen 8`).
2. Paste your JSON into the **Community Pack JSON Validator**.
3. Click **Validate Schema**. Fix any schema errors or warnings before opening a Pull Request!

---

## 🎯 Starter Good-First-Issues for Hacktoberfest

Here are 5 well-scoped starter issues ready for community contributors:

### Issue #1: `[Pack]` Add "Nocturnal Soundscapes & Astronomy" Quest Pack
- **Description:** Create a safe evening quest pack (`backend/packs/nocturnal_soundscapes.json`) focused on twilight bird roosts, cricket frequencies, and cloud/star gazing from balconies or yards.
- **Difficulty:** Beginner-friendly. No code required, just structured JSON matching the schema!

### Issue #2: `[A11y]` Audio Chime on Timer Intervals in Pocket Mode
- **Description:** Implement optional periodic soft audio tones (e.g. via HTML5 Web Audio API at 5, 10, and 15 minutes) so the user doesn't need to look at their phone to know when their time is halfway elapsed.
- **Difficulty:** Intermediate.

### Issue #3: `[Model]` Add Model Adapter Support for `llama3.2:1b` & `mistral-nemo`
- **Description:** Expand `ollama_adapter.py` with presets and tested system prompts for Meta Llama 3.2 1B and Mistral Nemo 12B.
- **Difficulty:** Intermediate.

### Issue #4: `[Export]` Anonymized GPX / GeoJSON Track Import (No Location Leaks)
- **Description:** Allow explorers who record offline walking tracks via open GPS devices to attach a GPX file locally without any cloud transmission.
- **Difficulty:** Advanced.

### Issue #5: `[i18n]` Spanish and French Localizations for Starter Quests
- **Description:** Translate the 3 starter packs (`urban_nature_explorer.json`, `slow_walks_mindful.json`, `small_space_gardening.json`) into French and Spanish.
- **Difficulty:** Beginner-friendly.

---

## 💻 Code Contribution Workflow

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/my-new-quest-pack
   ```
2. Run backend tests before submitting:
   ```powershell
   $env:PYTHONPATH="backend"
   .\venv\Scripts\python.exe -m pytest -v backend/tests
   ```
3. Run frontend build verification:
   ```bash
   cd frontend
   npm run build
   ```
4. Commit your changes with a clear message and submit a PR!
