from __future__ import annotations

from typing import Any


SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]
PLANET_ORDER = [
    "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
]
SIGN_LORDS = {
    0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon", 4: "Sun", 5: "Mercury",
    6: "Venus", 7: "Mars", 8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter",
}
EXALTATION_SIGNS = {
    "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo",
    "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra",
}
DEBILITATION_SIGNS = {
    "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer", "Mercury": "Pisces",
    "Jupiter": "Capricorn", "Venus": "Virgo", "Saturn": "Aries",
}
OWN_SIGNS = {
    "Sun": {"Leo"}, "Moon": {"Cancer"}, "Mars": {"Aries", "Scorpio"},
    "Mercury": {"Gemini", "Virgo"}, "Jupiter": {"Sagittarius", "Pisces"},
    "Venus": {"Taurus", "Libra"}, "Saturn": {"Capricorn", "Aquarius"},
}


def _house_from_sign(sign_idx: int, lagna_sign_idx: int) -> int:
    return ((sign_idx - lagna_sign_idx) % 12) + 1


def _planet_dignity(name: str, planet: dict[str, Any], chart: dict[str, Any]) -> dict[str, Any]:
    basic = str(chart.get("dignity", {}).get(name, {}).get("basic", "unknown"))
    sign = str(planet.get("sign", ""))
    applicable = name not in {"Rahu", "Ketu"}
    return {
        "status": basic if applicable else "not_standardized_for_nodes",
        "exaltation": applicable and sign == EXALTATION_SIGNS.get(name),
        "debilitation": applicable and sign == DEBILITATION_SIGNS.get(name),
        "ownSign": applicable and sign in OWN_SIGNS.get(name, set()),
        "applicable": applicable,
    }


def _normalize_planets(chart: dict[str, Any]) -> list[dict[str, Any]]:
    combustion = chart.get("combustion", {})
    result = []
    for name in PLANET_ORDER:
        raw = chart["planets"][name]
        nakshatra = raw.get("nakshatra", {})
        dignity = _planet_dignity(name, raw, chart)
        result.append({
            "name": name,
            "longitude": round(float(raw["longitude"]), 8),
            "sign": raw["sign"],
            "house": int(raw["house"]),
            "nakshatra": nakshatra.get("name"),
            "pada": nakshatra.get("pada"),
            "nakshatraLord": nakshatra.get("lord"),
            "retrograde": bool(raw.get("retrograde", False)),
            "combust": name in combustion,
            "combustionDistance": combustion.get(name, {}).get("distance"),
            "degrees": round(float(raw.get("degree", 0.0)), 8),
            "degreesFormatted": raw.get("deg_str"),
            "exaltation": dignity["exaltation"],
            "debilitation": dignity["debilitation"],
            "ownSign": dignity["ownSign"],
            "dignity": dignity,
        })
    return result


def _normalize_houses(chart: dict[str, Any]) -> list[dict[str, Any]]:
    lagna_idx = int(chart["lagna"]["sign_idx"])
    houses = []
    for number in range(1, 13):
        sign_idx = (lagna_idx + number - 1) % 12
        lord = SIGN_LORDS[sign_idx]
        occupants = [
            name for name in PLANET_ORDER if int(chart["planets"][name]["house"]) == number
        ]
        lord_house = chart["planets"].get(lord, {}).get("house")
        houses.append({
            "number": number,
            "sign": SIGNS[sign_idx],
            "lord": lord,
            "lordHouse": int(lord_house) if lord_house is not None else None,
            "occupants": occupants,
        })
    return houses


