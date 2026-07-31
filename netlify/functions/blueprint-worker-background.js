const { handler: deepseekVedicHandler } = require("./deepseek-vedic.js");
const { setBlueprintJob, validJobId } = require("./blueprint-job-store.js");

// Long reports use the same persisted professional chart evidence across all segments.

const REPORT_SEGMENTS = [
  "请输出完整报告的第1—4部分，约2800—3400个中文字符：1.命盘整体格局；2.九大行星逐颗分析；3.十二宫（重点1、2、4、5、7、9、10、11、12宫）；4.事业。每个结论必须引用命盘JSON的具体依据。",
  "请输出完整报告的第5—9部分，约2800—3400个中文字符：5.财富；6.婚姻；7.健康；8.学业；9.家庭。婚恋时间只能使用JSON中真实Dasha起止日期；健康不作医学诊断；JSON未提供的信息明确写无法判断。",
  "请输出完整报告的第10—13部分和最终总结，约2800—3400个中文字符：10.Dasha（当前大运、小运和未来3—5年）；11.Navamsa D9；12.Yoga（只能逐条解释JSON中已列出的Yoga，禁止新增）；13.现实建议。最后依次输出①命盘总结、②人生优势、③人生课题、④未来几年重点、⑤约300字人生建议。"
];

async function generateSegment(payload, question) {
  const response = await deepseekVedicHandler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({
      ...payload,
      mode: "segment",
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
      chartJson: chartData.chartJson || payload.skillResult?.chartJson || null,
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
