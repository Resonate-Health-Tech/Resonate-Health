"""
OpenAI API service for AI operations.
"""
import json
import re
import openai
from openai import AsyncOpenAI
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
import logging

from app.core.config import settings
from app.core.logger import logger, log_ai_call, log_error


# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Per-call timeout: 10s to connect, 90s to receive response.
# Prevents a stalled OpenAI stream from hanging a uvicorn worker forever.
# The tenacity retry decorator will fire a new attempt if the timeout raises.
OPENAI_TIMEOUT = openai.Timeout(90.0, connect=10.0)  # 90s default (read/write), 10s to connect

# Tenacity retry policy: 3 total attempts, exponential backoff 2s→10s
# Only retries transient errors: rate limits and connection failures
_openai_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((openai.RateLimitError, openai.APIConnectionError)),
    before_sleep=before_sleep_log(logging.getLogger(__name__), logging.WARNING),
    reraise=True,
)


@_openai_retry
async def call_vision_api(
    prompt: str,
    image_content: list[dict],
    temperature: float = 0.0
) -> dict:
    """
    Call OpenAI Vision API with images.

    Retries automatically on RateLimitError / APIConnectionError
    (up to 3 attempts with exponential backoff).

    Args:
        prompt: Text prompt for the model
        image_content: List of image content dicts
        temperature: Model temperature

    Returns:
        Parsed JSON response

    Raises:
        ValueError: If response is not valid JSON
        openai.RateLimitError: If all retries exhausted
    """
    log_ai_call("Vision API", settings.OPENAI_MODEL)

    messages = [{
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            *image_content
        ]
    }]

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"},
        timeout=OPENAI_TIMEOUT,  # Hard cap: stalled responses won't hang the worker
    )

    try:
        result = json.loads(response.choices[0].message.content)
        logger.info("Vision API call successful")
        return result
    except json.JSONDecodeError as e:
        log_error("Vision API JSON parsing", e)
        raise ValueError("AI did not return valid JSON")


@_openai_retry
async def call_chat_api(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7
) -> dict:
    """
    Call OpenAI Chat API for text generation.

    Retries automatically on RateLimitError / APIConnectionError
    (up to 3 attempts with exponential backoff).

    Args:
        system_prompt: System context
        user_prompt: User request
        temperature: Model temperature

    Returns:
        Parsed JSON response

    Raises:
        ValueError: If response is not valid JSON
        openai.RateLimitError: If all retries exhausted
    """
    log_ai_call("Chat API", settings.OPENAI_MODEL)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"},
        timeout=OPENAI_TIMEOUT,  # Hard cap: stalled responses won't hang the worker
    )

    try:
        result = json.loads(response.choices[0].message.content)
        logger.info("Chat API call successful")
        return result
    except json.JSONDecodeError as e:
        log_error("Chat API JSON parsing", e)
        raise ValueError("AI did not return valid JSON")


def sanitize_key(name: str) -> str:
    """
    Convert biomarker name to valid JSON key.
    
    Args:
        name: Biomarker display name
        
    Returns:
        camelCase key string
    """
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', name.lower())
    words = cleaned.split()
    if not words:
        return "biomarker"
    return words[0] + ''.join(w.capitalize() for w in words[1:])


# --- Blood Report Classification ---

CLASSIFICATION_PROMPT = """
You are a medical document classifier.

Based ONLY on the document content,
determine whether this is a BLOOD TEST REPORT.

Return JSON only:
{
  "isBloodReport": true | false,
  "confidence": "low" | "medium" | "high",
  "reason": "short explanation"
}
"""


async def classify_blood_report(image_content: list[dict]) -> dict:
    """
    Classify if document is a blood report.
    
    Args:
        image_content: Document page images
        
    Returns:
        Classification result with confidence
    """
    return await call_vision_api(
        CLASSIFICATION_PROMPT,
        image_content,
        temperature=settings.TEMPERATURE_EXTRACTION
    )


