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

  const email = String(payload.email || "").trim().toLowerCase();
  const code = String(payload.code || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    return { statusCode: 400, body: "Invalid email or code" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VERIFY_FROM_EMAIL || "Luna Arcana <onboarding@resend.dev>";
  if (!apiKey) {
    return { statusCode: 501, body: "Email service is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Luna Arcana 登录验证码",
      html: `
        <div style="font-family:Arial,'Microsoft YaHei',sans-serif;color:#2e2b2c;line-height:1.7">
          <h2>Luna Arcana 登录验证码</h2>
          <p>你的验证码是：</p>
          <p style="font-size:28px;letter-spacing:6px;font-weight:700;color:#a85f73">${code}</p>
          <p>验证码 10 分钟内有效。如非本人操作，请忽略这封邮件。</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    return { statusCode: 502, body: "Email provider failed" };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
