const path = require("path");
const swe = require("sweph");

// Swiss Ephemeris constants from swephexp.h (library version 2.10.03).
const C = Object.freeze({
  GREG_CAL: 1,
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  MEAN_NODE: 10,
  FLG_SWIEPH: 2,
  FLG_SPEED: 256,
  FLG_SIDEREAL: 65536,
  SIDM_LAHIRI: 1
});

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
const PLANETS = [["Sun", C.SUN], ["Moon", C.MOON], ["Mars", C.MARS], ["Mercury", C.MERCURY], ["Jupiter", C.JUPITER], ["Venus", C.VENUS], ["Saturn", C.SATURN]];
const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const NAKSHATRAS = [
  ["Ashwini", "Ketu"], ["Bharani", "Venus"], ["Krittika", "Sun"], ["Rohini", "Moon"], ["Mrigashira", "Mars"], ["Ardra", "Rahu"],
  ["Punarvasu", "Jupiter"], ["Pushya", "Saturn"], ["Ashlesha", "Mercury"], ["Magha", "Ketu"], ["Purva Phalguni", "Venus"],
  ["Uttara Phalguni", "Sun"], ["Hasta", "Moon"], ["Chitra", "Mars"], ["Swati", "Rahu"], ["Vishakha", "Jupiter"],
  ["Anuradha", "Saturn"], ["Jyeshtha", "Mercury"], ["Mula", "Ketu"], ["Purva Ashadha", "Venus"], ["Uttara Ashadha", "Sun"],
  ["Shravana", "Moon"], ["Dhanishta", "Mars"], ["Shatabhisha", "Rahu"], ["Purva Bhadrapada", "Jupiter"],
  ["Uttara Bhadrapada", "Saturn"], ["Revati", "Mercury"]
];
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const KARAKA_NAMES = ["AK", "AmK", "BK", "MK", "PK", "GK", "DK"];

let configured = false;
function configureSwissEphemeris() {
  if (configured) return;
  swe.set_ephe_path(path.join(__dirname, "ephe"));
  swe.set_sid_mode(C.SIDM_LAHIRI, 0, 0);
  configured = true;
}

function normalizeLongitude(value) {
  return ((Number(value) % 360) + 360) % 360;
}

function dmsToDecimal(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const text = String(value || "").trim();
  const match = text.match(/^(\d+(?:\.\d+)?)[°\s]*([NSEW])?(?:\s*(\d+)[′']?)?(?:\s*(\d+(?:\.\d+)?)[″"]?)?$/i);
  if (!match) return null;
  let decimal = Number(match[1]) + Number(match[3] || 0) / 60 + Number(match[4] || 0) / 3600;
  if (["S", "W"].includes(String(match[2] || "").toUpperCase())) decimal *= -1;
  return decimal;
}

function fixedOffsetMinutes(profile) {
  const text = `${profile.timezone || ""} ${profile.timezoneOffset || ""}`;
  const match = text.match(/(?:UTC|GMT)?\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i);
  if (match) return (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] || 0));
  const direction = String(profile.timezoneDirection || "").toLowerCase();
  const hour = Number(profile.timezoneHour);
  const minute = Number(profile.timezoneMinute || 0);
  if (Number.isFinite(hour) && (direction.includes("east") || direction.includes("west"))) {
    return (direction.includes("west") ? -1 : 1) * (hour * 60 + minute);
  }
  return null;
}

function inferIanaTimezone(profile, longitude) {
  const explicit = String(profile.timezone || "").trim();
  if (explicit.includes("/")) return explicit;
  const city = String(profile.birthCity || "").toLowerCase();
  if (/singapore|新加坡/.test(city)) return "Asia/Singapore";
  if (/hong kong|香港/.test(city)) return "Asia/Hong_Kong";
  if (/taipei|台北/.test(city)) return "Asia/Taipei";
  if (/tokyo|东京|日本/.test(city)) return "Asia/Tokyo";
  if (/delhi|mumbai|india|印度/.test(city)) return "Asia/Kolkata";
  if (/london|伦敦/.test(city)) return "Europe/London";
  if (/new york|纽约/.test(city)) return "America/New_York";
  if (/los angeles|洛杉矶/.test(city)) return "America/Los_Angeles";
  if (/北京|上海|广州|深圳|成都|重庆|武汉|南京|杭州|西安|china|中国/.test(city)) return "Asia/Shanghai";
  if (longitude >= 68 && longitude <= 98) return "Asia/Kolkata";
  if (longitude >= 100 && longitude <= 125) return "Asia/Shanghai";
  return "UTC";
}

function localPartsAt(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(timestamp));
  return Object.fromEntries(parts.filter((item) => item.type !== "literal").map((item) => [item.type, Number(item.value)]));
}

