from __future__ import annotations

import math
import sys
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


SKILL_COMMIT = "7a6e33e23dc1f45107af2f249848241bb4d22b67"
SKILL_REPOSITORY = "https://github.com/lixingxuan920-sudo/vedic-astro-skills"
SKILL_ROOT = Path(__file__).parent / "vendor" / "vedic-calculator"
SKILL_SCRIPTS = SKILL_ROOT / "scripts"

if str(SKILL_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SKILL_SCRIPTS))

from engine import calculate_full_chart  # noqa: E402
from formatter import format_structured_data  # noqa: E402
from transit import calc_transit  # noqa: E402


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

    city = str(profile.get("birthCity", "")).lower()
    timezone = str(profile.get("timezone", "")).lower()
    if (
        "south grafton" in city
        or "massachusetts" in city
        or "-04" in timezone
        or "-05" in timezone
    ):
        return "America/New_York"
    if (
        "india" in city
        or "delhi" in city
        or "mumbai" in city
        or "05:30" in timezone
    ):
        return "Asia/Kolkata"
    if "hong" in city or "香港" in city:
        return "Asia/Hong_Kong"
    if "taipei" in city or "台北" in city:
        return "Asia/Taipei"
    if (
        "+08" in timezone
        or "china" in city
        or any(
            item in city
            for item in [
                "北京", "上海", "广州", "深圳", "西宁", "成都",
                "重庆", "武汉", "南京", "杭州", "西安",
            ]
        )
    ):
        return "Asia/Shanghai"
    if lon is not None and 68 < lon < 98:
        return "Asia/Kolkata"
    return "Asia/Shanghai"


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

    return {
        "structuredDataMarkdown": markdown,
        "professionalChart": compact_professional_chart(chart),
        "calculationMeta": {
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
        },
    }
