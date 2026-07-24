const { getBlueprintJob, validJobId } = require("./blueprint-job-store.js");

exports.handler = async (event, context) => {
  const jobId = context.params?.jobId || event.path.split("/").filter(Boolean).pop();
  if (!validJobId(jobId)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Invalid job ID" })
    };
  }

  const job = await getBlueprintJob(event, jobId);
  if (!job) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Blueprint job not found" })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    body: JSON.stringify(job)
  };
};
