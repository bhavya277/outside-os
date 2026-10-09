import uuid
import hashlib
from typing import List, Dict, Any
from datetime import datetime, timezone
from ..models.quest import Quest, QuestStep, QuestConfig

# Core verified archetype templates designed for realistic outdoor environments
ARCHETYPES = [
    {
        "category": "biodiversity",
        "title_templates": [
            "The Micro-Canopy Inventory",
            "Hidden Botany of the Sidewalk Crevices",
            "Leaf Morphology Expedition",
            "Bark Texture & Lichen Cartography"
        ],
        "objective_template": "Document 3 distinct leaf vascular patterns and surface textures in your immediate {env} without plucking or disturbing any living foliage.",
        "steps": [
            QuestStep(step_number=1, instruction="Step outside into your {env} and find a safe, stationary vantage point away from vehicle pathways.", detail="Take three slow breaths to calibrate your field vision to small details."),
            QuestStep(step_number=2, instruction="Locate three different living plant specimens at eye or waist level.", detail="Notice blade shape: is it serrated, palmate, oval, or needle-like?"),
            QuestStep(step_number=3, instruction="Examine the underside of one leaf with natural sunlight filtering through.", detail="Observe the vein architecture without twisting or tearing the stem."),
            QuestStep(step_number=4, instruction="Check for secondary micro-life such as tiny moss patches, lichen rosettes, or insect tracks.", detail="Observe from a respectful distance without touching delicate organisms.")
        ],
        "checklist": [
            "Found one broad-leaf specimen with visible veins",
            "Identified one smooth-edged vs one toothed/serrated edge",
            "Noticed an area where moss or lichen colonizes a hard surface",
            "Observed natural light filtering through translucent foliage"
        ],
        "bonus_challenge": "Spot one sign of seasonal transition: a yellowing margin, dried seed capsule, or new budding node.",
        "safe_alternative": "Observe houseplants near an indoor window or watch swaying tree branches through a glass pane, sketching two distinct silhouette shapes.",
        "reflection_question": "What structural adaptation stood out most to you when looking at leaves up close rather than passing by them?",
        "safety_notes": [
            "Do not pick, tear, or ingest wild foliage, berries, or fungi.",
            "Stay clear of thorny brush or private perimeter fences.",
            "Watch your footing on damp or uneven terrain."
        ]
    },
    {
        "category": "mindful exploration",
        "title_templates": [
            "Soundscape Topography",
            "Five Horizons Walk",
            "Shadow & Light Thresholds",
            "Slow Motion Micro-Patrol"
        ],
        "objective_template": "Map the subtle acoustic and shadow boundaries across a calm sector of your {env} while walking at half your normal pace.",
        "steps": [
            QuestStep(step_number=1, instruction="Begin walking at a measured, deliberate pace across a familiar path in your {env}.", detail="Keep your phone in your pocket; let your natural periphery widen."),
            QuestStep(step_number=2, instruction="Pause at an open boundary or bench for two full minutes.", detail="Close your eyes for 30 seconds: distinguish artificial ambient sounds from organic wind or bird calls."),
            QuestStep(step_number=3, instruction="Note three distinct micro-climates along your path: warmth from a sunlit wall, cool air under tree shade, or moving breeze.", detail="Feel the subtle temperature variation on the back of your hands."),
            QuestStep(step_number=4, instruction="Identify one architectural or natural landmark you normally rush past without noticing.", detail="Observe how light reflects off its texture.")
        ],
        "checklist": [
            "Walked at least 50 steps at half ordinary walking speed",
            "Heard two distinct non-mechanical sounds (wind, birdsong, rustling leaves)",
            "Identified where warm direct sun meets cool tree shade",
            "Spotted one overlooked architectural or natural fixture"
        ],
        "bonus_challenge": "Track a single falling leaf or drifting cloud fragment until it disappears from view.",
        "safe_alternative": "Sit comfortably by an open window, close your eyes for 3 minutes, and catalog the 3 loudest and 3 quietest sounds reaching your ears.",
        "reflection_question": "How did reducing your walking pace alter what you were able to register in your surroundings?",
        "safety_notes": [
            "Stay aware of your surroundings, crosswalks, cyclists, and uneven curbs.",
            "Do not close your eyes while actively walking near traffic or drop-offs."
        ]
    },
    {
        "category": "photography",
        "title_templates": [
            "The Color Contrast Survey",
            "Geometric Naturalism Study",
            "Macro Perspective Hunt",
            "Weathered Surface Chronicles"
        ],
        "objective_template": "Frame three compositions capturing the tension between natural growth and human-made surfaces in your {env}.",
        "steps": [
            QuestStep(step_number=1, instruction="Survey your immediate {env} for borders where plants meet brick, wood, stone, or iron.", detail="Notice weeds emerging from cracks or vines scaling fences."),
            QuestStep(step_number=2, instruction="Take your first mental or captured frame: a stark high-contrast close-up of texture.", detail="Pay attention to side-lighting and grain."),
            QuestStep(step_number=3, instruction="Take a second frame from an unusual angle: knee-height looking upward or bird-eye looking down.", detail="Change your physical elevation to reveal hidden geometry."),
            QuestStep(step_number=4, instruction="Find a spot where weathering (water marks, rust, moss patina) tells a story of time passing.", detail="Appreciate the natural decay or growth process.")
        ],
        "checklist": [
            "Found an intersection of green life and stone/concrete",
            "Observed a high-contrast shadow pattern cast by organic foliage",
            "Framed an angle from below waist level looking skyward",
            "Noticed surface patina, rust, or weathered grain"
        ],
        "bonus_challenge": "Capture or memorize an image containing only two harmonious complementary colors found in nature.",
        "safe_alternative": "Compose photos from an indoor balcony or window framing the horizon line against a window frame.",
        "reflection_question": "Which unexpected texture or color combination was the most visually striking?",
        "safety_notes": [
            "Keep your screen brightness low and put your camera away between shots to stay present.",
            "Never step into roadway lanes or balance precariously on ledges for an angle."
        ]
    },
    {
        "category": "nature observation",
        "title_templates": [
            "Avian Flyway & Perch Vigil",
            "Wind Direction & Foliage Flutter",
            "Canopy Silhouette Mapping",
            "Insect Waypoint Observation"
        ],
        "objective_template": "Observe flying visitors and branch movements for {dur} minutes to decipher natural communication patterns.",
        "steps": [
            QuestStep(step_number=1, instruction="Settle into a stationary spot with an unobstructed view of overhead branches, wires, or rooftops in your {env}.", detail="Stay as still as possible for the first 3 minutes so surrounding wildlife returns to normal activity."),
            QuestStep(step_number=2, instruction="Scan the upper periphery without staring directly into the sun.", detail="Look for sudden darting flights, perching silhouettes, or foraging hops."),
            QuestStep(step_number=3, instruction="Note the rhythm of wind moving through different trees or structures.", detail="Notice how conifers sway differently from broadleaf trees or grasses."),
            QuestStep(step_number=4, instruction="Follow the path of a pollinator, bird, or windblown spore for 30 consecutive seconds.", detail="Observe its trajectory and resting points.")
        ],
        "checklist": [
            "Maintained stationary observation for at least 5 minutes",
            "Identified two different perching or resting locations used by wildlife",
            "Noticed how varying plant species respond differently to wind gusts",
            "Heard or spotted at least one feathered or buzzing traveler"
        ],
        "bonus_challenge": "Distinguish between an alarm/territory call and regular chirping or ambient rustle.",
        "safe_alternative": "Observe sky movement, cloud speed, and bird flight paths through an outdoor-facing window while seated comfortably.",
        "reflection_question": "What patterns emerged once you remained still long enough for the space to settle?",
        "safety_notes": [
            "Never approach, corner, or feed wild animals or birds.",
            "Do not disturb nests, burrows, or hollowed logs."
        ]
    },
    {
        "category": "gardening",
        "title_templates": [
            "Micro-Soil & Drainage Inspection",
            "Balcony & Pocket Pot Care Audit",
            "Seed Pod & Spore Dispersal Scout",
            "Companion Growth Observation"
        ],
        "objective_template": "Inspect soil conditions, moisture retention, and companion plant neighbors across your immediate {env}.",
        "steps": [
            QuestStep(step_number=1, instruction="Examine exposed soil or container planter beds in your {env}.", detail="Observe surface dampness, mulch cover, and compaction without disturbing root balls."),
            QuestStep(step_number=2, instruction="Gently feel soil temperature with the back of a clean knuckle.", detail="Is it cool and sheltered, or dry and baked by midday exposure?"),
            QuestStep(step_number=3, instruction="Inspect leaf nodes for new shoots, spent blossoms, or dried seed heads ready to drop.", detail="Note how seeds are shielded by husks or capsules."),
            QuestStep(step_number=4, instruction="Identify one spot that receives optimal morning light versus afternoon shade.", detail="Consider how varying light angles support different plant varieties.")
        ],
        "checklist": [
            "Checked soil moisture and surface texture",
            "Found one seed pod, budding node, or unfurling new shoot",
            "Identified areas of full sun vs sheltering shade",
            "Noticed organic companion species growing in close proximity"
        ],
        "bonus_challenge": "Identify a simple way this space could catch rainfall or support pollinator hydration safely.",
        "safe_alternative": "Inspect indoor potted plants or kitchen herbs: check soil dryness, wipe dust from two large leaves, and inspect for new node growth.",
        "reflection_question": "How do small variations in sun and shelter affect plant vitality in this micro-zone?",
        "safety_notes": [
            "Wash hands thoroughly after touching garden soil.",
            "Avoid contact with synthetic chemical sprays or sharp gardening shears without protection."
        ]
    },
    {
        "category": "community contribution",
        "title_templates": [
            "Neighborhood Accessibility Audit",
            "Green Infrastructure Reconnaissance",
            "Quiet Haven Public Space Catalog",
            "Caretaker's Survey"
        ],
        "objective_template": "Survey your local {env} to identify public amenities, curb ramps, tree health, and spaces needing communal stewardship.",
        "steps": [
            QuestStep(step_number=1, instruction="Walk a safe loop through your {env} with an eye for accessibility and public hospitality.", detail="Check sidewalk width, dropped curb ramps, and crosswalk visibility."),
            QuestStep(step_number=2, instruction="Take note of public greenery: are street trees well-mulched, or are tree pits compacted?", detail="Notice if rainwater drains safely or pools along the path."),
            QuestStep(step_number=3, instruction="Identify public benches or resting spaces.", detail="Is there equitable shade for elders, strollers, and resting neighbors during midday heat?"),
            QuestStep(step_number=4, instruction="Locate one area that could benefit from clean-up or community gardening attention.", detail="Never touch biohazards, broken glass, or hazardous items.")
        ],
        "checklist": [
            "Checked step-free navigability of at least one public pathway",
            "Located at least one bench or designated rest area",
            "Noticed condition of street trees or public planter boxes",
            "Identified one civic opportunity to improve accessibility or green cover"
        ],
        "bonus_challenge": "Note where the nearest public water source, trash bin, or community notice board is located.",
        "safe_alternative": "Review your block via personal memory or window view and outline two positive physical additions that would benefit local neighbors.",
        "reflection_question": "What public design element made this environment feel either welcoming or exclusionary to pedestrians?",
        "safety_notes": [
            "Never collect or touch broken glass, sharp metals, or biohazardous waste.",
            "Respect private property boundaries and municipal utility easements."
        ]
    }
]