function localToUtcMillis(parts, profile, longitude) {
  const nominal = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond || 0);
  const fixed = fixedOffsetMinutes(profile);
  if (fixed !== null) return nominal - fixed * 60000;
  const timeZone = inferIanaTimezone(profile, longitude);
  let candidate = nominal;
  for (let i = 0; i < 2; i += 1) {
    const actual = localPartsAt(candidate, timeZone);
    const rendered = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    candidate += nominal - rendered;
  }
  return candidate;
}

function parseBirth(profile) {
  const dateMatch = String(profile.birthDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(profile.birthTime || "").match(/^(\d{1,2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/);
  if (!dateMatch || !timeMatch) throw new Error("出生日期或出生时间格式不完整。");
  const latitude = dmsToDecimal(profile.latitude);
  const longitude = dmsToDecimal(profile.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("真实星历计算需要出生地点的经纬度。");
  const secondValue = Number(timeMatch[3] || profile.birthSecond || 0);
  const wholeSecond = Math.floor(secondValue);
  const parts = {
    year: Number(dateMatch[1]), month: Number(dateMatch[2]), day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]), minute: Number(timeMatch[2]), second: wholeSecond,
    millisecond: Math.round((secondValue - wholeSecond) * 1000)
  };
  const utcMillis = localToUtcMillis(parts, profile, longitude);
  const utc = new Date(utcMillis);
  const utcHour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600 + utc.getUTCMilliseconds() / 3600000;
  return { ...parts, latitude, longitude, utc, utcMillis, utcHour, timeZone: fixedOffsetMinutes(profile) === null ? inferIanaTimezone(profile, longitude) : String(profile.timezone || "fixed offset") };
}

function degreeString(longitude) {
  const within = normalizeLongitude(longitude) % 30;
  let degree = Math.floor(within);
  let minute = Math.floor((within - degree) * 60);
  let second = Math.round((((within - degree) * 60) - minute) * 60);
  if (second === 60) { second = 0; minute += 1; }
  if (minute === 60) { minute = 0; degree += 1; }
  return `${degree}°${String(minute).padStart(2, "0")}′${String(second).padStart(2, "0")}″`;
}

function nakshatraFor(longitude) {
  const span = 360 / 27;
  const index = Math.floor(normalizeLongitude(longitude) / span) % 27;
  const pada = Math.floor((normalizeLongitude(longitude) % span) / (span / 4)) + 1;
  return { name: NAKSHATRAS[index][0], lord: NAKSHATRAS[index][1], pada, index };
}

function wholeSignHouse(signIndex, lagnaSignIndex) {
  return ((signIndex - lagnaSignIndex + 12) % 12) + 1;
}

function divisionSign(longitude, division) {
  const lon = normalizeLongitude(longitude);
  const sign = Math.floor(lon / 30);
  const within = lon % 30;
  if (division === 9) {
    const part = Math.floor(within / (30 / 9));
    const start = [0, 3, 6, 9].includes(sign) ? sign : ([1, 4, 7, 10].includes(sign) ? (sign + 8) % 12 : (sign + 4) % 12);
    return (start + part) % 12;
  }
  if (division === 10) {
    const part = Math.floor(within / 3);
    const start = sign % 2 === 0 ? sign : (sign + 8) % 12;
    return (start + part) % 12;
  }
  return sign;
}

function addYears(timestamp, years) {
  return timestamp + years * 365.2425 * 86400000;
}

function dashaTimeline(moonLongitude, birthMillis) {
  const nak = nakshatraFor(moonLongitude);
  const firstLord = nak.lord;
  const span = 360 / 27;
  const elapsed = (normalizeLongitude(moonLongitude) % span) / span;
  let start = addYears(birthMillis, -elapsed * DASHA_YEARS[firstLord]);
  const startIndex = DASHA_ORDER.indexOf(firstLord);
  const now = Date.now();
  const mahadashas = [];
  let currentMahadasha = null;
  for (let i = 0; i < 18; i += 1) {
    const lord = DASHA_ORDER[(startIndex + i) % DASHA_ORDER.length];
    const end = addYears(start, DASHA_YEARS[lord]);
    const item = { planet: lord, start, end, years: DASHA_YEARS[lord], isCurrent: start <= now && now < end };
    mahadashas.push(item);
    if (item.isCurrent) currentMahadasha = item;
    start = end;
  }
  const antardashas = [];
  if (currentMahadasha) {
    const mdIndex = DASHA_ORDER.indexOf(currentMahadasha.planet);
    let adStart = currentMahadasha.start;
    for (let i = 0; i < 9; i += 1) {
      const lord = DASHA_ORDER[(mdIndex + i) % 9];
      const adYears = currentMahadasha.years * DASHA_YEARS[lord] / 120;
      const adEnd = addYears(adStart, adYears);
      antardashas.push({ planet: lord, start: adStart, end: adEnd, isCurrent: adStart <= now && now < adEnd });
      adStart = adEnd;
    }
  }
  return { mahadashas, antardashas, currentMahadasha, currentAntardasha: antardashas.find((item) => item.isCurrent) || null };
}

function isoDate(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function formatStructuredData(profile, birth, result) {
  const lines = [
    "## 元信息", "", "```",
    `出生日期: ${profile.birthDate || ""}`,
    `出生时间: ${profile.birthTime || ""}`,
    `出生地点: ${profile.birthCity || ""} (${birth.longitude}, ${birth.latitude})`,
    `时区: ${birth.timeZone}`,
    "读盘方式: Swiss Ephemeris 2.10.03 本地函数计算",
    `Ayanamsa: Lahiri (${result.ayanamsa.toFixed(8)}°)`,
    "Node模式: Mean Node", "```", "",
    "## 计算声明", "",
    "> 行星经度、上升、宫位、月宿、D9、D10 与 Vimshottari 大运均由服务端 Swiss Ephemeris + Lahiri Ayanamsa 计算；星历文件随函数部署，不使用浏览器估算。Shadbala、SAV/BAV 仍未量化，解读不得伪造。", "",
    "## 用户信息", "", "```", `性别: ${profile.gender || "未填写"}`, `感情状态: ${profile.relationship || "未填写"}`, "```", "",
    "## D1基础数据", "", "### 行星位置", "| 行星 | 星座 | 宫位 | 度数 | 逆行 |", "|---|---|---:|---|---|"
  ];
  for (const name of ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]) {
    const item = name === "Lagna" ? result.lagna : result.planets[name];
    lines.push(`| ${name} | ${item.sign} | ${item.house} | ${item.degree} | ${item.retrograde ? "R" : "D"} |`);
  }
  lines.push("", "### Nakshatra", "| 行星 | Nakshatra | Pada | Nakshatra主 |", "|---|---|---:|---|");
  for (const name of ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]) {
    const item = name === "Lagna" ? result.lagna : result.planets[name];
    lines.push(`| ${name} | ${item.nakshatra.name} | ${item.nakshatra.pada} | ${item.nakshatra.lord} |`);
  }
  lines.push("", "### Chara Karakas（7K）", "| Karaka | 行星 | 宫内度数 |", "|---|---|---:|");
  result.karakas.forEach((item) => lines.push(`| ${item.karaka} | ${item.planet} | ${item.withinSign.toFixed(6)}° |`));
  lines.push("", "### 宫主表", "| 宫位 | 星座 | 宫主 | 宫主落宫 |", "|---:|---|---|---:|");
  result.houseLords.forEach((item) => lines.push(`| ${item.house} | ${item.sign} | ${item.lord} | ${item.lordHouse} |`));
  for (const [label, key] of [["D9 Navamsa", "d9"], ["D10 Dasamsa", "d10"]]) {
    lines.push("", `### ${label}`, "| 行星 | 星座 | 宫位 |", "|---|---|---:|");
    for (const name of ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]) {
      const item = result[key][name];
      lines.push(`| ${name} | ${item.sign} | ${item.house} |`);
    }
  }
  lines.push("", "### Vimshottari Dasha（Mahadasha）", "| 当前 | 行星 | 起始 | 结束 |", "|---|---|---|---|");
  result.dasha.mahadashas.forEach((item) => lines.push(`| ${item.isCurrent ? "→当前" : ""} | ${item.planet} | ${isoDate(item.start)} | ${isoDate(item.end)} |`));
  lines.push("", "### 当前 Antardasha", "| 当前 | 行星 | 起始 | 结束 |", "|---|---|---|---|");
  result.dasha.antardashas.forEach((item) => lines.push(`| ${item.isCurrent ? "→当前" : ""} | ${item.planet} | ${isoDate(item.start)} | ${isoDate(item.end)} |`));
  lines.push("", "## 量化限制", "", "Shadbala / SAV / BAV：当前 Netlify 星历后端未计算，Skill 解读必须明确限制，不得填入占位值。", "");
  return lines.join("\n");
}

