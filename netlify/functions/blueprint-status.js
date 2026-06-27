function renderBaseUrl() {
  return (process.env.VEDIC_API_URL || "").replace(/\/$/, "");
}

exports.handler = async (event, context) => {
  const jobId = context.params?.jobId || event.path.split("/").filter(Boolean).pop();
  const baseUrl = renderBaseUrl();
  if (!baseUrl) {
    return {
      statusCode: 501,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "VEDIC_API_URL is not configured" })
    };
  }
  const response = await fetch(`${baseUrl}/blueprint/${encodeURIComponent(jobId)}`, {
    headers: {
      ...(process.env.VEDIC_API_KEY ? { "X-Vedic-Api-Key": process.env.VEDIC_API_KEY } : {})
    }
  });
  const text = await response.text();
  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: text
  };
};
