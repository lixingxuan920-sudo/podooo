const REQUIRED_KEYS = [
  "birth", "lagna", "planets", "houses", "nakshatra", "dasha",
  "navamsa", "yogas", "aspects", "shadbala"
];
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const DEBILITATION = { Sun: "Libra", Moon: "Scorpio", Mars: "Cancer", Mercury: "Pisces", Jupiter: "Capricorn", Venus: "Virgo", Saturn: "Aries" };
const EXALTATION = { Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo", Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra" };

function detectLegacyYogas(chart) {
  const p = chart.planets || {};
  const lagnaIndex = Number(chart.lagna?.sign_idx);
  const lords = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, SIGN_LORDS[(lagnaIndex + index) % 12]]));
  const yogas = [];
  const add = (name, evidence, rule) => yogas.push({ name, formed: true, evidence, rule });
  const connected = (a, b) => {
    const same = Number(p[a]?.sign_idx) === Number(p[b]?.sign_idx);
    const opposed = (Number(p[a]?.sign_idx) - Number(p[b]?.sign_idx) + 12) % 12 === 6;
    const exchange = SIGN_LORDS[Number(p[a]?.sign_idx)] === b && SIGN_LORDS[Number(p[b]?.sign_idx)] === a;
    return same || opposed || exchange;
  };
  const raja = new Set();
  [1, 4, 7, 10].forEach((kendra) => [1, 5, 9].forEach((trikona) => {
    const pair = [lords[kendra], lords[trikona]].sort();
    if (pair[0] !== pair[1] && connected(pair[0], pair[1])) raja.add(pair.join("/"));
  }));
  if (raja.size) add("Raja Yoga", [...raja].map((pair) => `${pair}形成合相、互容或互相七宫照`), "Kendra lord connects with Trikona lord");
  const wealthHouses = [2, 5, 9, 11];
  const dhana = new Set();
  wealthHouses.forEach((a, index) => wealthHouses.slice(index + 1).forEach((b) => {
    const pair = [lords[a], lords[b]].sort();
    if (pair[0] !== pair[1] && connected(pair[0], pair[1])) dhana.add(pair.join("/"));
  }));
  if (dhana.size) add("Dhana Yoga", [...dhana].map((pair) => `${pair}连接财富宫主`), "Lords of houses 2, 5, 9 or 11 connect");
  const vipreet = [6, 8, 12].filter((house) => [6, 8, 12].includes(Number(p[lords[house]]?.house)));
  if (vipreet.length) add("Vipreet Raja Yoga", vipreet.map((house) => `第${house}宫主${lords[house]}落第${p[lords[house]].house}宫`), "Dusthana lord occupies a Dusthana");
  const moonIndex = Number(p.Moon?.sign_idx);
  const jupiterFromMoon = ((Number(p.Jupiter?.sign_idx) - moonIndex + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupiterFromMoon)) add("Gajakesari Yoga", [`Jupiter位于Moon起算第${jupiterFromMoon}宫`], "Jupiter is in a Kendra from Moon");
  const exchanges = [];
  PLANETS.slice(0, 7).forEach((a, index) => PLANETS.slice(0, 7).slice(index + 1).forEach((b) => {
    if (SIGN_LORDS[Number(p[a]?.sign_idx)] === b && SIGN_LORDS[Number(p[b]?.sign_idx)] === a) exchanges.push(`${a}与${b}互换星座`);
  }));
  if (exchanges.length) add("Parivartana Yoga", exchanges, "Two sign lords occupy each other's signs");
  const neecha = PLANETS.slice(0, 7).filter((name) => p[name]?.sign === DEBILITATION[name]).filter((name) => {
    const signLord = SIGN_LORDS[Number(p[name].sign_idx)];
    const exaltLord = SIGN_LORDS[SIGNS.indexOf(EXALTATION[name])];
    const fromMoon = ((Number(p[signLord]?.sign_idx) - moonIndex + 12) % 12) + 1;
    return [1, 4, 7, 10].includes(Number(p[signLord]?.house)) || [1, 4, 7, 10].includes(fromMoon) || [1, 4, 7, 10].includes(Number(p[exaltLord]?.house));
  });
  if (neecha.length) add("Neecha Bhanga", neecha.map((name) => `${name}落陷且满足落陷取消角宫条件`), "A classical cancellation condition for a debilitated planet is met");
  const moonMars = (moonIndex - Number(p.Mars?.sign_idx) + 12) % 12;
  if ([0, 6].includes(moonMars)) add("Chandra-Mangal Yoga", ["Moon与Mars同座或互相七宫照"], "Moon and Mars are conjunct or mutually opposed");
  if (Number(p.Sun?.sign_idx) === Number(p.Mercury?.sign_idx)) add("Budha-Aditya Yoga", [`Sun与Mercury同在${p.Sun.sign}`], "Sun and Mercury occupy the same sign");
  const lagnaLord = lords[1];
  const ninthLord = lords[9];
  const strong = (name) => ["exalted", "own_sign", "great_friend"].includes(chart.dignity?.[name]?.basic);
  if (strong(lagnaLord) && strong(ninthLord) && [1, 4, 5, 7, 9, 10].includes(Number(p[ninthLord]?.house))) {
    add("Lakshmi Yoga", [`命主星${lagnaLord}与第9宫主${ninthLord}均具强尊贵，第9宫主落角宫/三角宫`], "Strong Lagna and ninth lords with ninth lord in Kendra or Trikona");
  }
  const adjacent = [(moonIndex + 11) % 12, (moonIndex + 1) % 12];
  const support = PLANETS.slice(0, 7).filter((name) => name !== "Sun" && adjacent.includes(Number(p[name]?.sign_idx)));
  const conjunctMoon = PLANETS.slice(0, 7).filter((name) => !["Sun", "Moon"].includes(name) && Number(p[name]?.sign_idx) === moonIndex);
  if (!support.length && !conjunctMoon.length && ![1, 4, 7, 10].includes(Number(p.Moon?.house))) {
    add("Kemadruma Yoga", ["Moon两侧无非太阳古典行星、无同座古典行星且不在Lagna角宫"], "Strict base condition after common cancellation checks");
  }
  return yogas;
}

