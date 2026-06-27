const { handler: deepseekVedicHandler } = require("./deepseek-vedic.js");

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
