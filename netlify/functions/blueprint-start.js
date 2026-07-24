const crypto = require("crypto");
const { setBlueprintJob } = require("./blueprint-job-store.js");

function requestOrigin(event) {
  if (event.rawUrl) return new URL(event.rawUrl).origin;
  const protocol = event.headers?.["x-forwarded-proto"] || "https";
  const host = event.headers?.host;
  if (!host) throw new Error("Unable to resolve the current deploy origin.");
  return `${protocol}://${host}`;
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

  const jobId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await setBlueprintJob(event, jobId, {
    jobId,
    status: "queued",
    progress: 5,
    createdAt,
    updatedAt: createdAt
  });

  try {
    const response = await fetch(`${requestOrigin(event)}/.netlify/functions/blueprint-worker-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, payload, createdAt })
    });
    if (response.status !== 202) {
      throw new Error(`Background function returned HTTP ${response.status}.`);
    }
  } catch (error) {
    await setBlueprintJob(event, jobId, {
      jobId,
      status: "failed",
      progress: 100,
      error: error.message,
      createdAt,
      updatedAt: new Date().toISOString()
    });
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Unable to start the Life Blueprint job" })
    };
  }

  return {
    statusCode: 202,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ jobId, status: "queued", progress: 5 })
  };
};
