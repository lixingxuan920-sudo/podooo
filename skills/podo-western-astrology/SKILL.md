---
name: podo-western-astrology
description: Calculate and interpret Podo “星盘” Western astrology charts with Swiss Ephemeris, including Tropical, Sidereal, and Draconic zodiacs; geocentric, heliocentric, and topocentric modes; Western house systems; natal, transit, synastry, composite, and topic readings. Never use for Podo’s Indian/Vedic astrology section.
---

# Podo Western Astrology

Use this skill only for Podo's **“星盘”** section. Keep it completely
separate from the **“印占”** section and its Vedic calculation and
interpretation rules.

## Enforce the scope

- Require or attach the scope marker `western-chart`.
- Default to Tropical, geocentric, Placidus, mean node, non-topocentric
  positions, and light-time correction so existing Podo results do not change.
- Allow Sidereal only with an explicit ayanamsa (`fagan-bradley` or `lahiri`).
- Allow Draconic only with an explicit node basis (`mean` or `true`) and rotate
  every longitude, angle, and house cusp so that the selected north node is
  Aries 0°.
- Allow Heliocentric as a planet-and-aspect chart without Ascendant,
  Midheaven, houses, or house rulers. Reject heliocentric + topocentric and
  heliocentric + draconic combinations.
- Allow Topocentric only for geocentric charts and require coordinates plus
  observer altitude.
- Treat `lightTimeCorrection: false` as the Swiss Ephemeris true-position
  research option. Keep it enabled by default.
- Use Swiss Ephemeris for astronomical positions.
- Default to Placidus houses unless the user or application explicitly
  selects Koch, Equal House, or Whole Sign.
- Reject data containing Vedic-only structures or requests to interpret
  Nakshatra, Vimshottari Dasha, divisional charts, or Yoga rules. Lahiri is
  permitted only as the declared ayanamsa of a Western Sidereal chart and
  must never activate Vedic interpretation rules.
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
- zodiac, ayanamsa or node basis, observation center, topocentric altitude,
  light-time setting, and whether houses are available.

Never invent a placement or aspect. If the calculation fails, report the
failure instead of estimating the chart from Sun signs.

For Heliocentric output, replace the geocentric Sun with Earth and omit the
Moon, lunar nodes, Ascendant, Midheaven, houses, and house rulers. Do not
interpret missing angles or houses as zero-degree placements.

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
