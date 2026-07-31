from __future__ import annotations

import math
import os
import threading
import uuid
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import swisseph as swe
import urllib.error
import urllib.request
import json
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from vedic_skill_rules import LIFE_BLUEPRINT_SKILL_RULES, VEDIC_SKILL_SOURCE
from vedic_calculator_adapter import calculate_professional_chart


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
    skillResult: dict[str, Any] = Field(default_factory=dict)
    chartData: dict[str, Any] = Field(default_factory=dict)
    pdfReferenceData: dict[str, Any] = Field(default_factory=dict)
    blueprint: str | None = None
    masterReading: str | None = None
    masterSummary: str | None = None
    question: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)


app = FastAPI(title="Luna Vedic Ephemeris API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()


def require_api_key(x_vedic_api_key: str | None) -> None:
    expected = os.getenv("VEDIC_API_KEY", "").strip()
    if expected and x_vedic_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid VEDIC_API_KEY")


def model_config() -> dict[str, str]:
    providers = {
        "deepseek": {"api_key": os.getenv("DEEPSEEK_API_KEY", ""), "base_url": os.getenv("DEEPSEEK_BASE_URL") or os.getenv("DEEPSEEK_API_BASE") or "https://api.deepseek.com", "model": os.getenv("DEEPSEEK_MODEL") or "deepseek-chat"},
        "openai": {"api_key": os.getenv("OPENAI_API_KEY", ""), "base_url": os.getenv("OPENAI_BASE_URL") or os.getenv("OPENAI_API_BASE") or "https://api.openai.com/v1", "model": os.getenv("OPENAI_MODEL") or "gpt-4o-mini"},
        "ccswitch": {"api_key": os.getenv("CCSWITCH_API_KEY") or os.getenv("API_KEY", ""), "base_url": os.getenv("CCSWITCH_BASE_URL") or "https://api.openai.com/v1", "model": os.getenv("CCSWITCH_MODEL") or "gpt-4o-mini"},
    }
    requested = (os.getenv("AI_PROVIDER") or os.getenv("MODEL_PROVIDER") or "").lower()
    provider = requested if requested in providers and providers[requested]["api_key"] else next((name for name in ("deepseek", "openai", "ccswitch") if providers[name]["api_key"]), requested or "deepseek")
    selected = providers.get(provider, providers["deepseek"])
    api_key = selected["api_key"].strip()
    base_url = selected["base_url"].rstrip("/")
    model = selected["model"]
    chat_url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
    return {"api_key": api_key, "chat_url": chat_url, "model": model, "provider": provider}


def clip(value: Any, max_length: int = 16000) -> str:
    text = value if isinstance(value, str) else json.dumps(value or {}, ensure_ascii=False, indent=2)
    if len(text) <= max_length:
        return text
    return f"{text[:max_length]}\n[内容过长，已截取]"


def clean_reading(text: str) -> str:
    import re

    text = re.sub(r"^#{1,6}\s*", "", str(text or ""), flags=re.M)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"^\s*[-*]\s+", "", text, flags=re.M)
    return text.strip()