async def extract_biomarkers(image_content: list[dict], biomarkers: list[str]) -> dict:
    """
    Extract biomarker values from blood report images.
    
    Args:
        image_content: Report page images
        biomarkers: List of biomarker names to extract
        
    Returns:
        Dict mapping biomarker names to values
    """
    biomarker_list = "\n".join([f"- {bm}" for bm in biomarkers])
    json_schema = {sanitize_key(bm): None for bm in biomarkers}

    prompt = f"""
Extract ONLY these biomarkers from the blood report:

{biomarker_list}

STRICT RULES:
- Extract the EXACT numeric value ONLY if explicitly written.
- If missing or unclear, return null.
- Do NOT infer or calculate.
- Do NOT apply medical knowledge.
- Match biomarker names flexibly.

Return JSON ONLY matching this schema:
{json.dumps(json_schema, indent=2)}
"""

    return await call_vision_api(
        prompt,
        image_content,
        temperature=settings.TEMPERATURE_EXTRACTION
    )


# --- Workout Generation ---

WORKOUT_SYSTEM_PROMPT = """
You are an expert elite fitness coach. Create a highly personalized, semi-structured workout plan.

Output JSON ONLY with this structure:
{
  "title": "Creative Workout Name",
  "duration": "X Minutes",
  "focus": "Target Area or Goal",
  "warmup": [{"name": "Exercise", "duration": "Time/Reps"}],
  "exercises": [{"name": "Exercise", "sets": Number, "reps": "Range or Time", "notes": "Optional tip"}],
  "cooldown": [{"name": "Exercise", "duration": "Time"}]
}

RULES:
1. STRICTLY respect injuries. Do NOT include exercises that aggravate listed injuries.
2. Adapt volume/intensity based on Age and Cycle Phase (e.g., Luteal = lower intensity/steady state; Follicular = HIIT/Strength).
3. Use ONLY available equipment.
4. FACTOR IN MOTIVATION: 
   - Low Motivation: Focus on "easy wins", shorter sets, fun exercises, lower barrier to entry.
   - High Motivation: Push limits, high intensity, complex movements.
5. FACTOR IN TIMING:
   - Morning: Energizing, mobility-focused.
   - Evening: De-stressing, avoid over-stimulation if late, focus on recovery/strength.
6. ADDRESS BARRIERS:
   - Time constraints: Supersets, minimal rest.
   - Boredom: High variety, novel exercises.
   - Low Energy: Start slow, build momentum.
"""


async def generate_workout(
    level: str,
    equipment: list[str],
    time: int,
    injuries: list[str],
    motivation: str = None,
    timing: str = None,
    barriers: list[str] = None,
    age: int = None,
    gender: str = None,
    weight: float = None,
    cycle_phase: str = None
) -> dict:
    """
    Generate personalized workout plan.
    
    Returns:
        Workout plan dict
    """
    profile_desc = f"Fitness Level: {level}\nTime Available: {time} minutes\n"
    
    if equipment:
        profile_desc += f"Equipment: {', '.join(equipment)}\n"
    else:
        profile_desc += "Equipment: None (Bodyweight only)\n"
        
    if injuries:
        profile_desc += f"Injuries/Limitations: {', '.join(injuries)}\n"
        
    if motivation:
        profile_desc += f"Motivation Level: {motivation}\n"
    if timing:
        profile_desc += f"Preferred Workout Time: {timing}\n"
    if barriers:
        profile_desc += f"Barriers/Challenges: {', '.join(barriers)}\n"
    if age:
        profile_desc += f"Age: {age}\n"
    if gender:
        profile_desc += f"Gender: {gender}\n"
    if weight:
        profile_desc += f"Weight: {weight}kg\n"
    if cycle_phase and gender and gender.lower() == 'female':
        profile_desc += f"Menstrual Cycle Phase: {cycle_phase}\n"

    user_prompt = f"Create a workout for this user:\n{profile_desc}"
    
    return await call_chat_api(
        WORKOUT_SYSTEM_PROMPT,
        user_prompt,
        temperature=settings.TEMPERATURE_CREATIVE
    )


# --- Nutrition Generation ---