def _normalize_aspects(chart: dict[str, Any]) -> list[dict[str, Any]]:
    """Return sign-based Parashari graha drishti, not Western angular aspects."""
    aspect_offsets = {
        "Sun": [7], "Moon": [7], "Mars": [4, 7, 8], "Mercury": [7],
        "Jupiter": [5, 7, 9], "Venus": [7], "Saturn": [3, 7, 10],
    }
    lagna_idx = int(chart["lagna"]["sign_idx"])
    aspects = []
    for name, aspect_numbers in aspect_offsets.items():
        source = chart["planets"][name]
        source_idx = int(source["sign_idx"])
        for aspect_number in aspect_numbers:
            target_idx = (source_idx + aspect_number - 1) % 12
            aspects.append({
                "planet": name,
                "aspect": aspect_number,
                "fromHouse": int(source["house"]),
                "toHouse": _house_from_sign(target_idx, lagna_idx),
                "toSign": SIGNS[target_idx],
                "aspectedPlanets": [
                    other for other in PLANET_ORDER
                    if int(chart["planets"][other]["sign_idx"]) == target_idx
                ],
                "system": "Parashari sign-based graha drishti",
            })
    return aspects


def _normalize_dasha(chart: dict[str, Any]) -> dict[str, Any]:
    mahadashas = []
    current_maha = None
    current_antara = None
    for raw in chart.get("dashas", []):
        antardashas = [{
            "planet": item.get("planet"),
            "start": item.get("start"),
            "end": item.get("end"),
            "current": bool(item.get("is_current", False)),
        } for item in raw.get("antardashas", [])]
        item = {
            "planet": raw.get("planet"),
            "start": raw.get("start"),
            "end": raw.get("end"),
            "years": raw.get("years"),
            "current": bool(raw.get("is_current", False)),
            "antardashas": antardashas,
        }
        mahadashas.append(item)
        if item["current"]:
            current_maha = {key: item[key] for key in ("planet", "start", "end")}
            active = next((ad for ad in antardashas if ad["current"]), None)
            if active:
                current_antara = {key: active[key] for key in ("planet", "start", "end")}
    return {
        "system": "Vimshottari",
        "mahadashas": mahadashas,
        "currentMahadasha": current_maha,
        "currentAntardasha": current_antara,
    }


def _normalize_d9(chart: dict[str, Any]) -> dict[str, Any]:
    d9 = chart.get("divisional_charts", {}).get("D9", {})
    if not d9 or "error" in d9 or "Lagna" not in d9:
        return {"available": False, "reason": d9.get("error", "D9 calculation unavailable")}
    lagna = d9["Lagna"]
    lagna_idx = int(lagna["sign_idx"])
    positions = []
    for name in PLANET_ORDER:
        raw = d9.get(name)
        if not raw:
            continue
        sign_idx = int(raw["sign_idx"])
        positions.append({
            "name": name,
            "sign": raw["sign"],
            "house": _house_from_sign(sign_idx, lagna_idx),
            "degrees": raw.get("degree"),
        })
    houses = []
    for number in range(1, 13):
        sign_idx = (lagna_idx + number - 1) % 12
        houses.append({
            "number": number,
            "sign": SIGNS[sign_idx],
            "lord": SIGN_LORDS[sign_idx],
            "occupants": [item["name"] for item in positions if item["house"] == number],
        })
    return {
        "available": True,
        "ascendant": {
            "longitude": round(lagna_idx * 30 + float(lagna.get("degree", 0)), 8),
            "sign": lagna["sign"],
            "degrees": lagna.get("degree"),
        },
        "houses": houses,
        "planetPositions": positions,
    }


def _connected(chart: dict[str, Any], first: str, second: str) -> bool:
    p1, p2 = chart["planets"][first], chart["planets"][second]
    conjunct = int(p1["sign_idx"]) == int(p2["sign_idx"])
    exchange = SIGN_LORDS[int(p1["sign_idx"])] == second and SIGN_LORDS[int(p2["sign_idx"])] == first
    mutual_seventh = (int(p1["sign_idx"]) - int(p2["sign_idx"])) % 12 == 6
    return conjunct or exchange or mutual_seventh