def call_deepseek(prompt: str, mode: str) -> str:
    cfg = model_config()
    if not cfg["api_key"]:
        raise RuntimeError("DeepSeek API key is not configured on Render")
    system_prompt = (
        "你是高级吠陀占星顾问。当前是连续咨询模式：只回答用户本次问题，必须引用已保存 Life Blueprint、历史对话和结构化星盘数据，不要重新生成完整报告。"
        if mode == "qa"
        else "你是高级吠陀占星顾问。当前是 Life Blueprint 长报告模式：严格执行提示词中的 Vedic Astro Skills v7.0 解读规则，像真实咨询师一样深入、连贯、可落地。"
    )
    body = {
        "model": cfg["model"],
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.62,
        "max_tokens": 4200 if mode == "qa" else 12000,
    }
    request = urllib.request.Request(
        cfg["chat_url"],
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {cfg['api_key']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=260) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Model request failed: {detail[:800]}") from exc
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    return clean_reading(content)


def build_blueprint_prompt(payload: VedicRequest, chart_result: dict[str, Any]) -> str:
    profile = payload.profile
    options = payload.options
    chart_data = payload.chartData or {}
    structured = chart_result.get("structuredDataMarkdown") or chart_data.get("structuredDataMarkdown") or ""
    return f"""
你是一位拥有二十年以上咨询经验的印度占星咨询师。
请根据下面所有盘的数据，写一份完整的 Life Blueprint。
不要简单列点，必须像真实咨询师面对面咨询一样，每个主题都深入解释原因、命盘依据、人格形成、优势、阻碍、现实表现、内在心理、建议。

当前启用的上游解读 Skill：
{clip(VEDIC_SKILL_SOURCE, 1200)}

Vedic Astro Skills 解读规则（优先执行）：
{LIFE_BLUEPRINT_SKILL_RULES}

要求：
1. 目标长度 8000 到 15000 字。不是摘要，是真正完整咨询。
2. 必须引用结构化星盘数据，不能空泛。
3. 不要制造恐惧，不要绝对化判断。
4. 当前后端如果没有完整 D9、D10、Shadbala、SAV/BAV 或瑜伽量化，不要伪造，要说明限制，并基于 D1、Nakshatra、Dasha 做可用判断。
5. 不要输出 Markdown 符号标题，直接写章节标题。

Life Blueprint 必须包含：
第一章 灵魂主题：为什么来到这一世、人生主线、业力方向。
第二章 人格分析：Asc、Moon、Sun、Nakshatra、心理模式、行为模式、潜意识。
第三章 家庭成长：父母影响、童年、情绪模式。
第四章 学习能力：天赋、思维方式、适合学习什么。
第五章 事业蓝图：D10、职业方向、创业、管理、媒体、艺术、AI、自由职业、适合行业以及为什么。
第六章 财富模式：赚钱方式、财富来源、容易漏财的位置、资产配置建议。
第七章 感情模式：择偶、恋爱、婚姻、业力关系、婚后模式。
第八章 健康：容易出现的问题、生活建议。不能做医疗诊断。
第九章 Dasha 大运分析：未来十年、重点年份、转折点。
第十章 人生建议：应该放弃什么、应该坚持什么、真正适合的人生道路。
Executive Summary：用咨询师语气总结。

用户资料：
{clip(profile, 6000)}

用户关注：
{clip(options, 3000)}

结构化星盘数据：
{clip(structured, 26000)}

计算元数据：
{clip(chart_result.get("calculationMeta"), 8000)}

网页/缓存星盘数据：
{clip(chart_data, 12000)}
"""


def build_chat_prompt(payload: VedicRequest) -> str:
    blueprint = payload.blueprint or payload.masterReading or ""
    return f"""
你是长期跟进同一位用户的印度占星咨询师。
请基于 Life Blueprint、结构化星盘数据和历史聊天，回答用户当前问题。
不要重新生成整份报告，不要重复介绍命盘。
回答要像继续咨询：先直接回答，再说明盘面依据、现实趋势和行动建议。

用户问题：
{payload.question or ""}

Life Blueprint：
{clip(blueprint, 30000)}

历史聊天：
{clip(payload.history, 9000)}

结构化星盘数据：
{clip(payload.chartData or payload.chart, 18000)}
"""


def set_job(job_id: str, **updates: Any) -> None:
    with JOBS_LOCK:
        current = JOBS.get(job_id, {})
        current.update(updates)
        current["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        JOBS[job_id] = current


def run_blueprint_job(job_id: str, payload: VedicRequest) -> None:
    try:
        set_job(job_id, status="running", step="calculate_chart", progress=20)
        chart_result = calculate_chart(payload.profile)
        chart_data = {
            "profile": payload.profile,
            "options": payload.options,
            "chart": payload.chart,
            "structuredDataMarkdown": chart_result["structuredDataMarkdown"],
            "calculationMeta": chart_result["calculationMeta"],
        }
        set_job(job_id, status="running", step="generate_blueprint", progress=55, chartData=chart_data)
        blueprint = call_deepseek(build_blueprint_prompt(payload, chart_result), "master")
        summary = " ".join(blueprint.split())[:500]
        set_job(
            job_id,
            status="completed",
            step="completed",
            progress=100,
            blueprint=blueprint,
            chartData=chart_data,
            summary=summary,
            createdAt=datetime.utcnow().isoformat() + "Z",
        )
    except Exception as exc:
        set_job(job_id, status="failed", step="failed", progress=100, error=str(exc))


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


def calculate_chart(
    profile: dict[str, Any],
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return calculate_professional_chart(profile, options)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "ok": "true",
        "engine": "vedic-calculator",
        "upstreamVersion": "v7.0",
        "commit": "7a6e33e23dc1f45107af2f249848241bb4d22b67",
        "ayanamsa": "TRUE_CITRA / Lahiri",
        "nodeMode": "Mean Node",
        "schema": "podo.vedic.chart.v1",
    }


@app.post("/calculate")
def calculate(payload: VedicRequest, x_vedic_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(x_vedic_api_key)
    result = calculate_chart(payload.profile, payload.options)
    return {"ok": True, **result}


@app.post("/blueprint/start")
def start_blueprint(payload: VedicRequest, x_vedic_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(x_vedic_api_key)
    job_id = uuid.uuid4().hex
    set_job(
      job_id,
      id=job_id,
      status="queued",
      step="queued",
      progress=0,
      createdAt=datetime.utcnow().isoformat() + "Z",
    )
    thread = threading.Thread(target=run_blueprint_job, args=(job_id, payload), daemon=True)
    thread.start()
    return {"ok": True, "jobId": job_id, "status": "queued"}


@app.get("/blueprint/{job_id}")
def get_blueprint_job(job_id: str, x_vedic_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(x_vedic_api_key)
    with JOBS_LOCK:
        job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Blueprint job not found")
    return {"ok": True, **job}


@app.post("/chat")
def chat(payload: VedicRequest, x_vedic_api_key: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(x_vedic_api_key)
    answer = call_deepseek(build_chat_prompt(payload), "qa")
    return {"ok": True, "answer": answer, "createdAt": datetime.utcnow().isoformat() + "Z"}
