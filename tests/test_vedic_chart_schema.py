import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parents[1] / "vedic-python-api"))

from vedic_chart_schema import PLANET_ORDER, SIGNS, build_chart_json  # noqa: E402


class VedicChartSchemaTests(unittest.TestCase):
    def setUp(self):
        planet_signs = {
            "Sun": 0, "Moon": 3, "Mars": 9, "Mercury": 0, "Jupiter": 6,
            "Venus": 11, "Saturn": 6, "Rahu": 1, "Ketu": 7,
        }
        lagna_idx = 0
        planets = {}
        for index, name in enumerate(PLANET_ORDER):
            sign_idx = planet_signs[name]
            longitude = sign_idx * 30 + index + 1
            planets[name] = {
                "longitude": longitude,
                "sign": SIGNS[sign_idx],
                "sign_idx": sign_idx,
                "degree": index + 1,
                "deg_str": f"{index + 1}°00'",
                "retrograde": name in {"Rahu", "Ketu"},
                "house": ((sign_idx - lagna_idx) % 12) + 1,
                "nakshatra": {"name": f"Nak-{name}", "pada": 1, "lord": "Sun"},
            }
        d9 = {
            "Lagna": {"sign": "Taurus", "sign_idx": 1, "degree": 3.2},
            **{
                name: {"sign": SIGNS[(index + 1) % 12], "sign_idx": (index + 1) % 12, "degree": index + 0.5}
                for index, name in enumerate(PLANET_ORDER)
            },
        }
        self.chart = {
            "lagna": {
                "longitude": 5.0, "sign": "Aries", "sign_idx": 0, "degree": 5.0,
                "deg_str": "5°00'", "nakshatra": {"name": "Ashwini", "pada": 2, "lord": "Ketu"},
            },
            "planets": planets,
            "dignity": {name: {"basic": "own_sign" if name in {"Mars", "Jupiter"} else "neutral"} for name in PLANET_ORDER[:7]},
            "combustion": {"Mercury": {"distance": 3.0}},
            "dashas": [{
                "planet": "Jupiter", "start": "2020-01", "end": "2036-01", "years": 16,
                "is_current": True,
                "antardashas": [{"planet": "Saturn", "start": "2025-01-01", "end": "2027-07-01", "is_current": True}],
            }],
            "divisional_charts": {"D9": d9},
            "shadbala": {"Sun": {"total_rupas": 6.1}},
        }
        self.meta = {
            "engine": "vedic-calculator", "upstreamVersion": "v7.0", "commit": "7a6e33e",
            "lat": 0.0, "lon": 0.0, "timezone": "UTC",
            "ayanamsaMode": "TRUE_CITRA / Lahiri", "nodeMode": "Mean Node",
            "calculatedAt": "2026-07-31T00:00:00Z", "validation": {"savValid": True}, "warnings": [],
        }

    def test_contract_contains_all_required_sections(self):
        result = build_chart_json(
            self.chart,
            {"birthDate": "SYNTHETIC_DATE", "birthTime": "SYNTHETIC_TIME", "birthCity": "Synthetic Test Location"},
            self.meta,
        )
        self.assertEqual(
            set(result),
            {"birth", "lagna", "planets", "houses", "nakshatra", "dasha", "navamsa", "yogas", "aspects", "shadbala"},
        )
        self.assertEqual(len(result["planets"]), 9)
        self.assertEqual(len(result["houses"]), 12)
        self.assertEqual(len(result["navamsa"]["planetPositions"]), 9)
        self.assertEqual(result["dasha"]["currentMahadasha"]["planet"], "Jupiter")
        self.assertEqual(result["dasha"]["currentAntardasha"]["planet"], "Saturn")

    def test_yoga_and_parashari_aspects_are_derived_from_chart(self):
        result = build_chart_json(self.chart, {}, self.meta)
        yoga_names = {item["name"] for item in result["yogas"]}
        self.assertIn("Budha-Aditya Yoga", yoga_names)
        mars_aspects = {item["aspect"] for item in result["aspects"] if item["planet"] == "Mars"}
        self.assertEqual(mars_aspects, {4, 7, 8})
        self.assertTrue(all(item["system"].startswith("Parashari") for item in result["aspects"]))


if __name__ == "__main__":
    unittest.main()