def _detect_yogas(chart: dict[str, Any]) -> list[dict[str, Any]]:
    planets = chart["planets"]
    lords = {house: SIGN_LORDS[(int(chart["lagna"]["sign_idx"]) + house - 1) % 12] for house in range(1, 13)}
    yogas: list[dict[str, Any]] = []

    def add(name: str, evidence: list[str], rule: str) -> None:
        yogas.append({"name": name, "formed": True, "evidence": evidence, "rule": rule})

    raja_links = sorted({
        tuple(sorted((lords[kendra], lords[trikona])))
        for kendra in (1, 4, 7, 10) for trikona in (1, 5, 9)
        if lords[kendra] != lords[trikona] and _connected(chart, lords[kendra], lords[trikona])
    })
    if raja_links:
        add("Raja Yoga", [f"{a}与{b}形成合相、互容或互相七宫照" for a, b in raja_links], "Kendra lord connects with Trikona lord")

    dhana_links = sorted({
        tuple(sorted((lords[a], lords[b])))
        for index, a in enumerate((2, 5, 9, 11)) for b in (2, 5, 9, 11)[index + 1:]
        if lords[a] != lords[b] and _connected(chart, lords[a], lords[b])
    })
    if dhana_links:
        add("Dhana Yoga", [f"{a}与{b}连接财富宫主" for a, b in dhana_links], "Lords of houses 2, 5, 9 or 11 connect")

    vipreet = [house for house in (6, 8, 12) if int(planets[lords[house]]["house"]) in (6, 8, 12)]
    if vipreet:
        add("Vipreet Raja Yoga", [f"第{house}宫主{lords[house]}落第{planets[lords[house]]['house']}宫" for house in vipreet], "Dusthana lord occupies a Dusthana")

    moon_idx = int(planets["Moon"]["sign_idx"])
    jupiter_from_moon = ((int(planets["Jupiter"]["sign_idx"]) - moon_idx) % 12) + 1
    if jupiter_from_moon in (1, 4, 7, 10):
        add("Gajakesari Yoga", [f"Jupiter位于Moon起算第{jupiter_from_moon}宫"], "Jupiter is in a Kendra from Moon")

    exchanges = []
    classical = PLANET_ORDER[:7]
    for index, first in enumerate(classical):
        for second in classical[index + 1:]:
            if SIGN_LORDS[int(planets[first]["sign_idx"])] == second and SIGN_LORDS[int(planets[second]["sign_idx"])] == first:
                exchanges.append(f"{first}与{second}互换星座")
    if exchanges:
        add("Parivartana Yoga", exchanges, "Two sign lords occupy each other's signs")

    debilitated = [name for name in classical if planets[name]["sign"] == DEBILITATION_SIGNS[name]]
    neecha_evidence = []
    for name in debilitated:
        sign_lord = SIGN_LORDS[int(planets[name]["sign_idx"])]
        lord_from_lagna = int(planets[sign_lord]["house"])
        lord_from_moon = ((int(planets[sign_lord]["sign_idx"]) - moon_idx) % 12) + 1
        exalt_lord = SIGN_LORDS[SIGNS.index(EXALTATION_SIGNS[name])]
        exalt_lord_from_lagna = int(planets[exalt_lord]["house"])
        if lord_from_lagna in (1, 4, 7, 10) or lord_from_moon in (1, 4, 7, 10) or exalt_lord_from_lagna in (1, 4, 7, 10):
            neecha_evidence.append(f"{name}落陷；其落座主{sign_lord}或擢升座主{exalt_lord}位于Lagna/Moon角宫")
    if neecha_evidence:
        add("Neecha Bhanga", neecha_evidence, "A classical cancellation condition for a debilitated planet is met")

    moon_mars_diff = (int(planets["Moon"]["sign_idx"]) - int(planets["Mars"]["sign_idx"])) % 12
    if moon_mars_diff in (0, 6):
        add("Chandra-Mangal Yoga", ["Moon与Mars同座或互相七宫照"], "Moon and Mars are conjunct or mutually opposed")

    if int(planets["Sun"]["sign_idx"]) == int(planets["Mercury"]["sign_idx"]):
        add("Budha-Aditya Yoga", [f"Sun与Mercury同在{planets['Sun']['sign']}"], "Sun and Mercury occupy the same sign")

    lagna_lord, ninth_lord = lords[1], lords[9]
    lagna_strong = chart.get("dignity", {}).get(lagna_lord, {}).get("basic") in {"exalted", "own_sign", "great_friend"}
    ninth_strong = chart.get("dignity", {}).get(ninth_lord, {}).get("basic") in {"exalted", "own_sign", "great_friend"}
    if lagna_strong and ninth_strong and int(planets[ninth_lord]["house"]) in (1, 4, 5, 7, 9, 10):
        add("Lakshmi Yoga", [f"命主星{lagna_lord}与第9宫主{ninth_lord}均具强尊贵，第9宫主落角宫/三角宫"], "Strong Lagna and ninth lords with ninth lord in Kendra or Trikona")

    adjacent_to_moon = {
        (moon_idx - 1) % 12,
        (moon_idx + 1) % 12,
    }
    supporting_planets = [name for name in classical if name != "Sun" and int(planets[name]["sign_idx"]) in adjacent_to_moon]
    moon_conjunct = [name for name in classical if name not in {"Sun", "Moon"} and int(planets[name]["sign_idx"]) == moon_idx]
    moon_from_lagna = int(planets["Moon"]["house"])
    if not supporting_planets and not moon_conjunct and moon_from_lagna not in (1, 4, 7, 10):
        add("Kemadruma Yoga", ["Moon两侧相邻星座无非太阳古典行星、Moon无同座古典行星且不在Lagna角宫"], "Strict base condition after common cancellation checks")

    return yogas


