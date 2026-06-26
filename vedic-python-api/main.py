from __future__ import annotations

import math
import os
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import swisseph as swe
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"]

PLANETS = [
    ("Sun", swe.SUN),
    ("Moon", swe.MOON),
    ("Mars", swe.MARS),
    ("Mercury", swe.MERCURY),
    ("Jupiter", swe.JUPITER),
    ("Venus", swe.VENUS),
    ("Saturn", swe.SATURN),
]

NAKSHATRAS = [
    ("Ashwini", "Ketu"), ("Bharani", "Venus"), ("Krittika", "Sun"),
    ("Rohini", "Moon"), ("Mrigashira", "Mars"), ("Ardra", "Rahu"),
    ("Punarvasu", "Jupiter"), ("Pushya", "Saturn"), ("Ashlesha", "Mercury"),
    ("Magha", "Ketu"), ("Purva Phalguni", "Venus"), ("Uttara Phalguni", "Sun"),
    ("Hasta", "Moon"), ("Chitra", "Mars"), ("Swati", "Rahu"),
    ("Vishakha", "Jupiter"), ("Anuradha", "Saturn"), ("Jyeshtha", "Mercury"),
    ("Mula", "Ketu"), ("Purva Ashadha", "Venus"), ("Uttara Ashadha", "Sun"),
    ("Shravana", "Moon"), ("Dhanishta", "Mars"), ("Shatabhisha", "Rahu"),
    ("Purva Bhadrapada", "Jupiter"), ("Uttara Bhadrapada", "Saturn"), ("Revati", "Mercury"),
]

DASHA_YEARS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}

DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]


class VedicRequest(BaseModel):
    profile: dict[str, Any] = Field(default_factory=dict)
    options: dict[str, Any] = Field(default_factory=dict)
    chart: dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title="Luna Vedic Ephemeris API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def require_api_key(x_vedic_api_key: str | None) -> None:
    expected = os.getenv("VEDIC_API_KEY", "").strip()
    if expected and x_vedic_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid VEDIC_API_KEY")


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

    match = re.match(r"^(\d+(?:\.\d+)?)([NSEW])\s*(?:(\d+(?:\.\d+)?)')?\s*(?:(\d+(?:\.\d+)?)\")?", text, re.I)
    if not match:
        return None
    degree = float(match.group(1))
    direction = match.group(2).upper()
    minute = float(match.group(3) or 0)
    second = float(match.group(4) or 0)
    decimal = degree + minute / 60 + second / 3600
    return -decimal if direction in ("S", "W") else decimal


def timezone_to_iana(profile: dict[str, Any], lon: float | None) -> str:
    city = str(profile.get("birthCity", "")).lower()
    timezone = str(profile.get("timezone", "")).lower()
    if "south grafton" in city or "massachusetts" in city or "-04" in timezone or "-05" in timezone:
        return "America/New_York"
    if "india" in city or "delhi" in city or "mumbai" in city or "05:30" in timezone:
        return "Asia/Kolkata"
    if "hong" in city or "香港" in city:
        return "Asia/Hong_Kong"
    if "taipei" in city or "台北" in city:
        return "Asia/Taipei"
    if "+08" in timezone or "china" in city or any(item in city for item in ["北京", "上海", "广州", "深圳", "西宁", "成都", "重庆", "武汉", "南京", "杭州", "西安"]):
        return "Asia/Shanghai"
    if lon is not None and 68 < lon < 98:
        return "Asia/Kolkata"
    return "Asia/Shanghai"


def parse_birth(profile: dict[str, Any]) -> tuple[datetime, float, float, str, float]:
    birth_date = str(profile.get("birthDate") or "")
    birth_time = str(profile.get("birthTime") or "12:00")
    second_value = profile.get("birthSecond", 0)
    year, month, day = [int(item) for item in birth_date.split("-")]
    parts = [int(float(item)) for item in birth_time.split(":")]
    hour = parts[0] if len(parts) > 0 else 12
    minute = parts[1] if len(parts) > 1 else 0
    second = float(parts[2]) if len(parts) > 2 else float(second_value or 0)
    whole_second = int(second)
    microsecond = int(round((second - whole_second) * 1_000_000))
    lat = dms_to_decimal(profile.get("latitude"))
    lon = dms_to_decimal(profile.get("longitude"))
    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")
    tz_name = timezone_to_iana(profile, lon)
    local_dt = datetime(year, month, day, hour, minute, whole_second, microsecond, tzinfo=ZoneInfo(tz_name))
    return local_dt, lat, lon, tz_name, second


def sidereal_longitude(tropical_longitude: float, ayanamsa: float) -> float:
    return (tropical_longitude - ayanamsa) % 360


