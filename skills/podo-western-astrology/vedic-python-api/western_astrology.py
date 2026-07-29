from __future__ import annotations

import math
import threading
from itertools import combinations
from datetime import datetime, time
from functools import lru_cache
from typing import Any
from zoneinfo import ZoneInfo

import swisseph as swe
from fastapi import HTTPException
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder


SIGNS = [
    ("Aries", "白羊座", "♈"),
    ("Taurus", "金牛座", "♉"),
    ("Gemini", "双子座", "♊"),
    ("Cancer", "巨蟹座", "♋"),
    ("Leo", "狮子座", "♌"),
    ("Virgo", "处女座", "♍"),
    ("Libra", "天秤座", "♎"),
    ("Scorpio", "天蝎座", "♏"),
    ("Sagittarius", "射手座", "♐"),
    ("Capricorn", "摩羯座", "♑"),
    ("Aquarius", "水瓶座", "♒"),
    ("Pisces", "双鱼座", "♓"),
]

PLANETS = [
    ("sun", "太阳", "☉", swe.SUN),
    ("moon", "月亮", "☽", swe.MOON),
    ("mercury", "水星", "☿", swe.MERCURY),
    ("venus", "金星", "♀", swe.VENUS),
    ("mars", "火星", "♂", swe.MARS),
    ("jupiter", "木星", "♃", swe.JUPITER),
    ("saturn", "土星", "♄", swe.SATURN),
    ("uranus", "天王星", "♅", swe.URANUS),
    ("neptune", "海王星", "♆", swe.NEPTUNE),
    ("pluto", "冥王星", "♇", swe.PLUTO),
    ("northNode", "北交点", "☊", swe.MEAN_NODE),
]

ASPECTS = [
    ("conjunction", "合相", 0, 8, "#96705f"),
    ("sextile", "六合", 60, 4, "#7d9b8d"),
    ("square", "刑相", 90, 6, "#bd756f"),
    ("trine", "拱相", 120, 6, "#73978d"),
    ("quincunx", "梅花相", 150, 3, "#a88776"),
    ("opposition", "冲相", 180, 8, "#b96868"),
]

SIGN_ELEMENTS = ["火", "土", "风", "水", "火", "土", "风", "水", "火", "土", "风", "水"]
SIGN_MODALITIES = ["开创", "固定", "变动", "开创", "固定", "变动", "开创", "固定", "变动", "开创", "固定", "变动"]
SIGN_RULERS = [
    ("mars", None),
    ("venus", None),
    ("mercury", None),
    ("moon", None),
    ("sun", None),
    ("mercury", None),
    ("venus", None),
    ("mars", "pluto"),
    ("jupiter", None),
    ("saturn", None),
    ("saturn", "uranus"),
    ("jupiter", "neptune"),
]

DOMICILES = {
    "sun": {4},
    "moon": {3},
    "mercury": {2, 5},
    "venus": {1, 6},
    "mars": {0, 7},
    "jupiter": {8, 11},
    "saturn": {9, 10},
    "uranus": {10},
    "neptune": {11},
    "pluto": {7},
}
EXALTATIONS = {
    "sun": 0,
    "moon": 1,
    "mercury": 5,
    "venus": 11,
    "mars": 9,
    "jupiter": 3,
    "saturn": 6,
}

HOUSE_SYSTEMS = {
    "placidus": (b"P", "Placidus"),
    "koch": (b"K", "Koch"),
    "equal": (b"E", "Equal"),
    "whole-sign": (b"W", "Whole Sign"),
}

ZODIAC_MODES = {
    "tropical": "Tropical",
    "sidereal": "Sidereal",
    "draconic": "Draconic",
}

AYANAMSA_MODES = {
    "fagan-bradley": (swe.SIDM_FAGAN_BRADLEY, "Fagan–Bradley"),
    "lahiri": (swe.SIDM_LAHIRI, "Lahiri"),
}

NODE_TYPES = {
    "mean": (swe.MEAN_NODE, "Mean Node"),
    "true": (swe.TRUE_NODE, "True Node"),
}

CENTERS = {
    "geocentric": "Geocentric",
    "heliocentric": "Heliocentric",
}

