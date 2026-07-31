from __future__ import annotations

import math
import sys
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

try:
    from timezonefinder import TimezoneFinder
except Exception:  # pragma: no cover - dependency is installed in production
    TimezoneFinder = None


SKILL_COMMIT = "7a6e33e23dc1f45107af2f249848241bb4d22b67"
SKILL_REPOSITORY = "https://github.com/lixingxuan920-sudo/vedic-astro-skills"
SKILL_ROOT = Path(__file__).parent / "vendor" / "vedic-calculator"
SKILL_SCRIPTS = SKILL_ROOT / "scripts"

if str(SKILL_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SKILL_SCRIPTS))

from engine import calculate_full_chart  # noqa: E402
from formatter import format_structured_data  # noqa: E402
from transit import calc_transit  # noqa: E402
from vedic_chart_schema import build_chart_json  # noqa: E402


SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]


def dms_to_decimal(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        pass

    import re

    match = re.match(
        r'^(\d+(?:\.\d+)?)([NSEW])\s*(?:(\d+(?:\.\d+)?)\')?\s*(?:(\d+(?:\.\d+)?)")?',
        text,
        re.I,
    )
    if not match:
        return None
    degree = float(match.group(1))
    direction = match.group(2).upper()
    minute = float(match.group(3) or 0)
    second = float(match.group(4) or 0)
    decimal = degree + minute / 60 + second / 3600
    return -decimal if direction in ("S", "W") else decimal


def timezone_to_iana(profile: dict[str, Any], lon: float | None) -> str:
    explicit = str(
        profile.get("timezoneIana")
        or profile.get("ianaTimezone")
        or profile.get("resolvedTimezone")
        or ""
    ).strip()
    if explicit:
        try:
            ZoneInfo(explicit)
            return explicit
        except Exception:
            pass

    lat = dms_to_decimal(profile.get("latitude"))
    if TimezoneFinder is not None and lat is not None and lon is not None:
        resolved = TimezoneFinder().timezone_at(lat=lat, lng=lon)
        if resolved:
            return resolved

    raise ValueError("无法根据出生坐标解析 IANA 时区，请补充明确的 IANA 时区。")


def parse_birth(
    profile: dict[str, Any],
) -> tuple[int, int, int, int, int, float, float, str, float]:
    birth_date = str(profile.get("birthDate") or "")
    birth_time = str(profile.get("birthTime") or "")
    if not birth_date or not birth_time:
        raise ValueError("出生日期和出生时间不能为空。")

    year, month, day = [int(item) for item in birth_date.split("-")]
    time_parts = birth_time.split(":")
    hour = int(float(time_parts[0]))
    minute = int(float(time_parts[1])) if len(time_parts) > 1 else 0
    second = (
        float(time_parts[2])
        if len(time_parts) > 2
        else float(profile.get("birthSecond") or 0)
    )
    lat = dms_to_decimal(profile.get("latitude"))
    lon = dms_to_decimal(profile.get("longitude"))
    if lat is None or lon is None:
        raise ValueError("必须提供有效的出生地经纬度。")
    timezone = timezone_to_iana(profile, lon)
    return year, month, day, hour, minute, lat, lon, timezone, second


def compact_professional_chart(chart: dict[str, Any]) -> dict[str, Any]:
    sav_total = sum(chart["sav"].get(sign, 0) for sign in SIGNS)
    rahu = float(chart["planets"]["Rahu"]["longitude"])
    ketu = float(chart["planets"]["Ketu"]["longitude"])
    node_distance = abs(rahu - ketu)
    if node_distance > 180:
        node_distance = 360 - node_distance

    return {
        "ayanamsa": chart["ayanamsa"],
        "lagna": chart["lagna"],
        "planets": chart["planets"],
        "sav": chart["sav"],
        "sav_by_house": chart["sav_by_house"],
        "shadbala": chart["shadbala"],
        "dashas": chart["dashas"],
        "d9": chart["d9"],
        "d10": chart["d10"],
        "d4": chart["d4"],
        "d5": chart["d5"],
        "divisional_charts": chart["divisional_charts"],
        "vargottama": chart["vargottama"],
        "dignity": chart["dignity"],
        "karakas": chart["karakas"],
        "aspects": chart["aspects"],
        "house_lords": chart["house_lords"],
        "special_points": chart["special_points"],
        "combustion": chart["combustion"],
        "moon_phase": chart["moon_phase"],
        "transits": chart["transits"],
        "bhava_bala": chart["bhava_bala"],
        "special_lagnas": chart["special_lagnas"],
        "vargeeya_bala": chart["vargeeya_bala"],
        "validation": {
            "savTotal": sav_total,
            "savValid": sav_total == 337,
            "planetCount": len(chart["planets"]) + 1,
            "planetCountValid": len(chart["planets"]) + 1 == 10,
            "rahuKetuDistance": round(node_distance, 8),
            "rahuKetuValid": abs(node_distance - 180) < 0.01,
            "ayanamsaMode": "TRUE_CITRA / Lahiri",
            "nodeMode": "Mean Node",
        },
        "provenance": {
            "engine": "vedic-calculator",
            "upstreamVersion": "v7.0",
            "repository": SKILL_REPOSITORY,
            "commit": SKILL_COMMIT,
        },
    }


def build_evidence_ledger(chart: dict[str, Any], calculation_meta: dict[str, Any]) -> dict[str, Any]:
    """Create the single evidence source consumed by all report sections."""
    planets = chart.get("planets", {})
    return {
        "lagna": chart.get("lagna"),
        "planets": planets,
        "dignity": chart.get("dignity", {}),
        "combustion": chart.get("combustion", {}),
        "shadbala": chart.get("shadbala", {}),
        "house_lords": chart.get("house_lords", {}),
        "d9": chart.get("d9", {}),
        "d10": chart.get("d10", {}),
        "dashas": chart.get("dashas", []),
        "karakas": chart.get("karakas", {}),
        "special_points": chart.get("special_points", {}),
        "sav": chart.get("sav", {}),
        "sav_by_house": chart.get("sav_by_house", {}),
        "validation": calculation_meta.get("validation", {}),
        "warnings": calculation_meta.get("warnings", []),
    }


def calculate_professional_chart(
    profile: dict[str, Any],
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    (
        year,
        month,
        day,
        hour,
        minute,
        lat,
        lon,
        timezone,
        second,
    ) = parse_birth(profile)

    chart = calculate_full_chart(
        year,
        month,
        day,
        hour,
        minute,
        lat,
        lon,
        timezone,
    )
    sav_total = sum(chart["sav"].get(sign, 0) for sign in SIGNS)
    if sav_total != 337:
        raise RuntimeError(f"vedic-calculator SAV hard validation failed: {sav_total} != 337")

    transit = calc_transit(
        chart["lagna"]["sign_idx"],
        chart["planets"]["Moon"]["sign_idx"],
        timezone,
    )
    birth_time = f"{hour:02d}:{minute:02d}"
    if second:
        birth_time = f"{birth_time}:{second:g}"
    meta = {
        "dob": f"{year:04d}-{month:02d}-{day:02d}",
        "time": birth_time,
        "place": profile.get("birthCity", ""),
        "lat": lat,
        "lon": lon,
        "time_precision": "精确到分钟",
        "time_source": (options or {}).get("timeSource", "用户输入"),
        "effective_precision": (
            "calculator v7.0 当前按分钟计算；输入秒数已记录但不参与 PyJHora 量化"
            if second
            else "分钟级"
        ),
    }
    user_info = {
        "gender": (options or {}).get("gender") or profile.get("gender") or "[待填]",
        "relationship": (
            (options or {}).get("relationship")
            or profile.get("relationship")
            or "[待填]"
        ),
    }
    markdown = format_structured_data(chart, transit, meta, user_info)
    warnings = []
    if second:
        warnings.append(
            "vedic-calculator v7.0 的 PyJHora 量化接口按分钟计算；出生秒数已保留在元数据中。"
        )

    calculation_meta = {
        "engine": "vedic-calculator",
        "upstreamVersion": "v7.0",
        "repository": SKILL_REPOSITORY,
        "commit": SKILL_COMMIT,
        "timezone": timezone,
        "lat": lat,
        "lon": lon,
        "second": second,
        "ayanamsa": chart["ayanamsa"],
        "ayanamsaMode": "TRUE_CITRA / Lahiri",
        "nodeMode": "Mean Node",
        "validation": compact_professional_chart(chart)["validation"],
        "warnings": warnings,
        "calculatedAt": datetime.utcnow().isoformat() + "Z",
    }
    return {
        "structuredDataMarkdown": markdown,
        "professionalChart": compact_professional_chart(chart),
        "chartJson": build_chart_json(chart, profile, calculation_meta),
        "calculationMeta": calculation_meta,
        "evidenceLedger": build_evidence_ledger(chart, calculation_meta),
    }
