(function () {
  const signs = [
    { name: "白羊座", glyph: "♈", element: "火", mode: "开创", ruler: "火星", keywords: ["行动", "勇气", "直接"] },
    { name: "金牛座", glyph: "♉", element: "土", mode: "固定", ruler: "金星", keywords: ["稳定", "感官", "价值"] },
    { name: "双子座", glyph: "♊", element: "风", mode: "变动", ruler: "水星", keywords: ["沟通", "学习", "变化"] },
    { name: "巨蟹座", glyph: "♋", element: "水", mode: "开创", ruler: "月亮", keywords: ["安全感", "家庭", "情绪"] },
    { name: "狮子座", glyph: "♌", element: "火", mode: "固定", ruler: "太阳", keywords: ["表达", "自信", "创造"] },
    { name: "处女座", glyph: "♍", element: "土", mode: "变动", ruler: "水星", keywords: ["分析", "秩序", "服务"] },
    { name: "天秤座", glyph: "♎", element: "风", mode: "开创", ruler: "金星", keywords: ["关系", "平衡", "审美"] },
    { name: "天蝎座", glyph: "♏", element: "水", mode: "固定", ruler: "冥王星", keywords: ["深度", "掌控", "转化"] },
    { name: "射手座", glyph: "♐", element: "火", mode: "变动", ruler: "木星", keywords: ["远方", "信念", "探索"] },
    { name: "摩羯座", glyph: "♑", element: "土", mode: "开创", ruler: "土星", keywords: ["责任", "结构", "目标"] },
    { name: "水瓶座", glyph: "♒", element: "风", mode: "固定", ruler: "天王星", keywords: ["独立", "革新", "群体"] },
    { name: "双鱼座", glyph: "♓", element: "水", mode: "变动", ruler: "海王星", keywords: ["共情", "想象", "灵性"] }
  ];

  const planets = [
    { key: "sun", name: "太阳", glyph: "☉", role: "核心自我、生命意志、长期方向", speed: 1, offset: 0 },
    { key: "moon", name: "月亮", glyph: "☽", role: "情绪需求、安全感、潜意识反应", speed: 13.176, offset: 4 },
    { key: "mercury", name: "水星", glyph: "☿", role: "思维方式、表达、学习与判断", speed: 1.28, offset: 1 },
    { key: "venus", name: "金星", glyph: "♀", role: "爱情模式、审美、吸引与价值感", speed: 1.18, offset: 2 },
    { key: "mars", name: "火星", glyph: "♂", role: "行动力、欲望、冲突和推进方式", speed: 0.524, offset: 5 },
    { key: "jupiter", name: "木星", glyph: "♃", role: "成长机会、信念、扩张和贵人运", speed: 0.083, offset: 8 },
    { key: "saturn", name: "土星", glyph: "♄", role: "责任、限制、长期课题和成熟方式", speed: 0.033, offset: 10 },
    { key: "uranus", name: "天王星", glyph: "♅", role: "独立、突变、突破旧框架", speed: 0.012, offset: 3 },
    { key: "neptune", name: "海王星", glyph: "♆", role: "理想、投射、灵感和迷雾", speed: 0.006, offset: 6 },
    { key: "pluto", name: "冥王星", glyph: "♇", role: "深层转化、控制议题和重生能力", speed: 0.004, offset: 9 },
    { key: "northNode", name: "北交点", glyph: "☊", role: "成长方向、需要练习的新课题", speed: -0.053, offset: 7 },
    { key: "southNode", name: "南交点", glyph: "☋", role: "熟悉惯性、旧有天赋与舒适区", speed: -0.053, offset: 1 },
    { key: "asc", name: "上升", glyph: "ASC", role: "外在气质、第一反应和人生入口", speed: 0, offset: 0 }
  ];

  const chartTypes = {
    natal: "本命盘",
    synastry: "合盘 / 比较盘",
    composite: "组合盘",
    transit: "流年盘",
    "solar-return": "日返盘",
    "lunar-return": "月返盘",
    firdaria: "法达盘",
    profection: "小限盘"
  };

  const houseThemes = [
    "自我呈现、身体、人生开场", "金钱、资源、价值感", "沟通、学习、日常信息",
    "家庭、根基、内在安全", "恋爱、创造、自我表达", "工作、健康、日常秩序",
    "伴侣、合作、公开关系", "亲密、共享资源、深层转化", "远方、信念、进修视野",
    "事业、公众角色、目标成就", "朋友、社群、愿景", "潜意识、疗愈、隐秘压力"
  ];

  const signStart = [
    [3, 21], [4, 20], [5, 21], [6, 22], [7, 23], [8, 23],
    [9, 23], [10, 24], [11, 23], [12, 22], [1, 20], [2, 19]
  ];

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function sunIndex(dateString) {
    if (!dateString) return 0;
    const [, month, day] = dateString.split("-").map(Number);
    let index = 9;
    for (let i = 0; i < signStart.length; i += 1) {
      const [m, d] = signStart[i];
      if (month > m || (month === m && day >= d)) index = i;
    }
    return index;
  }

  function signIndexForPlanet(profile, planet, dateOverride) {
    const birthDate = dateOverride || profile.birthDate || "2000-01-01";
    const date = new Date(`${birthDate}T12:00:00`);
    const doy = dayOfYear(date);
    const base = sunIndex(birthDate);
    if (planet.key === "sun") return base;
    if (planet.key === "asc") {
      const [hRaw, mRaw] = (profile.birthTime || "12:00").split(":").map(Number);
      const h = Number.isFinite(hRaw) ? hRaw : 12;
      const m = Number.isFinite(mRaw) ? mRaw : 0;
      return (base + Math.floor((h + m / 60) / 2) + 6) % 12;
    }
    return Math.abs(Math.floor(base + planet.offset + doy * planet.speed)) % 12;
  }

  function houseFor(index, ascIndex) {
    return ((index - ascIndex + 12) % 12) + 1;
  }

  function buildChart(profile, options = {}) {
    if (!profile.birthDate) return null;
    const dateOverride = options.targetDate || null;
    const asc = signIndexForPlanet(profile, planets.find((p) => p.key === "asc"), dateOverride);
    const placements = planets.map((planet) => {
      const index = signIndexForPlanet(profile, planet, dateOverride);
      const date = new Date(`${dateOverride || profile.birthDate}T12:00:00`);
      const degree = (index * 30 + ((dayOfYear(date) * Math.abs(planet.speed || 1) * 7) % 30)) % 360;
      return {
        ...planet,
        sign: signs[index],
        signIndex: index,
        degree: Number(degree.toFixed(2)),
        house: houseFor(index, asc)
      };
    });
    const elements = placements.reduce((acc, item) => {
      acc[item.sign.element] = (acc[item.sign.element] || 0) + 1;
      return acc;
    }, { 火: 0, 土: 0, 风: 0, 水: 0 });
    const modes = placements.reduce((acc, item) => {
      acc[item.sign.mode] = (acc[item.sign.mode] || 0) + 1;
      return acc;
    }, { 开创: 0, 固定: 0, 变动: 0 });
    const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
    const dominantMode = Object.entries(modes).sort((a, b) => b[1] - a[1])[0][0];
    const aspects = buildAspects(placements);
    return { placements, elements, modes, dominantElement, dominantMode, ascIndex: asc, aspects, chartType: options.chartType || "natal" };
  }

  function buildAspects(placements) {
    const aspectDefs = [
      { name: "合相", angle: 0, orb: 8 }, { name: "六合", angle: 60, orb: 5 },
      { name: "刑相", angle: 90, orb: 6 }, { name: "拱相", angle: 120, orb: 6 },
      { name: "冲相", angle: 180, orb: 7 }
    ];
    const core = placements.filter((p) => ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "asc"].includes(p.key));
    const aspects = [];
    for (let i = 0; i < core.length; i += 1) {
      for (let j = i + 1; j < core.length; j += 1) {
        const diffRaw = Math.abs(core[i].degree - core[j].degree);
        const diff = diffRaw > 180 ? 360 - diffRaw : diffRaw;
        const found = aspectDefs.find((a) => Math.abs(diff - a.angle) <= a.orb);
        if (found) aspects.push({ a: core[i].name, b: core[j].name, type: found.name, orb: Math.abs(diff - found.angle).toFixed(1) });
      }
    }
    return aspects.slice(0, 8);
  }

  function buildComposite(primary, partner) {
    const a = buildChart(primary);
    const b = buildChart(partner || {});
    if (!a || !b) return null;
    const placements = a.placements.map((item) => {
      const pair = b.placements.find((p) => p.key === item.key) || item;
      const degree = (item.degree + pair.degree) / 2;
      const signIndex = Math.floor(degree / 30) % 12;
      return { ...item, degree: Number(degree.toFixed(2)), signIndex, sign: signs[signIndex], house: item.house };
    });
    return { ...a, placements, chartType: "composite", partnerChart: b };
  }

  function marker(index, label, radius = 42, extraClass = "") {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return `<span class="astro-marker ${extraClass}" style="left:${x}%;top:${y}%">${label}</span>`;
  }

  function wheelFromChart(chart) {
    if (!chart) return "";
    return `
      <div class="astro-wheel large" aria-label="星盘盘面">
        ${signs.map((sign, index) => marker(index, sign.glyph, 44)).join("")}
        ${Array.from({ length: 12 }, (_, index) => marker((chart.ascIndex + index) % 12, index + 1, 28, "house-marker")).join("")}
        ${chart.placements.map((item) => marker(item.signIndex, item.glyph, 36, "planet-marker")).join("")}
        <div class="astro-wheel-core">${chartTypes[chart.chartType] || "Chart"}</div>
      </div>
    `;
  }

  function placementCards(chart) {
    return `<div class="placement-grid">${chart.placements.map((item) => `
      <article class="placement-card">
        <h3>${item.name}落${item.sign.name} · 第${item.house}宫</h3>
        <p><strong>度数：</strong>${item.degree.toFixed(2)}°</p>
        <p><strong>主题：</strong>${item.role}</p>
        <p><strong>解读：</strong>${item.sign.name}让${item.name}以${item.sign.keywords.join("、")}的方式表达。第${item.house}宫把这股能量带到“${houseThemes[item.house - 1]}”。</p>
      </article>
    `).join("")}</div>`;
  }

  function aspectPanel(chart) {
    if (!chart.aspects.length) return "<p>当前核心相位较少，解读重点放在三元组、宫位和元素结构。</p>";
    return `<div class="aspect-list">${chart.aspects.map((item) => `
      <span>${item.a} ${item.type} ${item.b}<small>容许度 ${item.orb}°</small></span>
    `).join("")}</div>`;
  }

  function typeReading(chart, profile, options) {
    const sun = chart.placements.find((item) => item.key === "sun");
    const moon = chart.placements.find((item) => item.key === "moon");
    const asc = chart.placements.find((item) => item.key === "asc");
    const type = options.chartType || "natal";
    const partnerName = options.partner?.name || "对方";
    const targetDate = options.targetDate || new Date().toISOString().slice(0, 10);
    const templates = {
      natal: `本命盘重点不是简单说你是什么星座，而是看太阳、月亮、上升如何分工。太阳${sun.sign.name}说明你长期会被“${sun.sign.keywords[0]}”驱动，月亮${moon.sign.name}说明你的安全感来自“${moon.sign.keywords[1]}”，上升${asc.sign.name}则是你面对世界的第一反应。`,
      synastry: `合盘/比较盘重点看两个人的能量如何互相触发。当前以你的盘为主、${partnerName}为参考：先看月亮与金星是否能提供情绪承接，再看火星和土星是否带来吸引、压力或节奏差。`,
      composite: `组合盘看的是“这段关系作为一个整体”的气质。它不等于你或${partnerName}单独的性格，而是你们在一起后形成的第三股能量，适合判断关系目标、相处模式和共同课题。`,
      transit: `流年盘看 ${targetDate} 附近外部环境如何触发本命盘。重点不是预言事件，而是看哪些宫位正在被激活，以及你该把注意力放在哪里。`,
      "solar-return": `日返盘看生日到下一次生日之间的一年主题。它适合判断这一年最重要的成长方向、事业重心、关系课题和能量消耗点。`,
      "lunar-return": `月返盘看未来约一个月的情绪节奏和短期事件触发。它更适合做月度规划、关系观察和状态管理。`,
      firdaria: `法达盘强调人生阶段主星。当前原型以年龄段和主星象征来判断阶段主题，后续接入专业算法后可精确到主限与副限。`,
      profection: `小限盘按年龄推进年度宫位，适合看这一年哪一个生活领域被推到前台，以及年度主星如何影响选择。`
    };
    return templates[type] || templates.natal;
  }

  function reading(profile, options = {}) {
    const chartType = options.chartType || profile.astroChartType || "natal";
    let chart = chartType === "composite"
      ? buildComposite(profile, options.partner)
      : buildChart(profile, { chartType, targetDate: options.targetDate });
    if (!chart) return "<p>填写生日、出生时间和出生城市后，可以生成星盘。</p>";
    chart.chartType = chartType;
    const sun = chart.placements.find((item) => item.key === "sun");
    const moon = chart.placements.find((item) => item.key === "moon");
    const asc = chart.placements.find((item) => item.key === "asc");
    return `
      <div class="astro-tags">
        <span>${chartTypes[chartType] || "星盘"}</span>
        <span>太阳${sun.sign.name}</span>
        <span>月亮${moon.sign.name}</span>
        <span>上升${asc.sign.name}</span>
        <span>${chart.dominantElement}元素突出</span>
      </div>
      ${wheelFromChart(chart)}
      <div class="astro-summary">
        <p><strong>盘型判断：</strong>${typeReading(chart, profile, { ...options, chartType })}</p>
        <p><strong>结构重点：</strong>${chart.dominantElement}元素偏强，说明你处理问题时更容易先使用这一类能量；${chart.dominantMode}模式突出，表示你在行动节奏上会呈现明显的${chart.dominantMode}特质。</p>
        <p><strong>相位观察：</strong>相位代表能量之间的合作或拉扯，下面列出本盘最需要关注的核心相位。</p>
        ${aspectPanel(chart)}
      </div>
      ${placementCards(chart)}
      <p class="disclaimer">当前为本地近似星盘原型，已按盘型输出结构化解读。若要达到专业精度，需要接入 Swiss Ephemeris、出生地经纬度、时区和宫制算法。</p>
    `;
  }

  function shortText(profile) {
    const chart = buildChart(profile);
    if (!chart) return "";
    const sun = chart.placements.find((item) => item.key === "sun");
    const moon = chart.placements.find((item) => item.key === "moon");
    const asc = chart.placements.find((item) => item.key === "asc");
    return `太阳${sun.sign.name}，月亮${moon.sign.name}，上升${asc.sign.name}，${chart.dominantElement}元素突出`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pointByKey(chart, key) {
    return chart?.points?.find((item) => item.key === key);
  }

  function degreeLabel(point) {
    if (!point) return "—";
    const degree = Math.floor(point.degree);
    const minute = Math.round((point.degree - degree) * 60);
    return `${degree}°${String(minute).padStart(2, "0")}′ ${point.sign}`;
  }

  function dignityLabel(point) {
    return point?.dignity?.name || "—";
  }

  function polar(longitude, ascendant, radius, center = 300) {
    const angle = (180 - (longitude - ascendant)) * Math.PI / 180;
    return {
      x: center + Math.cos(angle) * radius,
      y: center - Math.sin(angle) * radius
    };
  }

  function svgLineAt(longitude, ascendant, inner, outer, className) {
    const a = polar(longitude, ascendant, inner);
    const b = polar(longitude, ascendant, outer);
    return `<line class="${className}" x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" />`;
  }

  function spreadPointRadii(points, baseRadius) {
    const sorted = [...points].sort((a, b) => a.longitude - b.longitude);
    const radii = new Map();
    sorted.forEach((point, index) => {
      const previous = sorted[index - 1];
      const close = previous && Math.abs(point.longitude - previous.longitude) < 6;
      radii.set(point.key, baseRadius - (close ? 18 : 0));
    });
    return radii;
  }

  function professionalWheel(chart, overlay, chartType) {
    if (!chart?.points?.length) return "";
    const ascendant = chart.angles?.asc ?? pointByKey(chart, "asc")?.longitude ?? 0;
    const zodiacLines = Array.from({ length: 12 }, (_, index) => (
      svgLineAt(index * 30, ascendant, 224, 274, "zodiac-line")
    )).join("");
    const zodiacGlyphs = signs.map((sign, index) => {
      const point = polar(index * 30 + 15, ascendant, 250);
      return `<text class="zodiac-glyph" x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}">${sign.glyph}</text>`;
    }).join("");
    const houseLines = chart.houses.map((house) => (
      svgLineAt(house.longitude, ascendant, 86, 222, `house-line ${house.house === 1 || house.house === 10 ? "axis-line" : ""}`)
    )).join("");
    const houseLabels = chart.houses.map((house, index) => {
      const next = chart.houses[(index + 1) % 12];
      const span = (next.longitude - house.longitude + 360) % 360;
      const point = polar((house.longitude + span / 2) % 360, ascendant, 107);
      return `<text class="house-number" x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}">${house.house}</text>`;
    }).join("");
    const pointRadii = spreadPointRadii(chart.points, 190);
    const pointLabels = chart.points.map((item) => {
      const point = polar(item.longitude, ascendant, pointRadii.get(item.key));
      return `
        <g class="chart-point natal-point">
          <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="14"></circle>
          <text x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}">${escapeHtml(item.glyph)}</text>
        </g>
      `;
    }).join("");
    const aspectLines = (chart.aspects || []).slice(0, 24).map((aspect) => {
      const a = pointByKey(chart, aspect.a);
      const b = pointByKey(chart, aspect.b);
      if (!a || !b) return "";
      const start = polar(a.longitude, ascendant, 154);
      const end = polar(b.longitude, ascendant, 154);
      return `<line class="aspect-line ${aspect.type}" style="--aspect-color:${aspect.color}" x1="${start.x.toFixed(2)}" y1="${start.y.toFixed(2)}" x2="${end.x.toFixed(2)}" y2="${end.y.toFixed(2)}" />`;
    }).join("");
    const overlayLabels = overlay?.points?.map((item) => {
      const point = polar(item.longitude, ascendant, 208);
      return `
        <g class="chart-point overlay-point">
          <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="12"></circle>
          <text x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}">${escapeHtml(item.glyph)}</text>
        </g>
      `;
    }).join("") || "";
    return `
      <div class="professional-wheel-wrap">
        <svg class="professional-wheel" viewBox="0 0 600 600" role="img" aria-label="真实星历星盘">
          <circle class="wheel-bg" cx="300" cy="300" r="286"></circle>
          <circle class="zodiac-ring" cx="300" cy="300" r="274"></circle>
          <circle class="zodiac-ring inner" cx="300" cy="300" r="224"></circle>
          <circle class="aspect-ring" cx="300" cy="300" r="154"></circle>
          ${zodiacLines}
          ${zodiacGlyphs}
          ${houseLines}
          ${houseLabels}
          ${aspectLines}
          ${pointLabels}
          ${overlayLabels}
          <circle class="wheel-center" cx="300" cy="300" r="45"></circle>
          <text class="wheel-center-title" x="300" y="295">${chartType === "transit" ? "NATAL + TRANSIT" : "NATAL CHART"}</text>
          <text class="wheel-center-subtitle" x="300" y="316">TROPICAL · SWISS EPHEMERIS</text>
        </svg>
        <div class="chart-legend">
          <span><i class="legend-dot natal"></i>本命行星</span>
          ${overlay ? `<span><i class="legend-dot transit"></i>${chartType === "synastry" ? "对方行星" : "行运行星"}</span>` : ""}
          <span><i class="legend-line soft"></i>和谐相位</span>
          <span><i class="legend-line hard"></i>紧张相位</span>
        </div>
      </div>
    `;
  }

  function placementTable(chart, title = "本命行星落点") {
    if (!chart?.points?.length) return "";
    return `
      <section class="astro-data-section">
        <div class="astro-section-title">
          <p class="kicker">PLANET POSITIONS</p>
          <h3>${title}</h3>
        </div>
        <div class="astro-table-wrap">
          <table class="astro-data-table">
            <thead><tr><th>星体</th><th>位置</th><th>宫位</th><th>尊贵</th><th>状态</th></tr></thead>
            <tbody>
              ${chart.points.map((item) => `
                <tr>
                  <td><span class="planet-symbol">${escapeHtml(item.glyph)}</span>${escapeHtml(item.name)}</td>
                  <td>${degreeLabel(item)}</td>
                  <td>${item.house ? `第 ${item.house} 宫` : "—"}</td>
                  <td>${escapeHtml(dignityLabel(item))}</td>
                  <td>${item.retrograde ? "逆行 R" : "顺行"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function aspectCards(aspects, title) {
    if (!aspects?.length) return "";
    return `
      <section class="astro-data-section">
        <div class="astro-section-title">
          <p class="kicker">ASPECTS</p>
          <h3>${title}</h3>
        </div>
        <div class="professional-aspect-grid">
          ${aspects.slice(0, 18).map((item) => `
            <article>
              <span class="aspect-swatch" style="--aspect-color:${item.color}"></span>
              <div>
                <strong>${escapeHtml(item.aName)} ${escapeHtml(item.name)} ${escapeHtml(item.bName)}</strong>
                <small>容许度 ${Number(item.orb).toFixed(2)}°</small>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function balanceAndPatternCards(chart) {
    if (!chart) return "";
    const balance = chart.balance || {};
    const patterns = chart.aspectPatterns || [];
    const rulers = chart.houseRulers || [];
    const careerRuler = rulers.find((item) => item.house === 10);
    const wealthRuler = rulers.find((item) => item.house === 2);
    const relationshipRuler = rulers.find((item) => item.house === 7);
    const patternText = patterns.length
      ? patterns.map((item) => `${item.name}（${item.memberNames.join("、")}）`).join("；")
      : "未形成主要经典相位格局";
    return `
      <section class="astro-data-section">
        <div class="astro-section-title">
          <p class="kicker">CHART STRUCTURE</p>
          <h3>整体格局与宫主星</h3>
        </div>
        <div class="astro-structure-grid">
          <article>
            <small>元素重点</small>
            <strong>${escapeHtml(balance.dominantElement || "—")}元素突出</strong>
            <p>${Object.entries(balance.elements || {}).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>
          </article>
          <article>
            <small>行动模式</small>
            <strong>${escapeHtml(balance.dominantModality || "—")}模式突出</strong>
            <p>${Object.entries(balance.modalities || {}).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>
          </article>
          <article>
            <small>相位格局</small>
            <strong>${patterns.length ? `${patterns.length} 组重点格局` : "无大型格局"}</strong>
            <p>${escapeHtml(patternText)}</p>
          </article>
        </div>
        <div class="astro-ruler-grid">
          ${[
            ["财富", wealthRuler],
            ["关系", relationshipRuler],
            ["事业", careerRuler]
          ].map(([label, ruler]) => `
            <article>
              <small>${label}宫主星</small>
              <strong>${ruler ? `${escapeHtml(ruler.rulerName)}落第 ${ruler.rulerHouse} 宫` : "—"}</strong>
              ${ruler?.coRulerName ? `<p>现代共主星：${escapeHtml(ruler.coRulerName)}落第 ${ruler.coRulerHouse} 宫</p>` : ""}
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function professionalReading(data, options = {}) {
    const chartType = data.chartType || options.chartType || "natal";
    const primary = chartType === "composite" && data.composite ? data.composite : data.natal;
    const overlay = chartType === "transit"
      ? data.transit
      : (chartType === "synastry" ? data.partner : null);
    const sun = pointByKey(data.natal, "sun");
    const moon = pointByKey(data.natal, "moon");
    const asc = pointByKey(data.natal, "asc");
    const mc = pointByKey(data.natal, "mc");
    const chartLabel = chartTypes[chartType] || "本命盘";
    return `
      <div class="professional-chart-header">
        <div>
          <p class="kicker">WESTERN ASTROLOGY · TROPICAL</p>
          <h2>${escapeHtml(chartLabel)}</h2>
          <p>${escapeHtml(data.subject?.resolvedName || data.subject?.city || "")}</p>
        </div>
        <span class="ephemeris-badge">Swiss Ephemeris</span>
      </div>
      <div class="astro-key-grid">
        <article><small>太阳</small><strong>${degreeLabel(sun)}</strong></article>
        <article><small>月亮</small><strong>${degreeLabel(moon)}</strong></article>
        <article><small>上升</small><strong>${degreeLabel(asc)}</strong></article>
        <article><small>天顶</small><strong>${degreeLabel(mc)}</strong></article>
      </div>
      ${professionalWheel(primary, overlay, chartType)}
      <p class="calculation-meta">
        热带黄道 · ${escapeHtml(primary.houseSystem || data.natal?.houseSystem || "Placidus")} ·
        ${escapeHtml(data.subject?.timezone || "")} ·
        ${escapeHtml(data.subject?.birthDateTime || "")}
      </p>
      ${data.calculationNote ? `<p class="astro-notice">${escapeHtml(data.calculationNote)}</p>` : ""}
      ${balanceAndPatternCards(primary)}
      ${placementTable(primary, chartType === "composite" ? "组合盘行星中点" : "本命行星落点")}
      ${overlay ? placementTable(overlay, chartType === "synastry" ? "对方行星落点" : "行运行星位置") : ""}
      ${aspectCards(primary.aspects, chartType === "composite" ? "组合盘主要相位" : "本命主要相位")}
      ${aspectCards(data.interAspects, chartType === "synastry" ? "双方交互相位" : "行运触发相位")}
      <p class="disclaimer">星盘用于自我观察与娱乐参考，不替代医疗、法律、财务或其他专业意见。</p>
    `;
  }

  window.AstrologySkill = {
    signs,
    planets,
    chartTypes,
    buildChart,
    buildComposite,
    reading,
    professionalReading,
    wheel: (profile) => wheelFromChart(buildChart(profile)),
    shortText
  };
})();
