const { handler: deepseekVedicHandler } = require("./deepseek-vedic.js");
const { setBlueprintJob, validJobId } = require("./blueprint-job-store.js");

const REPORT_SEGMENTS = [
  "这是首次完整 Life Blueprint 的第一部分。请写一段约 1600 至 2200 个中文字符、连续流畅的专业印度占星报告，分析命盘整体格局、上升与命主星、太阳月亮、Nakshatra、九大行星强弱、核心性格、人生主题、家庭、学习、健康与重点宫位。每项判断引用具体盘面依据。不要说这是追问，不要提没有保存报告，不要使用数字编号、目录、Markdown 标题或列表。",
  "这是首次完整 Life Blueprint 的第二部分，直接承接前文，不要重复出生资料。请写一段约 1600 至 2200 个中文字符、连续流畅的专业印度占星报告，深入分析事业与财富、适合行业和岗位、赚钱模式、创业管理体制技术商业艺术咨询的适配度、事业高峰与谨慎期。必须结合第 2、6、10、11 宫、宫主、AmK、D10、当前大运与小运等真实盘面依据。不要使用数字编号、目录、Markdown 标题或列表。",
  "这是首次完整 Life Blueprint 的第三部分，直接承接前文，不要重复出生资料。请写一段约 1800 至 2400 个中文字符、连续流畅的专业印度占星报告，分析婚姻感情、伴侣特质、关系课题和时间窗口，结合第 5、7 宫、Venus、Moon、DK、D9；核验重要 Yoga，证据不足就明确限制；结合 Vimshottari Mahadasha 与 Antardasha 解读未来三到五年，并给出事业、财富、感情、健康和成长的现实行动建议，最后自然总结人生优势、主要课题与未来重点。不要使用数字编号、目录、Markdown 标题或列表。"
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
      status: "processing",
      progress: 25,
      createdAt,
      updatedAt: new Date().toISOString()
    });

    const segments = await Promise.all(REPORT_SEGMENTS.map((question) => generateSegment(payload, question)));
    const blueprint = segments.join("\n\n").trim();
    const summary = blueprint.replace(/\s+/g, " ").slice(0, 420);
    await setBlueprintJob(event, jobId, {
      jobId,
      status: "completed",
      progress: 100,
      blueprint,
      summary,
      chartData: payload.chartData || payload.chart || {},
      createdAt,
      updatedAt: new Date().toISOString()
    });
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
