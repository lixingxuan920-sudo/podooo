const STORE_NAME = "vedic-blueprint-jobs";
const JOB_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validJobId(value) {
  return JOB_ID_PATTERN.test(String(value || ""));
}

async function getJobStore() {
  const { getDeployStore } = await import("@netlify/blobs");
  return getDeployStore({ name: STORE_NAME, consistency: "strong" });
}

async function setBlueprintJob(jobId, value) {
  if (!validJobId(jobId)) throw new Error("Invalid blueprint job ID.");
  const store = await getJobStore();
  await store.setJSON(jobId, value);
}

async function getBlueprintJob(jobId) {
  if (!validJobId(jobId)) return null;
  const store = await getJobStore();
  return store.get(jobId, { type: "json", consistency: "strong" });
}

module.exports = { getBlueprintJob, setBlueprintJob, validJobId };
