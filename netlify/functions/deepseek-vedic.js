const { VEDIC_SKILL_SOURCE, LIFE_BLUEPRINT_SKILL_RULES } = require("./vedic-skill-rules.js");

function getModelConfig() {
  const requested = String(process.env.AI_PROVIDER || process.env.MODEL_PROVIDER || "").toLowerCase();
  const providers = {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.DEEPSEEK_BASE_URL || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com",
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat"
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    },
    ccswitch: {
      apiKey: process.env.CCSWITCH_API_KEY || process.env.API_KEY,
      baseUrl: process.env.CCSWITCH_BASE_URL || "https://api.openai.com/v1",
      model: process.env.CCSWITCH_MODEL || "gpt-4o-mini"
    }
  };
  const provider = providers[requested]?.apiKey
    ? requested
    : (["deepseek", "openai", "ccswitch"].find((name) => providers[name].apiKey) || requested || "deepseek");
  const selected = providers[provider] || providers.deepseek;
  const apiKey = selected.apiKey;
  const baseUrl = selected.baseUrl.replace(/\/$/, "");
  const model = selected.model === "deepseek-chat" && !baseUrl.includes("api.deepseek.com")
    ? "deepseek-v4-flash"
    : selected.model;
  const chatUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  return { apiKey, chatUrl, model, provider };
}