CITY_PRESETS = {
    "上海": (31.2304, 121.4737, "Asia/Shanghai"),
    "shanghai": (31.2304, 121.4737, "Asia/Shanghai"),
    "北京": (39.9042, 116.4074, "Asia/Shanghai"),
    "beijing": (39.9042, 116.4074, "Asia/Shanghai"),
    "广州": (23.1291, 113.2644, "Asia/Shanghai"),
    "guangzhou": (23.1291, 113.2644, "Asia/Shanghai"),
    "深圳": (22.5431, 114.0579, "Asia/Shanghai"),
    "shenzhen": (22.5431, 114.0579, "Asia/Shanghai"),
    "成都": (30.5728, 104.0668, "Asia/Shanghai"),
    "chengdu": (30.5728, 104.0668, "Asia/Shanghai"),
    "重庆": (29.5630, 106.5516, "Asia/Shanghai"),
    "chongqing": (29.5630, 106.5516, "Asia/Shanghai"),
    "香港": (22.3193, 114.1694, "Asia/Hong_Kong"),
    "hong kong": (22.3193, 114.1694, "Asia/Hong_Kong"),
    "台北": (25.0330, 121.5654, "Asia/Taipei"),
    "taipei": (25.0330, 121.5654, "Asia/Taipei"),
    "新加坡": (1.3521, 103.8198, "Asia/Singapore"),
    "singapore": (1.3521, 103.8198, "Asia/Singapore"),
}

_timezone_finder = TimezoneFinder()
_geolocator = Nominatim(user_agent="podo-western-astrology/1.0", timeout=10)
_swe_lock = threading.RLock()


def _longitude_distance(a: float, b: float) -> float:
    raw = abs((a - b) % 360)
    return min(raw, 360 - raw)


def _circular_midpoint(a: float, b: float) -> float:
    delta = ((b - a + 540) % 360) - 180
    return (a + delta / 2) % 360


def _decimal_coordinate(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        pass
    import re

    match = re.match(
        r"^\s*(\d+(?:\.\d+)?)\s*([NSEW])\s*(?:(\d+(?:\.\d+)?)')?\s*(?:(\d+(?:\.\d+)?)\")?",
        str(value),
        re.I,
    )
    if not match:
        return None
    degree = float(match.group(1))
    minute = float(match.group(3) or 0)
    second = float(match.group(4) or 0)
    decimal = degree + minute / 60 + second / 3600
    return -decimal if match.group(2).upper() in ("S", "W") else decimal


@lru_cache(maxsize=256)
def _geocode_city(city: str) -> tuple[float, float, str]:
    try:
        location = _geolocator.geocode(city, language="zh-CN", exactly_one=True)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="出生城市定位服务暂时不可用，请稍后重试") from exc
    if not location:
        raise HTTPException(status_code=400, detail=f"无法识别出生城市：{city}")
    return float(location.latitude), float(location.longitude), str(location.address)


def _resolve_location(profile: dict[str, Any]) -> dict[str, Any]:
    city = str(profile.get("birthCity") or "").strip()
    lat = _decimal_coordinate(profile.get("latitude"))
    lon = _decimal_coordinate(profile.get("longitude"))
    resolved_name = city
    preset_timezone = ""
    if lat is None or lon is None:
        if not city:
            raise HTTPException(status_code=400, detail="请填写出生城市")
        preset = next(
            (value for key, value in CITY_PRESETS.items() if key in city.lower()),
            None,
        )
        if preset:
            lat, lon, preset_timezone = preset
        else:
            lat, lon, resolved_name = _geocode_city(city)
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise HTTPException(status_code=400, detail="出生地经纬度超出有效范围")

    timezone_name = str(profile.get("timezoneIana") or preset_timezone or "").strip()
    if not timezone_name:
        timezone_name = _timezone_finder.timezone_at(lat=lat, lng=lon) or ""
    if not timezone_name:
        raise HTTPException(status_code=400, detail="无法确定出生地时区")
    try:
        ZoneInfo(timezone_name)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"无法识别时区：{timezone_name}") from exc
    return {
        "city": city,
        "resolvedName": resolved_name,
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "timezone": timezone_name,
    }