def sign_index(longitude: float) -> int:
    return int(longitude // 30) % 12


def deg_string(longitude: float) -> str:
    within = longitude % 30
    degree = int(within)
    minute_float = (within - degree) * 60
    minute = int(minute_float)
    second = int(round((minute_float - minute) * 60))
    if second == 60:
        minute += 1
        second = 0
    if minute == 60:
        degree += 1
        minute = 0
    return f"{degree}d{minute:02d}m{second:02d}s"


def nakshatra_for(longitude: float) -> dict[str, Any]:
    span = 360 / 27
    index = int(longitude // span) % 27
    pada = int((longitude % span) // (span / 4)) + 1
    name, lord = NAKSHATRAS[index]
    return {"name": name, "pada": pada, "lord": lord, "index": index}


def house_from_lagna(planet_sign: int, lagna_sign: int) -> int:
    return ((planet_sign - lagna_sign) % 12) + 1


def calc_julian_day(local_dt: datetime) -> float:
    utc = local_dt.astimezone(ZoneInfo("UTC"))
    hour = utc.hour + utc.minute / 60 + utc.second / 3600 + utc.microsecond / 3_600_000_000
    return swe.julday(utc.year, utc.month, utc.day, hour)


def calc_ut_values(jd: float, planet_id: int) -> tuple[float, float, float, float]:
    result = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SPEED)
    values: list[float] = []

    def collect_numbers(item: Any) -> None:
        if len(values) >= 4:
            return
        if isinstance(item, (list, tuple)):
            for child in item:
                collect_numbers(child)
                if len(values) >= 4:
                    return
        elif isinstance(item, (int, float)):
            values.append(float(item))

    collect_numbers(result)
    if len(values) < 4:
        raise RuntimeError(f"Unexpected swisseph.calc_ut result shape: {result!r}")
    return values[0], values[1], values[2], values[3]


def calc_planet(jd: float, planet_id: int, ayanamsa: float, lagna_sign: int) -> dict[str, Any]:
    tropical_lon, _lat, _distance, speed = calc_ut_values(jd, planet_id)
    lon = sidereal_longitude(tropical_lon, ayanamsa)
    sidx = sign_index(lon)
    return {
        "longitude": round(lon, 8),
        "sign": SIGNS[sidx],
        "sign_index": sidx,
        "house": house_from_lagna(sidx, lagna_sign),
        "deg_str": deg_string(lon),
        "retrograde": speed < 0,
        "nakshatra": nakshatra_for(lon),
    }


def calc_lagna(jd: float, lat: float, lon: float, ayanamsa: float) -> dict[str, Any]:
    houses, ascmc = swe.houses_ex(jd, lat, lon, b"P")
    asc = sidereal_longitude(ascmc[0], ayanamsa)
    sidx = sign_index(asc)
    return {
        "longitude": round(asc, 8),
        "sign": SIGNS[sidx],
        "sign_index": sidx,
        "house": 1,
        "deg_str": deg_string(asc),
        "nakshatra": nakshatra_for(asc),
        "houses": [round(sidereal_longitude(item, ayanamsa), 8) for item in houses],
    }


def vimshottari_dashas(moon_longitude: float, birth_date_value: date) -> list[dict[str, Any]]:
    nak = nakshatra_for(moon_longitude)
    lord = nak["lord"]
    span = 360 / 27
    elapsed_ratio = (moon_longitude % span) / span
    remaining_years = DASHA_YEARS[lord] * (1 - elapsed_ratio)
    start = birth_date_value - timedelta(days=round((DASHA_YEARS[lord] - remaining_years) * 365.2425))
    order_start = DASHA_ORDER.index(lord)
    dashas = []
    current_start = start
    today = date.today()
    for i in range(18):
        planet = DASHA_ORDER[(order_start + i) % len(DASHA_ORDER)]
        years = DASHA_YEARS[planet]
        current_end = current_start + timedelta(days=round(years * 365.2425))
        dashas.append({
            "planet": planet,
            "start": current_start.isoformat(),
            "end": current_end.isoformat(),
            "years": years,
            "is_current": current_start <= today < current_end,
        })
        current_start = current_end
    return dashas


def chart_to_markdown(profile: dict[str, Any], local_dt: datetime, lat: float, lon: float, tz_name: str, second: float, chart: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("## 元信息\n")
    lines.append("```")
    lines.append(f"出生日期: {profile.get('birthDate', '')}")
    lines.append(f"出生时间: {profile.get('birthTime', '')}:{second:g}" if second and ":" not in str(profile.get("birthTime", ""))[6:] else f"出生时间: {profile.get('birthTime', '')}")
    lines.append(f"出生地点: {profile.get('birthCity', '')} ({lon}, {lat})")
    lines.append(f"时间精度: {'秒级输入' if second else '精确到分钟'}")
    lines.append("时间来源: 用户输入")
    lines.append("有效精度: D1星历秒级输入；公网 Python 后端计算")
    lines.append("验证轨道: 轨道1-标准")
    lines.append("读盘方式: vedic-python-api直接计算")
    lines.append(f"Ayanamsa: Lahiri ({chart['ayanamsa']:.4f}°)")
    lines.append("Node模式: Mean Node")
    lines.append("```\n")
    lines.append("## 计算警示\n")
    lines.append("> D1本命盘、上升、行星经度和月宿来自 Swiss Ephemeris 真实星历。SAV/BAV、Shadbala、复杂分盘和高级瑜伽仍建议接入完整 PyJHora/JHora 校验后再做强弱量化。\n")
    lines.append("## 用户信息\n")
    lines.append("```")
    lines.append(f"性别: {profile.get('gender', '[待填]')}")
    lines.append(f"感情状态: {profile.get('relationship', '[待填]')}")
    lines.append("```\n")
    lines.append("## D1基础数据\n")
    lines.append("### 行星位置")
    lines.append("| 行星 | 星座 | 宫位 | 度数 | 逆行 |")
    lines.append("|------|------|------|------|------|")
    lagna = chart["lagna"]
    lines.append(f"| Lagna | {lagna['sign']} | 1 | {lagna['deg_str']} | - |")
    for name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
        planet = chart["planets"][name]
        lines.append(f"| {name} | {planet['sign']} | {planet['house']} | {planet['deg_str']} | {'R' if planet['retrograde'] else 'D'} |")
    lines.append("")
    lines.append("### Nakshatra")
    lines.append("| 行星 | Nakshatra | Pada | Nakshatra主 |")
    lines.append("|------|-----------|------|-------------|")
    lagna_nak = lagna["nakshatra"]
    lines.append(f"| Lagna | {lagna_nak['name']} | {lagna_nak['pada']} | {lagna_nak['lord']} |")
    for name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
        nak = chart["planets"][name]["nakshatra"]
        lines.append(f"| {name} | {nak['name']} | {nak['pada']} | {nak['lord']} |")
    lines.append("")
    lines.append("### Vimsottari Dasha")
    lines.append("| 大运 | 行星 | 起始 | 结束 | 年数 |")
    lines.append("|------|------|------|------|------|")
    for item in chart["dashas"]:
        marker = "→当前" if item["is_current"] else ""
        lines.append(f"| {marker} | {item['planet']} | {item['start']} | {item['end']} | {item['years']} |")
    lines.append("")
    lines.append("## 分盘与量化说明\n")
    lines.append("D1 ✅ Swiss Ephemeris 可信")
    lines.append("D9/D10/SAV/BAV/Shadbala ⚠️ 当前公网 API 不伪造量化值，需完整 PyJHora/JHora 后端进一步扩展")
    lines.append("")
    return "\n".join(lines)


def calculate_chart(profile: dict[str, Any]) -> dict[str, Any]:
    local_dt, lat, lon, tz_name, second = parse_birth(profile)
    jd = calc_julian_day(local_dt)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)
    lagna = calc_lagna(jd, lat, lon, ayanamsa)
    planets: dict[str, Any] = {}
    for name, planet_id in PLANETS:
        planets[name] = calc_planet(jd, planet_id, ayanamsa, lagna["sign_index"])
    rahu_tropical_lon, _lat, _distance, _speed = calc_ut_values(jd, swe.MEAN_NODE)
    rahu_lon = sidereal_longitude(rahu_tropical_lon, ayanamsa)
    ketu_lon = (rahu_lon + 180) % 360
    for name, lon_value in [("Rahu", rahu_lon), ("Ketu", ketu_lon)]:
        sidx = sign_index(lon_value)
        planets[name] = {
            "longitude": round(lon_value, 8),
            "sign": SIGNS[sidx],
            "sign_index": sidx,
            "house": house_from_lagna(sidx, lagna["sign_index"]),
            "deg_str": deg_string(lon_value),
            "retrograde": True,
            "nakshatra": nakshatra_for(lon_value),
        }
    dashas = vimshottari_dashas(planets["Moon"]["longitude"], local_dt.date())
    chart = {
        "ayanamsa": ayanamsa,
        "julian_day": jd,
        "lagna": lagna,
        "planets": planets,
        "dashas": dashas,
    }
    markdown = chart_to_markdown(profile, local_dt, lat, lon, tz_name, second, chart)
    return {
        "structuredDataMarkdown": markdown,
        "calculationMeta": {
            "engine": "vedic-python-api",
            "timezone": tz_name,
            "lat": lat,
            "lon": lon,
            "second": second,
            "julianDay": jd,
            "ayanamsa": ayanamsa,
            "warnings": [
                "公网 API 当前提供 Swiss Ephemeris D1、Nakshatra 与 Vimshottari Dasha；SAV/BAV、Shadbala、完整分盘量化待接入 PyJHora/JHora 校验。"
            ],
        },
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"ok": "true", "engine": "vedic-python-api"}


@app.post("/calculate")
def calculate(payload: VedicRequest, x_vedic_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(x_vedic_api_key)
    result = calculate_chart(payload.profile)
    return {"ok": True, **result}