function clip(value, maxLength = 10000) {
  const text = typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n[内容过长，已截取关键前半部分]`;
}

function cleanReading(text) {
  return String(text || "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^-{3,}\s*$/gm, "")
    .trim();
}

function parseMarkdownTable(markdown, heading) {
  const text = String(markdown || "");
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const section = text.match(new RegExp(`${escaped}([\\s\\S]*?)(?:\\n### |\\n## |$)`));
  if (!section) return [];
  return section[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/---/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length > 1);
}

function parseMeta(markdown) {
  const text = String(markdown || "");
  const pick = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*([^\\n]+)`));
    return match ? match[1].trim() : "";
  };
  return {
    birthDate: pick("出生日期"),
    birthTime: pick("出生时间"),
    birthPlace: pick("出生地点"),
    precision: pick("有效精度") || pick("时间精度"),
    method: pick("读盘方式"),
    ayanamsa: pick("Ayanamsa"),
    nodeMode: pick("Node模式")
  };
}

function buildChartDataDigest(skillResult, profile, options) {
  const markdown = skillResult?.structuredDataMarkdown || "";
  const meta = parseMeta(markdown);
  const positions = parseMarkdownTable(markdown, "### 行星位置")
    .filter((row) => row[0] !== "行星")
    .map((row) => ({
      body: row[0],
      sign: row[1],
      house: row[2],
      degree: row[3],
      motion: row[4]
    }));
  const nakshatras = parseMarkdownTable(markdown, "### Nakshatra")
    .filter((row) => row[0] !== "行星")
    .map((row) => ({
      body: row[0],
      nakshatra: row[1],
      pada: row[2],
      lord: row[3]
    }));
  const dashas = parseMarkdownTable(markdown, "### Vimshottari Dasha")
    .filter((row) => row[1] && row[1] !== "行星")
    .map((row) => ({
      marker: row[0],
      planet: row[1],
      start: row[2],
      end: row[3],
      years: row[4]
    }));
  const currentDasha = dashas.find((item) => String(item.marker || "").includes("当前")) || null;
  const warnings = Array.isArray(skillResult?.calculationMeta?.warnings)
    ? skillResult.calculationMeta.warnings
    : [];

  return {
    userInput: {
      birthDate: profile.birthDate || meta.birthDate || "未填写",
      birthTime: profile.birthTime || meta.birthTime || "未填写",
      birthSecond: profile.birthSecond || "",
      birthPlace: profile.birthCity || meta.birthPlace || "未填写",
      latitude: profile.latitude || "",
      longitude: profile.longitude || "",
      timezone: profile.timezone || skillResult?.calculationMeta?.timezone || "",
      gender: profile.gender || "未填写",
      focusArea: options.focusArea || "未填写"
    },
    calculation: {
      engine: skillResult?.calculationMeta?.engine || "未生成",
      source: skillResult?.bridge?.source || "",
      timezone: skillResult?.calculationMeta?.timezone || "",
      lat: skillResult?.calculationMeta?.lat,
      lon: skillResult?.calculationMeta?.lon,
      second: skillResult?.calculationMeta?.second,
      ayanamsa: meta.ayanamsa || skillResult?.calculationMeta?.ayanamsa || "",
      nodeMode: meta.nodeMode,
      precision: meta.precision,
      method: meta.method
    },
    d1Positions: positions,
    nakshatras,
    currentDasha,
    dashas: dashas.slice(0, 12),
    warnings
  };
}

function buildPrompt(payload) {
  const profile = payload.profile || {};
  const chart = payload.chart || {};
  const chartData = payload.chartData || {};
  const options = payload.options || {};
  const skillResult = payload.skillResult || {};
  const mode = payload.mode || "reading";
  const question = (payload.question || "").trim();
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
  const masterReading = payload.masterReading || payload.masterReadingText || "";
  const masterSummary = payload.masterSummary || "";
  const pdfReferenceData = payload.pdfReferenceData || {};
  const activeRoute = skillResult.activeRoute || skillResult.bridge?.activeRoute || {
    primary: options.vedicModule || "vedic-core",
    modules: options.activeSkillModules || ["vedic-calculator", "vedic-reader", "vedic-core"],
    focusArea: options.focusArea || ""
  };
  const chartDataDigest = buildChartDataDigest(skillResult, profile, options);

  return `
你是一位有 20 年咨询经验的高级吠陀占星顾问，熟悉 Jyotish、Parashari、KN Rao 口径、十二宫、九大行星、Nakshatra 月宿、Vimshottari Dasha、Navamsa D9、Dasamsa D10、行星强弱、瑜伽组合、合盘和现实人生咨询。

你的任务
你不是百科词条作者，也不是普通 AI 聊天助手。你的输出要像一位资深占星顾问正在做真实咨询：冷静、专业、温和、有心理洞察、有现实建议。专业占星推理必须来自结构化星盘数据，DeepSeek 只负责把这些证据组织成自然、可信、可落地的中文咨询语言。

当前启用的上游解读 Skill
${clip(VEDIC_SKILL_SOURCE, 1200)}

Vedic Astro Skills 解读规则（优先执行）
${LIFE_BLUEPRINT_SKILL_RULES}

当前模式
${mode}

用户本次追问
${question || "无"}

已保存的 Life Blueprint 摘要
${clip(masterSummary || "首次生成中，暂无摘要。", 1800)}

已保存的 Life Blueprint 全文
${clip(masterReading || "首次生成中，暂无已保存总报告。", 22000)}

用户最关心的问题
${options.focusArea || "未填写"}

自动启用的印占技能路线
${clip(activeRoute, 3000)}

已接入的技能规则库摘要
${clip(skillResult.skillGuidance || [], 5000)}

使用规则
1. 基础判断顺序是：出生资料校验、D1 本命盘、Moon/Nakshatra、Rahu/Ketu 轴、关键宫位、D9/D10、Dasha，再到现实建议。
2. 如果 activeRoute.primary 是 vedic-career，重点分析 10 宫、6 宫、2 宫、11 宫、L10、AmK、D10、强星、当前大运，结论要回答职业方向、赚钱模式、跳槽创业和阶段节奏。
3. 如果 activeRoute.primary 是 vedic-love，重点分析 5 宫、7 宫、Venus、Moon、DK、UL、D9、Rahu/Ketu、Dasha，结论要回答伴侣特质、关系课题、稳定性和时间窗口。
4. 如果 activeRoute.primary 是 vedic-synastry，必须先检查是否有第二个人完整出生资料。资料不足时只做有限提示，不能假装已完成合盘。
5. 如果 activeRoute.primary 是 vedic-rectifier，必须提示出生时间不准会影响上升、宫位、D9、D10、Dasha 细节，并引导用户补充 5 个重大人生事件，不能伪造校时结果。
6. 如果 activeRoute.primary 是 vedic-core 或 vedic-reader，做综合命盘分析，但要根据用户当前关心的问题调整篇幅。
7. 如果 skillResult.structuredDataMarkdown 存在，优先使用它；否则使用 chart.structuredData 和 pdfReferenceData。
8. PDF reference data 视为专业软件导出参考；网页 fallback 数据视为可体验原型数据，需要在关键处说明精度限制。
9. 出生参数里如果有秒数、UTC 时区、West/East of GMT、Daylight Saving、Use LMT、经纬度 DMS、海拔、气压、温度，要优先参考这些 JHora 风格字段。不要只根据城市名泛泛判断。
10. 对上升、分盘、Dasha 时间窗这类对时间敏感的结论，要说明“秒、经纬度、时区和夏令时会影响精度”。如果当前只是网页 fallback，要把判断写成倾向，不要说成正式软件最终盘。
11. 如果 structured_data 或 calculationMeta 出现 SAV/BAV、Shadbala、分盘、Dasha 的计算警示，不要把缺失值、0 值或占位值当作真实结论。要明确说明该模块待校验，并优先使用 D1 行星经度、宫位、月宿、Rahu/Ketu、D9/D10 可用数据与 Dasha 可用数据。
12. 如果 calculationMeta.engine 是 swiss-ephemeris-lahiri 或 vedic-calculator，说明 D1 本命盘、上升、行星经度、月宿来自 Swiss Ephemeris 真实星历，可以比网页 fallback 更优先。
13. 不要输出工程信息，不要说 schema、adapter、API、函数、JSON、skills 路由这些后台词。
14. 不要制造恐惧，不要绝对化判断。使用“倾向于”“更像是”“这提示”“需要验证”等表达。
15. 不要使用 Markdown 标题符号、粗体符号、星号、###、#、---。标题直接写普通中文，例如“1. 命盘整体格局”。
16. 不要把所有用户都讲成同一个答案。每段必须引用本盘至少一个具体依据，如宫位、行星、星座、月宿、大运、D9/D10 或数据缺失限制。
17. 如果资料不足以确认某个瑜伽或时间窗口，要明确说“当前数据不足以确认”，不能硬编。
18. 如果当前模式是 reading 或 master，必须按照用户指定的十章 Life Blueprint 结构输出，不要改成其他模板。
19. 每个章节至少引用一条“核心排盘数据摘要”里的具体数据，例如某行星落座、宫位、月宿、当前大运、Rahu/Ketu 轴或计算警示。
20. 如果当前数据没有 D9、Shadbala、SAV/BAV 或完整瑜伽校验，不要编造。对应章节必须明确写“当前后端暂未提供完整分盘/量化数据，因此只能基于 D1 与 Dasha 做初步判断”。
21. 不要空泛说“你适合发展事业”。必须把判断落到职业方向、赚钱方式、关系模式、健康习惯或现实行动。
22. 如果当前模式是 qa，禁止重新生成完整命盘报告。必须读取已保存的 Life Blueprint、最近对话和当前问题，做连续咨询，不能与 Life Blueprint 的基础判断互相矛盾。

master / reading 模式输出要求
首次报告命名为 Life Blueprint。它是以后所有咨询的基础，只生成一次。不要写得像说明书，不要机械堆 bullet，不要重复解释术语。每个章节都要详细、连贯、有咨询感，并解释“为什么这样判断”。当前部署环境有函数时限，请优先保证十章结构完整、盘面依据明确、建议可落地；长度尽量充分，但不要为了凑字导致接口超时。

开头先确认出生日期、出生时间、出生地点、性别、目前最关心的问题。缺失就写“未填写”。如果出生时间、经纬度、时区或夏令时会影响精度，请说明哪些结论受影响。

第一章 灵魂主题
说明为什么来到这一世、人生主线、业力方向。必须引用 Rahu/Ketu 轴、上升、月亮、关键宫位或大运证据。

第二章 人格分析
分析 Asc、Moon、Sun、Nakshatra、心理模式、行为模式、潜意识。不要只写性格形容词，要解释人格如何形成、现实中如何表现。

第三章 家庭成长
分析父母影响、童年、情绪模式。必须结合第2宫、第4宫、第9宫、太阳、月亮、土星等可用证据。

第四章 学习能力
分析天赋、思维方式、适合学习什么。结合水星、木星、第3宫、第5宫、第9宫和月亮。

第五章 事业蓝图
重点分析 D10、职业方向、创业、管理、媒体、艺术、AI、自由职业、适合行业以及为什么。如果 D10 数据不足，要明确说明，只能先用 D1、第10宫、第6宫、第2宫、第11宫、太阳、土星、水星、火星和当前大运判断。

第六章 财富模式
分析赚钱方式、财富来源、容易漏财的位置、资产配置建议。结合第2宫、第8宫、第11宫、第12宫、金星、木星、土星和大运。

第七章 感情模式
分析择偶、恋爱、婚姻、业力关系、婚后模式。结合第5宫、第7宫、金星、木星、月亮、DK、D9 和 Rahu/Ketu。D9 不完整时必须说明限制。

第八章 健康
分析容易出现的问题和生活建议。结合第1宫、第6宫、第8宫、第12宫、月亮、火星、土星。不能做医疗诊断。

第九章 Dasha 大运分析
分析未来十年、重点年份、转折点。必须引用 Vimshottari Mahadasha / Antardasha 可用数据；数据不足时说明需要后端继续补全。

第十章 人生建议
说明应该放弃什么、应该坚持什么、真正适合的人生道路。建议必须可执行，不能只讲玄学。

Executive Summary
用咨询师语气总结：人生优势、核心课题、未来十年重点方向、现在最该做的三件事。

qa 模式输出结构
先直接回答用户这一次的问题，再写“为什么这样判断”“盘面依据”“未来趋势”“现实建议”。必须引用已保存 Life Blueprint 的基础判断、最近对话和本次问题。不要重新生成完整报告。回答要聚焦问题，不要泛泛重复本命盘。目标约 1800 到 3000 个中文字符，像真实咨询追问，不像模板回复。

核心排盘数据摘要
这是你必须优先使用和引用的数据，不可忽略：
${clip(chartDataDigest, 10000)}

最近对话
${clip(history, 6000)}

用户资料
${clip(profile, 8000)}

印度占星网页排盘数据
${clip(chart, 10000)}

缓存的完整结构化星盘数据
${clip(chartData, 10000)}

skill 结构化数据
${clip(chart.structuredData || {}, 8000)}

完整 structured_data.md
${clip(skillResult.structuredDataMarkdown || "未生成，使用网页 fallback 结构化数据。", 9000)}

PDF / JHora 参考数据
${clip(pdfReferenceData, 6000)}
`;
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

  const { apiKey, chatUrl, model } = getModelConfig();
  if (!apiKey) {
    if (!event.headers?.["x-podo-production-fallback"]) {
      const production = await fetch("https://podooo.netlify.app/.netlify/functions/deepseek-vedic", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-podo-production-fallback": "1" },
        body: JSON.stringify(payload)
      });
      return {
        statusCode: production.status,
        headers: { "Content-Type": "application/json" },
        body: await production.text()
      };
    }
    return {
      statusCode: 501,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Model API key is not configured" })
    };
  }

  const mode = payload.mode || "reading";
  const prompt = buildPrompt(payload);
  const systemPrompt = mode === "qa"
    ? "你是高级吠陀占星顾问。必须用中文回答。当前是连续咨询模式：只回答用户本次问题，必须引用已保存的 Life Blueprint、最近对话和核心排盘数据，不要重新生成完整报告，不做绝对化预言，不输出 Markdown 符号标题。"
    : "你是高级吠陀占星顾问。必须用中文回答。当前是 Life Blueprint 首次报告模式：严格执行已提供的 Vedic Astro Skills v7.0 规则，用资深咨询师语气输出完整、连贯、可落地的中文报告。依据核心排盘数据摘要和 structured_data.md，不做绝对化预言，不输出 Markdown 符号标题。每个核心判断都要引用具体盘面数据。";

  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.62,
      max_tokens: mode === "qa" ? 3200 : 5200
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Model request failed", detail: errorText.slice(0, 500) })
    };
  }

  const data = await response.json();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reading: cleanReading(data.choices?.[0]?.message?.content || ""),
      summary: cleanReading(data.choices?.[0]?.message?.content || "").replace(/\s+/g, " ").slice(0, 420)
    })
  };
};
