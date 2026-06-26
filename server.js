const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 4173;
const host = process.env.HOST || "0.0.0.0";

function loadEnvFile(fileName) {
  const envPath = path.join(root, fileName);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8"
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleFunction(req, res, functionName) {
  const functionPath = path.join(root, "netlify", "functions", `${functionName}.js`);
  if (!fs.existsSync(functionPath)) {
    res.writeHead(404);
    res.end("Function not found");
    return;
  }
  try {
    const body = await readBody(req);
    delete require.cache[require.resolve(functionPath)];
    const { handler } = require(functionPath);
    const result = await handler({
      httpMethod: req.method,
      headers: req.headers,
      body
    });
    res.writeHead(result.statusCode || 200, result.headers || { "Content-Type": "text/plain; charset=utf-8" });
    res.end(result.body || "");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const functionMatch = urlPath.match(/^\/\.netlify\/functions\/([a-z0-9-]+)$/i);
  if (functionMatch) {
    handleFunction(req, res, functionMatch[1]);
    return;
  }

  const filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`Luna Arcana Tarot is running at http://localhost:${port}`);
});
