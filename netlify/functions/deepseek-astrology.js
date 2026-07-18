function getModelConfig() {
  const requested = String(process.env.AI_PROVIDER || process.env.MODEL_PROVIDER || "").toLowerCase();
  const providers = {
    deepseek: { apiKey: process.env.DEEPSEEK_API_KEY, baseUrl: process.env.DEEPSEEK_BASE_URL || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com", model: process.env.DEEPSEEK_MODEL || "deepseek-chat" },
    openai: { apiKey: process.env.OPENAI_API_KEY, baseUrl: process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || "https://api.openai.com/v1", model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
    ccswitch: { apiKey: process.env.CCSWITCH_API_KEY || process.env.API_KEY, baseUrl: process.env.CCSWITCH_BASE_URL || "https://api.openai.com/v1", model: process.env.CCSWITCH_MODEL || "gpt-4o-mini" }
  };
  const provider = providers[requested]?.apiKey ? requested : (["deepseek", "openai", "ccswitch"].find((name) => providers[name].apiKey) || requested || "deepseek");
  const selected = providers[provider] || providers.deepseek;
  const apiKey = selected.apiKey;
  const baseUrl = selected.baseUrl.replace(/\/$/, "");
  const model = selected.model;
  const chatUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  return { apiKey, chatUrl, model, provider };
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
    if (process.env.CONTEXT === "deploy-preview") {
      const production = await fetch("https://podooo.netlify.app/.netlify/functions/deepseek-astrology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const profile = payload.profile || {};
  const chart = payload.chart || {};
  const options = payload.options || {};
  const prompt = `
你是一位专业、稳重、可信赖的西洋占星师。请根据以下结构化星盘数据，用中文进行深入解读。

要求：
1. 不要做绝对化预言，不制造焦虑。
2. 根据 chartType 判断盘型：本命盘、合盘/比较盘、组合盘、流年盘、日返盘、月返盘、法达盘或小限盘。
3. 合盘/组合盘重点分析双方互动模式、吸引点、压力点、现实课题和可执行建议。
4. 流年、日返、月返、小限或法达盘重点分析时间主题、被激活宫位、主星课题和近期建议。
5. 结合太阳、月亮、上升、金星、火星、土星、北交点，以及核心相位。
6. 说明当前网页为本地近似排盘，后续可接 Swiss Ephemeris/真实星历校正度数。
7. 输出结构：核心结论、性格/关系/阶段主题、关键相位、风险与盲点、具体行动建议。

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
        { role: "system", content: "你是专业西洋占星解读师，回答必须使用中文，语气温和、具体、可信赖。" },
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
