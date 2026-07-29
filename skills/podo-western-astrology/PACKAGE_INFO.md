# Podo Western Astrology Skill

This package contains the Western astrology files from Podo PR #5, latest
isolation commit `a7958ad`.

## Scope

- Tropical, Sidereal (Fagan–Bradley or Lahiri), and Draconic zodiac modes
- Geocentric, heliocentric, and topocentric calculation modes
- Mean or true node basis for Draconic charts
- Optional no-light-time-correction research mode
- Swiss Ephemeris calculation
- Placidus, Koch, Equal House, and Whole Sign house systems
- Natal, transit, synastry, and composite charts
- Western interpretation rules adapted from `aryaminus/astro` under MIT
- Hard scope marker: `western-chart`

## Isolation boundary

This package is for Podo's “星盘” section only. It intentionally excludes:

- Vedic Skill rules
- Vedic interpretation rules triggered merely by selecting Lahiri ayanamsa
- Nakshatra
- Vimshottari Dasha
- D1/D9/D10 divisional charts
- Yoga rules

Do not import these files into the Indian astrology interpretation path.

## Files

- `SKILL.md`: required Skill entrypoint, workflow, and Western/Vedic isolation
  boundary
- `vedic-python-api/western_astrology.py`: Swiss Ephemeris calculation layer
- `netlify/functions/western-chart.js`: Netlify proxy for `/western/calculate`
- `netlify/functions/western-skill-rules.js`: Western interpretation rules
- `netlify/functions/deepseek-astrology.js`: Western AI interpretation endpoint
  with strict scope validation
- `astrology-skill.js`: Podo frontend chart rendering and reading adapter
- `WESTERN_ASTROLOGY_SKILL_SOURCE.md`: upstream source and license note

The files preserve their Podo project-relative locations so they can be
reviewed or copied back into the project directly.