def generate_fallback_quest(config: QuestConfig) -> Quest:
    """Deterministically synthesizes an authentic, tailored Quest for any combination of inputs."""
    # Match category based on preferences
    chosen_cat = "nature observation"
    for pref in config.activity_preferences:
        p_lower = pref.lower()
        for arch in ARCHETYPES:
            if arch["category"] in p_lower or p_lower in arch["category"]:
                chosen_cat = arch["category"]
                break

    # Find the archetype
    archetype = next((a for a in ARCHETYPES if a["category"] == chosen_cat), ARCHETYPES[0])

    # Hash config inputs to pick title and stable variant
    config_key = f"{config.duration_minutes}_{config.energy_level}_{config.environment}_{config.difficulty}_{config.social_mode}"
    seed = int(hashlib.md5(config_key.encode()).hexdigest()[:8], 16)
    
    env_name = config.environment.strip() if config.environment else "neighborhood"
    title_idx = seed % len(archetype["title_templates"])
    title = f"{archetype['title_templates'][title_idx]} ({env_name.capitalize()})"

    dur = config.duration_minutes
    objective = archetype["objective_template"].format(env=env_name, dur=dur)

    # Adapt steps according to time and energy
    steps: List[QuestStep] = []
    base_steps = archetype["steps"]
    
    # If duration is 10 mins, take 3 steps. If 30-60 mins, take 4-5 steps
    step_count = 3 if dur <= 10 else (4 if dur <= 30 else 5)
    
    for i in range(min(step_count, len(base_steps))):
        s = base_steps[i]
        inst = s.instruction.format(env=env_name, dur=dur)
        detail = s.detail.format(env=env_name, dur=dur) if s.detail else None
        
        # Adjust for accessibility if needed
        if config.accessibility_notes and "seat" in config.accessibility_notes.lower():
            if "walk" in inst.lower():
                inst = inst.replace("Walk", "Maintain a stationary seated vantage point and survey").replace("walk", "survey")
        
        steps.append(QuestStep(step_number=i + 1, instruction=inst, detail=detail))

    # Add a final reflection step if extended duration
    if len(steps) < step_count and dur >= 45:
        steps.append(QuestStep(
            step_number=len(steps) + 1,
            instruction="Take 5 minutes of quiet stillness before heading back to integrate your field impressions.",
            detail="Allow your heart rate and breath to synchronize with your immediate surroundings."
        ))

    # Energy-based reason
    energy_reasons = {
        "low": f"Designed for low energy expenditure ({dur} min), focusing on contemplative sensory perception rather than physical exertion.",
        "balanced": f"A balanced {dur}-minute expedition offering gentle physical movement paired with mindful observation.",
        "high": f"An active {dur}-minute exploration engaging both observational acuity and dynamic terrain investigation."
    }
    suitability = f"{energy_reasons.get(config.energy_level, energy_reasons['balanced'])} Optimized for {env_name} with {config.difficulty} difficulty."
    if config.accessibility_notes:
        suitability += f" Configured with user accessibility context: '{config.accessibility_notes}'."

    # Checklist
    checklist = list(archetype["checklist"])
    if dur <= 15:
        checklist = checklist[:3]

    # Required equipment
    equipment = [] if config.no_equipment_only else ["Small notebook or pencil (optional)"]

    # Safe alternative
    safe_alt = archetype["safe_alternative"]
    if config.accessibility_notes:
        safe_alt = f"Seated indoor alternative: {safe_alt}"

    return Quest(
        id=f"quest_det_{uuid.uuid4().hex[:8]}",
        title=title,
        objective=objective,
        suitability_reason=suitability,
        duration_minutes=dur,
        difficulty=config.difficulty,
        energy_level=config.energy_level,
        environment=env_name,
        required_equipment=equipment,
        steps=steps,
        checklist=checklist,
        bonus_challenge=archetype["bonus_challenge"],
        safe_alternative=safe_alt,
        completion_criteria=f"Complete at least {max(1, len(checklist) - 1)} items from the field checklist during your {dur}-minute outing.",
        reflection_question=archetype["reflection_question"],
        safety_notes=archetype["safety_notes"],
        provenance=f"offline_library:{archetype['category'].replace(' ', '_')}",
        created_at=datetime.now(timezone.utc).isoformat()
    )