function validateChartJson(chartJson) {
  const errors = [];
  if (!chartJson || typeof chartJson !== "object" || Array.isArray(chartJson)) {
    return { ok: false, errors: ["chartJson must be an object"] };
  }
  REQUIRED_KEYS.forEach((key) => {
    if (!(key in chartJson)) errors.push(`missing:${key}`);
  });
  if (!Array.isArray(chartJson.planets) || chartJson.planets.length !== 9) errors.push("planets:expected-nine");
  if (!PLANETS.every((name) => chartJson.planets?.some((planet) => planet.name === name))) errors.push("planets:incomplete");
  if (!Array.isArray(chartJson.houses) || chartJson.houses.length !== 12) errors.push("houses:expected-twelve");
  if (!chartJson.navamsa?.available || chartJson.navamsa?.planetPositions?.length !== 9) errors.push("navamsa:incomplete");
  if (!Array.isArray(chartJson.dasha?.mahadashas) || !chartJson.dasha.mahadashas.length) errors.push("dasha:missing");
  if (!Array.isArray(chartJson.yogas)) errors.push("yogas:not-array");
  if (!Array.isArray(chartJson.aspects)) errors.push("aspects:not-array");
  return { ok: errors.length === 0, errors };
}

function legacyChartJson(body, profile = {}) {
  const chart = body.professionalChart || {};
  const meta = body.calculationMeta || {};
  const lagna = chart.lagna || {};
  const lagnaIndex = Number(lagna.sign_idx);
  const planetsByName = chart.planets || {};
  const houses = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const signIndex = (lagnaIndex + index) % 12;
    const lord = SIGN_LORDS[signIndex];
    return {
      number,
      sign: SIGNS[signIndex],
      lord,
      lordHouse: planetsByName[lord]?.house ?? null,
      occupants: PLANETS.filter((name) => Number(planetsByName[name]?.house) === number)
    };
  });
  const planets = PLANETS.map((name) => {
    const raw = planetsByName[name] || {};
    const dignity = chart.dignity?.[name]?.basic || (name === "Rahu" || name === "Ketu" ? "not_standardized_for_nodes" : "unknown");
    return {
      name,
      longitude: raw.longitude,
      sign: raw.sign,
      house: raw.house,
      nakshatra: raw.nakshatra?.name,
      pada: raw.nakshatra?.pada,
      nakshatraLord: raw.nakshatra?.lord,
      retrograde: Boolean(raw.retrograde),
      combust: Boolean(chart.combustion?.[name]),
      combustionDistance: chart.combustion?.[name]?.distance ?? null,
      degrees: raw.degree,
      degreesFormatted: raw.deg_str,
      exaltation: dignity === "exalted",
      debilitation: dignity === "debilitated",
      ownSign: dignity === "own_sign",
      dignity: {
        status: dignity,
        exaltation: dignity === "exalted",
        debilitation: dignity === "debilitated",
        ownSign: dignity === "own_sign",
        applicable: name !== "Rahu" && name !== "Ketu"
      }
    };
  });
  const dashas = (chart.dashas || []).map((item) => ({
    planet: item.planet,
    start: item.start,
    end: item.end,
    years: item.years,
    current: Boolean(item.is_current),
    antardashas: (item.antardashas || []).map((sub) => ({
      planet: sub.planet, start: sub.start, end: sub.end, current: Boolean(sub.is_current)
    }))
  }));
  const currentMahadasha = dashas.find((item) => item.current) || null;
  const currentAntardasha = currentMahadasha?.antardashas.find((item) => item.current) || null;
  const d9 = chart.divisional_charts?.D9 || {};
  const d9LagnaIndex = Number(d9.Lagna?.sign_idx);
  const d9Positions = PLANETS.map((name) => ({
    name,
    sign: d9[name]?.sign,
    house: ((Number(d9[name]?.sign_idx) - d9LagnaIndex + 12) % 12) + 1,
    degrees: d9[name]?.degree
  }));
  const aspects = [];
  const aspectRules = { Sun: [7], Moon: [7], Mars: [4, 7, 8], Mercury: [7], Jupiter: [5, 7, 9], Venus: [7], Saturn: [3, 7, 10] };
  Object.entries(aspectRules).forEach(([name, numbers]) => {
    const source = planetsByName[name];
    numbers.forEach((aspect) => {
      const targetIndex = (Number(source.sign_idx) + aspect - 1) % 12;
      aspects.push({
        planet: name,
        aspect,
        fromHouse: source.house,
        toHouse: ((targetIndex - lagnaIndex + 12) % 12) + 1,
        toSign: SIGNS[targetIndex],
        aspectedPlanets: PLANETS.filter((other) => Number(planetsByName[other]?.sign_idx) === targetIndex),
        system: "Parashari sign-based graha drishti"
      });
    });
  });
  return {
    birth: {
      date: profile.birthDate,
      time: profile.birthTime,
      place: profile.birthCity,
      latitude: meta.lat,
      longitude: meta.lon,
      timezone: meta.timezone,
      calculation: {
        engine: meta.engine,
        version: meta.upstreamVersion,
        commit: meta.commit,
        ayanamsa: meta.ayanamsaMode,
        nodeMode: meta.nodeMode,
        houseSystem: "Whole Sign",
        calculatedAt: meta.calculatedAt,
        validation: meta.validation || chart.validation || {},
        warnings: [...(meta.warnings || []), "JSON由兼容层从Python v7结构化结果无损映射；天文数据未在JavaScript中重算。"]
      }
    },
    lagna: {
      longitude: lagna.longitude,
      sign: lagna.sign,
      degrees: lagna.degree,
      degreesFormatted: lagna.deg_str,
      nakshatra: lagna.nakshatra,
      lord: {
        planet: SIGN_LORDS[lagnaIndex],
        house: planetsByName[SIGN_LORDS[lagnaIndex]]?.house,
        sign: planetsByName[SIGN_LORDS[lagnaIndex]]?.sign
      }
    },
    planets,
    houses,
    nakshatra: { moon: planetsByName.Moon?.nakshatra || {} },
    dasha: {
      system: "Vimshottari",
      mahadashas: dashas,
      currentMahadasha: currentMahadasha ? { planet: currentMahadasha.planet, start: currentMahadasha.start, end: currentMahadasha.end } : null,
      currentAntardasha: currentAntardasha ? { planet: currentAntardasha.planet, start: currentAntardasha.start, end: currentAntardasha.end } : null
    },
    navamsa: {
      available: Boolean(d9.Lagna),
      ascendant: { longitude: d9.Lagna ? d9LagnaIndex * 30 + Number(d9.Lagna.degree || 0) : null, sign: d9.Lagna?.sign, degrees: d9.Lagna?.degree },
      houses: Array.from({ length: 12 }, (_, index) => ({
        number: index + 1,
        sign: SIGNS[(d9LagnaIndex + index) % 12],
        lord: SIGN_LORDS[(d9LagnaIndex + index) % 12],
        occupants: d9Positions.filter((item) => item.house === index + 1).map((item) => item.name)
      })),
      planetPositions: d9Positions
    },
    yogas: detectLegacyYogas(chart),
    aspects,
    shadbala: chart.shadbala || {}
  };
}

function getChartJson(body, profile) {
  const chartJson = body.chartJson || legacyChartJson(body, profile);
  const validation = validateChartJson(chartJson);
  return { chartJson, validation };
}

module.exports = { REQUIRED_KEYS, PLANETS, validateChartJson, getChartJson };