async def generate_meal_plan(
    age: int = None,
    gender: str = None,
    weight: float = None,
    height: float = None,
    goals: str = None,
    diet_type: str = None,
    allergies: list[str] = None,
    cuisine: str = "Indian"
) -> dict:
    """
    Generate daily meal plan.
    
    Returns:
        Meal plan dict
    """
    allergies_str = ", ".join(allergies) if allergies else "None"
    
    prompt = f"""
You are an expert nutritionist specializing in {cuisine} cuisine.
Create a daily meal plan for a user with the following profile:

- Age: {age}
- Gender: {gender}
- Weight: {weight}kg
- Height: {height}cm
- Goals: {goals}
- Diet Type: {diet_type}
- Allergies/Restrictions: {allergies_str}

Provide a structured meal plan with:
1. Breakfast
2. Lunch
3. Dinner
4. Snacks (2 options)

Focus on healthy, nutritious {cuisine} meals that align with the user's goals.
Include approximate calories and protein for each meal.

Return JSON ONLY with this structure:
{{
  "breakfast": {{ "name": "...", "description": "...", "calories": 0, "protein": "0g" }},
  "lunch": {{ "name": "...", "description": "...", "calories": 0, "protein": "0g" }},
  "dinner": {{ "name": "...", "description": "...", "calories": 0, "protein": "0g" }},
  "snacks": [
    {{ "name": "...", "description": "...", "calories": 0, "protein": "0g" }}
  ],
  "total_calories": 0,
  "total_protein": "0g"
}}
"""

    return await call_chat_api(
        "You are a helpful nutrition assistant that outputs strictly valid JSON.",
        prompt,
        temperature=settings.TEMPERATURE_CREATIVE
    )


# --- Food Analysis ---

async def analyze_food_image(image_base64: str, cuisine: str = "General") -> dict:
    """
    Analyze food image for nutritional content.
    
    Args:
        image_base64: Base64 encoded image
        cuisine: Cuisine context hint
        
    Returns:
        Food analysis dict
    """
    prompt = f"""
You are an expert nutritionist and food analyst. 
Analyze the food in this image. The user specified the cuisine/context as: {cuisine}.

Identify the food items, estimate portion sizes, and calculate nutritional values.

Return JSON ONLY with this structure:
{{
  "food_name": "Name of the dish/food",
  "description": "Brief description",
  "ingredients": ["List of likely ingredients"],
  "nutritional_info": {{
      "calories": 0,
      "protein": "0g",
      "carbohydrates": "0g",
      "fats": "0g",
      "fiber": "0g"
  }},
  "health_rating": "A score from 1-10 (10 being very healthy)",
  "suggestions": "Suggestions to make it healthier or what to pair it with"
}}
"""

    image_content = [{
        "type": "image_url",
        "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
    }]

    return await call_vision_api(
        prompt,
        image_content,
        temperature=settings.TEMPERATURE_ANALYSIS
    )


# --- Intervention Suggestion ---

INTERVENTION_SYSTEM_PROMPT = """
You are an expert health coach AI that analyzes a user's health data and suggests personalized lifestyle interventions.

Based on the memory context provided (key facts, recent events, active interventions, trends), suggest 3–5 actionable interventions.

Return JSON ONLY with this structure:
{
  "suggestions": [
    {
      "title": "Short intervention title",
      "description": "What to do and why (2-3 sentences)",
      "type": "nutrition | fitness | recovery | lifestyle | supplementation",
      "duration": "Duration in days (e.g. 14)",
      "priority": "high | medium | low",
      "rationale": "Evidence-based reason drawn from the user's data"
    }
  ]
}

RULES:
1. Only suggest interventions supported by the data. Do NOT hallucinate conditions.
2. Avoid duplicating any active interventions already listed.
3. Be specific and actionable — not vague advice like "exercise more".
4. Prioritize by urgency relative to the data.
5. Return valid JSON only. No markdown, no explanation outside the JSON.
"""


async def generate_interventions(memory_context: dict, gender: str = None, age: int = None) -> dict:
    """
    Suggest personalized health interventions based on user memory context.

    Args:
        memory_context: Structured context from MemoryContextBuilder
        gender: User's gender (optional)
        age: User's age (optional)

    Returns:
        Dict with 'suggestions' list
    """
    profile_lines = []
    if gender:
        profile_lines.append(f"Gender: {gender}")
    if age:
        profile_lines.append(f"Age: {age}")

    profile_section = "\n".join(profile_lines) if profile_lines else "Not provided"

    key_facts = "\n".join([f"- {f}" for f in memory_context.get("key_facts", [])])
    recent_events = "\n".join([f"- {e}" for e in memory_context.get("recent_events", [])])
    active = "\n".join([f"- {i}" for i in memory_context.get("active_interventions", [])])

    user_prompt = f"""User Profile:
{profile_section}

Key Health Facts:
{key_facts or "None available"}

Recent Events:
{recent_events or "None available"}

Active Interventions (do NOT suggest these again):
{active or "None"}

Suggest the most impactful health interventions for this user based on the above data."""

    return await call_chat_api(
        INTERVENTION_SYSTEM_PROMPT,
        user_prompt,
        temperature=settings.TEMPERATURE_CREATIVE
    )


