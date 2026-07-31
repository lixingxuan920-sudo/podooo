const { handler: deepseekVedicHandler } = require("./deepseek-vedic.js");

function renderBaseUrl() {
  return (
    process.env.VEDIC_API_URL || "https://podooo.onrender.com"
  ).replace(/\/$/, "");
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

  const baseUrl = renderBaseUrl();
  if (baseUrl) {
    const response = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.VEDIC_API_KEY ? { "X-Vedic-Api-Key": process.env.VEDIC_API_KEY } : {})
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    if (response.ok) return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: text };
  }

  const response = await deepseekVedicHandler({
    ...event,
    body: JSON.stringify({
      ...payload,
      masterReading: payload.blueprint || payload.masterReading || "",
      mode: "qa"
    })
  });

  if (response.statusCode !== 200) return response;

  const data = JSON.parse(response.body || "{}");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answer: data.reading || "",
      createdAt: new Date().toISOString()
    })
  };
};
