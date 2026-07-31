const test = require("node:test");
const assert = require("node:assert/strict");
const { validateChartJson } = require("../netlify/functions/vedic-chart-contract.js");
const { _test } = require("../netlify/functions/deepseek-vedic.js");

function validChart() {
  return {
    birth: {}, lagna: {},
    planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((name) => ({ name })),
    houses: Array.from({ length: 12 }, (_, index) => ({ number: index + 1 })),
    nakshatra: {},
    dasha: { mahadashas: [{ planet: "Sun" }] },
    navamsa: { available: true, planetPositions: Array.from({ length: 9 }, () => ({})) },
    yogas: [], aspects: [], shadbala: {}
  };
}

test("contract rejects incomplete Stage 1 data", () => {
  const result = validateChartJson({ birth: {} });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("missing:lagna"));
});

test("DeepSeek prompt treats JSON as the only chart authority", () => {
  const chart = validChart();
  assert.equal(validateChartJson(chart).ok, true);
  const prompt = _test.masterPrompt(chart, "事业");
  assert.match(prompt, /严禁自行计算/);
  assert.match(prompt, /JSON 没有提供的信息/);
  assert.match(prompt, /不得自行新增Yoga/);
  assert.match(prompt, /"planets"/);
});
