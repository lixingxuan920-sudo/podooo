function renderBaseUrl() {
  return (process.env.VEDIC_API_URL || "").replace(/\/$/, "");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const baseUrl = renderBaseUrl();
  if (!baseUrl) {
    return {
      statusCode: 501,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "VEDIC_API_URL is not configured" })
    };
  }
  const response = await fetch(`${baseUrl}/blueprint/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.VEDIC_API_KEY ? { "X-Vedic-Api-Key": process.env.VEDIC_API_KEY } : {})
    },
    body: event.body || "{}"
  });
  const text = await response.text();
  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: text
  };
};