def _parse_local_datetime(profile: dict[str, Any], date_key: str = "birthDate", time_key: str = "birthTime") -> tuple[datetime, dict[str, Any]]:
    raw_date = str(profile.get(date_key) or "").strip()
    raw_time = str(profile.get(time_key) or "12:00").strip()
    if not raw_date:
        raise HTTPException(status_code=400, detail="请填写出生日期")
    try:
        parsed_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
        parsed_time = time.fromisoformat(raw_time)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="日期或时间格式不正确") from exc
    location = _resolve_location(profile)
    local_dt = datetime.combine(parsed_date, parsed_time, ZoneInfo(location["timezone"]))
    return local_dt, location


def _julian_day(local_dt: datetime) -> float:
    utc = local_dt.astimezone(ZoneInfo("UTC"))
    hour = utc.hour + utc.minute / 60 + utc.second / 3600 + utc.microsecond / 3_600_000_000
    return swe.julday(utc.year, utc.month, utc.day, hour, swe.GREG_CAL)


def _house_for(longitude: float, cusps: list[float]) -> int:
    for index, start in enumerate(cusps):
        end = cusps[(index + 1) % 12]
        span = (end - start) % 360
        offset = (longitude - start) % 360
        if offset < span or math.isclose(offset, span, abs_tol=1e-8):
            return index + 1
    return 12


def _dignity(key: str, sign_index: int) -> dict[str, str] | None:
    domiciles = DOMICILES.get(key)
    if not domiciles:
        return None
    if sign_index in domiciles:
        return {"key": "domicile", "name": "入庙"}
    if sign_index in {(index + 6) % 12 for index in domiciles}:
        return {"key": "detriment", "name": "失势"}
    exaltation = EXALTATIONS.get(key)
    if exaltation == sign_index:
        return {"key": "exaltation", "name": "擢升"}
    if exaltation is not None and (exaltation + 6) % 12 == sign_index:
        return {"key": "fall", "name": "落陷"}
    return {"key": "neutral", "name": "中性"}