function calculateVedicChart(profile = {}) {
  configureSwissEphemeris();
  const birth = parseBirth(profile);
  const jd = swe.julday(birth.utc.getUTCFullYear(), birth.utc.getUTCMonth() + 1, birth.utc.getUTCDate(), birth.utcHour, C.GREG_CAL);
  const flags = C.FLG_SWIEPH | C.FLG_SPEED | C.FLG_SIDEREAL;
  const ayanamsa = swe.get_ayanamsa_ut(jd);
  const houses = swe.houses_ex(jd, C.FLG_SIDEREAL, birth.latitude, birth.longitude, "P");
  if (!houses?.data?.points?.length) throw new Error("Swiss Ephemeris 无法计算上升点。");
  const ascendant = normalizeLongitude(houses.data.points[0]);
  const lagnaSign = Math.floor(ascendant / 30);
  const lagna = { longitude: ascendant, sign: SIGNS[lagnaSign], signIndex: lagnaSign, house: 1, degree: degreeString(ascendant), retrograde: false, nakshatra: nakshatraFor(ascendant) };
  const planets = {};
  for (const [name, id] of PLANETS) {
    const calculated = swe.calc_ut(jd, id, flags);
    if (!calculated?.data?.length) throw new Error(`Swiss Ephemeris 无法计算 ${name}。`);
    if (calculated.error && /not found|moshier/i.test(calculated.error)) {
      throw new Error(`Swiss Ephemeris 星历文件未正确加载（${name}）。`);
    }
    const longitude = normalizeLongitude(calculated.data[0]);
    const signIndex = Math.floor(longitude / 30);
    planets[name] = { longitude, sign: SIGNS[signIndex], signIndex, house: wholeSignHouse(signIndex, lagnaSign), degree: degreeString(longitude), retrograde: calculated.data[3] < 0, nakshatra: nakshatraFor(longitude) };
  }
  const node = swe.calc_ut(jd, C.MEAN_NODE, flags);
  if (!node?.data?.length) throw new Error("Swiss Ephemeris 无法计算月交点。");
  if (node.error && /not found|moshier/i.test(node.error)) {
    throw new Error("Swiss Ephemeris 星历文件未正确加载（月交点）。");
  }
  const rahuLongitude = normalizeLongitude(node.data[0]);
  for (const [name, longitude] of [["Rahu", rahuLongitude], ["Ketu", normalizeLongitude(rahuLongitude + 180)]]) {
    const signIndex = Math.floor(longitude / 30);
    planets[name] = { longitude, sign: SIGNS[signIndex], signIndex, house: wholeSignHouse(signIndex, lagnaSign), degree: degreeString(longitude), retrograde: true, nakshatra: nakshatraFor(longitude) };
  }
  const karakas = PLANETS.map(([name]) => ({ planet: name, withinSign: planets[name].longitude % 30 })).sort((a, b) => b.withinSign - a.withinSign).map((item, index) => ({ ...item, karaka: KARAKA_NAMES[index] }));
  const houseLords = Array.from({ length: 12 }, (_, index) => {
    const signIndex = (lagnaSign + index) % 12;
    const lord = SIGN_LORDS[signIndex];
    return { house: index + 1, sign: SIGNS[signIndex], lord, lordHouse: planets[lord].house };
  });
  const divisions = {};
  for (const [key, division] of [["d9", 9], ["d10", 10]]) {
    const divisionLagna = divisionSign(ascendant, division);
    const chart = { Lagna: { sign: SIGNS[divisionLagna], signIndex: divisionLagna, house: 1 } };
    Object.entries(planets).forEach(([name, item]) => {
      const signIndex = divisionSign(item.longitude, division);
      chart[name] = { sign: SIGNS[signIndex], signIndex, house: wholeSignHouse(signIndex, divisionLagna) };
    });
    divisions[key] = chart;
  }
  const dasha = dashaTimeline(planets.Moon.longitude, birth.utcMillis);
  const result = { ayanamsa, julianDay: jd, lagna, planets, karakas, houseLords, d9: divisions.d9, d10: divisions.d10, dasha };
  const structuredDataMarkdown = formatStructuredData(profile, birth, result);
  return {
    ok: true,
    structuredDataMarkdown,
    calculationMeta: {
      engine: "swiss-ephemeris-lahiri",
      ephemeris: "Swiss Ephemeris 2.10.03",
      ephemerisFiles: "sepl_18.se1 + semo_18.se1 + seas_18.se1",
      ayanamsaMode: "SIDM_LAHIRI",
      ayanamsa,
      nodeMode: "Mean Node",
      houseMode: "Whole Sign from Swiss Ephemeris sidereal Ascendant",
      timezone: birth.timeZone,
      lat: birth.latitude,
      lon: birth.longitude,
      julianDay: jd,
      warnings: ["Shadbala、SAV、BAV 尚未在 Netlify 星历后端量化；解读不得伪造这些数值。"]
    },
    chart: result
  };
}

module.exports = { calculateVedicChart };
