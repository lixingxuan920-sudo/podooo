const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const target = path.join(root, "netlify", "functions", "ephe", "semo_18.se1");
const parts = [
  path.join(root, "ephemeris-source", "semo_18.se1.part0"),
  path.join(root, "ephemeris-source", "semo_18.se1.part1")
];
const expectedBytes = 1304771;
const expectedSha256 = "7034c7825a0fef2f660d99161aa8e60429adfa315d269ac68042ef5a5e6319bf";

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function valid(buffer) {
  return buffer.length === expectedBytes && sha256(buffer) === expectedSha256;
}

if (fs.existsSync(target) && valid(fs.readFileSync(target))) {
  process.exit(0);
}

const joined = Buffer.concat(parts.map((part) => fs.readFileSync(part)));
if (!valid(joined)) {
  throw new Error("Moon ephemeris reconstruction failed integrity validation.");
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, joined);