def _point_payload(key: str, name: str, glyph: str, longitude: float, speed: float, house: int | None) -> dict[str, Any]:
    sign_index = int(longitude // 30) % 12
    sign_en, sign_zh, sign_glyph = SIGNS[sign_index]
    return {
        "key": key,
        "name": name,
        "glyph": glyph,
        "longitude": round(longitude % 360, 8),
        "degree": round(longitude % 30, 4),
        "signIndex": sign_index,
        "sign": sign_zh,
        "signEn": sign_en,
        "signGlyph": sign_glyph,
        "element": SIGN_ELEMENTS[sign_index],
        "modality": SIGN_MODALITIES[sign_index],
        "house": house,
        "retrograde": speed < 0,
        "speed": round(speed, 8),
        "dignity": _dignity(key, sign_index),
    }


def _aspects(points: list[dict[str, Any]], other: list[dict[str, Any]] | None = None, cross: bool = False) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    right = other or points
    for left_index, left in enumerate(points):
        for right_index, target in enumerate(right):
            if not cross and right_index <= left_index:
                continue
            if left["key"] in ("asc", "mc") and target["key"] in ("asc", "mc"):
                continue
            distance = _longitude_distance(left["longitude"], target["longitude"])
            for aspect_key, aspect_name, angle, base_orb, color in ASPECTS:
                orb_limit = base_orb
                if left["key"] in ("sun", "moon") or target["key"] in ("sun", "moon"):
                    orb_limit += 1
                if cross:
                    orb_limit = min(orb_limit, 5)
                orb = abs(distance - angle)
                if orb <= orb_limit:
                    results.append(
                        {
                            "a": left["key"],
                            "aName": left["name"],
                            "b": target["key"],
                            "bName": target["name"],
                            "type": aspect_key,
                            "name": aspect_name,
                            "angle": angle,
                            "orb": round(orb, 3),
                            "color": color,
                        }
                    )
                    break
    return sorted(results, key=lambda item: item["orb"])


def _chart_balance(points: list[dict[str, Any]]) -> dict[str, Any]:
    excluded = {"asc", "mc", "northNode", "southNode"}
    core = [point for point in points if point["key"] not in excluded]
    elements = {key: 0 for key in ("火", "土", "风", "水")}
    modalities = {key: 0 for key in ("开创", "固定", "变动")}
    for point in core:
        elements[point["element"]] += 1
        modalities[point["modality"]] += 1
    dominant_element = max(elements, key=elements.get)
    dominant_modality = max(modalities, key=modalities.get)
    return {
        "elements": elements,
        "modalities": modalities,
        "dominantElement": dominant_element,
        "dominantModality": dominant_modality,
    }


def _house_rulers(houses: list[dict[str, Any]], points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    point_map = {point["key"]: point for point in points}
    results = []
    for house in houses:
        ruler_key, co_ruler_key = SIGN_RULERS[house["signIndex"]]
        ruler = point_map.get(ruler_key)
        co_ruler = point_map.get(co_ruler_key) if co_ruler_key else None
        results.append(
            {
                "house": house["house"],
                "sign": house["sign"],
                "rulerKey": ruler_key,
                "rulerName": ruler["name"] if ruler else ruler_key,
                "rulerHouse": ruler["house"] if ruler else None,
                "coRulerKey": co_ruler_key,
                "coRulerName": co_ruler["name"] if co_ruler else None,
                "coRulerHouse": co_ruler["house"] if co_ruler else None,
            }
        )
    return results


def _normalize_calculation_settings(options: dict[str, Any]) -> dict[str, Any]:
    house_system = str(options.get("houseSystem") or "placidus").lower()
    zodiac = str(options.get("zodiac") or "tropical").lower()
    ayanamsa = str(options.get("ayanamsa") or "fagan-bradley").lower()
    node_type = str(options.get("nodeType") or "mean").lower()
    center = str(options.get("center") or "geocentric").lower()
    topocentric = bool(options.get("topocentric", False))
    light_time_correction = bool(options.get("lightTimeCorrection", True))
    try:
        observer_altitude = float(options.get("observerAltitudeMeters") or 0)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="观测点海拔必须是数字") from exc

    if house_system not in HOUSE_SYSTEMS:
        raise HTTPException(status_code=400, detail=f"不支持的宫制：{house_system}")
    if zodiac not in ZODIAC_MODES:
        raise HTTPException(status_code=400, detail=f"不支持的黄道体系：{zodiac}")
    if ayanamsa not in AYANAMSA_MODES:
        raise HTTPException(status_code=400, detail=f"不支持的岁差体系：{ayanamsa}")
    if node_type not in NODE_TYPES:
        raise HTTPException(status_code=400, detail=f"不支持的交点类型：{node_type}")
    if center not in CENTERS:
        raise HTTPException(status_code=400, detail=f"不支持的观测中心：{center}")
    if not -500 <= observer_altitude <= 10000:
        raise HTTPException(status_code=400, detail="观测点海拔需在 -500 至 10000 米之间")
    if center == "heliocentric" and topocentric:
        raise HTTPException(status_code=400, detail="日心盘不能同时启用地面点坐标")
    if center == "heliocentric" and zodiac == "draconic":
        raise HTTPException(status_code=400, detail="龙首黄道仅适用于地心盘")

    return {
        "houseSystem": house_system,
        "zodiac": zodiac,
        "ayanamsa": ayanamsa,
        "nodeType": node_type,
        "center": center,
        "topocentric": topocentric,
        "observerAltitudeMeters": observer_altitude,
        "lightTimeCorrection": light_time_correction,
    }


def _aspect_type_map(aspects: list[dict[str, Any]]) -> dict[frozenset[str], str]:
    return {frozenset((aspect["a"], aspect["b"])): aspect["type"] for aspect in aspects}


def _aspect_patterns(points: list[dict[str, Any]], aspects: list[dict[str, Any]]) -> list[dict[str, Any]]:
    core = [point for point in points if point["key"] in {item[0] for item in PLANETS[:10]}]
    point_names = {point["key"]: point["name"] for point in core}
    aspect_map = _aspect_type_map(aspects)
    patterns: list[dict[str, Any]] = []
    seen: set[tuple[str, tuple[str, ...]]] = set()

    def add(pattern_key: str, name: str, members: tuple[str, ...]) -> None:
        signature = (pattern_key, tuple(sorted(members)))
        if signature in seen:
            return
        seen.add(signature)
        patterns.append(
            {
                "key": pattern_key,
                "name": name,
                "members": list(members),
                "memberNames": [point_names[key] for key in members],
            }
        )

    for group_key, group_name, selector in (
        ("stellium-sign", "星座群星", lambda point: point["signIndex"]),
        ("stellium-house", "宫位群星", lambda point: point["house"]),
    ):
        grouped: dict[Any, list[str]] = {}
        for point in core:
            grouped.setdefault(selector(point), []).append(point["key"])
        for members in grouped.values():
            if len(members) >= 3:
                add(group_key, group_name, tuple(members))

    for trio in combinations([point["key"] for point in core], 3):
        pair_types = [
            aspect_map.get(frozenset(pair))
            for pair in combinations(trio, 2)
        ]
        if pair_types.count("trine") == 3:
            add("grand-trine", "大三角", trio)
        if pair_types.count("square") == 2 and pair_types.count("opposition") == 1:
            add("t-square", "T 三角", trio)
        if pair_types.count("quincunx") == 2 and pair_types.count("sextile") == 1:
            add("yod", "上帝之指", trio)

    for quartet in combinations([point["key"] for point in core], 4):
        pair_types = [
            aspect_map.get(frozenset(pair))
            for pair in combinations(quartet, 2)
        ]
        if pair_types.count("opposition") == 2 and pair_types.count("square") == 4:
            add("grand-cross", "大十字", quartet)

    return patterns


def _chart(local_dt: datetime, location: dict[str, Any], settings: dict[str, Any]) -> dict[str, Any]:
    jd = _julian_day(local_dt)
    house_system = settings["houseSystem"]
    zodiac = settings["zodiac"]
    center = settings["center"]
    topocentric = settings["topocentric"]
    light_time_correction = settings["lightTimeCorrection"]
    system_code, system_name = HOUSE_SYSTEMS.get(house_system, HOUSE_SYSTEMS["placidus"])
    houses_available = center == "geocentric"
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    if zodiac == "sidereal":
        flags |= swe.FLG_SIDEREAL
    if center == "heliocentric":
        flags |= swe.FLG_HELCTR
    if topocentric:
        flags |= swe.FLG_TOPOCTR
    if not light_time_correction:
        flags |= swe.FLG_TRUEPOS

    planet_set = PLANETS
    if center == "heliocentric":
        planet_set = [
            ("earth", "地球", "⊕", swe.EARTH),
            *[item for item in PLANETS if item[0] in {
                "mercury", "venus", "mars", "jupiter", "saturn",
                "uranus", "neptune", "pluto",
            }],
        ]
    elif settings["nodeType"] == "true":
        planet_set = [
            (key, name, glyph, swe.TRUE_NODE if key == "northNode" else planet_id)
            for key, name, glyph, planet_id in PLANETS
        ]

    with _swe_lock:
        if zodiac == "sidereal":
            swe.set_sid_mode(AYANAMSA_MODES[settings["ayanamsa"]][0])
        if topocentric:
            swe.set_topo(
                float(location["longitude"]),
                float(location["latitude"]),
                settings["observerAltitudeMeters"],
            )

        cusps: list[float] = []
        asc: float | None = None
        mc: float | None = None
        if houses_available:
            house_flags = swe.FLG_SIDEREAL if zodiac == "sidereal" else swe.FLG_TROPICAL
            try:
                cusp_values, ascmc = swe.houses_ex(
                    jd,
                    float(location["latitude"]),
                    float(location["longitude"]),
                    system_code,
                    house_flags,
                )
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"当前纬度无法使用 {system_name} 宫制") from exc
            cusp_list = list(cusp_values)
            if len(cusp_list) == 13:
                cusp_list = cusp_list[1:]
            if len(cusp_list) != 12:
                raise HTTPException(status_code=500, detail="Swiss Ephemeris 返回了无效宫头数据")
            cusps = [float(value) % 360 for value in cusp_list]
            asc = float(ascmc[0]) % 360
            mc = float(ascmc[1]) % 360

        raw_points: list[tuple[str, str, str, float, float]] = []
        for key, name, glyph, planet_id in planet_set:
            calculation = swe.calc_ut(jd, planet_id, flags)
            values = calculation[0] if isinstance(calculation[0], (list, tuple)) else calculation
            if len(values) < 4:
                raise HTTPException(status_code=500, detail=f"无法计算{name}位置")
            raw_points.append((key, name, glyph, float(values[0]) % 360, float(values[3])))

        draconic_offset = 0.0
        draconic_speed = 0.0
        if zodiac == "draconic":
            node_id = NODE_TYPES[settings["nodeType"]][0]
            node_calculation = swe.calc_ut(jd, node_id, flags)
            node_values = node_calculation[0] if isinstance(node_calculation[0], (list, tuple)) else node_calculation
            draconic_offset = float(node_values[0]) % 360
            draconic_speed = float(node_values[3])
            cusps = [(value - draconic_offset) % 360 for value in cusps]
            asc = (asc - draconic_offset) % 360 if asc is not None else None
            mc = (mc - draconic_offset) % 360 if mc is not None else None

    points: list[dict[str, Any]] = []
    for key, name, glyph, raw_longitude, raw_speed in raw_points:
        longitude = (raw_longitude - draconic_offset) % 360
        speed = raw_speed - draconic_speed if zodiac == "draconic" else raw_speed
        house = _house_for(longitude, cusps) if houses_available else None
        points.append(_point_payload(key, name, glyph, longitude, speed, house))

    if houses_available and asc is not None and mc is not None:
        points.extend(
            [
                _point_payload("asc", "上升点", "ASC", asc, 0, 1),
                _point_payload("mc", "天顶", "MC", mc, 0, 10),
            ]
        )
    houses = []
    for index, longitude in enumerate(cusps):
        sign_index = int(longitude // 30) % 12
        houses.append(
            {
                "house": index + 1,
                "longitude": round(longitude, 8),
                "degree": round(longitude % 30, 4),
                "signIndex": sign_index,
                "sign": SIGNS[sign_index][1],
                "signGlyph": SIGNS[sign_index][2],
            }
        )
    aspects = _aspects(points)
    ayanamsa_name = AYANAMSA_MODES[settings["ayanamsa"]][1] if zodiac == "sidereal" else None
    node_name = NODE_TYPES[settings["nodeType"]][1] if zodiac == "draconic" else None
    return {
        "localDateTime": local_dt.isoformat(),
        "utcDateTime": local_dt.astimezone(ZoneInfo("UTC")).isoformat(),
        "julianDay": round(jd, 8),
        "points": points,
        "houses": houses,
        "aspects": aspects,
        "balance": _chart_balance(points),
        "houseRulers": _house_rulers(houses, points),
        "aspectPatterns": _aspect_patterns(points, aspects),
        "angles": {
            "asc": round(asc, 8) if asc is not None else None,
            "mc": round(mc, 8) if mc is not None else None,
        },
        "houseSystem": system_name if houses_available else None,
        "calculationSettings": {
            "zodiac": ZODIAC_MODES[zodiac],
            "zodiacKey": zodiac,
            "ayanamsa": ayanamsa_name,
            "nodeType": node_name,
            "center": CENTERS[center],
            "centerKey": center,
            "topocentric": topocentric,
            "observerAltitudeMeters": settings["observerAltitudeMeters"] if topocentric else None,
            "lightTimeCorrection": light_time_correction,
            "housesAvailable": houses_available,
        },
    }


def _target_chart(primary_profile: dict[str, Any], target_date: str, target_time: str, settings: dict[str, Any]) -> dict[str, Any]:
    target_profile = {
        **primary_profile,
        "birthDate": target_date,
        "birthTime": target_time or "12:00",
    }
    local_dt, location = _parse_local_datetime(target_profile)
    return _chart(local_dt, location, settings)


def _composite_chart(first: dict[str, Any], second: dict[str, Any]) -> dict[str, Any]:
    second_by_key = {item["key"]: item for item in second["points"]}
    has_houses = first["angles"].get("asc") is not None and second["angles"].get("asc") is not None
    asc = _circular_midpoint(first["angles"]["asc"], second["angles"]["asc"]) if has_houses else None
    points = []
    for item in first["points"]:
        pair = second_by_key.get(item["key"])
        if not pair:
            continue
        longitude = _circular_midpoint(item["longitude"], pair["longitude"])
        house = int(((longitude - asc) % 360) // 30) + 1 if asc is not None else None
        points.append(_point_payload(item["key"], item["name"], item["glyph"], longitude, 0, house))
    houses = []
    if asc is not None:
        for index in range(12):
            longitude = (asc + index * 30) % 360
            sign_index = int(longitude // 30) % 12
            houses.append(
                {
                    "house": index + 1,
                    "longitude": round(longitude, 8),
                    "degree": round(longitude % 30, 4),
                    "signIndex": sign_index,
                    "sign": SIGNS[sign_index][1],
                    "signGlyph": SIGNS[sign_index][2],
                }
            )
    aspects = _aspects(points)
    return {
        "points": points,
        "houses": houses,
        "aspects": aspects,
        "balance": _chart_balance(points),
        "houseRulers": _house_rulers(houses, points),
        "aspectPatterns": _aspect_patterns(points, aspects),
        "angles": {
            "asc": round(asc, 8) if asc is not None else None,
            "mc": round((asc + 270) % 360, 8) if asc is not None else None,
        },
        "houseSystem": "Composite Equal Houses" if has_houses else None,
        "calculationSettings": first.get("calculationSettings", {}),
        "calculationNote": (
            "组合盘行星与轴点使用最短弧中点；宫位采用组合上升起算的等宫制。"
            if has_houses
            else "日心组合盘仅使用行星最短弧中点，不生成角轴与宫位。"
        ),
    }


def calculate_western_chart(profile: dict[str, Any], options: dict[str, Any] | None = None) -> dict[str, Any]:
    options = options or {}
    chart_type = str(options.get("chartType") or "natal")
    settings = _normalize_calculation_settings(options)
    local_dt, location = _parse_local_datetime(profile)
    natal = _chart(local_dt, location, settings)
    result: dict[str, Any] = {
        "engine": "Swiss Ephemeris",
        "zodiac": ZODIAC_MODES[settings["zodiac"]],
        "zodiacMode": settings["zodiac"],
        "calculationSettings": natal["calculationSettings"],
        "interpretationSkill": {
            "name": "Astro Western interpretation rules",
            "source": "https://github.com/aryaminus/astro",
            "license": "MIT",
            "scope": "western-chart",
        },
        "chartType": chart_type,
        "subject": {**location, "birthDateTime": local_dt.isoformat()},
        "natal": natal,
    }

    if chart_type in ("transit", "solar-return", "lunar-return"):
        target_date = str(options.get("targetDate") or datetime.now(ZoneInfo(location["timezone"])).date().isoformat())
        target_time = str(options.get("targetTime") or "12:00")
        transit = _target_chart(profile, target_date, target_time, settings)
        result["transit"] = transit
        result["interAspects"] = _aspects(transit["points"], natal["points"], cross=True)
        if chart_type != "transit":
            result["calculationNote"] = "当前版本按所选日期生成真实行运叠盘；精确日返/月返时刻搜索将在下一阶段加入。"

    if chart_type in ("synastry", "composite"):
        partner = options.get("partner") or {}
        partner_dt, partner_location = _parse_local_datetime(partner)
        partner_chart = _chart(partner_dt, partner_location, settings)
        result["partnerSubject"] = {**partner_location, "birthDateTime": partner_dt.isoformat()}
        result["partner"] = partner_chart
        result["interAspects"] = _aspects(natal["points"], partner_chart["points"], cross=True)
        if chart_type == "composite":
            result["composite"] = _composite_chart(natal, partner_chart)

    if chart_type in ("firdaria", "profection"):
        result["calculationNote"] = "法达与小限属于时间主宰技术，不等同于天文行运；本版本先保留本命盘，不伪造推运结果。"
    return result
