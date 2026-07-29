# Western Astrology Skill source

Podo's Western astrology interpretation layer is adapted from:

- Project: [aryaminus/astro](https://github.com/aryaminus/astro)
- Rules consulted: `skills/astrology/SKILL.md`,
  `skills/astrology/references/western.md`, and
  `skills/astrology/references/synastry-and-timing.md`
- License: MIT

Podo keeps its own Swiss Ephemeris calculation path for Tropical, Sidereal,
and Draconic positions; geocentric, heliocentric, and topocentric modes; and
Placidus plus other supported Western house systems. The upstream pure-Python
chart engine is not bundled or used for chart calculation.

The adapted interpretation layer preserves the upstream trust discipline:
calculate first, never invent placements, ground interpretations in specific
chart factors, synthesize tensions rather than listing keywords, and preserve
the user's agency.
