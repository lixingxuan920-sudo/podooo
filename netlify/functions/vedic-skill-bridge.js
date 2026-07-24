const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

// Production chart requests must remain fail-fast and professional-backend-only.

const REQUIRED_SKILLS = [
  "vedic-calculator",
  "vedic-core",
  "vedic-reader",
  "vedic-career",
  "vedic-love",
  "vedic-rectifier",
  "vedic-synastry"
];

const BUILT_IN_GUIDANCE = {
  "vedic-calculator": {
    role: "从出生日期、时间、地点、经纬度和时区生成吠陀占星结构化命盘，是所有判断的计算基座。",
    use: "唯一允许的计算来源是固定版本的专业后端；专业引擎不可用时必须 fail-fast。",
    rules: ["出生时间和地点必须优先校验", "Ayanamsa 默认 Lahiri", "不凭印象改动行星落座和宫位"]
  },
  "vedic-reader": {
    role: "把不同来源的星盘数据整理成可读的命盘叙事，强调数据来源、可信度和交叉校验。",
    use: "用于综合读盘、命盘摘要、从 PDF/JHora 类数据向核心分析过渡。",
    rules: ["准确性高于速度", "不确定的数据要标注限制", "PDF/JHora 数据可作为专业软件参考"]
  },
  "vedic-core": {
    role: "KN Rao/Parashari 口径的核心分析层，负责行星审计、分盘交叉、宫位诊断和 Dasha 逻辑。",
    use: "适合健康、家庭、学业、未来几年运势、综合人生方向等非单一专题。",
    rules: ["先说盘面证据，再说判断", "避免用用户经历反推结论", "术语必须翻译成人话"]
  },
  "vedic-career": {
    role: "职业与财富专题分析，重点看 10 宫、6 宫、2 宫、11 宫、D10、AmK、L10、强星和当前 Dasha。",
    use: "用户关注事业、财富、跳槽、创业、职业方向、赚钱模式时启用。",
    rules: ["职业建议只依据盘面结构", "不要把所有配置都硬解释成事业", "给出现实可执行路线"]
  },
  "vedic-love": {
    role: "感情、婚姻与桃花时机分析，重点看 5 宫、7 宫、Venus、Moon、DK、UL、D9 和 Dasha。",
    use: "用户关注感情、婚姻、复合、伴侣特质、恋爱时间窗口时启用。",
    rules: ["不制造关系焦虑", "区分恋爱机会、婚姻承诺和长期稳定性", "时间窗口要说明依据"]
  },
  "vedic-rectifier": {
    role: "出生时间校准，只在用户时间不准或分盘结论敏感时提出校时建议。",
    use: "用户说出生时间不确定，或上升、D9、D10 临界时提示需要重大事件校验。",
    rules: ["不能伪造精确校时", "只说明哪些结论会受影响", "引导用户补充 5 个重大人生事件"]
  },
  "vedic-synastry": {
    role: "吠陀合盘分析，比较两份命盘的月宿、宫位触发、DK/UL、Dasha 同步和关系承载力。",
    use: "用户提供两个人出生信息，或明确要求合盘、婚配、合作搭档分析时启用。",
    rules: ["缺少第二份完整资料时必须降级说明", "不混入西方合成盘体系", "关系类型由用户提供，不靠盘面猜"]
  }
};

function uniqueByPath(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.path || seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
}

function getSkillRoots() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
  const envRoots = (process.env.VEDIC_SKILLS_ROOT || "")
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => ({ label: `env-${index + 1}`, path: item }));

  return uniqueByPath([
    ...envRoots,
    { label: "desktop", path: path.join(os.homedir(), "Desktop", "skills") },
    { label: "codex", path: path.join(codexHome, "skills") }
  ]);
}

function getSkillStatus(roots) {
  return REQUIRED_SKILLS.map((name) => {
    const candidates = roots.map((root) => {
      const skillPath = path.join(root.path, name);
      return {
        label: root.label,
        path: skillPath,
        installed: fs.existsSync(path.join(skillPath, "SKILL.md"))
      };
    });
    const found = candidates.find((candidate) => candidate.installed);
    return {
      name,
      path: found?.path || candidates[0]?.path || "",
      source: found?.label || "built-in",
      installed: Boolean(found),
      candidates
    };
  });
}

function hasPartnerData(options) {
  const partner = options.partner || {};
  return Boolean(partner.birthDate && partner.birthTime && partner.birthCity);
}