# --- Insights Generation ---

INSIGHTS_SYSTEM_PROMPT = """
You are an expert health coach AI. Analyze the user's health data and generate personalised, actionable health insights.

Based on the memory context provided (numeric trends, recent events, key facts), generate 3–5 insights.

Return JSON ONLY with this exact structure:
{
  "insights": [
    {
      "type": "critical | warning | action | suggestion | positive",
      "title": "Short, punchy insight title (5 words max)",
      "description": "2-3 sentence personalised explanation using the user's actual data points (e.g. their specific scores). Tell them what is happening and why it matters.",
      "evidence": ["List of specific data points from the context that support this insight"],
      "suggested_intervention": "short_snake_case_action_key"
    }
  ]
}

STRICT RULES:
1. ONLY surface insights that are directly supported by data in the context. Do NOT hallucinate conditions.
2. If a field in trends is null or missing, do NOT mention it or invent a value.
3. Use the user's actual numeric values in the description (e.g. "Your energy is 4/10" not "Your energy is low").
4. Prioritise by urgency: critical burnout signals first, then warnings, then suggestions, then positives.
5. If the user has no logged data (all trends are empty), return exactly 1 insight of type "suggestion" prompting them to start logging daily check-ins.
6. Return valid JSON only. No markdown, no text outside the JSON object.
7. Maximum 5 insights, minimum 1.
"""


async def generate_insights(memory_context: dict, gender: str = None, age: int = None) -> dict:
    """
    Generate personalised health insights based on user memory context.

    Args:
        memory_context: Structured context from MemoryContextBuilder (trends, recent_events, key_facts)
        gender: User's gender (optional, for personalisation)
        age: User's age (optional, for personalisation)

    Returns:
        Dict with 'insights' list — each insight has type, title, description, evidence, suggested_intervention
    """
    profile_lines = []
    if gender:
        profile_lines.append(f"Gender: {gender}")
    if age:
        profile_lines.append(f"Age: {age}")

    profile_section = "\n".join(profile_lines) if profile_lines else "Not provided"

    # Format numeric trends clearly for the AI
    trends = memory_context.get("trends", {})
    trend_lines = []
    for key, value in trends.items():
        if value is not None:
            trend_lines.append(f"- {key}: {value}")
    trends_section = "\n".join(trend_lines) if trend_lines else "No numeric trend data available"

    key_facts = "\n".join([f"- {f}" for f in memory_context.get("key_facts", [])])
    recent_events = "\n".join([f"- {e}" for e in memory_context.get("recent_events", [])])
    active = "\n".join([f"- {i}" for i in memory_context.get("active_interventions", [])])

    user_prompt = f"""User Profile:
{profile_section}

Numeric Health Trends (these are averages from recent logs):
{trends_section}

Key Health Facts:
{key_facts or "None available"}

Recent Memory Events (last 7-14 days):
{recent_events or "None available"}

Active Interventions (already in progress — do not re-suggest):
{active or "None"}

Generate personalised health insights for this user based on the above data."""

    return await call_chat_api(
        INSIGHTS_SYSTEM_PROMPT,
        user_prompt,
        temperature=settings.TEMPERATURE_ANALYSIS
    )


# --- Dashboard Health Analysis ---

