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

function clip(value, maxLength = 16000) {
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

function buildPrompt(payload) {
  const profile = payload.profile || {};
  const chart = payload.chart || {};
  const options = payload.options || {};
  const skillResult = payload.skillResult || {};
  const mode = payload.mode || "reading";
  const question = (payload.question || "").trim();
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
  const pdfReferenceData = payload.pdfReferenceData || {};
  const activeRoute = skillResult.activeRoute || skillResult.bridge?.activeRoute || {
    primary: options.vedicModule || "vedic-core",
    modules: options.activeSkillModules || ["vedic-calculator", "vedic-reader", "vedic-core"],
    focusArea: options.focusArea || ""
  };

  return `
你是一位专业、稳重、可信赖的印度占星师，熟悉 Jyotish、Parashari、KN Rao 口径、十二宫、九大行星、Nakshatra 月宿、Vimshottari Dasha、Navamsa D9、Dasamsa D10、行星强弱、瑜伽组合、合盘和现实人生咨询。

你的任务
根据用户出生资料和网页生成的印度星盘数据，输出中文解读。你可以使用 DeepSeek 的推理能力，但所有结论必须先落在盘面证据上，再落到现实建议上。

当前模式
${mode}

用户本次追问
${question || "无"}

用户最关心的问题
${options.focusArea || "未填写"}

自动启用的印占技能路线
${clip(activeRoute, 3000)}

已接入的技能规则库摘要
${clip(skillResult.skillGuidance || [], 9000)}

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
12. 如果 calculationMeta.engine 是 vedic-calculator，说明 D1本命盘、上升、行星经度、月宿来自 Swiss Ephemeris 真实星历，可以比网页 fallback 更优先。
13. 不要输出工程信息，不要说 schema、adapter、API、函数、JSON、skills 路由这些后台词。
14. 不要制造恐惧，不要绝对化判断。使用“倾向于”“更像是”“这提示”“需要验证”等表达。
15. 不要使用 Markdown 标题符号、粗体符号、星号、###、#、---。标题直接写普通中文，例如“1. 命盘整体格局”。
16. 不要把所有用户都讲成同一个答案。每段必须引用本盘至少一个具体依据，如宫位、行星、星座、月宿、大运、D9/D10 或数据缺失限制。
17. 如果资料不足以确认某个瑜伽或时间窗口，要明确说“当前数据不足以确认”，不能硬编。
18. 回答要像真人占星师，先说用户能听懂的判断，再补充依据。不要堆表格。

reading 模式输出结构
开头先简短确认出生日期、时间、地点、性别、关注问题。缺失就写“未填写”。如果出生时间不够准确，说明哪些结论受影响。

1. 命盘整体格局
说明上升星座、月亮星座、太阳星座、命主星状态，以及核心性格、人生主题和主要优势。

2. 行星强弱与重点配置
分析九大行星的落宫、落座、尊贵状态、受克或受益情况。指出关键行星和挑战行星，每个结论要有依据。

3. 十二宫位解读
重点看第1、2、4、5、7、9、10、11、12宫，说明它们对性格、财富、事业、婚姻、家庭、贵人和精神成长的影响。

4. 事业与财富
说明适合职业方向、赚钱模式、事业高峰期、谨慎阶段，以及是否适合创业、管理、体制内、技术、商业、艺术、咨询等。

5. 婚姻与感情
说明伴侣特质、婚姻稳定性、感情课题、适合推进关系的阶段或需要避开的阶段。

6. 大运 Dasha 分析
分析当前大运和小运，说明当前阶段主题、机会、风险，并给未来3到5年的趋势。

7. Navamsa D9 解读
分析婚姻、内在成熟度、人生后半段运势，并对照本命盘判断命盘承诺是否能兑现。

8. 重要瑜伽与特殊组合
说明是否能确认 Raja Yoga、Dhana Yoga、Neecha Bhanga、Vipreet Raj Yoga 等，不能确认就说明原因。

9. 现实建议
给出事业、财富、感情、健康、个人成长方面的具体行动建议。一定要写完整，不要在这里截断。

最后总结
用一小段总结人生优势、主要课题、未来几年重点方向，并提示用户可以继续追问具体问题。

qa 模式输出结构
先直接回答用户这一次的问题，再写“盘面依据”和“现实建议”。不要重新生成完整报告。回答要聚焦问题，不要泛泛重复本命盘。

最近对话
${clip(history, 6000)}

用户资料
${clip(profile, 8000)}

印度占星网页排盘数据
${clip(chart, 18000)}

skill 结构化数据
${clip(chart.structuredData || {}, 12000)}

真实 vedic-calculator structured_data.md
${clip(skillResult.structuredDataMarkdown || "未生成，使用网页 fallback 结构化数据。", 18000)}

PDF / JHora 参考数据
${clip(pdfReferenceData, 12000)}
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
    return {
      statusCode: 501,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Model API key is not configured" })
    };
  }

  const mode = payload.mode || "reading";
  const prompt = buildPrompt(payload);

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
          content: "你是专业印度占星师。必须用中文回答。必须依据盘面数据，不做绝对化预言，不输出 Markdown 符号标题。"
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.62,
      max_tokens: mode === "qa" ? 3200 : 7600
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
    body: JSON.stringify({ reading: cleanReading(data.choices?.[0]?.message?.content || "") })
  };
};
