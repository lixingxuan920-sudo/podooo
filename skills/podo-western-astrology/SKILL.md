---
name: podo-western-astrology
description: Calculate and interpret Western astrology charts for Podo's “星盘” section using the tropical zodiac, Swiss Ephemeris, and supported Western house systems. Use for Western natal charts, transits, synastry, composite charts, and topic-based readings. Never use this skill for Podo's Indian/Vedic astrology section.
---

# Podo Western Astrology

Use this skill only for Podo's **“星盘”** section. Keep it completely
separate from the **“印占”** section and its Vedic calculation and
interpretation rules.

## Enforce the scope

- Require or attach the scope marker `western-chart`.
- Use the tropical zodiac.
- Use Swiss Ephemeris for astronomical positions.
- Default to Placidus houses unless the user or application explicitly
  selects Koch, Equal House, or Whole Sign.
- Reject data containing Vedic-only structures or requests to interpret
  Lahiri ayanamsa, Nakshatra, Vimshottari Dasha, divisional charts, or Yoga
  rules.
- Never import or call `vedic_skill_rules.py`, the Vedic Skill bridge, or
  Indian astrology prompts from this skill.

## Collect birth data

Obtain:

1. Birth date.
2. Local birth time.
3. Birth city or exact latitude and longitude.
4. Time zone or UTC offset at birth.

If the birth time is estimated, calculate with the supplied estimate but
state clearly that the Ascendant, Midheaven, houses, and house-dependent
interpretations are provisional. Do not present them as exact.

## Calculate before interpreting

Use `vedic-python-api/western_astrology.py` as the calculation layer. The
directory name reflects Podo's existing Python service layout; the file
itself is Western-only.

Calculate and preserve:

- planetary and angle longitudes;
- zodiac signs, degrees, retrograde status, and house placement;
- house cusps for the selected house system;
- major aspects and their orbs;
- chart type and calculation metadata.

Never invent a placement or aspect. If the calculation fails, report the
failure instead of estimating the chart from Sun signs.

## Interpret the chart

Ground every conclusion in named chart factors. Synthesize repeated themes,
tensions, and compensating factors instead of listing isolated keywords.
Preserve the user's agency and treat astrology as symbolic reflection rather
than scientific fact or deterministic prediction.

For a full natal reading, use this order:

1. Calculation settings and birth-data caveat.
2. Core placement table.
3. Overall personality.
4. Thinking and emotional patterns.
5. Relationships.
6. Career and public development.
7. Finances and resources.
8. Family and inner security.
9. Main talents.
10. Growth challenges.
11. Concise synthesis.

For a topic request such as career, relationships, or wealth, prioritize the
relevant houses, their rulers, planets in those houses, aspects to the
rulers, and supporting chart-wide patterns. Do not repeat the entire natal
reading unless requested.

## Use the Podo adapters

- `astrology-skill.js`: frontend chart rendering and reading adapter.
- `netlify/functions/western-chart.js`: proxy for `/western/calculate`.
- `netlify/functions/western-skill-rules.js`: Western interpretation rules.
- `netlify/functions/deepseek-astrology.js`: Western AI reading endpoint with
  strict scope validation.
- `WESTERN_ASTROLOGY_SKILL_SOURCE.md`: upstream source and license note.

When copying these files into Podo, preserve their project-relative paths and
retain the `western-chart` validation boundary.