function routeForOptions(options) {
  const focus = `${options.focusArea || ""} ${options.vedicModule || ""}`.toLowerCase();
  let primary = "vedic-core";
  let reason = "综合命盘与人生主题";

  if (hasPartnerData(options) || /合盘|婚配|synastry|partner|matching|关系对比/.test(focus)) {
    primary = "vedic-synastry";
    reason = "检测到合盘或第二人出生资料";
  } else if (/事业|职业|工作|跳槽|转行|创业|财富|钱|收入|career|wealth|business/.test(focus)) {
    primary = "vedic-career";
    reason = "用户最关心事业或财富";
  } else if (/婚姻|感情|恋爱|桃花|复合|伴侣|爱情|love|relationship|marriage/.test(focus)) {
    primary = "vedic-love";
    reason = "用户最关心感情或婚姻";
  } else if (/校时|校准|矫正|出生时间不准|rectifier|rectification/.test(focus)) {
    primary = "vedic-rectifier";
    reason = "用户需要出生时间校准";
  }

  const modules = ["vedic-calculator", "vedic-reader", "vedic-core"];
  if (!modules.includes(primary)) modules.push(primary);
  if (primary === "vedic-synastry" && !modules.includes("vedic-love")) modules.push("vedic-love");
  if ((options.timePrecision || "").includes("不") && !modules.includes("vedic-rectifier")) {
    modules.push("vedic-rectifier");
  }

  return {
    focusArea: options.focusArea || "",
    requestedModule: options.vedicModule || "",
    primary,
    modules,
    reason
  };
}

