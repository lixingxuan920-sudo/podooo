const { handler: deepseekVedicHandler } = require("./deepseek-vedic.js");
const { setBlueprintJob, validJobId } = require("./blueprint-job-store.js");

const REPORT_SEGMENTS = [
  "这是首次完整 Life Blueprint 的第1—3部分。请输出约2800—3400个中文字符，使用清晰的Markdown章节标题，完整包含：1. 命盘整体格局；2. 行星强弱与重点配置；3. 十二宫位解读。必须展开上升、命主星、太阳、月亮、九大行星、尊贵/燃烧/逆行、Shadbala、十二宫审计，并说明每项判断的具体证据。只使用统一evidence ledger和structured_data中的真实数据；无法确认的Yoga或配置必须写“当前数据不足以确认”。",
  "这是首次完整 Life Blueprint 的第4—6部分。请输出约2800—3400个中文字符，使用清晰的Markdown章节标题，完整包含：4. 事业与财富；5. 婚姻与感情；6. 大运Dasha分析。事业必须调用vedic-career规则并结合2、6、10、11宫、L10、AmK、D10、强星和真实Dasha；感情必须调用vedic-love规则并结合5、7宫、L7、Venus、Moon、DK、UL、D9、Rahu/Ketu和真实Dasha；时间只可使用真实起止日期，不能猜结婚年份或高峰年份。",
  "这是首次完整 Life Blueprint 的第7—9部分及总结。请输出约2800—3400个中文字符，使用清晰的Markdown章节标题，完整包含：7. Navamsa D9解读；8. 重要瑜伽与特殊组合；9. 现实建议；最后总结人生优势、主要课题、未来几年重点方向和当前最应该做的三件事。逐项核验D1成立依据、激活大运/小运、D9兑现度；证据不足写“当前数据不足以确认”。健康只能给生活方式提醒，不作医学诊断。"
];

async function generateSegment(payload, question) {
  const response = await deepseekVedicHandler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      ...payload,
      mode: "qa",
      question,
      masterReading: "",
      masterSummary: "",
      history: []
    })
  });
  if (response.statusCode !== 200) {
    let detail = response.body || "";
    try {
      const parsed = JSON.parse(response.body || "{}");
      detail = parsed.detail || parsed.error || detail;
    } catch {
      // Keep the raw error message.
    }
    throw new Error(`DeepSeek report segment failed: ${String(detail).slice(0, 300)}`);
  }
  const data = JSON.parse(response.body || "{}");
  const reading = String(data.reading || "").trim();
  if (!reading) throw new Error("DeepSeek returned an empty report segment.");
  return reading;
}

exports.handler = async (event) => {
  let jobId = "";
  let payload = {};
  let createdAt = new Date().toISOString();
  try {
    const request = JSON.parse(event.body || "{}");
    jobId = request.jobId;
    payload = request.payload || {};
    if (!validJobId(jobId)) throw new Error("Invalid blueprint job ID.");
    createdAt = request.createdAt || createdAt;

    await setBlueprintJob(event, jobId, {
      jobId,
      status: "generating_report",
      progress: 25,
      createdAt,
      updatedAt: new Date().toISOString()
    });

    const segments = await Promise.all(REPORT_SEGMENTS.map((question) => generateSegment(payload, question)));
    const blueprint = segments.join("\n\n").trim();
    if (blueprint.length < 8000) {
      throw new Error(`Life Blueprint 字数不足：${blueprint.length}，需要至少8000个中文字符。`);
    }
    const summary = blueprint.replace(/\s+/g, " ").slice(0, 420);
    const chartData = payload.chartData || {};
    await setBlueprintJob(event, jobId, {
      jobId,
      status: "merging_report",
      progress: 100,
      blueprint,
      summary,
      chartData,
      birthData: payload.profile || {},
      structuredDataMarkdown: chartData.structuredDataMarkdown || payload.skillResult?.structuredDataMarkdown || "",
      professionalChart: chartData.professionalChart || payload.skillResult?.professionalChart || null,
      calculationMeta: chartData.calculationMeta || payload.skillResult?.calculationMeta || null,
      evidenceLedger: chartData.evidenceLedger || payload.skillResult?.evidenceLedger || null,
      skillVersion: payload.skillResult?.calculationMeta?.upstreamVersion || "v7.0",
      skillCommit: payload.skillResult?.calculationMeta?.commit || "7a6e33e23dc1f45107af2f249848241bb4d22b67",
      createdAt,
      updatedAt: new Date().toISOString()
    });
    await setBlueprintJob(event, jobId, { status: "completed", progress: 100, updatedAt: new Date().toISOString() });
  } catch (error) {
    if (validJobId(jobId)) {
      await setBlueprintJob(event, jobId, {
        jobId,
        status: "failed",
        progress: 100,
        error: error.message || "Life Blueprint generation failed",
        createdAt,
        updatedAt: new Date().toISOString()
      });
    }
    throw error;
  }
};
