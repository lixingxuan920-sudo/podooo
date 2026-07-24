const {
  WESTERN_SKILL_RULES,
  WESTERN_SKILL_SOURCE
} = require("./western-skill-rules");

const WESTERN_SKILL_SCOPE = "western-chart";
const WESTERN_SKILL_REPOSITORY = "https://github.com/aryaminus/astro";

function getModelConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY
    || process.env.OPENAI_API_KEY
    || process.env.CCSWITCH_API_KEY
    || process.env.API_KEY;
  const baseUrl = (process.env.DEEPSEEK_BASE_URL
    || process.env.DEEPSEEK_API_BASE
    || process.env.OPENAI_BASE_URL
    || process.env.OPENAI_API_BASE
    || process.env.CCSWITCH_BASE_URL
    || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL
    || process.env.CCSWITCH_MODEL
    || process.env.OPENAI_MODEL
    || "deepseek-chat";
  const chatUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  return { apiKey, chatUrl, model };
}

function isWesternChart(chart) {
  return chart
    && chart.zodiac === "Tropical"
    && chart.interpretationSkill?.scope === WESTERN_SKILL_SCOPE
    && chart.interpretationSkill?.source === WESTERN_SKILL_REPOSITORY
    && chart.natal?.points?.length;
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

  const profile = payload.profile || {};
  const chart = payload.chart || {};
  const options = payload.options || {};
  if (!isWesternChart(chart)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Western chart data required",
        detail: "该接口仅接受“星盘”板块生成的热带黄道西洋占星数据。"
      })
    };
  }

  const { apiKey, chatUrl, model } = getModelConfig();
  if (!apiKey) {
    return {
      statusCode: 501,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Model API key is not configured" })
    };
  }

  const prompt = `
你是一位专业、稳重、可信赖的西洋占星师。请根据以下结构化星盘数据，用中文进行深入解读。

系统边界：
- 当前 Skill 只服务 Podo 的“星盘”板块。
- 只使用热带黄道、西洋占星宫制、行星尊贵、宫主星和西洋占星相位规则。
- 严禁混入印度占星的恒星黄道、Lahiri Ayanamsa、Nakshatra、Vimshottari Dasha、D1/D9/D10、Yoga 或 Vedic Skill 规则。
- 如果输入出现印度占星字段，不得引用或解读。

规则来源：
${JSON.stringify(WESTERN_SKILL_SOURCE, null, 2)}

${WESTERN_SKILL_RULES}

要求：
1. 不要做绝对化预言，不制造焦虑。
2. 根据 chartType 判断盘型：本命盘、合盘/比较盘、组合盘、流年盘、日返盘、月返盘、法达盘或小限盘。
3. 合盘/组合盘重点分析双方互动模式、吸引点、压力点、现实课题和可执行建议。
4. 流年、日返、月返、小限或法达盘重点分析时间主题、被激活宫位、主星课题和近期建议。
5. 结合太阳、月亮、上升、金星、火星、土星、北交点、元素与模式、尊贵状态、宫主星、相位格局及核心相位。
6. 当前结构化数据来自 Swiss Ephemeris 真实星历、出生地经纬度、历史时区与用户所选宫制；必须以数据为准，不得自行改动落座、宫位、度数或逆行状态。
7. 如果 calculationNote 明确提示某种高级推运尚未精确实现，必须如实说明，不能补造。
8. 本命盘输出结构：核心结论、大三角与整体格局、行星强弱与重点配置、十二宫与宫主星、关键相位与格局、事业、财富、感情、成长方向、行动建议。
9. 合盘/组合盘输出结构：关系核心、吸引与支持、情绪与沟通、承诺与现实、冲突触发、相处建议。
10. 行运盘输出结构：阶段核心、长期主题、短期触发、被激活宫位、风险与盲点、行动建议。

用户资料：
${JSON.stringify(profile, null, 2)}

星盘选项：
${JSON.stringify(options, null, 2)}

星盘结构化数据：
${JSON.stringify(chart, null, 2)}
`;

  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "你是 Podo“星盘”板块的专业西洋占星解读师。只采用西洋占星体系，不得混入印度占星规则。回答必须使用中文，语气温和、具体、可信赖。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.72,
      max_tokens: 1800
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
  const reading = data.choices?.[0]?.message?.content || "";
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reading })
  };
};