function compactText(value, maxLength = 1600) {
  const text = String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function extractImportantSkillText(markdown) {
  const lines = String(markdown || "").split(/\n/);
  const picked = lines.filter((line) => (
    /Role|核心|原则|规则|数据|输出|职业|感情|合盘|校准|Dasha|D9|D10|SAV|Shadbala|禁止|必须|Step|Phase|Layer/i.test(line)
  ));
  return (picked.length ? picked : lines).slice(0, 90).join("\n");
}

function readSkillGuidance(route, skills) {
  return route.modules.map((name) => {
    const status = skills.find((item) => item.name === name);
    const fallback = BUILT_IN_GUIDANCE[name] || {};
    let excerpt = "";
    if (status?.installed) {
      try {
        const markdown = fs.readFileSync(path.join(status.path, "SKILL.md"), "utf8");
        excerpt = compactText(extractImportantSkillText(markdown), 1800);
      } catch {
        excerpt = "";
      }
    }
    return {
      name,
      source: status?.installed ? status.source : "built-in",
      role: fallback.role || "",
      use: fallback.use || "",
      rules: fallback.rules || [],
      excerpt: excerpt || compactText(`${fallback.role}\n${fallback.use}\n${(fallback.rules || []).join("\n")}`, 1200)
    };
  });
}

function dmsToDecimal(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim();
  if (!text) return null;
  const numeric = Number(text);
  if (Number.isFinite(numeric)) return numeric;
  const match = text.match(/^(\d+(?:\.\d+)?)([NSEW])\s*(?:(\d+)')?\s*(?:(\d+(?:\.\d+)?)")?/i);
  if (!match) return null;
  const degree = Number(match[1]);
  const direction = match[2].toUpperCase();
  const minute = Number(match[3] || 0);
  const second = Number(match[4] || 0);
  let decimal = degree + minute / 60 + second / 3600;
  if (direction === "S" || direction === "W") decimal *= -1;
  return decimal;
}

function timezoneToIana(profile, longitude) {
  const city = String(profile.birthCity || "").toLowerCase();
  const timezone = String(profile.timezone || "").toLowerCase();
  if (city.includes("south grafton") || city.includes("massachusetts") || timezone.includes("-04") || timezone.includes("-05")) {
    return "America/New_York";
  }
  if (city.includes("india") || city.includes("delhi") || city.includes("mumbai") || timezone.includes("05:30")) {
    return "Asia/Kolkata";
  }
  if (city.includes("hong") || city.includes("香港")) return "Asia/Hong_Kong";
  if (city.includes("taipei") || city.includes("台北")) return "Asia/Taipei";
  if (timezone.includes("+08") || city.includes("china") || /北京|上海|广州|深圳|西宁|成都|重庆|武汉|南京|杭州|西安/.test(city)) {
    return "Asia/Shanghai";
  }
  const lon = Number(longitude);
  if (Number.isFinite(lon) && lon > 68 && lon < 98) return "Asia/Kolkata";
  return "Asia/Shanghai";
}

function findPython(calculatorPath) {
  const candidates = [
    process.env.VEDIC_PYTHON,
    path.join(calculatorPath, "venv", "Scripts", "python.exe"),
    path.join(calculatorPath, "venv", "bin", "python"),
    path.join(process.cwd(), "vedic-calc-env", "Scripts", "python.exe"),
    path.join(process.cwd(), "vedic-calc-env", "bin", "python"),
    path.join(process.cwd(), "venv", "Scripts", "python.exe"),
    path.join(process.cwd(), "venv", "bin", "python"),
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python313", "python.exe"),
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python312", "python.exe"),
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python311", "python.exe"),
    "C:\\Python313\\python.exe",
    "C:\\Python312\\python.exe",
    "C:\\Python311\\python.exe"
  ].filter(Boolean);
  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  if (existing) return existing;
  for (const command of ["python", "py"]) {
    const check = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 8000 });
    if (check.status === 0) return command;
  }
  return null;
}

function runCalculator(profile, options, calculatorPath) {
  const scriptsPath = path.join(calculatorPath, "scripts");
  const pythonPath = findPython(calculatorPath);
  if (!pythonPath) {
    return {
      ok: false,
      reason: "未找到可用的固定版本 vedic-calculator 专业引擎。"
    };
  }

  const [year, month, day] = String(profile.birthDate || "").split("-").map(Number);
  const [hourRaw, minuteRaw, secondRaw] = String(profile.birthTime || "12:00").split(":").map(Number);
  const second = Number.isFinite(secondRaw) ? secondRaw : Number(profile.birthSecond || 0);
  const lat = dmsToDecimal(profile.latitude);
  const lon = dmsToDecimal(profile.longitude);
  if (![year, month, day, hourRaw, minuteRaw, lat, lon].every(Number.isFinite)) {
    return {
      ok: false,
      reason: "出生日期、时间或经纬度不完整，无法调用 vedic-calculator。"
    };
  }

  const payload = {
    year,
    month,
    day,
    hour: hourRaw,
    minute: minuteRaw,
    second: Number.isFinite(second) ? second : 0,
    lat,
    lon,
    tz: timezoneToIana(profile, lon),
    meta: {
      dob: profile.birthDate,
      time: profile.birthSecond && String(profile.birthTime || "").split(":").length < 3
        ? `${profile.birthTime}:${profile.birthSecond}`
        : profile.birthTime,
      place: profile.birthCity || "",
      lat,
      lon,
      latitude_dms: profile.latitude || "",
      longitude_dms: profile.longitude || "",
      timezone_text: profile.timezone || "",
      timezone_hour: profile.timezoneHour || "",
      timezone_minute: profile.timezoneMinute || "",
      timezone_direction: profile.timezoneDirection || "",
      daylight_saving: Boolean(profile.daylightSaving),
      use_lmt: Boolean(profile.useLmt),
      altitude_m: profile.altitude || "",
      atmospheric_pressure_hpa: profile.atmosphericPressure || "",
      atmospheric_temperature_c: profile.atmosphericTemperature || "",
      time_precision: options.timePrecision || (profile.birthSecond ? "秒级输入" : "精确到分钟"),
      time_source: options.timeSource || "用户输入",
      effective_precision: profile.birthSecond ? "D1星历秒级输入；PyJHora量化层按分钟接口校验" : "分钟级"
    },
    user: {
      gender: options.gender || "[待填]",
      relationship: options.relationship || "[待填]"
    }
  };

  const code = `
import json, sys, io, contextlib
payload = json.loads(sys.stdin.read())
noise = io.StringIO()
with contextlib.redirect_stdout(noise):
    sys.path.insert(0, ${JSON.stringify(scriptsPath)})
    from engine import calculate_full_chart
    from formatter import format_structured_data
    chart = calculate_full_chart(
        payload["year"], payload["month"], payload["day"],
        payload["hour"], payload["minute"],
        payload["lat"], payload["lon"], payload["tz"],
        second=payload.get("second", 0)
    )
    structured = format_structured_data(chart, None, payload["meta"], payload["user"])
print(json.dumps({
    "structuredDataMarkdown": structured,
    "calculationMeta": {
        "engine": "vedic-calculator",
        "timezone": payload["tz"],
        "lat": payload["lat"],
        "lon": payload["lon"],
        "second": payload.get("second", 0),
        "warnings": chart.get("calculation_warnings", [])
    }
}, ensure_ascii=False))
`;

  const result = spawnSync(pythonPath, ["-c", code], {
    input: JSON.stringify(payload),
    cwd: scriptsPath,
    encoding: "utf8",
    env: {
      ...process.env,
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8"
    },
    timeout: 90000,
    maxBuffer: 8 * 1024 * 1024
  });

  if (result.error) {
    return { ok: false, reason: result.error.message };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      reason: (result.stderr || result.stdout || "vedic-calculator 执行失败").slice(0, 1200)
    };
  }
  try {
    return { ok: true, ...JSON.parse(result.stdout.trim()) };
  } catch {
    return {
      ok: false,
      reason: "vedic-calculator 输出无法解析。",
      raw: result.stdout.slice(0, 1200)
    };
  }
}

