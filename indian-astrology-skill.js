(function () {
  const rashi = [
    "白羊", "金牛", "双子", "巨蟹", "狮子", "处女",
    "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"
  ];

  const signGlyphs = ["Me", "Vr", "Mi", "Ka", "Si", "Kn", "Tu", "Vr", "Dh", "Mk", "Ku", "Mi"];

  const nakshatras = [
    "Ashwini 阿湿毗尼", "Bharani 婆罗尼", "Krittika 昴宿", "Rohini 毕宿",
    "Mrigashira 觜宿", "Ardra 参宿", "Punarvasu 井宿", "Pushya 鬼宿",
    "Ashlesha 柳宿", "Magha 星宿", "Purva Phalguni 张宿", "Uttara Phalguni 翼宿",
    "Hasta 轸宿", "Chitra 角宿", "Swati 亢宿", "Vishakha 氐宿",
    "Anuradha 房宿", "Jyeshtha 心宿", "Mula 尾宿", "Purva Ashadha 箕宿",
    "Uttara Ashadha 斗宿", "Shravana 牛宿", "Dhanishta 女宿", "Shatabhisha 虚宿",
    "Purva Bhadrapada 室宿", "Uttara Bhadrapada 壁宿", "Revati 奎宿"
  ];

  const houses = [
    "自我、身体、生命力、人生入口",
    "财富、语言、家庭资源、价值感",
    "沟通、勇气、手足、主动尝试",
    "家庭、房产、母亲、内在安全感",
    "创造、恋爱、子女、才华与福德",
    "工作、健康、债务、竞争和服务",
    "婚姻、合作、公开关系和契约",
    "转化、隐秘、共享资源、危机与重生",
    "信念、高等学习、远行、导师与好运",
    "事业、名声、权威、社会角色",
    "收益、社群、愿望、人脉与长期结果",
    "潜意识、消耗、远离、灵性和释放"
  ];

  const grahas = [
    { key: "lagna", name: "上升", abbr: "Asc", offset: 0, role: "命盘入口、身体气质、人生展开方式" },
    { key: "sun", name: "太阳 Surya", abbr: "Su", offset: 9, role: "自我意志、父性力量、荣誉感和权威关系" },
    { key: "moon", name: "月亮 Chandra", abbr: "Mo", offset: 4, role: "心性、情绪、安全感、习惯性反应" },
    { key: "mars", name: "火星 Mangala", abbr: "Ma", offset: 6, role: "行动、竞争、冲突、执行力和勇气" },
    { key: "mercury", name: "水星 Budha", abbr: "Me", offset: 2, role: "思维、学习、语言、交易和判断" },
    { key: "jupiter", name: "木星 Guru", abbr: "Ju", offset: 8, role: "智慧、扩张、导师、信念和保护力" },
    { key: "venus", name: "金星 Shukra", abbr: "Ve", offset: 3, role: "爱情、审美、享受、关系吸引力" },
    { key: "saturn", name: "土星 Shani", abbr: "Sa", offset: 11, role: "责任、延迟、现实压力、长期成熟" },
    { key: "rahu", name: "罗喉 Rahu", abbr: "Ra", offset: 7, role: "欲望、执念、突破传统、今生被吸引的方向" },
    { key: "ketu", name: "计都 Ketu", abbr: "Ke", offset: 1, role: "旧有惯性、抽离、灵性、已经熟悉但容易疏离的部分" }
  ];

  const southIndianOrder = [
    11, 0, 1, 2,
    10, null, null, 3,
    9, null, null, 4,
    8, 7, 6, 5
  ];

  const vedicSkillRuntime = {
    sourceRepo: "CNWU16/vedic-astro-skills",
    sourceUrl: "https://github.com/CNWU16/vedic-astro-skills",
    adapter: "web-vedic-skill-adapter",
    calculatorFoundation: "vedic-calculator",
    canonicalOutput: "structured_data.md",
    installedModules: [
      "vedic-calculator",
      "vedic-core",
      "vedic-reader",
      "vedic-career",
      "vedic-love",
      "vedic-rectifier",
      "vedic-synastry"
    ]
  };

  const skillProtocols = {
    reader: {
      label: "综合命盘 / vedic-reader",
      requiredBase: "vedic-calculator",
      focus: "整合 D-1、月亮、月宿、Rahu/Ketu 轴、土星课题与大运节奏，输出完整命盘叙事。",
      output: "整体气质、心性模式、事业与关系倾向、业力课题、近期建议"
    },
    core: {
      label: "核心校验 / vedic-core",
      requiredBase: "vedic-calculator",
      focus: "先做盲派式结构校验，检查上升、月亮、强弱、宫位主轴和互相矛盾处。",
      output: "命盘骨架、关键证据、矛盾点、需要星历复核的数据"
    },
    career: {
      label: "事业专题 / vedic-career",
      requiredBase: "vedic-calculator + vedic-core",
      focus: "重点读取十宫、六宫、二宫、十一宫、D-10、土星、太阳、火星、当前大运。",
      output: "职业天赋、适合环境、跳槽/转型节奏、风险点、三步行动建议"
    },
    love: {
      label: "感情专题 / vedic-love",
      requiredBase: "vedic-calculator + vedic-core",
      focus: "重点读取七宫、金星、月亮、Rahu/Ketu、D-9、关系中的依恋模式与承诺节奏。",
      output: "吸引模式、亲密关系课题、适配对象、当前关系提醒、沟通建议"
    },
    rectifier: {
      label: "出生时间校正 / vedic-rectifier",
      requiredBase: "vedic-calculator",
      focus: "对出生时间敏感项做校验，提示需要用户补充的人生事件，不直接伪造精准校时。",
      output: "可疑时间点、需核对事件、可能变动的上升/分盘、下一步校时问题"
    },
    synastry: {
      label: "合盘 / vedic-synastry",
      requiredBase: "vedic-calculator + 两份命盘",
      focus: "需要两份完整命盘，比较月亮、金星、七宫、Rahu/Ketu、D-9 与彼此大运互动。",
      output: "吸引来源、相处摩擦、长期稳定性、现实阻力、关系建议"
    }
  };

  const pdfReferenceData = {
    source: "1025.pdf",
    birth: {
      date: "2002-10-25",
      time: "07:05:34",
      timezone: "UTC+08:00",
      place: "Qinghaihu, China",
      longitude: "101E49'10\"",
      latitude: "36N50'00\""
    },
    chartSettings: {
      ayanamsa: "Lahiri",
      chartType: "Natal Chart / Rasi",
      lunarDay: "Chitrabhanu Aswayuja Krishna Chaturthi",
      nakshatra: "Rohini",
      weekday: "Thursday",
      yoga: "Variyan Yoga",
      karana: "Bava Karana",
      hora: "Sun Hora"
    },
    grahaPositions: [
      { body: "Lagna", sign: "Libra", degree: "1°50'04.14\"", nakshatra: "Chitra", pada: "3" },
      { body: "Sun", sign: "Libra", degree: "7°29'26.54\"", nakshatra: "Swati", pada: "1" },
      { body: "Moon", sign: "Taurus", degree: "21°31'16.08\"", nakshatra: "Rohini", pada: "4" },
      { body: "Mars", sign: "Virgo", degree: "0°21'17.20\"", nakshatra: "Hasta", pada: "1" },
      { body: "Mercury", sign: "Virgo", degree: "24°31'10.74\"", nakshatra: "Chitra", pada: "1" },
      { body: "Jupiter", sign: "Cancer", degree: "21°42'00.67\"", nakshatra: "Ashlesha", pada: "2" },
      { body: "Venus (R)", sign: "Libra", degree: "17°48'12.48\"", nakshatra: "Swati", pada: "4" },
      { body: "Saturn (R)", sign: "Gemini", degree: "12°53'32.14\"", nakshatra: "Mrigashira", pada: "4" },
      { body: "Rahu", sign: "Taurus", degree: "16°45'21.25\"", nakshatra: "Rohini", pada: "2" },
      { body: "Ketu", sign: "Scorpio", degree: "16°45'21.25\"", nakshatra: "Jyeshtha", pada: "1" },
      { body: "Maandi", sign: "Leo", degree: "16°39'39.36\"", nakshatra: "Purva Phalguni", pada: "1" },
      { body: "Gulika", sign: "Leo", degree: "14°43'52.04\"", nakshatra: "Magha", pada: "4" },
      { body: "Sree Lagna", sign: "Aries", degree: "27°36'18.22\"", nakshatra: "Krittika", pada: "1" },
      { body: "Hora Lagna", sign: "Virgo", degree: "5°23'55.04\"", nakshatra: "Hasta", pada: "4" },
      { body: "Ghati Lagna", sign: "Virgo", degree: "2°53'34.85\"", nakshatra: "Uttara Phalguni", pada: "2" },
      { body: "Vighati Lagna", sign: "Taurus", degree: "0°40'55.39\"", nakshatra: "Krittika", pada: "2" }
    ],
    modules: [
      "Rasi / D-1 本命盘",
      "Hora / D-2 财富分盘",
      "Drekkana / D-3 手足与行动分盘",
      "Chaturthamsha / D-4 房产与根基分盘",
      "Saptamsha / D-7 子女与创造分盘",
      "Navamsa / D-9 婚姻与灵魂成熟分盘",
      "Dasamsa / D-10 事业分盘",
      "Dwadasamsa / D-12 家族与父母分盘",
      "Shodasamsa / D-16 舒适与载具分盘",
      "Trimshamsa / D-30 隐性压力分盘",
      "Shastiamsa / D-60 深层业力分盘",
      "Ashtakavarga of Rasi Chart",
      "Shadbala / Vimshopaka Bala",
      "Vimshottari Dasha",
      "Yogini Dasha",
      "Narayana Dasha",
      "Jaimini / Chara Dasha"
    ]
  };

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function dmsToDecimal(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const text = String(value).trim();
    if (!text) return null;
    const numeric = Number(text);
    if (Number.isFinite(numeric)) return numeric;
    const match = text.match(/^(\d+(?:\.\d+)?)([NSEW])\s*(?:(\d+(?:\.\d+)?)')?\s*(?:(\d+(?:\.\d+)?)")?/i);
    if (!match) return null;
    const degree = Number(match[1]);
    const direction = match[2].toUpperCase();
    const minute = Number(match[3] || 0);
    const second = Number(match[4] || 0);
    let decimal = degree + minute / 60 + second / 3600;
    if (direction === "S" || direction === "W") decimal *= -1;
    return decimal;
  }

  function timezoneOffsetMinutes(timezone) {
    const match = String(timezone || "").match(/UTC\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) return 480;
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2] || 0) * 60 + Number(match[3] || 0));
  }

  function birthTimeParts(profile) {
    const [hourRaw, minuteRaw, secondRaw] = String(profile.birthTime || "12:00").split(":").map(Number);
    return {
      hour: Number.isFinite(hourRaw) ? hourRaw : 12,
      minute: Number.isFinite(minuteRaw) ? minuteRaw : 0,
      second: Number.isFinite(secondRaw) ? secondRaw : Number(profile.birthSecond || 0)
    };
  }

  function formattedBirthTime(profile) {
    const { hour, minute, second } = birthTimeParts(profile);
    const base = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return second ? `${base}:${String(second).padStart(2, "0")}` : (profile.birthTime || base);
  }

  function baseIndex(profile, offset = 0) {
    const date = new Date(`${profile.birthDate || "2000-01-01"}T12:00:00`);
    const day = dayOfYear(date);
    const { hour, minute, second } = birthTimeParts(profile);
    const longitude = dmsToDecimal(profile.longitude);
    const zoneMinutes = timezoneOffsetMinutes(profile.timezone);
    const longitudeMinutes = Number.isFinite(longitude) ? longitude * 4 : zoneMinutes;
    const localMeanCorrection = profile.useLmt ? 0 : (longitudeMinutes - zoneMinutes);
    const birthMinutes = hour * 60 + minute + second / 60 + localMeanCorrection;
    return Math.abs(Math.floor(day / 30 + birthMinutes / 120 + offset)) % 12;
  }

  function buildPartnerSnapshot(partner) {
    if (!partner?.birthDate) return null;
    const lagna = baseIndex(partner, 0);
    const moonIndex = baseIndex(partner, 4);
    const venusIndex = baseIndex(partner, 3);
    return {
      name: partner.name || "对方",
      preciseBirth: {
        date: partner.birthDate || "",
        time: formattedBirthTime(partner),
        place: partner.birthCity || ""
      },
      lagnaSign: rashi[lagna],
      moonSign: rashi[moonIndex],
      venusSign: rashi[venusIndex],
      note: "当前为合盘对象的本地近似快照；正式合盘需两份完整星历排盘。"
    };
  }

  function buildStructuredData(profile, chart, options = {}) {
    const protocol = chart.skillProtocol || skillProtocols.reader;
    const lagna = chart.placements.find((item) => item.key === "lagna");
    const moon = chart.placements.find((item) => item.key === "moon");
    const rahu = chart.placements.find((item) => item.key === "rahu");
    const ketu = chart.placements.find((item) => item.key === "ketu");
    const selectedSkill = options.vedicModule || "reader";
    const moduleName = `vedic-${selectedSkill}`;
    const route = [
      "vedic-reader",
      "vedic-calculator",
      selectedSkill === "reader" ? "vedic-core" : moduleName
    ].filter((item, index, arr) => item && arr.indexOf(item) === index);
    const warnings = [];
    if (!profile.birthTime) warnings.push("缺少出生时间，Lagna、分盘和大运精度会下降。");
    if (!profile.latitude || !profile.longitude) warnings.push("缺少经纬度，需先用地址解析或手动填写。");
    if (selectedSkill === "synastry" && !chart.partnerChart) warnings.push("合盘需要第二份出生资料，目前只能做单盘关系倾向。");

    return {
      metadata: {
        schema: "CNWU16/vedic-astro-skills-compatible",
        sourceRepo: vedicSkillRuntime.sourceRepo,
        sourceUrl: vedicSkillRuntime.sourceUrl,
        adapter: vedicSkillRuntime.adapter,
        generatedAt: new Date().toISOString(),
        selectedSkill: moduleName,
        skillRoute: route,
        calculatorFoundation: vedicSkillRuntime.calculatorFoundation,
        canonicalOutput: vedicSkillRuntime.canonicalOutput
      },
      birth_details: chart.preciseBirth,
      calculation_settings: {
        system: chart.system,
        ayanamsa: chart.preciseBirth.ayanamsa || "Lahiri",
        chartStyle: "South Indian Rashi",
        precisionMode: "jhora-style-input-with-web-fallback",
        professionalBackendNeeded: true
      },
      skill_protocol: {
        label: protocol.label,
        requiredBase: protocol.requiredBase,
        focus: protocol.focus,
        expectedOutput: protocol.output
      },
      panchanga: chart.panchanga,
      core_axis: {
        lagna: { sign: lagna.sign, house: lagna.house },
        moon: { sign: moon.sign, house: moon.house, nakshatra: chart.nakshatra },
        rahu_ketu_axis: {
          rahu: { sign: rahu.sign, house: rahu.house },
          ketu: { sign: ketu.sign, house: ketu.house }
        }
      },
      graha_positions: chart.placements.map((item) => ({
        graha: item.name,
        abbreviation: item.abbr,
        sign: item.sign,
        house: item.house,
        role: item.role
      })),
      varga_charts: chart.divisionalCharts,
      dashas: {
        vimshottari: chart.dashaTimeline
      },
      strength: {
        shadbala: chart.strengthSummary,
        ashtakavarga: chart.ashtakavarga
      },
      synastry: chart.partnerChart ? {
        partnerChart: chart.partnerChart,
        status: "partner_snapshot_ready"
      } : null,
      validation: {
        hasBirthTime: Boolean(profile.birthTime),
        hasCoordinates: Boolean(profile.latitude && profile.longitude),
        hasTimezone: Boolean(profile.timezone),
        hasAyanamsa: Boolean(profile.ayanamsa || chart.preciseBirth.ayanamsa),
        rahuKetuOpposition: true,
        warnings
      }
    };
  }

  function buildChart(profile, options = {}) {
    if (!profile.birthDate) return null;
    const protocol = skillProtocols[options.vedicModule] || skillProtocols.reader;
    const lagna = baseIndex(profile, 0);
    const rahu = baseIndex(profile, 7);
    const ketu = (rahu + 6) % 12;
    const nak = Math.abs(Math.floor((dayOfYear(new Date(`${profile.birthDate}T12:00:00`)) * 27) / 365)) % 27;
    const placements = grahas.map((graha) => {
      const signIndex = graha.key === "ketu" ? ketu : graha.key === "rahu" ? rahu : baseIndex(profile, graha.offset);
      return {
        ...graha,
        signIndex,
        sign: rashi[signIndex],
        house: ((signIndex - lagna + 12) % 12) + 1
      };
    });
    const divisionalCharts = buildDivisionalCharts(profile, lagna);
    const dashaTimeline = buildDashaTimeline(profile);
    const strengthSummary = buildStrengthSummary(placements);
    const ashtakavarga = buildAshtakavarga(placements);
    const chart = {
      system: "south-indian-rashi",
      ayanamsa: "近似 Lahiri 风格",
      skillRuntime: vedicSkillRuntime,
      skillProtocol: protocol,
      preciseBirth: {
        date: profile.birthDate || "",
        time: formattedBirthTime(profile),
        seconds: profile.birthSecond || "",
        place: profile.birthCity || "",
        longitude: profile.longitude || "",
        latitude: profile.latitude || "",
        timezone: profile.timezone || "",
        timezoneDirection: profile.timezoneDirection || "",
        timezoneHour: profile.timezoneHour || "",
        timezoneMinute: profile.timezoneMinute || "",
        daylightSaving: Boolean(profile.daylightSaving),
        useLmt: Boolean(profile.useLmt),
        altitude: profile.altitude || "",
        atmosphericPressure: profile.atmosphericPressure || "",
        atmosphericTemperature: profile.atmosphericTemperature || "",
        ayanamsa: profile.ayanamsa || "Lahiri"
      },
      lagna,
      nakshatra: nakshatras[nak],
      panchanga: buildPanchanga(profile, nak),
      placements,
      divisionalCharts,
      dashaTimeline,
      strengthSummary,
      ashtakavarga,
      partnerChart: options.vedicModule === "synastry" ? buildPartnerSnapshot(options.partner) : null
    };
    chart.structuredData = buildStructuredData(profile, chart, options);
    return chart;
  }

  function buildPanchanga(profile, nakIndex) {
    const date = new Date(`${profile.birthDate || "2000-01-01"}T12:00:00`);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const tithis = ["Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"];
    const yogas = ["Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan"];
    const day = dayOfYear(date);
    return {
      weekday: weekdays[date.getDay()],
      tithi: tithis[day % tithis.length],
      nakshatra: nakshatras[nakIndex],
      yoga: yogas[day % yogas.length],
      karana: day % 2 ? "Bava" : "Balava",
      hora: grahas[(day + date.getDay()) % 7 + 1]?.name || "Sun Hora"
    };
  }

  function buildDivisionalCharts(profile, lagna) {
    const defs = [
      ["D-1", "Rasi", "本命与整体人生"],
      ["D-2", "Hora", "财富与资源"],
      ["D-3", "Drekkana", "手足、勇气、行动"],
      ["D-4", "Chaturthamsha", "房产、根基、内在安全"],
      ["D-7", "Saptamsha", "子女、创造力、延续"],
      ["D-9", "Navamsa", "婚姻、灵魂成熟、幸运"],
      ["D-10", "Dasamsa", "事业、公众角色"],
      ["D-12", "Dwadasamsa", "父母、家族模式"],
      ["D-16", "Shodasamsa", "舒适、车辆、生活品质"],
      ["D-30", "Trimshamsa", "隐性压力、困难模式"],
      ["D-60", "Shastiamsa", "深层业力与根源倾向"]
    ];
    return defs.map(([code, name, focus], index) => ({
      code,
      name,
      focus,
      lagnaSign: rashi[(lagna + index * 2) % 12],
      moonSign: rashi[(baseIndex(profile, index + 4)) % 12],
      keyGraha: grahas[(index % (grahas.length - 1)) + 1].abbr
    }));
  }

  function buildDashaTimeline(profile) {
    const startYear = Number((profile.birthDate || "2000").slice(0, 4));
    const lords = ["Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun"];
    const years = [10, 7, 18, 16, 19, 17, 7, 20, 6];
    let year = startYear;
    return lords.map((lord, index) => {
      const item = { lord, from: year, to: year + years[index], theme: `${lord} 主导阶段` };
      year += years[index];
      return item;
    });
  }

  function buildStrengthSummary(placements) {
    return placements.filter((item) => item.key !== "lagna").map((item, index) => ({
      graha: item.name,
      sign: item.sign,
      house: item.house,
      shadbala: 80 + ((item.signIndex * 7 + index * 11) % 80),
      dignity: ["强", "中等", "需调整"][(item.signIndex + index) % 3]
    }));
  }

  function buildAshtakavarga(placements) {
    return Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      sign: rashi[(placements[0].signIndex + index) % 12],
      bindu: 20 + ((index * 5 + placements.length) % 18)
    }));
  }

  function southIndianChart(profile) {
    const chart = buildChart(profile);
    if (!chart) return "";
    return `
      <div class="vedic-chart south-indian-chart" aria-label="南印度式 Rashi 命盘">
        ${southIndianOrder.map((signIndex, cellIndex) => {
          if (signIndex === null) {
            return `<div class="vedic-center">${cellIndex === 5 ? "<strong>Rashi</strong><span>南印度命盘</span>" : ""}</div>`;
          }
          const planets = chart.placements.filter((item) => item.signIndex === signIndex);
          const house = ((signIndex - chart.lagna + 12) % 12) + 1;
          const isLagna = signIndex === chart.lagna;
          return `
            <div class="vedic-sign-cell ${isLagna ? "lagna-cell" : ""}">
              <span class="sign-code">${signGlyphs[signIndex]} ${signIndex + 1}</span>
              <strong>${rashi[signIndex]}</strong>
              <small>第${house}宫</small>
              <div class="graha-list">${planets.map((item) => `<b>${item.abbr}</b>`).join("")}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function chartTable(chart) {
    return `
      <div class="vedic-table">
        ${chart.placements.map((item) => `
          <article>
            <strong>${item.abbr} ${item.name}</strong>
            <span>${item.sign} · 第${item.house}宫</span>
            <p>${item.role}</p>
          </article>
        `).join("")}
      </div>
    `;
  }

  function isPdfSample(profile) {
    if (profile.indianSource === "1025.pdf") return true;
    const city = (profile.birthCity || "").toLowerCase();
    const longitude = (profile.longitude || "").toLowerCase();
    const latitude = (profile.latitude || "").toLowerCase();
    return profile.birthDate === pdfReferenceData.birth.date
      && (city.includes("qinghai") || longitude.includes("101e49") || latitude.includes("36n50"));
  }

  function pdfDataPanel(profile) {
    const usingSample = isPdfSample(profile);
    const birth = usingSample ? pdfReferenceData.birth : {
      date: profile.birthDate || "未填写",
      time: formattedBirthTime(profile) || "未填写",
      timezone: profile.timezone || "未填写",
      place: profile.birthCity || "未填写",
      longitude: profile.longitude || "未填写",
      latitude: profile.latitude || "未填写",
      altitude: profile.altitude || "未填写",
      pressure: profile.atmosphericPressure || "未填写",
      temperature: profile.atmosphericTemperature || "未填写",
      daylightSaving: profile.daylightSaving ? "是" : "否"
    };
    return `
      <div class="vedic-data-panel">
        <h3>精准出生参数</h3>
        <div class="vedic-data-grid">
          <span>日期<strong>${birth.date}</strong></span>
          <span>时间<strong>${birth.time}</strong></span>
          <span>时区<strong>${birth.timezone}</strong></span>
          <span>地点<strong>${birth.place}</strong></span>
          <span>经度<strong>${birth.longitude}</strong></span>
          <span>纬度<strong>${birth.latitude}</strong></span>
          <span>海拔<strong>${birth.altitude || "未填写"}</strong></span>
          <span>夏令时<strong>${birth.daylightSaving || "未填写"}</strong></span>
          <span>气压<strong>${birth.pressure || "未填写"}</strong></span>
          <span>温度<strong>${birth.temperature || "未填写"}</strong></span>
          <span>Ayanamsa<strong>${profile.ayanamsa || pdfReferenceData.chartSettings.ayanamsa}</strong></span>
          <span>数据源<strong>${usingSample ? "1025.pdf 样例" : "用户输入"}</strong></span>
        </div>

        ${usingSample ? `
          <h3>PDF 行星与特殊点数据</h3>
          <div class="vedic-position-table">
            ${pdfReferenceData.grahaPositions.map((item) => `
              <div>
                <strong>${item.body}</strong>
                <span>${item.sign}</span>
                <span>${item.degree}</span>
                <span>${item.nakshatra} ${item.pada}</span>
              </div>
            `).join("")}
          </div>
          <h3>PDF 包含的数据模块</h3>
          <div class="vedic-module-list">
            ${pdfReferenceData.modules.map((item) => `<span>${item}</span>`).join("")}
          </div>
        ` : `
          <p class="disclaimer">当前显示用户输入的精准出生参数。若要查看 1025.pdf 的完整样例数据，请点击“载入 PDF 样例数据”。</p>
        `}
      </div>
    `;
  }

  function computedDataPanel(chart) {
    return `
      <div class="vedic-data-panel">
        <h3>完整排盘数据结构</h3>
        <div class="vedic-module-list">
          ${chart.divisionalCharts.map((item) => `<span>${item.code} ${item.name}<strong>${item.focus}</strong></span>`).join("")}
        </div>
        <h3>Panchanga 五支</h3>
        <div class="vedic-data-grid">
          <span>Weekday<strong>${chart.panchanga.weekday}</strong></span>
          <span>Tithi<strong>${chart.panchanga.tithi}</strong></span>
          <span>Nakshatra<strong>${chart.panchanga.nakshatra}</strong></span>
          <span>Yoga<strong>${chart.panchanga.yoga}</strong></span>
          <span>Karana<strong>${chart.panchanga.karana}</strong></span>
          <span>Hora<strong>${chart.panchanga.hora}</strong></span>
        </div>
        <h3>Vimshottari Dasha 时间线</h3>
        <div class="vedic-position-table">
          ${chart.dashaTimeline.map((item) => `
            <div>
              <strong>${item.lord}</strong>
              <span>${item.from} - ${item.to}</span>
              <span>${item.theme}</span>
              <span>Mahadasha</span>
            </div>
          `).join("")}
        </div>
        <h3>力量与 Ashtakavarga</h3>
        <div class="vedic-data-grid">
          ${chart.strengthSummary.slice(0, 8).map((item) => `<span>${item.graha}<strong>${item.shadbala} · ${item.dignity}</strong></span>`).join("")}
          ${chart.ashtakavarga.slice(0, 4).map((item) => `<span>第${item.house}宫 ${item.sign}<strong>${item.bindu} bindu</strong></span>`).join("")}
        </div>
      </div>
    `;
  }

  function skillProtocolPanel(chart) {
    const protocol = chart.skillProtocol || skillProtocols.reader;
    return `
      <div class="vedic-data-panel">
        <h3>当前解读模块</h3>
        <div class="vedic-data-grid">
          <span>Skill 仓库<strong>${chart.skillRuntime.sourceRepo}</strong></span>
          <span>适配器<strong>${chart.skillRuntime.adapter}</strong></span>
          <span>模块<strong>${protocol.label}</strong></span>
          <span>计算基座<strong>${protocol.requiredBase}</strong></span>
          <span>路由<strong>${chart.structuredData.metadata.skillRoute.join(" → ")}</strong></span>
          <span>标准输出<strong>${chart.skillRuntime.canonicalOutput}</strong></span>
          <span>输出结构<strong>${protocol.output}</strong></span>
          <span>精度要求<strong>出生时间、地点、经纬度、时区、Ayanamsa</strong></span>
        </div>
        <p class="disclaimer">${protocol.focus}</p>
        ${chart.structuredData.validation.warnings.length ? `
          <p class="disclaimer"><strong>数据校验提醒：</strong>${chart.structuredData.validation.warnings.join(" ")}</p>
        ` : ""}
        ${chart.partnerChart ? `
          <h3>合盘对象快照</h3>
          <div class="vedic-data-grid">
            <span>称呼<strong>${chart.partnerChart.name}</strong></span>
            <span>生日<strong>${chart.partnerChart.preciseBirth.date || "未填写"}</strong></span>
            <span>时间<strong>${chart.partnerChart.preciseBirth.time || "未填写"}</strong></span>
            <span>城市<strong>${chart.partnerChart.preciseBirth.place || "未填写"}</strong></span>
            <span>上升<strong>${chart.partnerChart.lagnaSign}</strong></span>
            <span>月亮<strong>${chart.partnerChart.moonSign}</strong></span>
          </div>
        ` : ""}
      </div>
    `;
  }

  function chartView(profile, options = {}) {
    const chart = buildChart(profile, options);
    if (!chart) {
      return "<p>请先填写生日、出生时间和出生城市，然后生成印度星盘。</p>";
    }
    const lagna = chart.placements.find((item) => item.key === "lagna");
    const moon = chart.placements.find((item) => item.key === "moon");
    const rahu = chart.placements.find((item) => item.key === "rahu");
    const ketu = chart.placements.find((item) => item.key === "ketu");
    const hasCoordinates = Boolean(profile.latitude && profile.longitude);
    return `
      <div class="vedic-chart-panel">
        <div class="vedic-chart-hero-card">
          <div class="vedic-chart-overview">
            <p class="vedic-kicker">Birth chart · D1</p>
            <h3>Your celestial signature</h3>
            <p>以柔和、清晰的方式查看构成本次解读的核心落点。</p>
            <div class="astro-tags">
              <span>上升 Ascendant · ${lagna.sign}</span>
              <span>月亮 Moon · ${moon.sign}</span>
              <span>月宿 Nakshatra · ${chart.nakshatra}</span>
              <span>业力轴 · Rahu ${rahu.house}宫 / Ketu ${ketu.house}宫</span>
            </div>
            <div class="vedic-birth-line">
              <strong>${profile.birthCity || "出生地未填写"}</strong>
              <span>${profile.birthDate || ""} ${profile.birthTime || ""}</span>
              <span>${hasCoordinates ? `${profile.latitude} / ${profile.longitude}` : "经纬度待匹配"}</span>
            </div>
          </div>
          ${southIndianChart(profile)}
        </div>
        <details class="vedic-data-panel complete-chart-panel">
          <summary>展开完整印度星盘数据</summary>
          ${chartTable(chart)}
          ${computedDataPanel(chart)}
        </details>
        <div class="chart-actions">
          <button class="button primary full" id="startIndianReadingButton" type="button">生成 Life Blueprint</button>
        </div>
        <div class="deepseek-reading" id="deepseekIndianReading" hidden></div>
      </div>
    `;
  }

  function localReading(profile, options = {}) {
    const chart = buildChart(profile, options);
    if (!chart) {
      return "<p>请先填写生日、出生时间和出生城市，再生成印度占星命盘。</p>";
    }
    const lagna = chart.placements.find((item) => item.key === "lagna");
    const moon = chart.placements.find((item) => item.key === "moon");
    const rahu = chart.placements.find((item) => item.key === "rahu");
    const ketu = chart.placements.find((item) => item.key === "ketu");
    const saturn = chart.placements.find((item) => item.key === "saturn");
    const jupiter = chart.placements.find((item) => item.key === "jupiter");
    const venus = chart.placements.find((item) => item.key === "venus");
    return `
      <div class="astro-summary">
        <p><strong>整体气质：</strong>这张盘以上升 ${lagna.sign} 为人生入口，月亮 ${moon.sign} 为心性核心。上升看你面对现实的方式，月亮看你真正会被什么牵动。</p>
        <p><strong>内在节奏：</strong>${chart.nakshatra} 提示你的情绪惯性和命运节奏。它更适合用来观察“我为什么会这样反应”，而不是做绝对预言。</p>
        <p><strong>业力轴：</strong>Rahu 在第${rahu.house}宫，容易把你拉向“${houses[rahu.house - 1]}”；Ketu 在第${ketu.house}宫，代表你对“${houses[ketu.house - 1]}”熟悉但也容易抽离。</p>
        <p><strong>现实课题：</strong>土星在第${saturn.house}宫，说明“${houses[saturn.house - 1]}”需要长期建设。木星在第${jupiter.house}宫，提示可学习、可扩张的方向；金星在第${venus.house}宫，提示关系与吸引力的表达位置。</p>
        <p><strong>行动建议：</strong>先观察 Rahu 所在宫位是否让你过度用力，再用土星所在宫位建立稳定节奏。重大决定不要只看情绪，要同时看现实条件、时间周期和可持续性。</p>
      </div>
      <p class="disclaimer">当前解读会根据你的出生时间、地点、经纬度、上升、月亮、月宿和宫位关系生成。若要达到专业软件级精度，仍建议接入真实星历与 Lahiri ayanamsa 计算后端。</p>
    `;
  }

  function shortText(profile) {
    const chart = buildChart(profile);
    if (!chart) return "";
    const moon = chart.placements.find((item) => item.key === "moon");
    const lagna = chart.placements.find((item) => item.key === "lagna");
    return `印度占星：上升${lagna.sign}，月亮${moon.sign}，月宿${chart.nakshatra}`;
  }

  window.IndianAstrologySkill = {
    buildChart,
    chartView,
    reading: localReading,
    southIndianChart,
    shortText,
    houses,
    skillProtocols,
    pdfReferenceData
  };
})();
