# Vedic Astro Skills integration

The Life Blueprint interpretation layer is adapted from:

- Repository: https://github.com/lixingxuan920-sudo/vedic-astro-skills
- Pinned commit: `7a6e33e23dc1f45107af2f249848241bb4d22b67`
- Upstream version: v7.0
- License: MIT
- License notice: `VEDIC_SKILL_LICENSE`
- Integrated modules: `vedic-calculator`, `vedic-reader`, `vedic-core`, `vedic-career`, `vedic-love`

The Python API vendors the pinned `vedic-calculator` implementation and uses its
PyJHora + pysweph pipeline as the canonical chart source. It calculates D1,
15 divisional charts, Vimshottari Mahadasha/Antardasha, Shadbala, SAV/BAV,
Chara Karakas, dignity, house lords, AL/UL and validation output. The other
upstream skills remain the interpretation policy for the resulting
`structured_data.md`. File-writing instructions from the agent-oriented skills
are adapted to one online Life Blueprint response.

The calculator reuses the repository's already-pinned Swiss Ephemeris assets.
The Moon ephemeris is reconstructed losslessly from the two checked-in source
parts during the Docker build, so the vendored Skill does not duplicate binary
ephemeris files.
