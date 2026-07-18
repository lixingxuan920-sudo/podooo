# Swiss Ephemeris backend source notice

The Vedic astrology backend uses `sweph` version `2.10.3-7` and bundled
Swiss Ephemeris data files to calculate sidereal planetary positions with
Lahiri Ayanamsa (`SIDM_LAHIRI`).

- Package: https://www.npmjs.com/package/sweph
- Upstream source: https://github.com/timotejroiko/sweph
- Swiss Ephemeris: https://www.astro.com/swisseph/
- Runtime module license: see `SWEPH_LICENSE`

The bundled data files are:

- `netlify/functions/ephe/sepl_18.se1`
- `netlify/functions/ephe/semo_18.se1`
- `netlify/functions/ephe/seas_18.se1`

Because GitHub's blob interface has a request-size limit, the Moon ephemeris
is stored losslessly as two source chunks under `ephemeris-source/` and joined
during the Netlify build by `scripts/prepare-ephemeris.js`. The joined file is
validated by byte length and SHA-256 before functions are bundled.

The application code that invokes Swiss Ephemeris is in
`netlify/functions/vedic-ephemeris.js`.
