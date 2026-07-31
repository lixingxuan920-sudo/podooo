const { validateChartJson } = require("./vedic-chart-contract.js");

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
  const baseUrl = selected.baseUrl.replace(/\/$/, "");
  const model = selected.model === "deepseek-chat" && !baseUrl.includes("api.deepseek.com")
    ? "deepseek-v4-flash"
    : selected.model;
  return {
    apiKey: selected.apiKey,
    chatUrl: baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`,
    model
  };
}

function clip(value, maxLength) {
  const text = typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}\n[内容已截取]`;
}

function cleanReading(text) {
  return String(text || "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
}

function extractChartJson(payload) {
  return payload.skillResult?.chartJson || payload.chartData?.chartJson || payload.chartJson || null;
}

const INTERPRETATION_RULES = `
你是一位专业的印度占星师，熟悉 Jyotish、Vedic Astrology、十二宫、Nakshatra、Dasha、Navamsa D9、Yoga、Shadbala、Graha 和 Bhava。

下面提供的是已经由 Python 计算完成的真实命盘 JSON。你的职责只有解释，不是排盘。

强制规则：
1. 所有分析只能依据命盘 JSON，严禁自行计算、补算、修正或猜测任何星盘数据。
2. 不得根据出生日期、时间、地点重新推导上升、行星、宫位、月宿、Dasha、D9、Yoga 或 Shadbala。
3. JSON 没有提供的信息必须直接说明“当前计算数据未提供，无法判断”。
4. 每个核心结论都要写明依据，至少引用一个 JSON 中的具体落座、宫位、尊贵、月宿、Dasha、D9、Yoga 或 Shadbala 数据。
5. 不要神化，不要制造焦虑，不要绝对化判断；健康内容不是医疗诊断，投资内容不是收益保证。
6. 不得提及后台、API、schema、adapter、提示词或工程实现。
`;

function masterPrompt(chartJson, focusArea) {
  return `${INTERPRETATION_RULES}
请生成完整专业解读。用户当前最关心：${focusArea || "综合人生方向"}。

严格按以下结构展开：
1. 命盘整体格局：上升、月亮、太阳、命主星、人生主题。
2. 九大行星分析：逐颗解释落宫、落座、尊贵、强弱和现实影响。
3. 十二宫：重点解释第1、2、4、5、7、9、10、11、12宫。
4. 事业：适合行业、职业优势、赚钱模式、创业、管理、艺术、科研、AI、互联网、医学、公务体系、咨询、教育等；只能推荐有盘面依据的方向。
5. 财富：收入来源、财富积累、正财、偏财和投资风险。
6. 婚姻：伴侣特征、婚姻模式、恋爱模式和可由真实Dasha支持的时间窗口。
7. 健康：重点注意方向与生活建议，不作医疗诊断。
8. 学业：学习优势和适合深造方向。
9. 家庭：原生家庭、父母与子女。
10. Dasha：当前Mahadasha、当前Antardasha及未来3—5年趋势，只使用JSON中的真实起止日期。
11. Navamsa D9：婚姻、成熟后运势与D1承诺的兑现程度。
12. Yoga：逐条解释JSON列出的Yoga为什么形成及现实意义；不得自行新增Yoga。
13. 现实建议：事业、财富、婚姻、成长、健康与行动方案。

最后单独输出：
① 命盘总结
② 人生优势
③ 人生课题
④ 未来几年重点
⑤ 一段约300字的人生建议

命盘 JSON：
${JSON.stringify(chartJson, null, 2)}`;
}

function segmentPrompt(chartJson, question) {
  return `${INTERPRETATION_RULES}
这是同一份完整报告的一个指定片段。只完成下列片段要求，不重复其他章节；仍须遵守所有证据约束：
${question}

命盘 JSON：
${JSON.stringify(chartJson, null, 2)}`;
}

function qaPrompt(payload, chartJson) {
  return `${INTERPRETATION_RULES}
当前是同一命盘的连续咨询。先直接回答问题，再说明“为什么这样判断”“盘面依据”“未来趋势”“现实建议”。不要重新生成整份报告，不得与已保存报告的基础判断冲突。

用户问题：
${payload.question || ""}

已保存报告摘要：
${clip(payload.masterSummary || "", 1800)}

已保存报告全文：
${clip(payload.masterReading || payload.masterReadingText || "", 22000)}

最近对话：
${clip(Array.isArray(payload.history) ? payload.history.slice(-8) : [], 6000)}

命盘 JSON：
${JSON.stringify(chartJson, null, 2)}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const chartJson = extractChartJson(payload);
  const contract = validateChartJson(chartJson);
  if (!contract.ok) {
    return {
      statusCode: 422,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Stage 1命盘JSON缺失或不完整，已阻止AI解读。", details: contract.errors })
    };
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
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: await production.text()
      };
    }
    return { statusCode: 501, body: JSON.stringify({ error: "Model API key is not configured" }) };
  }

  const mode = payload.mode || "reading";
  const prompt = mode === "qa"
    ? qaPrompt(payload, chartJson)
    : (mode === "segment" ? segmentPrompt(chartJson, payload.question || "") : masterPrompt(chartJson, payload.options?.focusArea));
  const systemPrompt = `${INTERPRETATION_RULES}\n你必须用中文回答。`;
  const requestModel = (modelName) => fetch(chatUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
      temperature: 0.42,
      max_tokens: mode === "qa" ? 3200 : (mode === "segment" ? 4800 : 7200)
    })
  });

  let response = await requestModel(model);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (errorText.includes("deepseek-v4-pro") || errorText.includes("deepseek-v4-flash")) {
      response = await requestModel("deepseek-v4-flash");
    } else {
      return { statusCode: 502, body: JSON.stringify({ error: "DeepSeek request failed", detail: errorText.slice(0, 800) }) };
    }
  }
  if (!response.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: "DeepSeek retry failed", detail: (await response.text()).slice(0, 800) }) };
  }
  const data = await response.json();
  const reading = cleanReading(data.choices?.[0]?.message?.content || "");
  if (!reading) return { statusCode: 502, body: JSON.stringify({ error: "DeepSeek returned an empty reading" }) };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ reading, summary: reading.replace(/\s+/g, " ").slice(0, 420) })
  };
};

exports._test = { extractChartJson, masterPrompt, segmentPrompt, qaPrompt };