DASHBOARD_ANALYSIS_PROMPT = """
You are an expert health data scientist. Analyse the user's health data and return a comprehensive dashboard analysis.

Return JSON ONLY with this exact structure:
{
  "healthScore": 0,
  "healthScoreBreakdown": "2-3 sentence explanation of the score using the user's actual data values",
  "recoveryStatus": "Optimal | Good | Moderate | Low | Critical",
  "recoveryNarrative": "1-2 sentences on recovery quality using specific data",
  "trainingBalance": {
    "aerobic": 0,
    "anaerobic": 0,
    "rest": 10,
    "classification_notes": "brief note on how workouts were classified"
  },
  "weeklyNarrative": "3-4 sentence personalised weekly summary covering the most important trends from the data"
}

RULES FOR healthScore (0-100):
- Biomarkers in normal range → positive, flagged/abnormal → negative impact
- Energy levels (0-10 scale): avg >= 7 good, <= 4 poor
- Stress levels (0-10): avg <= 4 good, >= 7 poor
- Sleep quality + duration both contribute
- Nutrition adherence adds up to +10 points
- Be realistic. 60-75 is a healthy active person. Only give 90+ for outstanding data.

RULES FOR trainingBalance:
- Look at workout titles, focus areas, RPE, and duration — NOT motivationLevel
- Aerobic: cardio, running, cycling, low-RPE (< 6), endurance focus
- Anaerobic: strength, HIIT, heavy lifting, high-RPE (>= 7), power focus
- Rest: active recovery, stretching, yoga, mobility, or any rest days
- Percentages must sum to 100

RULES FOR weeklyNarrative:
- Use actual numbers from the data (don't say "low energy" — say "energy averaged 4/10")
- Highlight the most important trend (positive or negative)
- Be direct and actionable

Return valid JSON only. No markdown. No text outside the JSON.
"""


async def analyze_dashboard(
    biomarkers: dict,
    sleep_history: list,
    recent_workouts: list,
    daily_logs: list,
    nutrition_summary: dict,
    gender: str = None,
    age: int = None
) -> dict:
    """
    Generate AI-powered dashboard health analysis.

    Replaces the manual formula: healthScore = biomarkers * 0.7 + sleep * 0.3
    Also replaces motivationLevel-based training balance and hardcoded recovery thresholds.

    Returns healthScore, healthScoreBreakdown, recoveryStatus, recoveryNarrative,
    trainingBalance (aerobic/anaerobic/rest %) and weeklyNarrative.
    """
    profile_lines = []
    if gender:
        profile_lines.append(f"Gender: {gender}")
    if age:
        profile_lines.append(f"Age: {age}")
    profile_section = "\n".join(profile_lines) if profile_lines else "Not provided"

    # Summarise biomarkers
    if biomarkers:
        normal = [k for k, v in biomarkers.items() if isinstance(v, dict) and v.get("status") == "normal"]
        flagged = [k for k, v in biomarkers.items() if isinstance(v, dict) and v.get("status") in ("high", "low")]
        critical = [k for k, v in biomarkers.items() if isinstance(v, dict) and v.get("status") == "critical"]
        bio_section = f"Biomarkers: {len(normal)} normal, {len(flagged)} flagged (high/low), {len(critical)} critical\n"
        if flagged:
            bio_section += f"  Flagged markers: {', '.join(flagged[:5])}\n"
        if critical:
            bio_section += f"  Critical markers: {', '.join(critical[:5])}\n"
    else:
        bio_section = "Biomarkers: No blood test data available\n"

    # Summarise sleep
    if sleep_history:
        sleep_vals = [d.get("sleepHours", 0) for d in sleep_history if d.get("sleepHours")]
        avg_sleep = round(sum(sleep_vals) / len(sleep_vals), 1) if sleep_vals else 0
        sleep_section = f"Sleep: avg {avg_sleep}h/night over last {len(sleep_history)} days\n"
    else:
        sleep_section = "Sleep: No sleep data\n"

    # Summarise workouts
    if recent_workouts:
        titles = [w.get("title") or w.get("focus") or "Unknown" for w in recent_workouts[:10]]
        rpes = [w.get("rpe") for w in recent_workouts if w.get("rpe")]
        avg_rpe = round(sum(rpes) / len(rpes), 1) if rpes else None
        workout_section = f"Workouts (last 7 days): {len(recent_workouts)} sessions\n"
        workout_section += f"  Workout titles/focus: {', '.join(titles[:8])}\n"
        if avg_rpe:
            workout_section += f"  Average RPE: {avg_rpe}/10\n"
    else:
        workout_section = "Workouts: No workout data\n"

    # Summarise daily logs
    if daily_logs:
        energies = [d.get("energyLevel") for d in daily_logs if d.get("energyLevel") is not None]
        stresses = [d.get("stressLevel") for d in daily_logs if d.get("stressLevel") is not None]
        sleepqs = [d.get("sleepQuality") for d in daily_logs if d.get("sleepQuality") is not None]
        avg_energy = round(sum(energies) / len(energies), 1) if energies else None
        avg_stress = round(sum(stresses) / len(stresses), 1) if stresses else None
        avg_sleepq = round(sum(sleepqs) / len(sleepqs), 1) if sleepqs else None
        log_section = f"Daily Logs ({len(daily_logs)} entries):\n"
        if avg_energy is not None:
            log_section += f"  Avg energy: {avg_energy}/10\n"
        if avg_stress is not None:
            log_section += f"  Avg stress: {avg_stress}/10\n"
        if avg_sleepq is not None:
            log_section += f"  Avg sleep quality: {avg_sleepq}/10\n"
    else:
        log_section = "Daily Logs: No check-in data\n"

    # Summarise nutrition
    if nutrition_summary:
        nut_section = f"Nutrition: {nutrition_summary.get('avgDailyCalories', 'N/A')} kcal/day, "
        nut_section += f"{nutrition_summary.get('avgDailyProteinG', 'N/A')}g protein/day, "
        nut_section += f"{nutrition_summary.get('trackingAdherencePct', 'N/A')}% tracking adherence\n"
    else:
        nut_section = "Nutrition: No food log data\n"

    user_prompt = f"""User Profile:
{profile_section}

Health Data Summary:
{bio_section}{sleep_section}{workout_section}{log_section}{nut_section}
Analyse all of this data and return the dashboard health analysis JSON."""

    return await call_chat_api(
        DASHBOARD_ANALYSIS_PROMPT,
        user_prompt,
        temperature=settings.TEMPERATURE_ANALYSIS
    )