async function callProfessionalCalculator(payload) {
  const baseUrl = String(process.env.VEDIC_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) {
    return { ok: false, reason: "专业排盘服务地址未配置。" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${baseUrl}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.VEDIC_API_KEY ? { "X-Vedic-Api-Key": process.env.VEDIC_API_KEY } : {})
      },
      body: JSON.stringify({
        profile: payload.profile || {},
        options: payload.options || {}
      }),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) {
      return { ok: false, reason: body.detail || body.error || `专业排盘服务返回 HTTP ${response.status}` };
    }
    const meta = body.calculationMeta || {};
    const chart = body.professionalChart || {};
    const validation = meta.validation || chart.validation || {};
    const requiredPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    const completePlanets = requiredPlanets.every((name) => chart.planets?.[name]);
    const hardChecks = {
      sav337: validation.savTotal === 337 && validation.savValid === true,
      planetsComplete: completePlanets && validation.planetCountValid === true,
      nodesOpposite: validation.rahuKetuValid === true,
      lahiri: /Lahiri|TRUE_CITRA/i.test(`${meta.ayanamsaMode || ""} ${meta.ayanamsa || ""}`),
      meanNode: /Mean Node/i.test(String(meta.nodeMode || validation.nodeMode || "")),
      d9: Boolean(chart.d9 || chart.divisional_charts?.D9),
      d10: Boolean(chart.d10 || chart.divisional_charts?.D10),
      dasha: Array.isArray(chart.dashas) && chart.dashas.length > 0,
      structuredData: String(body.structuredDataMarkdown || "").includes("structured_data") || String(body.structuredDataMarkdown || "").length > 500
    };
    const failed = Object.entries(hardChecks).filter(([, passed]) => !passed).map(([name]) => name);
    if (failed.length) return { ok: false, reason: `专业排盘硬校验失败：${failed.join(", ")}` };
    return {
      ok: true,
      structuredDataMarkdown: body.structuredDataMarkdown,
      professionalChart: chart,
      evidenceLedger: body.evidenceLedger || {},
      calculationMeta: { ...meta, validation: { ...validation, hardChecks } },
      source: "vedic-calculator"
    };
  } catch (error) {
    return { ok: false, reason: error.name === "AbortError" ? "专业排盘服务超时。" : `专业排盘服务不可用：${error.message}` };
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const options = payload.options || {};
  const roots = getSkillRoots();
  const skills = getSkillStatus(roots);
  const activeRoute = routeForOptions(options);
  const skillGuidance = readSkillGuidance(activeRoute, skills);
  const allInstalled = REQUIRED_SKILLS.every((name) => skills.find((item) => item.name === name)?.installed);
  const calculator = await callProfessionalCalculator(payload);
  if (!calculator.ok) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        ok: false,
        error: "专业星历计算暂时失败，请稍后重试",
        reason: calculator.reason,
        bridge: { installed: allInstalled, skills, roots, source: "professional-backend", calculatorReady: false, reason: calculator.reason, activeRoute }
      })
    };
  }

  const body = {
    ok: true,
    bridge: {
      installed: allInstalled,
      skills,
      roots,
      source: calculator.source,
      calculatorReady: true,
      reason: "",
      activeRoute
    },
    activeRoute,
    skillGuidance,
    structuredDataMarkdown: calculator.structuredDataMarkdown || "",
    professionalChart: calculator.professionalChart,
    evidenceLedger: calculator.evidenceLedger,
    calculationMeta: calculator.calculationMeta
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
};