def build_chart_json(
    chart: dict[str, Any],
    profile: dict[str, Any],
    calculation_meta: dict[str, Any],
) -> dict[str, Any]:
    lagna = chart["lagna"]
    lagna_lord = SIGN_LORDS[int(lagna["sign_idx"])]
    moon_nak = chart["planets"]["Moon"]["nakshatra"]
    return {
        "birth": {
            "date": profile.get("birthDate"),
            "time": profile.get("birthTime"),
            "place": profile.get("birthCity"),
            "latitude": calculation_meta.get("lat"),
            "longitude": calculation_meta.get("lon"),
            "timezone": calculation_meta.get("timezone"),
            "calculation": {
                "engine": calculation_meta.get("engine"),
                "version": calculation_meta.get("upstreamVersion"),
                "commit": calculation_meta.get("commit"),
                "ayanamsa": calculation_meta.get("ayanamsaMode"),
                "nodeMode": calculation_meta.get("nodeMode"),
                "houseSystem": "Whole Sign",
                "calculatedAt": calculation_meta.get("calculatedAt"),
                "validation": calculation_meta.get("validation", {}),
                "warnings": calculation_meta.get("warnings", []),
            },
        },
        "lagna": {
            "longitude": round(float(lagna["longitude"]), 8),
            "sign": lagna["sign"],
            "degrees": round(float(lagna["degree"]), 8),
            "degreesFormatted": lagna.get("deg_str"),
            "nakshatra": lagna.get("nakshatra"),
            "lord": {
                "planet": lagna_lord,
                "house": int(chart["planets"][lagna_lord]["house"]),
                "sign": chart["planets"][lagna_lord]["sign"],
            },
        },
        "planets": _normalize_planets(chart),
        "houses": _normalize_houses(chart),
        "nakshatra": {
            "moon": {
                "name": moon_nak.get("name"),
                "pada": moon_nak.get("pada"),
                "lord": moon_nak.get("lord"),
            }
        },
        "dasha": _normalize_dasha(chart),
        "navamsa": _normalize_d9(chart),
        "yogas": _detect_yogas(chart),
        "aspects": _normalize_aspects(chart),
        "shadbala": chart.get("shadbala", {}),
    }
