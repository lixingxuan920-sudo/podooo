function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const baseUrl = String(process.env.VEDIC_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) {
    return json(503, { error: "星历服务尚未配置 VEDIC_API_URL" });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const headers = { "Content-Type": "application/json" };
    if (process.env.VEDIC_API_KEY) {
      headers["X-Vedic-Api-Key"] = process.env.VEDIC_API_KEY;
    }
    const response = await fetch(`${baseUrl}/western/calculate`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "星历服务返回了无效响应" };
    }
    return json(response.status, data);
  } catch (error) {
    return json(502, { error: error.message || "无法连接星历服务" });
  }
};