# --- Intervention Effectiveness Analysis ---

INTERVENTION_ANALYSIS_PROMPT = """
You are an expert health coach analysing the effectiveness of a health intervention.

Based on the intervention details and outcome history provided, return a JSON analysis.

Return JSON ONLY with this exact structure:
{
  "effective": true | false,
  "effectivenessScore": 0,
  "summary": "2-3 sentence verdict: did it work, what changed, what does the trend show",
  "trend": "improving | stable | declining | insufficient_data",
  "recommendation": "1-2 sentences on what to do next: continue, modify, stop, or escalate"
}

RULES:
- effectivenessScore: 0-100. 0 = complete failure, 50 = partial, 100 = fully achieved goal
- If targetValue is provided, compare actual outcome values to it
- If no targetValue, judge directional improvement from the outcome notes/values
- If fewer than 2 outcomes exist, set trend to "insufficient_data" and effectivenessScore to null
- effective = true only if effectivenessScore >= 60
- Return valid JSON only. No markdown.
"""


async def analyze_intervention(
    intervention_type: str,
    recommendation: str,
    rationale: str = None,
    target_metric: str = None,
    target_value: float = None,
    duration_days: int = None,
    start_date: str = None,
    outcomes: list = None,
    status: str = "active"
) -> dict:
    """
    AI analysis of whether a health intervention worked.

    Replaces the stub analyzeEffectiveness() that returned raw numbers
    with no interpretation. Now returns effective (bool), score, trend, and narrative.
    """
    outcomes = outcomes or []

    outcome_lines = []
    for i, o in enumerate(outcomes):
        date = o.get("date", f"Entry {i+1}")
        value = o.get("metricValue", "N/A")
        notes = o.get("notes", "")
        outcome_lines.append(f"  - {date}: value={value}{', notes: ' + notes if notes else ''}")

    outcomes_section = "\n".join(outcome_lines) if outcome_lines else "  No outcomes recorded yet."

    user_prompt = f"""Intervention Type: {intervention_type}
Recommendation: {recommendation}
Rationale: {rationale or 'Not specified'}
Target Metric: {target_metric or 'Not specified'}
Target Value: {target_value if target_value is not None else 'Not specified'}
Duration: {duration_days or 'Not specified'} days
Start Date: {start_date or 'Not specified'}
Current Status: {status}

Outcome History:
{outcomes_section}

Analyse whether this intervention was effective and return the JSON analysis."""

    return await call_chat_api(
        INTERVENTION_ANALYSIS_PROMPT,
        user_prompt,
        temperature=settings.TEMPERATURE_ANALYSIS
    )
