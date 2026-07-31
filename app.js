const topics = [
  { id: "love", name: "爱情关系", desc: "看见关系中的真实需求、边界与靠近方式。" },
  { id: "career", name: "事业方向", desc: "梳理当下职业处境、机会与下一步行动。" },
  { id: "wealth", name: "财富机会", desc: "观察资源流动、风险意识与可持续选择。" },
  { id: "growth", name: "自我成长", desc: "理解内在模式，找到更稳定的自我支持。" },
  { id: "daily", name: "今日指引", desc: "为今天抽取一个温和、具体的提醒。" },
  { id: "choice", name: "重大选择", desc: "比较不同路径背后的代价、潜力与隐含因素。" }
];

const spreads = [
  {
    id: "one",
    name: "单张牌",
    subtitle: "今日能量 / 快速指引",
    bestFor: "适合简单提问、日常提醒与快速校准。",
    depth: "轻量",
    positions: ["核心指引"]
  },
  {
    id: "yesno",
    name: "Yes / No",
    subtitle: "是 / 否 / 条件尚未成熟",
    bestFor: "适合询问短期内是否适合行动、回应、推进或等待。",
    depth: "快速判断",
    positions: ["是或否倾向"]
  },
  {
    id: "three",
    name: "三张牌",
    subtitle: "过去 / 现在 / 未来",
    bestFor: "适合梳理事件脉络、趋势与阶段变化。",
    depth: "中等",
    positions: ["过去影响", "当前状态", "未来趋势"]
  },
  {
    id: "relationship",
    name: "关系牌阵",
    subtitle: "我 / 对方 / 关系现状 / 阻碍 / 建议",
    bestFor: "适合爱情、合作、家庭与重要人际关系。",
    depth: "深入",
    positions: ["我的状态", "对方状态", "关系现状", "潜在阻碍", "行动建议"]
  },
  {
    id: "decision",
    name: "选择牌阵",
    subtitle: "选项 A / 选项 B / 隐藏因素 / 建议",
    bestFor: "适合面对两个方向、方案或关系选择时使用。",
    depth: "深入",
    positions: ["选项 A", "选项 B", "隐藏因素", "行动建议"]
  }
];

const majorArcana = [
  ["the-fool", "愚者", ["开始", "自由", "信任"], "这张牌提示你可以用更开放的心态面对未知，新的阶段正在形成。", "这张牌提示你先确认边界与准备度，避免只凭冲动行动。"],
  ["the-magician", "魔术师", ["意志", "资源", "显化"], "你已经拥有推动事情的关键资源，重点是把想法转化为行动。", "资源可能分散，建议先聚焦一个最可执行的切入点。"],
  ["the-high-priestess", "女祭司", ["直觉", "隐秘", "等待"], "答案可能暂时不在表面，倾听直觉与细微信号会更有帮助。", "你可能过度沉默或逃避确认事实，需要让信息变得更清晰。"],
  ["the-empress", "女皇", ["滋养", "丰盛", "关系"], "局势倾向于通过照顾、创造与稳定连接而逐渐生长。", "过度付出可能让边界变弱，建议把照顾也留给自己。"],
  ["the-emperor", "皇帝", ["秩序", "责任", "结构"], "建立规则和清晰边界，会让事情更稳固地推进。", "控制感过强可能阻碍流动，试着区分原则与固执。"],
  ["the-hierophant", "教皇", ["传统", "学习", "承诺"], "向经验、制度或可信赖的人求助，可能带来稳定答案。", "旧规则未必适合此刻，你需要判断哪些框架仍然有效。"],
  ["the-lovers", "恋人", ["选择", "连接", "价值"], "这张牌强调真诚选择，关系或合作需要价值观对齐。", "你可能在取悦与真实需求之间摇摆，需要回到自己的核心标准。"],
  ["the-chariot", "战车", ["推进", "意志", "胜利"], "保持方向感与自律，事情有机会在主动推进中打开。", "过度用力可能带来消耗，先调整节奏再继续前进。"],
  ["strength", "力量", ["温柔", "勇气", "耐心"], "柔和而稳定的力量比强硬对抗更有效，你可以慢慢驯服局势。", "你可能低估了自己的承受力，也可能需要停止硬撑。"],
  ["the-hermit", "隐士", ["独处", "省思", "智慧"], "暂时抽离喧嚣，能帮助你看清真正重要的问题。", "孤立太久会削弱反馈，适度寻求支持会更平衡。"],
  ["wheel-of-fortune", "命运之轮", ["转变", "周期", "机会"], "局势正在转动，顺势观察变化比强行固定更合适。", "不确定感较强，建议不要把短期波动误判成最终答案。"],
  ["justice", "正义", ["平衡", "因果", "判断"], "事实、契约与公平是关键，请基于证据做决定。", "你可能在回避责任或信息不对称中判断失准。"],
  ["the-hanged-man", "倒吊人", ["暂停", "换位", "臣服"], "暂停不是失败，而是换一个角度理解局势的机会。", "长期停滞可能来自不愿取舍，需要温和地做出决定。"],
  ["death", "死神", ["结束", "更新", "蜕变"], "某个旧阶段正在退场，为新的状态腾出空间。", "你可能明知需要改变却仍紧抓旧模式，先允许自己告别。"],
  ["temperance", "节制", ["调和", "疗愈", "耐心"], "事情适合通过协调、试探和逐步融合来推进。", "节奏可能失衡，建议减少极端选择，回到中间道路。"],
  ["the-devil", "恶魔", ["执念", "束缚", "欲望"], "这张牌提醒你看见诱惑、依赖或不健康循环。", "束缚正在松动，但仍需要诚实面对自己的真实动机。"],
  ["the-tower", "高塔", ["震动", "真相", "重建"], "旧结构可能被打破，真相虽然突然，却能带来重建空间。", "变化已在内部发生，拖延面对只会延长不安。"],
  ["the-star", "星星", ["希望", "疗愈", "愿景"], "局势里仍有清澈的希望，适合恢复信心与长期愿景。", "期待可能过于理想化，需要把愿景落到可执行的小步骤。"],
  ["the-moon", "月亮", ["潜意识", "迷雾", "敏感"], "情绪与未知因素较多，先观察，不急着下结论。", "迷雾正在散开，但你仍需要核对事实与感受的差异。"],
  ["the-sun", "太阳", ["清晰", "喜悦", "显现"], "事情倾向于变得明朗，真实表达会带来积极回应。", "你可能忽略了简单答案，别让担忧遮住已经出现的光。"],
  ["judgement", "审判", ["觉醒", "召唤", "复盘"], "这是重新回应内在召唤的时刻，复盘会带来新的判断。", "旧评价可能困住你，试着用现在的自己重新理解过去。"],
  ["the-world", "世界", ["完成", "整合", "成熟"], "一个阶段正在整合完成，你可以更成熟地进入下一轮。", "离完成只差收尾与确认，别因为完美主义迟迟不结束。"]
].map(([id, name, keywords, upright, reversed]) => ({
  id,
  name,
  arcana: "major",
  suit: "大阿卡那",
  keywords,
  upright,
  reversed,
  yesNo: ["the-sun", "the-star", "the-world", "the-magician", "strength", "temperance", "the-chariot"].includes(id)
    ? "yes"
    : ["the-devil", "the-tower", "the-moon", "death", "the-hanged-man"].includes(id)
      ? "no"
      : "maybe"
}));

const suitProfiles = {
  wands: {
    name: "权杖",
    element: "火",
    theme: "行动力、热情、事业推进与创造冲动",
    advice: "把热情落到具体行动，避免只停留在想法或情绪高点。"
  },
  cups: {
    name: "圣杯",
    element: "水",
    theme: "情感、关系、直觉、疗愈与内在需求",
    advice: "先辨认真实感受，再决定如何表达和回应。"
  },
  swords: {
    name: "宝剑",
    element: "风",
    theme: "思考、沟通、冲突、判断与信息清晰度",
    advice: "把事实和想象分开，用清晰沟通减少内耗。"
  },
  pentacles: {
    name: "星币",
    element: "土",
    theme: "现实资源、金钱、身体、工作成果与长期稳定",
    advice: "回到现实条件，优先处理资源、时间和可持续性。"
  }
};

const rankProfiles = [
  ["ace", "一", ["种子", "新机会", "潜力"], "新的能量正在出现，适合开启、试探或为未来播种。", "机会尚未完全成形，可能需要更多准备、耐心或现实条件。", "yes"],
  ["two", "二", ["选择", "平衡", "关系"], "你正在面对两个方向或两股力量，关键是找到平衡点。", "摇摆、迟疑或信息不完整可能让决定变得不稳定。", "maybe"],
  ["three", "三", ["成长", "合作", "扩展"], "事情开始向外发展，合作、表达或阶段性成果变得重要。", "扩展受阻，可能需要重新确认团队、节奏或期待。", "yes"],
  ["four", "四", ["稳定", "结构", "停顿"], "局势进入稳定或收束阶段，适合整理基础与安全感。", "稳定可能变成停滞，过度保守会压住流动。", "maybe"],
  ["five", "五", ["冲突", "变化", "挑战"], "挑战浮现，但它也暴露了真正需要调整的结构。", "冲突可能被放大，建议减少对抗，先处理核心问题。", "no"],
  ["six", "六", ["修复", "互助", "过渡"], "能量开始回到较平衡的位置，适合修复、协助与过渡。", "旧账或不公平感仍在影响关系，需要更诚实地处理。", "yes"],
  ["seven", "七", ["评估", "防守", "考验"], "现在需要评估立场、坚持边界，也要看清真正的挑战。", "过度防御或怀疑会消耗力量，先确认威胁是否真实。", "maybe"],
  ["eight", "八", ["推进", "练习", "速度"], "事情有加速或持续打磨的趋势，行动会带来反馈。", "节奏不稳，可能因为重复消耗或缺乏有效方法而卡住。", "yes"],
  ["nine", "九", ["积累", "临界点", "韧性"], "你接近一个阶段性结果，需要保持韧性并照顾自身状态。", "疲惫或过度警戒可能影响判断，先恢复再推进。", "maybe"],
  ["ten", "十", ["完成", "压力", "结果"], "一个周期接近完成，结果、责任或代价都会更明显。", "负担过重，可能需要放下不属于你的责任。", "no"],
  ["page", "侍从", ["学习", "消息", "探索"], "新的信息、学习机会或初步表达正在出现。", "经验不足或信息未成熟，适合先学习观察。", "maybe"],
  ["knight", "骑士", ["推进", "追求", "变化"], "行动力增强，适合主动追求目标，但要注意方向。", "急躁、摇摆或用力过猛可能带来偏差。", "yes"],
  ["queen", "王后", ["成熟", "接纳", "滋养"], "更成熟的承接力出现，适合照顾关系、资源或内在状态。", "过度承接他人需求，可能削弱自身边界。", "yes"],
  ["king", "国王", ["掌控", "责任", "领导"], "你可以用更成熟、稳定的方式做决定并承担结果。", "控制感或责任压力过强，可能让局势失去弹性。", "yes"]
];

function buildMinorArcana() {
  return Object.entries(suitProfiles).flatMap(([suitId, suit]) => (
    rankProfiles.map(([rankId, rankName, keywords, uprightCore, reversedCore, yesNo]) => ({
      id: `${suitId}-${rankId}`,
      name: `${suit.name}${rankName}`,
      arcana: "minor",
      rank: rankId,
      suit: suit.name,
      element: suit.element,
      keywords: [...keywords, suit.name],
      upright: `${suit.name}属于${suit.element}元素，关乎${suit.theme}。${uprightCore}`,
      reversed: `${suit.name}的能量在逆位时容易表现为失衡、延迟或内耗。${reversedCore}`,
      yesNo,
      suitAdvice: suit.advice
    }))
  ));
}

const tarotCards = [...majorArcana, ...buildMinorArcana()];

const astraeaCards = [
  { title: "The Magician", subtitle: "Power & Potential", color: "#a87162", mark: "I", art: "magician" },
  { title: "The Star", subtitle: "Hope & Inspiration", color: "#8f7864", mark: "XVII", art: "star" },
  { title: "Ace of Pentacles", subtitle: "Lorem ipsum dolor sit amet.", color: "#d1ad78", mark: "A", art: "pentacle" },
  { title: "The Hermit", subtitle: "Inner Guidance", color: "#8c7465", mark: "IX", art: "hermit" }
];

const state = {
  topic: topics[0],
  spread: spreads[0],
  selectedCards: [],
  currentReading: null,
  favorite: false,
  shuffled: false,
  installPrompt: null,
  indianContext: null,
  indianChatHistory: [],
  indianMasterReading: null,
  indianSkillResult: null,
  indianSkillPromise: null,
  indianSkillRequestId: 0,
  astraeaIndex: 2,
  astraeaTab: "home"
};

const els = {
  topicGrid: document.querySelector("#topicGrid"),
  spreadGrid: document.querySelector("#spreadGrid"),
  deck: document.querySelector("#deck"),
  questionInput: document.querySelector("#questionInput"),
  moodSelect: document.querySelector("#moodSelect"),
  timeframeSelect: document.querySelector("#timeframeSelect"),
  backgroundInput: document.querySelector("#backgroundInput"),
  focusInput: document.querySelector("#focusInput"),
  prepareButton: document.querySelector("#prepareButton"),
  ritualStatus: document.querySelector("#ritualStatus"),
  drawCount: document.querySelector("#drawCount"),
  shuffleButton: document.querySelector("#shuffleButton"),
  shuffleStage: document.querySelector("#shuffleStage"),
  result: document.querySelector("#result"),
  resultSummary: document.querySelector("#resultSummary"),
  positionTabs: document.querySelector("#positionTabs"),
  resultList: document.querySelector("#resultList"),
  noteInput: document.querySelector("#noteInput"),
  saveButton: document.querySelector("#saveButton"),
  favoriteButton: document.querySelector("#favoriteButton"),
  historyList: document.querySelector("#historyList")
};

els.loginForm = document.querySelector("#loginForm");
els.authScreen = document.querySelector("#authScreen");
els.appDashboard = document.querySelector("#appDashboard");
els.loginName = document.querySelector("#loginName");
els.loginPassword = document.querySelector("#loginPassword");
els.loginCode = document.querySelector("#loginCode");
els.sendCodeButton = document.querySelector("#sendCodeButton");
els.registerButton = document.querySelector("#registerButton");
els.loginButton = document.querySelector("#loginButton");
els.authStatus = document.querySelector("#authStatus");
els.currentUserLabel = document.querySelector("#currentUserLabel");
els.profileForm = document.querySelector("#profileForm");
els.home = document.querySelector("#home");
els.astrologySection = document.querySelector("#astrology");
els.indianAstrologySection = document.querySelector("#indianAstrology");
els.drawSection = document.querySelector("#draw");
els.resultSection = document.querySelector("#result");
els.historySection = document.querySelector("#history");
els.enterDrawButton = document.querySelector("#enterDrawButton");
els.backToHomeButton = document.querySelector("#backToHomeButton");
els.showTarotButton = document.querySelector("#showTarotButton");
els.showAstrologyButton = document.querySelector("#showAstrologyButton");
els.showIndianButton = document.querySelector("#showIndianButton");
els.astraeaHomePage = document.querySelector("#astraeaHomePage");
els.moduleChooserPage = document.querySelector("#moduleChooserPage");
els.openModuleChooserButton = document.querySelector("#openModuleChooserButton");
els.astraeaProfileButton = document.querySelector("#astraeaProfileButton");
els.astraeaCardStack = document.querySelector("#astraeaCardStack");
els.astraeaCardTitle = document.querySelector("#astraeaCardTitle");
els.astraeaCardSubtitle = document.querySelector("#astraeaCardSubtitle");
els.astraeaDots = document.querySelector("#astraeaDots");
els.astraeaPrevCard = document.querySelector("#astraeaPrevCard");
els.astraeaNextCard = document.querySelector("#astraeaNextCard");
els.astraeaHomePanel = document.querySelector("#astraeaHomePanel");
els.astraeaSpreadsPanel = document.querySelector("#astraeaSpreadsPanel");
els.backFromAstrologyButton = document.querySelector("#backFromAstrologyButton");
els.backFromIndianButton = document.querySelector("#backFromIndianButton");
els.refreshAstrologyButton = document.querySelector("#refreshAstrologyButton");
els.refreshIndianButton = document.querySelector("#refreshIndianButton");
els.astrologyReading = document.querySelector("#astrologyReading");
els.indianReading = document.querySelector("#indianReading");
els.profileName = document.querySelector("#profileName");
els.birthDate = document.querySelector("#birthDate");
els.birthTime = document.querySelector("#birthTime");
els.birthCity = document.querySelector("#birthCity");
els.currentCity = document.querySelector("#currentCity");
els.astroBirthDate = document.querySelector("#astroBirthDate");
els.astroBirthTime = document.querySelector("#astroBirthTime");
els.astroBirthCity = document.querySelector("#astroBirthCity");
els.astroChartType = document.querySelector("#astroChartType");
els.astroPartnerName = document.querySelector("#astroPartnerName");
els.astroPartnerBirthDate = document.querySelector("#astroPartnerBirthDate");
els.astroPartnerBirthTime = document.querySelector("#astroPartnerBirthTime");
els.astroPartnerBirthCity = document.querySelector("#astroPartnerBirthCity");
els.astroTargetDate = document.querySelector("#astroTargetDate");
els.indianBirthDate = document.querySelector("#indianBirthDate");
els.indianBirthTime = document.querySelector("#indianBirthTime");
els.indianBirthCity = document.querySelector("#indianBirthCity");
els.indianLatitude = document.querySelector("#indianLatitude");
els.indianLongitude = document.querySelector("#indianLongitude");
els.indianTimezone = document.querySelector("#indianTimezone");
els.indianAyanamsa = document.querySelector("#indianAyanamsa");
els.indianBirthSecond = document.querySelector("#indianBirthSecond");
els.indianTimezoneHour = document.querySelector("#indianTimezoneHour");
els.indianTimezoneMinute = document.querySelector("#indianTimezoneMinute");
els.indianTimezoneDirection = document.querySelector("#indianTimezoneDirection");
els.indianDaylightSaving = document.querySelector("#indianDaylightSaving");
els.indianUseLmt = document.querySelector("#indianUseLmt");
els.indianLongitudeDegree = document.querySelector("#indianLongitudeDegree");
els.indianLongitudeDirection = document.querySelector("#indianLongitudeDirection");
els.indianLongitudeMinute = document.querySelector("#indianLongitudeMinute");
els.indianLongitudeSecond = document.querySelector("#indianLongitudeSecond");
els.indianLatitudeDegree = document.querySelector("#indianLatitudeDegree");
els.indianLatitudeDirection = document.querySelector("#indianLatitudeDirection");
els.indianLatitudeMinute = document.querySelector("#indianLatitudeMinute");
els.indianLatitudeSecond = document.querySelector("#indianLatitudeSecond");
els.indianAltitude = document.querySelector("#indianAltitude");
els.indianPressure = document.querySelector("#indianPressure");
els.indianTemperature = document.querySelector("#indianTemperature");
els.indianLocationStatus = document.querySelector("#indianLocationStatus");
els.indianConcernSelect = document.querySelector("#indianConcernSelect");
els.vedicModuleSelect = document.querySelector("#vedicModuleSelect");
els.vedicPartnerName = document.querySelector("#vedicPartnerName");
els.vedicPartnerBirthDate = document.querySelector("#vedicPartnerBirthDate");
els.vedicPartnerBirthTime = document.querySelector("#vedicPartnerBirthTime");
els.vedicPartnerBirthCity = document.querySelector("#vedicPartnerBirthCity");
els.resolveIndianLocationButton = document.querySelector("#resolveIndianLocationButton");
els.startVedicFormButton = document.querySelector("#startVedicFormButton");
els.copyIndianReadingButton = document.querySelector("#copyIndianReadingButton");
els.shareIndianReadingButton = document.querySelector("#shareIndianReadingButton");
els.downloadIndianReadingButton = document.querySelector("#downloadIndianReadingButton");
els.indianReadingProgress = document.querySelector("#indianReadingProgress");
els.appMain = document.querySelector(".app-main");
els.profileReading = document.querySelector("#profileReading");
els.homeHistoryList = document.querySelector("#homeHistoryList");
els.showHistoryButton = document.querySelector("#showHistoryButton");
els.showProfileButton = document.querySelector("#showProfileButton");
els.profileDrawer = document.querySelector("#profileDrawer");
els.logoutButton = document.querySelector("#logoutButton");
els.installBanner = document.querySelector("#installBanner");
els.installButton = document.querySelector("#installButton");
els.dismissInstallButton = document.querySelector("#dismissInstallButton");

function renderTopics() {
  els.topicGrid.innerHTML = topics.map((topic) => `
    <button class="topic-card ${state.topic.id === topic.id ? "active" : ""}" data-topic="${topic.id}">
      <h3>${topic.name}</h3>
      <p>${topic.desc}</p>
    </button>
  `).join("");
}

function renderSpreads() {
  els.spreadGrid.innerHTML = spreads.map((spread) => `
    <button class="spread-card ${state.spread.id === spread.id ? "active" : ""}" data-spread="${spread.id}">
      <h3>${spread.name}</h3>
      <p>${spread.subtitle}</p>
      <p>适合场景：${spread.bestFor}</p>
      <p>解读深度：${spread.depth}</p>
    </button>
  `).join("");
  els.drawCount.textContent = `完整 78 张牌组 · 需抽取 ${state.spread.positions.length} 张`;
}

function renderDeck() {
  const displayCount = 18;
  els.deck.innerHTML = Array.from({ length: displayCount }, (_, index) => `
    <button class="tarot-card" aria-label="选择第 ${index + 1} 张牌" data-slot="${index}"></button>
  `).join("");
}

function normalizeUserName(name) {
  return (name || "访客").trim().replace(/\s+/g, "_").slice(0, 40) || "访客";
}

function normalizeAccount(value) {
  return (value || "").trim().toLowerCase();
}

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("lunaArcanaAccounts") || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem("lunaArcanaAccounts", JSON.stringify(accounts));
}

async function hashPassword(password, salt) {
  const source = `${salt}:${password}`;
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(source);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(source)));
}

function getPendingCodes() {
  try {
    return JSON.parse(localStorage.getItem("lunaArcanaPendingCodes") || "{}");
  } catch {
    return {};
  }
}

function savePendingCodes(codes) {
  localStorage.setItem("lunaArcanaPendingCodes", JSON.stringify(codes));
}

function verifyLocalCode(account, code) {
  const pending = getPendingCodes()[account];
  if (!pending || Date.now() > pending.expiresAt) return false;
  return pending.code === (code || "").trim();
}

function getCurrentUser() {
  const stored = localStorage.getItem("lunaArcanaCurrentUser");
  return normalizeUserName(stored && stored !== "访客" ? stored : "Podo");
}

function isLoggedIn() {
  return true;
}

function userStorageKey(base) {
  return `${base}:${getCurrentUser()}`;
}

function renderLoginState() {
  const user = getCurrentUser();
  if (els.loginName) {
    els.loginName.value = user === "访客" ? "" : user;
  }
  if (els.currentUserLabel) {
    els.currentUserLabel.textContent = `当前用户：${user}`;
  }
  if (els.authScreen && els.appDashboard) {
    els.authScreen.hidden = true;
    els.appDashboard.hidden = false;
  }
}

function showAstraeaLanding() {
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  if (els.astraeaHomePage) els.astraeaHomePage.hidden = true;
  if (els.moduleChooserPage) els.moduleChooserPage.hidden = false;
}

function showModuleChooser() {
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再进入占卜功能。");
    showHomeFlow();
    return;
  }
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  if (els.astraeaHomePage) els.astraeaHomePage.hidden = true;
  if (els.moduleChooserPage) els.moduleChooserPage.hidden = false;
  if (els.moduleChooserPage) {
    els.moduleChooserPage.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setAstraeaTab(tab) {
  state.astraeaTab = tab;
  const isHome = tab === "home";
  if (els.astraeaHomePanel) {
    els.astraeaHomePanel.hidden = !isHome;
    els.astraeaHomePanel.classList.toggle("active", isHome);
  }
  if (els.astraeaSpreadsPanel) {
    els.astraeaSpreadsPanel.hidden = isHome;
    els.astraeaSpreadsPanel.classList.toggle("active", !isHome);
  }
  if (els.openModuleChooserButton) {
    els.openModuleChooserButton.hidden = !isHome;
  }
  document.querySelectorAll("[data-astraea-bottom]").forEach((button) => {
    button.classList.toggle("active", button.dataset.astraeaBottom === tab);
  });
  if (isHome) renderAstraeaCarousel();
}

function getAstraeaCardIcon(art) {
  if (art === "pentacle") {
    return `
      <svg class="astraea-card-line-svg" viewBox="0 0 72 92" aria-hidden="true">
        <path class="card-glow" d="M19 56c9.8-8.8 23.8-11.1 35-5.7" />
        <path d="M13.5 61.5c7.1-4.4 13.2-4 17.7.4 1.5 1.5 3.7 2.2 5.8 1.8l12.4-2.4c3.2-.6 5.2 3 3 5.4-5.6 5.8-13.5 9.6-21.4 8.9-6.5-.6-11-4.5-17.5-1.4" />
        <path d="M13.5 61.5 6.8 71.8M18.6 60.2l-4.7 14.2" />
        <circle cx="47.4" cy="30.6" r="16.2" />
        <path d="m47.4 17.2 3.5 9 9.6.5-7.4 6.1 2.5 9.3-8.2-5.2-8.1 5.2 2.5-9.3-7.5-6.1 9.6-.5 3.5-9Z" />
        <path d="M36.4 48.4c6 2.8 13.1 2.8 19.1 0" />
      </svg>
    `;
  }
  if (art === "hermit") {
    return `
      <svg class="astraea-card-line-svg" viewBox="0 0 72 92" aria-hidden="true">
        <path d="M36 13.5v12.2M27.8 25.7h16.4M30.8 25.7l-4.2 19.8h18.8l-4.2-19.8" />
        <path d="M30.4 45.5 25.8 74h20.4l-4.6-28.5M31.7 74h8.6" />
        <path class="card-glow" d="M28.6 41.8c5.3 5 9.5 5 14.8 0M22.8 37.5c8.7-8.4 17.7-8.4 26.4 0" />
        <path d="M36 31.6v8.7M31.7 36h8.6" />
        <path d="M20.5 79.5c9.4-4.6 21.6-4.6 31 0" />
      </svg>
    `;
  }
  if (art === "star") {
    return `
      <svg class="astraea-card-line-svg" viewBox="0 0 72 92" aria-hidden="true">
        <path d="M36 12.8 39.9 26l13.8.3-11 8.3 4 13.1L36 39.8 25.3 47.7l4-13.1-11-8.3 13.8-.3L36 12.8Z" />
        <path class="card-glow" d="M16 66.5c11.2-5.3 28.8-5.3 40 0M22 75c8.2-2.7 19.8-2.7 28 0" />
        <path d="M19.2 17.5v5.2M16.6 20.1h5.2M53 20v6M50 23h6M51.2 46.5v4.4M49 48.7h4.4" />
      </svg>
    `;
  }
  return `
    <svg class="astraea-card-line-svg" viewBox="0 0 72 92" aria-hidden="true">
      <path d="M36 14.8c-7.2 0-13 5.8-13 13 0 5 2.8 9.3 6.8 11.5" />
      <path d="M36 14.8c7.2 0 13 5.8 13 13 0 5-2.8 9.3-6.8 11.5" />
      <path d="M31.8 41.5h8.4v22.8h-8.4zM25.6 64.3h20.8" />
      <path class="card-glow" d="M19.6 75.5c10.4-4.2 22.4-4.2 32.8 0M25.5 28h21M36 19.6v16.8" />
    </svg>
  `;
}

function renderAstraeaCarousel() {
  if (!els.astraeaCardStack) return;
  els.astraeaCardStack.innerHTML = astraeaCards.map((card, index) => {
    let offset = index - state.astraeaIndex;
    if (offset < -2) offset += astraeaCards.length;
    if (offset > 2) offset -= astraeaCards.length;
    const visible = Math.abs(offset) <= 2;
    const active = index === state.astraeaIndex;
    const layout = {
      "-2": { x: -204, y: 38, scale: 0.82, rotate: -3, opacity: 0.5, z: 6, role: "peek" },
      "-1": { x: -42, y: 9, scale: 0.92, rotate: -2, opacity: 0.78, z: 16, role: "back" },
      "0": { x: 30, y: 28, scale: 1, rotate: 1, opacity: 1, z: 24, role: "front" },
      "1": { x: 204, y: 38, scale: 0.82, rotate: 3, opacity: 0.5, z: 6, role: "peek" },
      "2": { x: 204, y: 38, scale: 0.82, rotate: 3, opacity: 0, z: 1, role: "hidden" }
    }[String(offset)];
    return `
      <article
        class="astraea-tarot-mini ${active ? "active" : ""} astraea-card-${layout.role} astraea-card-art-${card.art}"
        style="
          --x: ${layout.x}px;
          --y: ${layout.y}px;
          --scale: ${layout.scale};
          --rotate: ${layout.rotate}deg;
          --card-color: ${card.color};
          --z: ${layout.z};
          --opacity: ${visible ? layout.opacity : 0};
          display: ${visible ? "grid" : "none"};
        "
        aria-label="${card.title}"
      >
        <span class="astraea-mini-number">${card.mark}</span>
        <span class="astraea-mini-motif">${getAstraeaCardIcon(card.art)}</span>
        <strong>${card.title}</strong>
      </article>
    `;
  }).join("");
  const activeCard = astraeaCards[state.astraeaIndex];
  if (els.astraeaCardTitle) els.astraeaCardTitle.textContent = activeCard.title;
  if (els.astraeaCardSubtitle) els.astraeaCardSubtitle.textContent = activeCard.subtitle;
  if (els.astraeaDots) {
    els.astraeaDots.innerHTML = astraeaCards.map((_, index) => `
      <button class="${index === state.astraeaIndex ? "active" : ""}" type="button" data-astraea-dot="${index}" aria-label="Show card ${index + 1}"></button>
    `).join("");
  }
}

function moveAstraeaCard(direction) {
  state.astraeaIndex = (state.astraeaIndex + direction + astraeaCards.length) % astraeaCards.length;
  renderAstraeaCarousel();
}

function drawAstraeaCard() {
  const next = Math.floor(Math.random() * astraeaCards.length);
  state.astraeaIndex = next === state.astraeaIndex ? (next + 1) % astraeaCards.length : next;
  if (els.astraeaCardStack) {
    els.astraeaCardStack.classList.remove("is-drawing");
    void els.astraeaCardStack.offsetWidth;
    els.astraeaCardStack.classList.add("is-drawing");
  }
  renderAstraeaCarousel();
}

function setAuthStatus(message) {
  if (els.authStatus) {
    els.authStatus.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanReadingText(text) {
  return String(text || "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*>+\s*/gm, "")
    .trim();
}

function formatReadingText(text) {
  const cleaned = cleanReadingText(text);
  return escapeHtml(cleaned)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function splitBlueprintSections(text) {
  const cleaned = cleanReadingText(text);
  if (!cleaned) return [];
  const headingPattern = /^(Executive Summary|执行摘要|核心摘要|总览|第[一二三四五六七八九十百0-9]+章(?:[：:\s].*)?|Chapter\s+\d+(?:[：:\s].*)?)$/i;
  const sections = [];
  let current = { title: "核心摘要", body: [] };

  cleaned.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (headingPattern.test(line)) {
      if (current.body.some(Boolean)) sections.push(current);
      current = { title: line.replace(/[：:]$/, ""), body: [] };
      return;
    }
    current.body.push(rawLine);
  });
  if (current.body.some(Boolean)) sections.push(current);

  if (sections.length > 1) return sections;
  const paragraphs = cleaned.split(/\n{2,}/).filter(Boolean);
  if (paragraphs.length < 4) return sections;
  return paragraphs.reduce((groups, paragraph, index) => {
    const groupIndex = Math.floor(index / 3);
    if (!groups[groupIndex]) groups[groupIndex] = { title: groupIndex === 0 ? "核心摘要" : `深度解读 ${groupIndex + 1}`, body: [] };
    groups[groupIndex].body.push(paragraph);
    return groups;
  }, []);
}

async function sendVerificationCode() {
  const account = normalizeAccount(els.loginName.value);
  if (!account) {
    setAuthStatus("请先填写邮箱或账号。");
    els.loginName.focus();
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const pending = getPendingCodes();
  pending[account] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  savePendingCodes(pending);

  try {
    const response = await fetch("/.netlify/functions/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: account, code })
    });
    if (!response.ok) throw new Error("send failed");
    setAuthStatus("验证码已发送，请查看邮箱。");
  } catch {
    setAuthStatus(`本地演示验证码：${code}。部署后配置邮件服务即可真实收信。`);
  }
}

async function registerAccount() {
  const account = normalizeAccount(els.loginName.value);
  const password = els.loginPassword.value;
  const code = els.loginCode.value;
  if (!account || !password) {
    setAuthStatus("请填写邮箱/账号和密码。");
    return;
  }
  if (password.length < 6) {
    setAuthStatus("密码至少需要 6 位。");
    return;
  }
  if (!verifyLocalCode(account, code)) {
    setAuthStatus("验证码不正确或已过期，请重新发送。");
    return;
  }
  const accounts = getAccounts();
  if (accounts[account]) {
    setAuthStatus("这个账号已经注册，请直接登录。");
    return;
  }
  const salt = `${account}:${Date.now()}`;
  accounts[account] = {
    email: account,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };
  saveAccounts(accounts);
  localStorage.setItem("lunaArcanaCurrentUser", account);
  renderLoginState();
  renderProfile();
  renderHistory();
  setAuthStatus("注册成功，已进入你的个人账号。");
}

async function loginAccount() {
  const account = normalizeAccount(els.loginName.value);
  const password = els.loginPassword.value;
  const accounts = getAccounts();
  const record = accounts[account];
  if (!account || !password) {
    setAuthStatus("请填写邮箱/账号和密码。");
    return;
  }
  if (!record) {
    setAuthStatus("这个账号还没有注册，请先发送验证码并注册。");
    return;
  }
  const passwordHash = await hashPassword(password, record.salt);
  if (passwordHash !== record.passwordHash) {
    setAuthStatus("密码不正确。");
    return;
  }
  localStorage.setItem("lunaArcanaCurrentUser", account);
  renderLoginState();
  renderProfile();
  renderHistory();
  setAuthStatus("登录成功，已切换到你的个人记录。");
}

function persistProfileFromFields() {
  const current = getProfile();
  saveProfile({
    ...current,
    name: els.profileName.value.trim(),
    birthDate: els.birthDate.value,
    birthTime: els.birthTime.value,
    birthCity: els.birthCity.value.trim(),
    currentCity: els.currentCity.value.trim()
  });
  renderProfile();
}

function persistProfileFromAstrologyFields() {
  const current = getProfile();
  saveProfile({
    ...current,
    birthDate: els.astroBirthDate.value,
    birthTime: els.astroBirthTime.value,
    birthCity: els.astroBirthCity.value.trim(),
    astroChartType: els.astroChartType.value,
    astroPartner: {
      name: els.astroPartnerName.value.trim(),
      birthDate: els.astroPartnerBirthDate.value,
      birthTime: els.astroPartnerBirthTime.value,
      birthCity: els.astroPartnerBirthCity.value.trim()
    },
    astroTargetDate: els.astroTargetDate.value
  });
  renderProfile();
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeNumberInput(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return String(number);
}

function normalizeSecond(value) {
  if (value === undefined || value === null || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(Math.max(0, Math.min(59.999999, number)));
}

function timeSecondFromValue(timeValue) {
  const parts = String(timeValue || "").split(":");
  return parts.length >= 3 ? normalizeSecond(parts[2]) : "";
}

function dmsPartsToString(degree, direction, minute, second) {
  const deg = Number(degree);
  if (!Number.isFinite(deg)) return "";
  const min = Number(minute || 0);
  const sec = Number(second || 0);
  return `${Math.abs(Math.trunc(deg))}${direction || "E"}${pad2(Math.max(0, Math.min(59, Math.trunc(min))))}'${pad2(Math.max(0, Math.min(59, Math.round(sec))))}"`;
}

function parseDmsString(value, axis) {
  const text = String(value || "").trim();
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*([NSEW])\s*(?:(\d+(?:\.\d+)?)')?\s*(?:(\d+(?:\.\d+)?)")?/i)
    || text.match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)?\D*(\d+(?:\.\d+)?)?\D*([NSEW])/i);
  if (!match) return null;
  const directionAtEnd = /[NSEW]$/i.test(match[0]);
  const degree = match[1] || "";
  const direction = directionAtEnd ? match[4] : match[2];
  const minute = directionAtEnd ? (match[2] || "0") : (match[3] || "0");
  const second = directionAtEnd ? (match[3] || "0") : (match[4] || "0");
  const allowed = axis === "lat" ? ["N", "S"] : ["E", "W"];
  return {
    degree,
    direction: allowed.includes(String(direction).toUpperCase()) ? String(direction).toUpperCase() : allowed[0],
    minute,
    second
  };
}

function timezonePartsToString(hour, minute, direction) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return "";
  const m = Number(minute || 0);
  const sign = direction === "W" ? "-" : "+";
  return `UTC${sign}${pad2(Math.abs(Math.trunc(h)))}:${pad2(Math.max(0, Math.min(59, Math.trunc(m))))}`;
}

function parseTimezoneString(value) {
  const text = String(value || "").trim();
  const match = text.match(/UTC\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return null;
  return {
    direction: match[1] === "-" ? "W" : "E",
    hour: match[2] || "0",
    minute: match[3] || "0"
  };
}

function syncIndianAdvancedToCanonical() {
  if (els.indianBirthSecond && !els.indianBirthSecond.value) {
    els.indianBirthSecond.value = timeSecondFromValue(els.indianBirthTime?.value);
  }
  const longitude = dmsPartsToString(
    els.indianLongitudeDegree?.value,
    els.indianLongitudeDirection?.value || "E",
    els.indianLongitudeMinute?.value,
    els.indianLongitudeSecond?.value
  );
  const latitude = dmsPartsToString(
    els.indianLatitudeDegree?.value,
    els.indianLatitudeDirection?.value || "N",
    els.indianLatitudeMinute?.value,
    els.indianLatitudeSecond?.value
  );
  const timezone = timezonePartsToString(
    els.indianTimezoneHour?.value,
    els.indianTimezoneMinute?.value,
    els.indianTimezoneDirection?.value || "E"
  );
  if (longitude) els.indianLongitude.value = longitude;
  if (latitude) els.indianLatitude.value = latitude;
  if (timezone) els.indianTimezone.value = timezone;
}

function syncIndianCanonicalToAdvanced(profile = getProfile()) {
  const lon = parseDmsString(profile.longitude || els.indianLongitude?.value, "lon");
  const lat = parseDmsString(profile.latitude || els.indianLatitude?.value, "lat");
  const tz = parseTimezoneString(profile.timezone || els.indianTimezone?.value);
  if (lon && els.indianLongitudeDegree) {
    els.indianLongitudeDegree.value = lon.degree;
    els.indianLongitudeDirection.value = lon.direction;
    els.indianLongitudeMinute.value = lon.minute;
    els.indianLongitudeSecond.value = lon.second;
  }
  if (lat && els.indianLatitudeDegree) {
    els.indianLatitudeDegree.value = lat.degree;
    els.indianLatitudeDirection.value = lat.direction;
    els.indianLatitudeMinute.value = lat.minute;
    els.indianLatitudeSecond.value = lat.second;
  }
  if (tz && els.indianTimezoneHour) {
    els.indianTimezoneHour.value = tz.hour;
    els.indianTimezoneMinute.value = tz.minute;
    els.indianTimezoneDirection.value = tz.direction;
  }
  if (els.indianBirthSecond) els.indianBirthSecond.value = profile.birthSecond || timeSecondFromValue(profile.birthTime) || "";
  if (els.indianDaylightSaving) els.indianDaylightSaving.checked = Boolean(profile.daylightSaving);
  if (els.indianUseLmt) els.indianUseLmt.checked = Boolean(profile.useLmt);
  if (els.indianAltitude) els.indianAltitude.value = profile.altitude || "";
  if (els.indianPressure) els.indianPressure.value = profile.atmosphericPressure || "";
  if (els.indianTemperature) els.indianTemperature.value = profile.atmosphericTemperature || "";
}

function getIndianPrecisionData() {
  syncIndianAdvancedToCanonical();
  return {
    birthSecond: normalizeSecond(els.indianBirthSecond?.value),
    timezoneHour: normalizeNumberInput(els.indianTimezoneHour?.value),
    timezoneMinute: normalizeNumberInput(els.indianTimezoneMinute?.value, "0"),
    timezoneDirection: els.indianTimezoneDirection?.value || "E",
    daylightSaving: Boolean(els.indianDaylightSaving?.checked),
    useLmt: Boolean(els.indianUseLmt?.checked),
    longitudeDegree: normalizeNumberInput(els.indianLongitudeDegree?.value),
    longitudeDirection: els.indianLongitudeDirection?.value || "E",
    longitudeMinute: normalizeNumberInput(els.indianLongitudeMinute?.value, "0"),
    longitudeSecond: normalizeSecond(els.indianLongitudeSecond?.value),
    latitudeDegree: normalizeNumberInput(els.indianLatitudeDegree?.value),
    latitudeDirection: els.indianLatitudeDirection?.value || "N",
    latitudeMinute: normalizeNumberInput(els.indianLatitudeMinute?.value, "0"),
    latitudeSecond: normalizeSecond(els.indianLatitudeSecond?.value),
    altitude: normalizeNumberInput(els.indianAltitude?.value),
    atmosphericPressure: normalizeNumberInput(els.indianPressure?.value),
    atmosphericTemperature: normalizeNumberInput(els.indianTemperature?.value)
  };
}

function persistProfileFromIndianFields() {
  const precision = getIndianPrecisionData();
  const current = getProfile();
  saveProfile({
    ...current,
    birthDate: els.indianBirthDate.value,
    birthTime: els.indianBirthTime.value,
    birthSecond: precision.birthSecond,
    birthCity: els.indianBirthCity.value.trim(),
    latitude: els.indianLatitude.value.trim(),
    longitude: els.indianLongitude.value.trim(),
    timezone: els.indianTimezone.value.trim(),
    ayanamsa: els.indianAyanamsa.value.trim() || "Lahiri",
    ...precision,
    indianSource: current.indianSource || ""
  });
  renderProfile();
}

const locationPresets = {};

function decimalToDms(value, axis) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  const direction = axis === "lat"
    ? (number >= 0 ? "N" : "S")
    : (number >= 0 ? "E" : "W");
  const absolute = Math.abs(number);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  return `${degrees}${direction}${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}"`;
}

function timezoneFromLongitude(longitude) {
  const number = Number(longitude);
  if (!Number.isFinite(number)) return "UTC+08:00";
  const offset = Math.max(-12, Math.min(14, Math.round(number / 15)));
  const sign = offset >= 0 ? "+" : "-";
  return `UTC${sign}${String(Math.abs(offset)).padStart(2, "0")}:00`;
}

function setIndianLocationStatus(text) {
  if (els.indianLocationStatus) {
    els.indianLocationStatus.textContent = text;
  }
}

async function resolveIndianLocation({ silent = false, rerender = true } = {}) {
  const raw = els.indianBirthCity.value.trim().toLowerCase();
  const matchedKey = Object.keys(locationPresets).find((key) => raw.includes(key.toLowerCase()));
  if (matchedKey) {
    const item = locationPresets[matchedKey];
    els.indianBirthCity.value = item.city;
    els.indianLatitude.value = item.latitude;
    els.indianLongitude.value = item.longitude;
    els.indianTimezone.value = item.timezone;
    els.indianAyanamsa.value = els.indianAyanamsa.value || "Lahiri";
    if (item.birthSecond && !els.indianBirthSecond.value) els.indianBirthSecond.value = item.birthSecond;
    if (item.timezoneHour) els.indianTimezoneHour.value = item.timezoneHour;
    if (item.timezoneMinute) els.indianTimezoneMinute.value = item.timezoneMinute;
    if (item.timezoneDirection) els.indianTimezoneDirection.value = item.timezoneDirection;
    if (item.daylightSaving !== undefined) els.indianDaylightSaving.checked = Boolean(item.daylightSaving);
    if (item.altitude) els.indianAltitude.value = item.altitude;
    if (item.atmosphericPressure) els.indianPressure.value = item.atmosphericPressure;
    if (item.atmosphericTemperature) els.indianTemperature.value = item.atmosphericTemperature;
    syncIndianCanonicalToAdvanced({
      ...getProfile(),
      birthSecond: els.indianBirthSecond.value,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      daylightSaving: Boolean(item.daylightSaving),
      altitude: item.altitude || "",
      atmosphericPressure: item.atmosphericPressure || "",
      atmosphericTemperature: item.atmosphericTemperature || ""
    });
    setIndianLocationStatus(`已自动生成：${item.latitude} / ${item.longitude} / ${item.timezone}`);
    if (rerender) renderIndianPage();
    return true;
  }

  if (!raw) return false;

  try {
    if (!silent) setIndianLocationStatus("正在根据地址生成经纬度……");
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(raw)}`);
    if (!response.ok) throw new Error("geocoding failed");
    const [place] = await response.json();
    if (!place) throw new Error("no place");
    const latitude = decimalToDms(place.lat, "lat");
    const longitude = decimalToDms(place.lon, "lon");
    els.indianBirthCity.value = place.display_name.split(",").slice(0, 3).join(", ");
    els.indianLatitude.value = latitude;
    els.indianLongitude.value = longitude;
    els.indianTimezone.value = timezoneFromLongitude(place.lon);
    els.indianAyanamsa.value = els.indianAyanamsa.value || "Lahiri";
    syncIndianCanonicalToAdvanced({
      ...getProfile(),
      latitude,
      longitude,
      timezone: els.indianTimezone.value
    });
    setIndianLocationStatus(`已自动生成：${latitude} / ${longitude} / ${els.indianTimezone.value}`);
    if (rerender) renderIndianPage();
    return true;
  } catch {
    if (!silent) {
      setIndianLocationStatus("暂时没有匹配到这个地址，可以换成城市名，例如：上海、北京、广州。");
    }
    return false;
  }
}

async function renderAstrologyPage() {
  persistProfileFromAstrologyFields();
  const profile = getProfile();
  const partner = {
    name: els.astroPartnerName.value.trim(),
    birthDate: els.astroPartnerBirthDate.value,
    birthTime: els.astroPartnerBirthTime.value,
    birthCity: els.astroPartnerBirthCity.value.trim()
  };
  if (!window.AstrologySkill) {
    els.astrologyReading.innerHTML = "<p>星盘 skill 未加载。</p>";
    return;
  }
  const options = {
    chartType: els.astroChartType.value,
    partner,
    targetDate: els.astroTargetDate.value
  };
  const chart = options.chartType === "composite"
    ? window.AstrologySkill.buildComposite(profile, partner)
    : window.AstrologySkill.buildChart(profile, options);
  els.astrologyReading.innerHTML = `
    ${window.AstrologySkill.reading(profile, options)}
    <div class="deepseek-reading" id="deepseekAstrologyReading">
      <h3>DeepSeek 专业星盘解读</h3>
      <p>正在连接 DeepSeek 生成更深入的星盘解读……</p>
    </div>
  `;
  const deepseekBox = document.querySelector("#deepseekAstrologyReading");
  if (!chart || !deepseekBox) return;
  try {
    const response = await fetch("/.netlify/functions/deepseek-astrology", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, chart, options })
    });
    if (!response.ok) {
      const issue = await response.json().catch(() => ({}));
      throw new Error(issue.error || "DeepSeek unavailable");
    }
    const data = await response.json();
    deepseekBox.innerHTML = `
      <h3>DeepSeek 专业星盘解读</h3>
      ${formatReadingText(data.reading)}
    `;
  } catch (error) {
    const missingKey = /key is not configured/i.test(error?.message || "");
    deepseekBox.innerHTML = `
      <h3>DeepSeek 专业星盘解读</h3>
      <p>${missingKey ? "当前预览环境没有读取到 DEEPSEEK_API_KEY；正式环境中的 DeepSeek 不受影响。请在 Netlify 将该变量的作用域同时开放给 Deploy Preview。" : "DeepSeek 暂时没有返回结果，页面已保留本地结构化解读，请稍后重试。"}</p>
    `;
  }
}

function getIndianModuleForFocus(focusArea, partner) {
  const focus = String(focusArea || "").toLowerCase();
  const hasPartner = Boolean(partner?.birthDate && partner?.birthTime && partner?.birthCity);
  if (hasPartner || /合盘|婚配|关系对比|synastry|partner|matching/.test(focus)) return "synastry";
  if (/事业|职业|工作|跳槽|转行|创业|财富|钱|收入|career|wealth|business/.test(focus)) return "career";
  if (/婚姻|感情|恋爱|桃花|复合|伴侣|爱情|love|relationship|marriage/.test(focus)) return "love";
  if (/校时|校准|矫正|出生时间不准|rectifier|rectification/.test(focus)) return "rectifier";
  return "core";
}

function getIndianSkillModules(vedicModule) {
  const modules = ["vedic-calculator", "vedic-reader", "vedic-core"];
  const map = {
    career: "vedic-career",
    love: "vedic-love",
    rectifier: "vedic-rectifier",
    synastry: "vedic-synastry",
    core: "vedic-core",
    reader: "vedic-reader"
  };
  const skillName = map[vedicModule] || "vedic-core";
  if (!modules.includes(skillName)) modules.push(skillName);
  if (vedicModule === "synastry" && !modules.includes("vedic-love")) modules.push("vedic-love");
  return modules;
}

function getIndianOptions() {
  const partner = {
    name: els.vedicPartnerName?.value.trim() || "",
    birthDate: els.vedicPartnerBirthDate?.value || "",
    birthTime: els.vedicPartnerBirthTime?.value || "",
    birthCity: els.vedicPartnerBirthCity?.value.trim() || ""
  };
  const focusArea = els.indianConcernSelect?.value || "事业";
  const vedicModule = getIndianModuleForFocus(focusArea, partner);
  return {
    vedicModule,
    focusArea,
    activeSkillModules: getIndianSkillModules(vedicModule),
    partner
  };
}

async function fetchVedicSkillResult(profile, options, chart) {
  try {
    const response = await fetch("/.netlify/functions/vedic-skill-bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, options, chart })
    });
    if (!response.ok) {
      const issue = await response.json().catch(() => ({}));
      return {
        ok: false,
        bridge: { source: "professional-backend", calculatorReady: false, reason: issue.reason || issue.error || "专业排盘接口暂时不可用。" },
        structuredDataMarkdown: "",
        calculationMeta: null
      };
    }
    return response.json();
  } catch (error) {
    return {
      ok: false,
      bridge: { source: "professional-backend", calculatorReady: false, reason: `当前页面无法连接 Python 排盘服务：${error.message}` },
      structuredDataMarkdown: "",
      calculationMeta: null
    };
  }
}

function warmVedicSkillResult(profile, options, chart) {
  const requestId = Date.now();
  state.indianSkillRequestId = requestId;
  state.indianSkillResult = null;
  state.indianSkillPromise = fetchVedicSkillResult(profile, options, chart)
    .then((skillResult) => {
      if (state.indianSkillRequestId === requestId) {
        state.indianSkillResult = skillResult;
      }
      return skillResult;
    });
  return state.indianSkillPromise;
}

function stableVedicSignature(profile, options) {
  const payload = {
    birthDate: profile.birthDate || "",
    birthTime: profile.birthTime || "",
    birthSecond: profile.birthSecond || "",
    birthCity: profile.birthCity || "",
    latitude: profile.latitude || "",
    longitude: profile.longitude || "",
    timezone: profile.timezone || "",
    ayanamsa: profile.ayanamsa || "Lahiri"
  };
  const text = JSON.stringify(payload);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return `vedic-${Math.abs(hash)}`;
}

function getChartCache() {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey("vedic_chart_cache")) || "{}");
  } catch {
    return {};
  }
}

function saveChartCache(signature, chartData) {
  const cache = getChartCache();
  cache[signature] = {
    ...chartData,
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(userStorageKey("vedic_chart_cache"), JSON.stringify(cache));
}

async function getOrCreateVedicChartData(profile, options, chart) {
  const signature = stableVedicSignature(profile, options);
  const cache = getChartCache();
  if (cache[signature]?.skillResult?.ok && cache[signature]?.chartJson && cache[signature]?.calculationMeta?.commit === "7a6e33e23dc1f45107af2f249848241bb4d22b67") {
    return cache[signature];
  }
  const skillResult = state.indianSkillResult || (state.indianSkillPromise ? await state.indianSkillPromise : null)
    || await fetchVedicSkillResult(profile, options, chart);
  if (!skillResult?.ok || !skillResult.chartJson || skillResult.calculationMeta?.commit !== "7a6e33e23dc1f45107af2f249848241bb4d22b67") {
    throw new Error(skillResult?.bridge?.reason || "专业星历计算暂时失败，请稍后重试。");
  }
  state.indianSkillResult = skillResult;
  const chartData = {
    signature,
    profile,
    options,
    chart,
    skillResult,
    structuredData: chart?.structuredData || {},
    structuredDataMarkdown: skillResult?.structuredDataMarkdown || "",
    professionalChart: skillResult?.professionalChart || null,
    chartJson: skillResult?.chartJson || null,
    evidenceLedger: skillResult?.evidenceLedger || null,
    calculationMeta: skillResult?.calculationMeta || null,
    pdfReferenceData: window.IndianAstrologySkill?.pdfReferenceData || {}
  };
  saveChartCache(signature, chartData);
  return chartData;
}

function getMasterReadings() {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey("master_readings")) || "[]");
  } catch {
    return [];
  }
}

function saveMasterReading(record) {
  const readings = getMasterReadings();
  const next = [record, ...readings.filter((item) => item.id !== record.id)].slice(0, 8);
  localStorage.setItem(userStorageKey("master_readings"), JSON.stringify(next));
}

function getConversationMemory(masterId) {
  try {
    const all = JSON.parse(localStorage.getItem(userStorageKey("conversation_memory")) || "{}");
    return Array.isArray(all[masterId]) ? all[masterId] : [];
  } catch {
    return [];
  }
}

function saveConversationMemory(masterId, history) {
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(userStorageKey("conversation_memory")) || "{}");
  } catch {
    all = {};
  }
  all[masterId] = history.slice(-24);
  localStorage.setItem(userStorageKey("conversation_memory"), JSON.stringify(all));
}

function summarizeReading(reading) {
  return String(reading || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

function findMasterReading(profile, options) {
  const signature = stableVedicSignature(profile, options);
  return getMasterReadings().find((item) => {
    const contract = item.chartData?.chartJson || item.skillResult?.chartJson || item.chartJson;
    return item.signature === signature
      && contract?.birth
      && Array.isArray(contract?.planets)
      && Array.isArray(contract?.houses)
      && contract?.navamsa;
  }) || null;
}

function renderVedicProgress(activeStep = 0) {
  const messages = [
    "Reading your birth chart...",
    "Calculating planetary positions...",
    "Interpreting Nakshatras...",
    "Consulting ancient wisdom...",
    "Generating AI insights...",
    "Shaping your Life Blueprint...",
    "Finishing your personal reading..."
  ];
  const safeStep = Math.min(Math.max(0, activeStep), messages.length - 1);
  return `
    <div class="vedic-loading-stage" role="status" aria-live="polite">
      <div class="vedic-loading-cosmos" aria-hidden="true">
        <div class="vedic-loading-orbit"></div>
        <div class="vedic-loading-moon">
          <svg class="lucide" viewBox="0 0 24 24"><path d="M12 3a7 7 0 1 0 7 7c0-3-2-5-4-6 0 5-4 9-9 9-1 0-1 0-1-.1A7 7 0 0 0 12 3Z" /></svg>
        </div>
      </div>
      <p class="vedic-kicker">A moment of reflection</p>
      <h4>${messages[safeStep]}</h4>
      <div class="vedic-loading-track"><span style="width:${Math.max(12, ((safeStep + 1) / messages.length) * 100)}%"></span></div>
      <p>正在生成完整 Life Blueprint，请保持页面打开。通常需要 2–5 分钟。</p>
    </div>
  `;
}

function renderBlueprintReport(record) {
  const sections = splitBlueprintSections(record.masterReading);
  return `
    <article class="blueprint-report">
      <header class="blueprint-report-header">
        <div>
          <span class="blueprint-status"><i></i>完整解读已保存</span>
          <h4>你的 Life Blueprint</h4>
          <p>长解读已经按章节整理。点击章节即可展开阅读，后续追问会继续引用这份报告。</p>
        </div>
        <span class="blueprint-count">${sections.length || 1} 个章节</span>
      </header>
      <div class="blueprint-toolbar">
        <span>首次生成后会保存在当前设备</span>
        <span>可使用页面上方的 PDF 按钮导出</span>
      </div>
      <div class="blueprint-chapters">
        ${sections.length ? sections.map((section, index) => `
          <details class="blueprint-chapter" ${index === 0 ? "open" : ""}>
            <summary>
              <span class="blueprint-index">${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(section.title)}</strong>
              <svg class="lucide" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div class="typewriter-text">${formatReadingText(section.body.join("\n"))}</div>
          </details>
        `).join("") : `<div class="typewriter-text">${formatReadingText(record.masterReading)}</div>`}
      </div>
    </article>
  `;
}

function renderIndianBlueprint(record, message = "") {
  const deepseekBox = document.querySelector("#deepseekIndianReading");
  if (!deepseekBox) return;
  deepseekBox.hidden = false;
  deepseekBox.innerHTML = `
    <h3>Life Blueprint</h3>
    ${message ? `<p class="disclaimer">${escapeHtml(message)}</p>` : ""}
    ${renderBlueprintReport(record)}
    ${indianChatMarkup()}
  `;
  renderIndianChatMessages();
}

async function postJsonWithTimeout(url, payload, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function createBlueprintJob(profile, options, chart, chartData) {
  return postJsonWithTimeout("/api/blueprint/start", {
    profile,
    options,
    chart,
    chartData,
    skillResult: chartData?.skillResult || null,
    pdfReferenceData: window.IndianAstrologySkill?.pdfReferenceData || {}
  }, 30000);
}

async function generateBlueprintDirect(profile, options, chart, chartData) {
  return postJsonWithTimeout("/api/generate-blueprint", {
    profile,
    options,
    chart,
    chartData,
    skillResult: chartData?.skillResult || null,
    pdfReferenceData: window.IndianAstrologySkill?.pdfReferenceData || {}
  }, 58000);
}

async function waitForBlueprintJob(jobId, onProgress) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const response = await fetch(`/api/blueprint/${encodeURIComponent(jobId)}`);
    if (!response.ok) throw new Error(`Blueprint job status failed: ${response.status}`);
    const job = await response.json();
    onProgress?.(job);
    if (job.status === "completed") return job;
    if (job.status === "failed") throw new Error(job.error || "Blueprint job failed");
    await sleep(attempt < 12 ? 4000 : 7000);
  }
  throw new Error("Blueprint job timed out");
}

async function renderIndianPage() {
  if (els.indianBirthCity.value.trim() && (!els.indianLatitude.value || !els.indianLongitude.value)) {
    await resolveIndianLocation({ silent: true, rerender: false });
  }
  persistProfileFromIndianFields();
  const profile = getProfile();
  if (!window.IndianAstrologySkill) {
    els.indianReading.innerHTML = "<p>印度占星 skill 未加载。</p>";
    return;
  }
  const options = {
    ...getIndianOptions(),
    professionalChart: state.indianSkillResult?.professionalChart || null
  };
  const chart = window.IndianAstrologySkill.buildChart(profile, options);
  els.indianReading.innerHTML = window.IndianAstrologySkill.chartView(profile, options);
  const blueprintActions = els.indianReading.querySelector(".chart-actions");
  if (blueprintActions) {
    blueprintActions.outerHTML = `
      <section class="vedic-blueprint-entry" aria-labelledby="vedicBlueprintEntryTitle">
        <div class="vedic-blueprint-entry-copy">
          <span class="vedic-blueprint-label">02 · 深度解读</span>
          <h4 id="vedicBlueprintEntryTitle">生成完整 Life Blueprint</h4>
          <p>系统会结合 D1、月亮、月宿、业力轴与大运，整理为可折叠的章节长报告。首次生成约需 2–5 分钟，之后可直接读取并继续追问。</p>
          <div class="vedic-blueprint-points">
            <span>完整章节</span><span>自动保存</span><span>持续咨询</span>
          </div>
        </div>
        <button class="button primary" id="startIndianReadingButton" type="button">开始生成完整解读</button>
      </section>
    `;
  }
  if (!options.professionalChart) {
    warmVedicSkillResult(profile, options, chart).then((skillResult) => {
      if (skillResult?.ok && skillResult.professionalChart && skillResult.chartJson) {
        renderIndianPage();
        return;
      }
      els.indianReading.innerHTML = `
        <div class="vedic-chart-panel">
          <p class="disclaimer">专业 Python 排盘暂时失败。系统不会显示网页近似盘，也不会启动 AI 解读。${escapeHtml(skillResult?.bridge?.reason || "请稍后重试。")}</p>
          <button class="button primary" id="retryIndianChartButton" type="button">重试计算星盘</button>
        </div>
      `;
      document.querySelector("#retryIndianChartButton")?.addEventListener("click", () => renderIndianPage());
    });
  }
}

async function renderIndianInterpretation() {
  persistProfileFromIndianFields();
  const profile = getProfile();
  if (!window.IndianAstrologySkill) {
    els.indianReading.innerHTML = "<p>印度占星 skill 未加载。</p>";
    return;
  }
  const options = {
    ...getIndianOptions(),
    professionalChart: state.indianSkillResult?.professionalChart || null
  };
  const chart = window.IndianAstrologySkill.buildChart(profile, options);
  const deepseekBox = document.querySelector("#deepseekIndianReading");
  if (!chart || !deepseekBox) return;
  deepseekBox.hidden = false;
  const cachedMaster = findMasterReading(profile, options);
  if (cachedMaster) {
    state.indianMasterReading = cachedMaster;
    state.indianContext = {
      profile,
      chart,
      options,
      skillResult: cachedMaster.skillResult,
      chartData: cachedMaster.chartData || cachedMaster.chartJson,
      masterReading: cachedMaster.masterReading
    };
    state.indianChatHistory = getConversationMemory(cachedMaster.id);
    renderIndianBlueprint(cachedMaster, "已读取这个账号保存过的完整 Life Blueprint。后续追问会继续引用这份报告与历史咨询，不会重新生成整盘。");
    return;
  }

  let activeProgress = 0;
  deepseekBox.innerHTML = `
    <h3>Life Blueprint</h3>
    ${renderVedicProgress(activeProgress)}
  `;
  const progressTimer = window.setInterval(() => {
    activeProgress = Math.min(activeProgress + 1, 6);
    deepseekBox.innerHTML = `
      <h3>Life Blueprint</h3>
      ${renderVedicProgress(activeProgress)}
    `;
  }, 8500);
  let chartData = null;
  try {
    chartData = await getOrCreateVedicChartData(profile, options, chart);
    activeProgress = 3;

    let job = null;
    try {
      const started = await createBlueprintJob(profile, options, chart, chartData);
      job = await waitForBlueprintJob(started.jobId, (current) => {
        activeProgress = Math.max(activeProgress, Math.floor((current.progress || 0) / 15));
        deepseekBox.innerHTML = `
          <h3>Life Blueprint</h3>
          ${renderVedicProgress(activeProgress)}
        `;
      });
    } catch {
      activeProgress = 5;
      deepseekBox.innerHTML = `
        <h3>Life Blueprint</h3>
        ${renderVedicProgress(activeProgress)}
      `;
      job = await generateBlueprintDirect(profile, options, chart, chartData);
    }
    const masterReading = job.blueprint || "";
    if (!masterReading.trim()) throw new Error("完整解读暂时没有返回有效内容");
    const masterRecord = {
      id: `${stableVedicSignature(profile, options)}-${Date.now()}`,
      signature: stableVedicSignature(profile, options),
      userId: getCurrentUser(),
      birthData: profile,
      chartJson: chartData.chartJson,
      webChart: chart,
      chartData: job.chartData || chartData,
      skillResult: (job.chartData || chartData)?.skillResult || chartData.skillResult,
      masterReading,
      summary: job.summary || summarizeReading(masterReading),
      favoriteChapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: job.createdAt || new Date().toISOString()
    };
    saveMasterReading(masterRecord);
    state.indianMasterReading = masterRecord;
    state.indianContext = { profile, chart, options, skillResult: chartData.skillResult, chartData, masterReading };
    state.indianChatHistory = [];
    saveConversationMemory(masterRecord.id, []);
    window.clearInterval(progressTimer);
    renderIndianBlueprint(masterRecord, "这份总报告已保存。之后你可以直接追问具体问题，系统会基于这份报告和咨询记忆继续回答。");
  } catch (error) {
    window.clearInterval(progressTimer);
    state.indianMasterReading = null;
    state.indianContext = null;
    state.indianChatHistory = [];
    const reason = error?.message ? `原因：${error.message}` : "原因：专业星历或完整解读服务暂时没有返回。";
    deepseekBox.innerHTML = `
      <h3>Life Blueprint</h3>
      <p class="disclaimer">专业星历计算或AI解读暂时失败，请稍后重试。系统不会使用本地近似星盘，也不会生成无真实JSON依据的报告。${escapeHtml(reason)}</p>
      <button class="button primary" id="retryIndianReadingButton" type="button">重试专业计算</button>
    `;
    document.querySelector("#retryIndianReadingButton")?.addEventListener("click", () => renderIndianInterpretation());
  }
}

function indianChatMarkup() {
  const topics = [
    ["事业", "请基于我的 Life Blueprint 和印度星盘，重点分析我的事业方向、适合行业、职业节奏、是否适合创业或自由职业。"],
    ["婚姻", "请基于我的 Life Blueprint 和印度星盘，重点分析我的婚姻模式、伴侣特质、适合结婚阶段和关系课题。"],
    ["财富", "请基于我的 Life Blueprint 和印度星盘，重点分析我的财富模式、赚钱方式、容易漏财的位置和资产配置建议。"],
    ["感情", "请基于我的 Life Blueprint 和印度星盘，重点分析我的恋爱模式、吸引类型、业力关系和当前感情建议。"],
    ["健康", "请基于我的 Life Blueprint 和印度星盘，重点分析我的身心压力模式、健康注意点和生活节律建议。"],
    ["未来几年", "请基于我的 Life Blueprint 和印度星盘，重点分析未来三到五年的大运趋势、关键年份和现实行动建议。"]
  ];
  return `
    <div class="vedic-chat">
      <h4>专题继续咨询</h4>
      <div class="vedic-topic-actions">
        ${topics.map(([label, question]) => `
          <button class="button secondary" type="button" data-indian-topic="${escapeHtml(question)}">${label}</button>
        `).join("")}
      </div>
      <div class="vedic-chat-messages" id="indianChatMessages"></div>
      <div class="vedic-chat-input">
        <input id="indianQuestionInput" type="text" placeholder="例如：我什么时候适合换工作？这段关系能不能稳定？" />
        <button class="button secondary" id="sendIndianQuestionButton" type="button">发送</button>
      </div>
      <p class="disclaimer">追问会读取 Life Blueprint 与 Consultation History，保持同一张命盘逻辑连续。</p>
    </div>
  `;
}

function renderIndianChatMessages() {
  const box = document.querySelector("#indianChatMessages");
  if (!box) return;
  box.innerHTML = state.indianChatHistory.map((item) => `
    <article class="vedic-chat-message ${item.role}">
      <strong>${item.role === "user" ? "你" : "占星师"}</strong>
      ${formatReadingText(item.content)}
    </article>
  `).join("");
  box.scrollTop = box.scrollHeight;
}

function updateActiveTab(target) {
  document.querySelectorAll("[data-tab-target]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tabTarget === target);
  });
}

async function sendIndianQuestion(presetQuestion = "") {
  const input = document.querySelector("#indianQuestionInput");
  const button = document.querySelector("#sendIndianQuestionButton");
  if (!input || !button || !state.indianContext || !state.indianMasterReading) return;
  const question = presetQuestion || input.value.trim();
  if (!question) return;
  input.value = "";
  state.indianChatHistory.push({ role: "user", content: question });
  state.indianChatHistory.push({ role: "assistant", content: "正在结合你的 Life Blueprint 和之前的咨询记录回答……" });
  renderIndianChatMessages();
  button.disabled = true;
  try {
    const data = await postJsonWithTimeout("/api/chat", {
      ...state.indianContext,
      question,
      blueprint: state.indianMasterReading.masterReading,
      history: state.indianChatHistory.slice(0, -1),
      chartData: state.indianMasterReading.chartData || state.indianContext.chartData,
      masterReading: state.indianMasterReading.masterReading,
      masterSummary: state.indianMasterReading.summary,
      pdfReferenceData: window.IndianAstrologySkill.pdfReferenceData
    }, 42000);
    state.indianChatHistory[state.indianChatHistory.length - 1] = {
      role: "assistant",
      content: data.answer || "这次没有生成有效回答，请换一种问法再试。"
    };
    saveConversationMemory(state.indianMasterReading.id, state.indianChatHistory);
  } catch {
    state.indianChatHistory[state.indianChatHistory.length - 1] = {
      role: "assistant",
      content: "当前 DeepSeek 没有返回结果。我仍建议你围绕上升、月亮、Rahu/Ketu 轴和土星所在宫位来追问，这样答案会更聚焦。"
    };
    saveConversationMemory(state.indianMasterReading.id, state.indianChatHistory);
  } finally {
    button.disabled = false;
    renderIndianChatMessages();
  }
}

function showAstrologyFlow() {
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再查看个人星盘。");
    showHomeFlow();
    return;
  }
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  persistProfileFromFields();
  renderAstrologyPage();
  els.home.hidden = true;
  els.drawSection.hidden = true;
  els.resultSection.hidden = true;
  els.indianAstrologySection.hidden = true;
  els.astrologySection.hidden = false;
  location.hash = "astrology";
  updateActiveTab("astrology");
  setExperienceStage("astrology", "form");
}

function showIndianFlow() {
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再查看印度占星。");
    showHomeFlow();
    return;
  }
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("astraea-landing-active");
  document.body.classList.add("indian-wellness-active");
  persistProfileFromFields();
  renderIndianPage();
  els.home.hidden = true;
  els.drawSection.hidden = true;
  els.resultSection.hidden = true;
  els.astrologySection.hidden = true;
  els.indianAstrologySection.hidden = false;
  location.hash = "indianAstrology";
  updateActiveTab("indianAstrology");
  setExperienceStage("vedic", "intro");
}

function showHomeFlow() {
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  els.home.hidden = false;
  els.drawSection.hidden = true;
  els.resultSection.hidden = true;
  els.astrologySection.hidden = true;
  els.indianAstrologySection.hidden = true;
  els.historySection.hidden = true;
  renderLoginState();
  if (isLoggedIn()) showAstraeaLanding();
  location.hash = "home";
  updateActiveTab("home");
}

function showHistoryFlow() {
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再查看历史记录。");
    showHomeFlow();
    return;
  }
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  renderHistory();
  els.home.hidden = true;
  els.drawSection.hidden = true;
  els.resultSection.hidden = true;
  els.astrologySection.hidden = true;
  els.indianAstrologySection.hidden = true;
  els.historySection.hidden = false;
  location.hash = "history";
  updateActiveTab("history");
}

function showTarotFlow() {
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再开始塔罗占卜。");
    showHomeFlow();
    return;
  }
  document.body.classList.add("cream-app-active");
  document.body.classList.remove("indian-wellness-active");
  document.body.classList.remove("astraea-landing-active");
  els.home.hidden = true;
  els.astrologySection.hidden = true;
  els.indianAstrologySection.hidden = true;
  els.historySection.hidden = true;
  els.drawSection.hidden = false;
  els.resultSection.hidden = true;
  state.selectedCards = [];
  state.currentReading = null;
  state.shuffled = false;
  renderDeck();
  location.hash = "draw";
  updateActiveTab("draw");
  setExperienceStage("tarot", "question");
}

function setExperienceStage(experience, stage) {
  document.querySelectorAll(`[data-experience-panel="${experience}"]`).forEach((panel) => {
    panel.hidden = panel.dataset.stage !== stage;
  });
  document.querySelectorAll(`[data-experience-tab="${experience}"]`).forEach((button) => {
    const active = button.dataset.stage === stage;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelector(".app-main")?.scrollTo({ top: 0 });
}

function enterDrawFlow() {
  const question = els.questionInput.value.trim();
  if (!question) {
    els.ritualStatus.textContent = "请先写下一个具体问题，再进入抽牌。";
    els.questionInput.focus();
    return;
  }
  if (!isLoggedIn()) {
    setAuthStatus("请先登录账号，再开始塔罗占卜。");
    showHomeFlow();
    return;
  }
  persistProfileFromFields();
  setExperienceStage("tarot", "spread");
  els.home.hidden = true;
  els.astrologySection.hidden = true;
  els.indianAstrologySection.hidden = true;
  els.drawSection.hidden = false;
  els.resultSection.hidden = true;
  state.selectedCards = [];
  state.currentReading = null;
  state.shuffled = false;
  renderDeck();
  location.hash = "draw";
  updateActiveTab("draw");
}

function returnHomeFlow() {
  showHomeFlow();
}

function shuffleDeck() {
  state.shuffled = false;
  state.selectedCards = [];
  state.currentReading = null;
  els.result.hidden = true;
  document.querySelectorAll(".tarot-card").forEach((card) => card.classList.remove("selected"));
  els.shuffleButton.disabled = true;
  els.shuffleStage.classList.add("active");
  els.ritualStatus.textContent = "正在洗牌，请把注意力放回你的问题。";

  window.setTimeout(() => {
    state.shuffled = true;
    els.shuffleButton.disabled = false;
    els.shuffleStage.classList.remove("active");
    els.ritualStatus.textContent = "洗牌完成。现在可以静心 5 秒，然后抽牌。";
  }, 1500);
}

function startRitual() {
  const question = els.questionInput.value.trim();
  if (!question) {
    els.ritualStatus.textContent = "请先写下一个具体问题，让牌面有可以回应的方向。";
    return;
  }

  if (!state.shuffled) {
    shuffleDeck();
    return;
  }

  state.selectedCards = [];
  state.currentReading = null;
  state.favorite = false;
  els.result.hidden = true;
  document.querySelectorAll(".tarot-card").forEach((card) => card.classList.remove("selected"));

  let count = 5;
  els.prepareButton.disabled = true;
  els.ritualStatus.textContent = `请慢慢呼吸，静心 ${count} 秒。`;
  const timer = window.setInterval(() => {
    count -= 1;
    if (count > 0) {
      els.ritualStatus.textContent = `正在聆听牌面的回声…… ${count}`;
      return;
    }
    window.clearInterval(timer);
    els.prepareButton.disabled = false;
    els.ritualStatus.textContent = `现在请从牌组中选择 ${state.spread.positions.length} 张牌。`;
  }, 1000);
}

function drawCard(button) {
  if (!els.questionInput.value.trim()) {
    els.ritualStatus.textContent = "请先写下问题并完成静心。";
    return;
  }
  if (!state.shuffled) {
    els.ritualStatus.textContent = "请先洗牌，让本次牌组重新归位。";
    return;
  }
  if (state.selectedCards.length >= state.spread.positions.length || button.classList.contains("selected")) {
    return;
  }

  const remaining = tarotCards.filter((card) => !state.selectedCards.some((item) => item.card.id === card.id));
  const card = remaining[Math.floor(Math.random() * remaining.length)];
  const orientation = Math.random() > 0.32 ? "upright" : "reversed";
  const position = state.spread.positions[state.selectedCards.length];
  state.selectedCards.push({ card, orientation, position });
  button.classList.add("selected");

  const left = state.spread.positions.length - state.selectedCards.length;
  els.ritualStatus.textContent = left ? `已选择 ${state.selectedCards.length} 张，还需 ${left} 张。` : "牌面已齐，正在整理解读。";

  if (!left) {
    window.setTimeout(showResult, 500);
  }
}

const topicLens = {
  love: {
    field: "关系互动",
    focus: "真实需求、情绪边界与双方靠近的方式",
    advice: "先用不指责的语言表达一个具体感受，再观察对方的回应质量"
  },
  career: {
    field: "事业方向",
    focus: "资源配置、角色定位与下一步推进节奏",
    advice: "把目标拆成一个可交付的小成果，用结果验证方向"
  },
  wealth: {
    field: "财富机会",
    focus: "风险承受度、资源流动与长期稳定性",
    advice: "先核对成本、时间和最坏情况，再决定是否投入更多资源"
  },
  growth: {
    field: "自我成长",
    focus: "内在模式、习惯反应与自我支持方式",
    advice: "记录一次情绪触发点，分清事实、解释和真正的需要"
  },
  daily: {
    field: "今日能量",
    focus: "当天最值得留意的提醒、节奏与心态",
    advice: "今天只选择一个最重要的小行动，把注意力收回来"
  },
  choice: {
    field: "重大选择",
    focus: "不同路径的代价、隐藏条件与价值排序",
    advice: "写下每个选项会带来的三个收益和三个代价，再看哪个更接近长期价值"
  }
};

const positionLens = {
  "核心指引": "它像本次问题的中心线索，提醒你先抓住最关键的判断依据。",
  "过去影响": "它指向过去留下的惯性，可能仍在影响你此刻的反应。",
  "当前状态": "它描述现在最活跃的能量，也是你最容易感受到的部分。",
  "未来趋势": "它不是绝对预言，而是指出若当前模式延续，局势可能靠近的方向。",
  "我的状态": "它映照你在这段关系或互动中的位置，尤其是你没有说出口的需求。",
  "对方状态": "它提示对方可能呈现出的倾向，但仍需要通过现实沟通验证。",
  "关系现状": "它总结双方之间正在形成的动态，包括连接与拉扯。",
  "潜在阻碍": "它指出容易被忽略的卡点，通常不是表面事件，而是背后的模式。",
  "行动建议": "它给出下一步的落点，重点是温和、具体、可执行。",
  "选项 A": "它呈现选项 A 的能量与代价，适合用来观察这条路的真实质地。",
  "选项 B": "它呈现选项 B 的能量与代价，帮助你比较另一条路的可能性。",
  "隐藏因素": "它提示尚未完全浮出水面的变量，做决定前值得再确认。"
};

const cardAdvice = {
  "the-fool": ["允许一次新的尝试，但先设定一个安全边界。", "把未知拆小，先走出第一步，而不是要求自己一次看完全部答案。"],
  "the-magician": ["盘点手边已有资源，选择最容易启动的一项马上行动。", "把想法写成计划表，避免灵感停留在脑中。"],
  "the-high-priestess": ["暂缓逼问答案，给直觉和事实各留一个位置。", "留意细节和沉默，它们可能比表面表达更接近真相。"],
  "the-empress": ["优先滋养真正有生命力的部分，减少无效消耗。", "问自己：这件事是在让我生长，还是只是在让我付出？"],
  "the-emperor": ["建立规则、期限或边界，让局势有可以依靠的结构。", "用清晰安排代替反复担心。"],
  "the-hierophant": ["寻找可信的经验、导师或规则，但保留自己的判断。", "确认承诺是否来自真心，而不是来自习惯或压力。"],
  "the-lovers": ["回到价值观层面做选择，不只看短期情绪。", "把真正重要的标准说清楚，关系才有机会诚实前进。"],
  "the-chariot": ["保持方向感，不要被旁枝问题拉走。", "选择一个目标，坚持推进到能看到反馈。"],
  "strength": ["用温柔但坚定的方式处理冲突。", "别急着证明自己，稳定本身就是力量。"],
  "the-hermit": ["给自己一段安静时间，答案需要从噪音中分离出来。", "减少外界意见，听见你自己的判断。"],
  "wheel-of-fortune": ["接受变化正在发生，先观察周期而不是急着控制。", "把计划做得更有弹性，为转机留空间。"],
  "justice": ["回到事实、责任和边界，不让情绪替你判案。", "把模糊约定写清楚，减少误解。"],
  "the-hanged-man": ["换一个角度看问题，暂停可能比硬推更有效。", "问自己：如果不急着证明对错，我还能看见什么？"],
  "death": ["允许旧模式结束，新的空间才会出现。", "做一次整理，放下已经不能支持你的东西。"],
  "temperance": ["选择协调与渐进，不必用极端方式解决问题。", "把节奏放慢一点，让不同需求有机会融合。"],
  "the-devil": ["诚实看见依赖、执念或交换条件。", "减少让你失去自由感的选择。"],
  "the-tower": ["面对已经松动的结构，重建会比粉饰更有力量。", "先处理最明显的真相，不必一次解决全部震动。"],
  "the-star": ["保留希望，但把希望落到具体行动。", "做一件能恢复信心的小事。"],
  "the-moon": ["先核对事实，不让焦虑填补未知。", "把不确定写下来，逐项确认。"],
  "the-sun": ["选择更坦诚、明亮的表达方式。", "把已经清楚的好消息或进展看见。"],
  "judgement": ["复盘过去的选择，听见内在真正的召唤。", "给自己一次重新回应生活的机会。"],
  "the-world": ["完成收尾，整合经验，再进入下一阶段。", "把成果固定下来，不要在最后一步反复拖延。"]
};

const majorDepth = {
  "the-fool": {
    essence: "愚者不是单纯冒险，它代表尚未被经验限制的生命力。牌面在提醒你，问题的关键可能不是准备到完美，而是能否带着觉察进入新阶段。",
    shadow: "阴影面是轻率、逃避后果，或把自由误解成不需要承担。",
    cue: "问自己：如果我允许自己从零开始，第一步会是什么？"
  },
  "the-magician": {
    essence: "魔术师强调把意志、语言、资源和行动连接起来。它通常表示你并不缺少条件，真正的考验是能否集中力量。",
    shadow: "阴影面是说得太多、做得太散，或用技巧掩盖真实动机。",
    cue: "把手上已有的资源列出来，只选一个最能启动局面的工具。"
  },
  "the-high-priestess": {
    essence: "女祭司指向尚未公开的信息、直觉与潜意识。她提醒你，不是所有答案都适合马上逼出来。",
    shadow: "阴影面是过度沉默、被动等待，或把猜测误当成直觉。",
    cue: "给自己一点安静时间，同时记录事实证据，不让直觉孤立存在。"
  },
  "the-empress": {
    essence: "女皇关乎滋养、身体感受、创造力与关系中的承接。它表示某件事需要被好好照料，而不是被催促。",
    shadow: "阴影面是过度付出、边界变软，或用照顾换取安全感。",
    cue: "观察这件事是否让你变得更丰盛，还是只让你被消耗。"
  },
  "the-emperor": {
    essence: "皇帝代表结构、责任和可执行的秩序。它要求你从情绪波动里站出来，建立规则与边界。",
    shadow: "阴影面是控制欲、僵硬标准，或把脆弱藏在强势后面。",
    cue: "为这件事定一个清楚的边界、时间表或判断标准。"
  },
  "the-hierophant": {
    essence: "教皇指向传统、承诺、系统性学习和被认可的路径。它常提示你向经验与专业框架借力。",
    shadow: "阴影面是盲从权威，或为了符合期待而压下真实判断。",
    cue: "分清哪些规则能保护你，哪些规则只是让你不敢选择。"
  },
  "the-lovers": {
    essence: "恋人真正讨论的是价值选择，而不只是浪漫关系。它要求你在吸引、承诺和真实标准之间做诚实校准。",
    shadow: "阴影面是犹豫、讨好，或把短暂心动误认为长期契合。",
    cue: "写下你不能妥协的三个价值标准。"
  },
  "the-chariot": {
    essence: "战车代表目标感、意志力和把矛盾力量拉向同一方向的能力。它适合主动推进，但不适合失控冲刺。",
    shadow: "阴影面是过度用力、只想赢，或忽略身体与关系的承受度。",
    cue: "确认方向后，把行动控制在可持续的节奏里。"
  },
  strength: {
    essence: "力量牌不是压制，而是温柔驯服本能。它表示真正有效的力量来自稳定、耐心和内在安全感。",
    shadow: "阴影面是硬撑、讨好式温柔，或压抑愤怒到失去边界。",
    cue: "用坚定但不攻击的方式表达你的底线。"
  },
  "the-hermit": {
    essence: "隐士代表向内寻找答案。它通常说明外界意见已经太多，你需要回到自己的经验和智慧。",
    shadow: "阴影面是孤立、退缩，或用独处逃避必要沟通。",
    cue: "暂时减少噪音，问自己真正知道但一直回避的答案是什么。"
  },
  "wheel-of-fortune": {
    essence: "命运之轮显示周期变化和外部变量。它提醒你顺势而为，同时保留对变化的敏感度。",
    shadow: "阴影面是完全被动，或把短期波动看成命运定论。",
    cue: "观察局势正在转向哪里，而不是只抓住原计划。"
  },
  justice: {
    essence: "正义要求你回到事实、责任和因果。它不是情绪审判，而是冷静看见每个选择带来的结果。",
    shadow: "阴影面是逃避责任、信息不透明，或只想证明自己正确。",
    cue: "把事实、感受和猜测分成三列。"
  },
  "the-hanged-man": {
    essence: "倒吊人代表暂停、换位和主动放下控制。它说明暂时不动，可能是为了看见更深的答案。",
    shadow: "阴影面是拖延、牺牲感，或把无力误认为顺其自然。",
    cue: "换一个立场看问题，尤其是你最不愿承认的那个角度。"
  },
  death: {
    essence: "死神代表必要的结束和更新。它并不等于坏事，而是旧结构已经无法继续承载新阶段。",
    shadow: "阴影面是抗拒告别，或反复给已经结束的东西续命。",
    cue: "明确写下需要停止的一件事。"
  },
  temperance: {
    essence: "节制代表调和、疗愈和逐步融合。它提示你用中道与耐心处理复杂关系或复杂目标。",
    shadow: "阴影面是拖太久、稀释真实需求，或为了和平放弃原则。",
    cue: "找一个能同时照顾两边需求的最小调整。"
  },
  "the-devil": {
    essence: "恶魔揭示执念、依赖、欲望和不自由的交换。它要求你诚实看见自己被什么牵动。",
    shadow: "阴影面是明知不健康却继续合理化，或把短期满足当成安全感。",
    cue: "指出一个让你失去自由感的诱因。"
  },
  "the-tower": {
    essence: "高塔代表真相打破旧结构。它通常来得突然，但它拆掉的是已经不稳的部分。",
    shadow: "阴影面是拒绝面对现实，直到局势用更剧烈的方式提醒你。",
    cue: "先承认最明显的事实，再谈重建。"
  },
  "the-star": {
    essence: "星星代表疗愈、希望和长远愿景。它不像太阳那样立刻明亮，而是恢复信任的过程。",
    shadow: "阴影面是过度理想化，或只许愿不行动。",
    cue: "做一件能让你恢复信心的小事。"
  },
  "the-moon": {
    essence: "月亮代表迷雾、投射和潜意识波动。它提醒你现在的信息可能不完整，情绪也会放大想象。",
    shadow: "阴影面是焦虑、误读信号，或被不确定牵着走。",
    cue: "先核实事实，再解释动机。"
  },
  "the-sun": {
    essence: "太阳代表清晰、显现和生命力。它通常说明真相会变得更明朗，坦诚表达有助于打开局面。",
    shadow: "阴影面是过度乐观，或忽略阴影处仍需处理的问题。",
    cue: "把已经确定的好消息、资源或支持看见。"
  },
  judgement: {
    essence: "审判代表觉醒、复盘和回应召唤。它说明旧经验正在被重新理解，你需要用现在的自己做判断。",
    shadow: "阴影面是自责、旧评价，或迟迟不肯回应内心真正知道的方向。",
    cue: "问自己：这件事在召唤我成为怎样的人？"
  },
  "the-world": {
    essence: "世界代表完成、整合和成熟。它说明一个周期接近闭合，重点是收尾、确认成果并准备进入下一阶段。",
    shadow: "阴影面是完美主义、拖延收尾，或不敢承认自己已经走到终点。",
    cue: "完成最后一个收尾动作，让阶段真正结束。"
  }
};

const minorSuitDepth = {
  权杖: {
    lens: "这张权杖牌把问题带到行动力、主动性、欲望和创造冲动上。",
    risk: "需要留意热情是否超过了现实承载，或行动是否缺少持续策略。",
    question: "我现在是在真正行动，还是只是在被冲动推着走？"
  },
  圣杯: {
    lens: "这张圣杯牌把焦点放在情感流动、关系需求、直觉和内在安全感上。",
    risk: "需要留意自己是否把感受当成全部事实，或把期待投射到他人身上。",
    question: "我真正需要被理解的感受是什么？"
  },
  宝剑: {
    lens: "这张宝剑牌强调想法、沟通、判断、冲突和信息的清晰度。",
    risk: "需要留意过度分析、言语锋利，或在脑中反复推演却不落地。",
    question: "哪些是事实，哪些只是我的解释？"
  },
  星币: {
    lens: "这张星币牌指向现实资源、金钱、时间、身体状态和长期建设。",
    risk: "需要留意现实条件是否匹配期待，以及投入是否可持续。",
    question: "这件事在现实层面需要哪些资源才能稳定发生？"
  }
};

const rankDepth = {
  ace: "一号牌是能量的种子，代表新机会刚刚出现，适合开启但不宜急着要求结果。",
  two: "二号牌强调选择与平衡，问题的核心常在两股力量之间的取舍。",
  three: "三号牌代表初步扩展，合作、表达和外部反馈会变得重要。",
  four: "四号牌带来稳定和结构，但也可能显示舒适区或暂时停顿。",
  five: "五号牌通常显示冲突、损失或调整期，它揭露真正需要修复的地方。",
  six: "六号牌带有修复、互助和过渡感，说明局势有机会回到较平衡的位置。",
  seven: "七号牌意味着考验、防守和评估，你需要确认自己坚持的理由。",
  eight: "八号牌代表速度、练习或持续推进，重点是方法是否有效。",
  nine: "九号牌接近周期尾声，显示积累、临界点和心理韧性。",
  ten: "十号牌代表一个阶段的结果，也会暴露责任、负担和完成后的代价。",
  page: "侍从带来学习、消息和探索，它常表示事情仍在初级阶段，需要保持开放。",
  knight: "骑士强调追求和移动，行动力强，但方向和节奏必须被校准。",
  queen: "王后代表成熟的承接力、感受力和内在掌控，适合用柔软方式管理局势。",
  king: "国王代表成熟决策、责任和外在掌控，要求你以更稳定的姿态承担结果。"
};

const rankAction = {
  ace: "先开启一个低风险的新尝试，不急着要求完整结果。",
  two: "把两个选择并排写下，比较它们分别需要你付出的代价。",
  three: "找一个可以合作、表达或获得反馈的对象，让事情走出独自消化。",
  four: "先整理基础结构，确认什么需要保留，什么只是让你停住。",
  five: "停止扩大冲突，先处理最核心的损失、分歧或不满。",
  six: "接受可用的支持，也主动修复一个仍有价值的连接。",
  seven: "守住重要边界，但同时检查自己是不是防御过度。",
  eight: "重复练习一个有效动作，用连续反馈代替空想。",
  nine: "先恢复体力和心理空间，再决定是否继续坚持。",
  ten: "做减法，把不属于你的责任从清单里移出去。",
  page: "把自己放回学习者位置，先收集信息、试探表达。",
  knight: "行动前确认方向和节奏，避免只凭一股冲劲推进。",
  queen: "用成熟的承接力照顾局面，同时保留清楚边界。",
  king: "做一个明确决定，并准备承担它带来的现实结果。"
};

function getDeepMeaning(item) {
  const base = item.orientation === "upright" ? item.card.upright : item.card.reversed;
  if (item.card.arcana === "major") {
    const depth = majorDepth[item.card.id];
    if (!depth) return base;
    return item.orientation === "upright"
      ? `${depth.essence}${base}`
      : `${depth.essence}${depth.shadow}${base}`;
  }

  const suit = minorSuitDepth[item.card.suit] || {};
  const rank = rankDepth[item.card.rank] || "";
  const reversed = item.orientation === "reversed" ? `逆位时，${suit.risk || "这股能量需要被重新校准"}` : "";
  return `${suit.lens || ""}${rank}${base}${reversed}`;
}

function getPositionReading(item) {
  const base = positionLens[item.position] || "它补充了本次牌阵中的关键语境。";
  if (item.position.includes("过去")) return `${base}${item.card.name}显示过去的核心影响不是事件本身，而是它留下的反应模式。`;
  if (item.position.includes("当前")) return `${base}${item.card.name}说明此刻最需要处理的是正在发生的现实，而不是想象中的最终结果。`;
  if (item.position.includes("未来")) return `${base}${item.card.name}提示后续趋势会取决于你是否愿意调整现在的处理方式。`;
  if (item.position.includes("阻碍")) return `${base}${item.card.name}指出卡点可能藏在习惯性反应里，而不是表面的某一句话或某个事件。`;
  if (item.position.includes("建议")) return `${base}${item.card.name}给出的建议是把注意力放回可执行动作，少一点猜测，多一点验证。`;
  if (item.position.includes("选项 A")) return `${base}${item.card.name}说明选项 A 的优势与代价会同时出现，需要看你是否愿意承担它的节奏。`;
  if (item.position.includes("选项 B")) return `${base}${item.card.name}说明选项 B 可能提供另一种路径，但也有它自己的条件和限制。`;
  if (item.position.includes("隐藏")) return `${base}${item.card.name}提示你还有信息没有看完整，尤其要核对动机、资源或未说出口的期待。`;
  return `${base}${item.card.name}在这里更像一个核心提示，帮助你抓住最值得先处理的部分。`;
}

function pickFrom(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function seedFor(text) {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getProfile() {
  try {
    const scoped = localStorage.getItem(userStorageKey("lunaArcanaProfile"));
    if (scoped) return JSON.parse(scoped);
    if (getCurrentUser() === "访客") {
      return JSON.parse(localStorage.getItem("lunaArcanaProfile") || "{}");
    }
    return {};
  } catch {
    return {};
  }
}

function saveProfile(profile) {
  localStorage.setItem(userStorageKey("lunaArcanaProfile"), JSON.stringify(profile));
}

function getWesternSign(dateString) {
  if (!dateString) return "";
  const [, monthRaw, dayRaw] = dateString.split("-").map(Number);
  const m = monthRaw;
  const d = dayRaw;
  const signs = [
    ["摩羯座", 1, 20], ["水瓶座", 2, 19], ["双鱼座", 3, 21], ["白羊座", 4, 20],
    ["金牛座", 5, 21], ["双子座", 6, 22], ["巨蟹座", 7, 23], ["狮子座", 8, 23],
    ["处女座", 9, 23], ["天秤座", 10, 24], ["天蝎座", 11, 23], ["射手座", 12, 22], ["摩羯座", 13, 1]
  ];
  return signs.find(([, month, day]) => m < month || (m === month && d < day))?.[0] || "摩羯座";
}

function getChineseZodiac(dateString) {
  if (!dateString) return "";
  const year = Number(dateString.slice(0, 4));
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return animals[(year - 4) % 12];
}

function getYearElement(dateString) {
  if (!dateString) return "";
  const year = Number(dateString.slice(0, 4));
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const elements = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };
  const stem = stems[(year - 4) % 10];
  return `${stem}${elements[stem]}`;
}

function profileMeta(profile = getProfile()) {
  if (!profile.birthDate) return null;
  const sign = getWesternSign(profile.birthDate);
  const zodiac = getChineseZodiac(profile.birthDate);
  const element = getYearElement(profile.birthDate);
  const astroText = window.AstrologySkill?.shortText ? `，${window.AstrologySkill.shortText(profile)}` : "";
  return {
    sign,
    zodiac,
    element,
    text: `${profile.name ? `${profile.name}，` : ""}${sign}，生肖${zodiac}，年柱五行倾向${element}${astroText}${profile.birthTime ? `，出生时间 ${profile.birthTime}` : ""}${profile.birthCity ? `，出生城市 ${profile.birthCity}` : ""}${profile.currentCity ? `，现居 ${profile.currentCity}` : ""}`
  };
}

function renderProfile() {
  const profile = getProfile();
  renderLoginState();
  els.profileName.value = profile.name || "";
  els.birthDate.value = profile.birthDate || "";
  els.birthTime.value = profile.birthTime || "";
  els.birthCity.value = profile.birthCity || "";
  els.currentCity.value = profile.currentCity || "";
  els.astroBirthDate.value = profile.birthDate || "";
  els.astroBirthTime.value = profile.birthTime || "";
  els.astroBirthCity.value = profile.birthCity || "";
  els.astroChartType.value = profile.astroChartType || "natal";
  els.astroPartnerName.value = profile.astroPartner?.name || "";
  els.astroPartnerBirthDate.value = profile.astroPartner?.birthDate || "";
  els.astroPartnerBirthTime.value = profile.astroPartner?.birthTime || "";
  els.astroPartnerBirthCity.value = profile.astroPartner?.birthCity || "";
  els.astroTargetDate.value = profile.astroTargetDate || new Date().toISOString().slice(0, 10);
  els.indianBirthDate.value = profile.birthDate || "";
  els.indianBirthTime.value = profile.birthTime || "";
  els.indianBirthCity.value = profile.birthCity || "";
  els.indianLatitude.value = profile.latitude || "";
  els.indianLongitude.value = profile.longitude || "";
  els.indianTimezone.value = profile.timezone || "";
  els.indianAyanamsa.value = profile.ayanamsa || "";
  syncIndianCanonicalToAdvanced(profile);

  const meta = profileMeta(profile);
  if (!meta) {
    els.profileReading.innerHTML = "<p>填写生日、出生时间和城市后，这里会生成基础星座、生肖和五行倾向。</p>";
    return;
  }
  els.profileReading.innerHTML = `
    <div class="astro-tags">
      <span>${meta.sign}</span>
      <span>生肖${meta.zodiac}</span>
      <span>${meta.element}</span>
    </div>
    <p><strong>档案摘要：</strong>${meta.text}。</p>
    <div class="astro-reading-block">
      <h3>基础星盘</h3>
      ${window.AstrologySkill ? window.AstrologySkill.reading(profile) : "<p>星盘 skill 未加载。</p>"}
    </div>
    <p><strong>关于星盘与八字：</strong>当前版本是基础推算，会用于增强塔罗解读语境。真正精确的星盘需要天文星历，完整八字还需要农历节气换算；后续可以接专业库或 API 来做更精确的命盘。</p>
  `;
}

function analyzeQuestion(question) {
  const text = `${question} ${els.focusInput.value || ""} ${els.backgroundInput.value || ""}`;
  const rules = [
    { type: "reconcile", label: "复合 / 修复关系", words: ["复合", "和好", "回来", "挽回", "修复", "前任"], core: "对方是否仍愿意靠近，以及你们之间的问题是否真的被处理" },
    { type: "contact", label: "是否主动联系", words: ["主动", "联系", "发消息", "表白", "沟通", "找他", "找她"], core: "主动之后会打开局面，还是只会让你陷入更被动的位置" },
    { type: "relationship", label: "关系发展", words: ["关系", "喜欢", "爱", "暧昧", "感情", "婚姻", "他", "她"], core: "双方需求、现实阻碍和互动质量是否一致" },
    { type: "career", label: "事业 / 工作", words: ["工作", "事业", "跳槽", "offer", "领导", "同事", "职业", "项目"], core: "当前机会是否匹配你的长期发展和现实资源" },
    { type: "money", label: "财富 / 投资", words: ["钱", "财富", "投资", "赚钱", "收入", "副业", "买", "卖"], core: "收益、风险、成本和时间投入是否平衡" },
    { type: "choice", label: "二选一 / 决策", words: ["选择", "选", "要不要", "该不该", "是否", "能不能", "可以吗"], core: "哪个选项更接近你的真实价值和可承担代价" },
    { type: "timing", label: "时机 / 等待", words: ["什么时候", "多久", "近期", "未来", "等待", "时机"], core: "当前条件是否成熟，以及什么时候适合行动" }
  ];
  return rules.find((rule) => rule.words.some((word) => text.includes(word))) || {
    type: state.topic.id,
    label: state.topic.name,
    core: (topicLens[state.topic.id] || topicLens.love).focus
  };
}

const directAnswerByCard = {
  positive: ["the-sun", "the-star", "the-world", "the-magician", "the-chariot", "strength", "temperance", "wands-ace", "wands-three", "wands-eight", "cups-two", "cups-six", "cups-ten", "pentacles-ace", "pentacles-six", "pentacles-nine", "pentacles-ten"],
  caution: ["the-moon", "the-hanged-man", "wheel-of-fortune", "justice", "the-high-priestess", "cups-four", "cups-seven", "swords-two", "swords-seven", "pentacles-two", "pentacles-seven"],
  negative: ["the-devil", "the-tower", "death", "swords-three", "swords-five", "swords-ten", "cups-five", "wands-five", "pentacles-five", "wands-ten"]
};

function cardTone(item) {
  if (item.orientation === "reversed") {
    if (directAnswerByCard.positive.includes(item.card.id)) return "caution";
    return "negative";
  }
  if (directAnswerByCard.positive.includes(item.card.id)) return "positive";
  if (directAnswerByCard.negative.includes(item.card.id)) return "negative";
  if (directAnswerByCard.caution.includes(item.card.id)) return "caution";
  return item.card.yesNo === "yes" ? "positive" : item.card.yesNo === "no" ? "negative" : "caution";
}

function directAnswer(item, q) {
  const meta = profileMeta();
  if (window.ProfessionalTarotSkill) {
    return window.ProfessionalTarotSkill.directAnswer({
      card: item.card,
      orientation: item.orientation,
      position: item.position,
      question: els.questionInput.value.trim(),
      background: els.backgroundInput.value.trim(),
      focus: els.focusInput.value.trim(),
      timeframe: els.timeframeSelect.value,
      profileText: meta?.text || ""
    });
  }
  const tone = cardTone(item);
  const position = item.position;
  const orientation = item.orientation === "upright" ? "正位" : "逆位";
  const focus = q.core;
  const byTone = {
    positive: {
      base: `这张牌给出偏肯定的信号：${focus}有推进空间。`,
      action: "可以行动，但要让行动具体、温和，并观察对方或现实的反馈。"
    },
    caution: {
      base: `这张牌不是直接肯定，而是在提醒：${focus}里还有条件没看清。`,
      action: "先补信息、等反馈或做小范围试探，不适合一下子下最终判断。"
    },
    negative: {
      base: `这张牌给出明显警示：${focus}目前阻力较大，贸然推进容易消耗。`,
      action: "先停下来处理核心问题，或把期待降低到现实可承受的范围。"
    }
  };
  const positionAdds = {
    "过去影响": `放在过去位置，它说明旧经历正在影响你现在的判断。`,
    "当前状态": `放在当前状态，它直接描述现在的局面质量。`,
    "未来趋势": `放在未来趋势，它显示如果维持现在做法，后续可能靠近这个方向。`,
    "潜在阻碍": `放在阻碍位置，它指出真正卡住你的点。`,
    "行动建议": `放在建议位置，它更像下一步操作说明。`,
    "我的状态": `放在你的状态，它反映你真实的期待、顾虑或行动方式。`,
    "对方状态": `放在对方状态，它只能表示对方倾向，仍需要现实验证。`,
    "关系现状": `放在关系现状，它描述双方互动目前的温度和稳定度。`,
    "选项 A": `放在选项 A，它是在评估这条路径的可行性。`,
    "选项 B": `放在选项 B，它是在评估另一条路径的代价和潜力。`,
    "隐藏因素": `放在隐藏因素，它提醒你有未说清或未看见的变量。`,
    "核心指引": `作为核心指引，它直接给出本题最该优先看的方向。`,
    "是或否倾向": `作为 Yes / No，它给的是当前条件下的倾向，不是不可改变的结局。`
  };
  return `${byTone[tone].base}${positionAdds[position] || ""}${item.card.name}${orientation}的重点是“${item.card.keywords.slice(0, 2).join("、")}”。${byTone[tone].action}`;
}

function compactOutcome(question) {
  const q = analyzeQuestion(question);
  const scores = state.selectedCards.map((item) => ({ positive: 1, caution: 0, negative: -1 }[cardTone(item)]));
  const total = scores.reduce((sum, value) => sum + value, 0);
  const reversedCount = state.selectedCards.filter((item) => item.orientation === "reversed").length;
  const label = total > 0 && reversedCount < state.selectedCards.length ? "可以推进，但要有边界" : total < 0 ? "暂不建议强推" : "先观察，条件还没完全成熟";
  const reason = state.selectedCards.map((item) => `${item.position}：${item.card.name}${item.orientation === "upright" ? "正位" : "逆位"}偏${cardTone(item) === "positive" ? "支持" : cardTone(item) === "negative" ? "警示" : "观望"}`).join("；");
  return { q, label, reason };
}

function buildCardInsight(item, question) {
  const lens = topicLens[state.topic.id] || topicLens.love;
  const q = analyzeQuestion(question);
  const meta = profileMeta();
  const background = els.backgroundInput.value.trim();
  const focus = els.focusInput.value.trim();
  const timeframe = els.timeframeSelect.value;
  const contextLine = [
    background ? `你补充的背景是“${background}”` : "",
    focus ? `最想确认的是“${focus}”` : "",
    timeframe ? `时间范围落在${timeframe}` : ""
  ].filter(Boolean).join("；");
  const arcanaNote = item.card.arcana === "major"
    ? "大阿卡那通常指向更深层的生命课题、关键转折或心理原型。"
    : `${item.card.suit}属于${item.card.element}元素，更常落在日常事件、具体互动和可调整的现实层面。`;
  const direction = item.orientation === "upright"
    ? `这张牌以正位出现，说明“${item.card.keywords[0]}”这股能量较容易被你主动使用。`
    : `这张牌以逆位出现，说明“${item.card.keywords[0]}”可能被压住、过度使用，或需要重新校准。`;
  const position = positionLens[item.position] || "它补充了本次牌阵中的关键语境。";
  const seed = seedFor(`${question}${item.card.id}${item.position}${state.topic.id}`);
  const generatedMinorAdvice = item.card.arcana === "minor"
    ? `${rankAction[item.card.rank] || "先做一个具体、可验证的小行动。"}${item.card.suitAdvice || ""}`
    : null;
  const advice = pickFrom(cardAdvice[item.card.id] || [generatedMinorAdvice, item.card.suitAdvice, lens.advice].filter(Boolean), seed);
  const depth = item.card.arcana === "major" ? majorDepth[item.card.id] : minorSuitDepth[item.card.suit];
  const cue = item.card.arcana === "major"
    ? depth?.cue
    : `${depth?.question || "我需要怎样把这件事落到现实里？"} ${rankDepth[item.card.rank] || ""}`;
  const skillInput = {
    card: item.card,
    orientation: item.orientation,
    position: item.position,
    question,
    background,
    focus,
    timeframe,
    profileText: meta?.text || ""
  };

  return {
    meaning: getDeepMeaning(item),
    direct: window.ProfessionalTarotSkill ? window.ProfessionalTarotSkill.directAnswer(skillInput) : directAnswer(item, q),
    professional: window.ProfessionalTarotSkill ? window.ProfessionalTarotSkill.positionInsight(skillInput) : `${arcanaNote}${direction}${getPositionReading(item)}这张牌对应的是“${q.label}”问题里的${q.core}，所以它回答的不是泛泛运势，而是你这个问题的具体卡点。`,
    revelation: `针对“${question}”，${meta ? `结合你的个人档案：${meta.text}。` : ""}${contextLine ? `${contextLine}。` : ""}${item.card.name}给出的具体提示是：${cue || `留意“${item.card.keywords.join("、")}”如何在现实中出现。`}这会直接影响${q.core}。`,
    action: window.ProfessionalTarotSkill ? window.ProfessionalTarotSkill.action(skillInput) : `${advice}${item.orientation === "reversed" ? " 先降低动作幅度，用一次小验证代替立刻定论。" : " 做完后观察现实反馈，再决定是否扩大投入。"}`
  };
}

function getYesNoReading() {
  const item = state.selectedCards[0];
  if (!item) {
    return null;
  }

  let tendency = item.card.yesNo;
  if (item.orientation === "reversed") {
    tendency = tendency === "yes" ? "maybe" : tendency === "maybe" ? "no" : "no";
  }

  const labels = {
    yes: "倾向 Yes",
    no: "倾向 No",
    maybe: "条件尚未成熟"
  };
  const reasons = {
    yes: "牌面能量较顺，说明这件事具备推进空间，但仍需要你用现实行动承接。",
    no: "牌面显示阻力、代价或时机问题较明显，目前不适合贸然推进。",
    maybe: "牌面没有给出干脆的肯定或否定，更像是在提醒你先补足信息、条件或内在确认。"
  };

  return {
    tendency,
    label: labels[tendency],
    reason: reasons[tendency],
    cardName: item.card.name,
    orientationText: item.orientation === "upright" ? "正位" : "逆位"
  };
}

function buildSummary(question) {
  const lens = topicLens[state.topic.id] || topicLens.love;
  const outcome = compactOutcome(question);
  const meta = profileMeta();
  const background = els.backgroundInput.value.trim();
  const focus = els.focusInput.value.trim();
  const timeframe = els.timeframeSelect.value;
  const first = state.selectedCards[0];
  const last = state.selectedCards[state.selectedCards.length - 1];
  const reversedCount = state.selectedCards.filter((item) => item.orientation === "reversed").length;
  const names = state.selectedCards.map((item) => `${item.position}的${item.card.name}`).join("、");
  const yesNo = state.spread.id === "yesno" ? getYesNoReading() : null;
  const skillSummary = window.ProfessionalTarotSkill ? window.ProfessionalTarotSkill.summary({
    question,
    background,
    focus,
    timeframe,
    profileText: meta?.text || "",
    cards: state.selectedCards
  }) : null;
  const skillNarrative = window.ProfessionalTarotSkill?.narrative ? window.ProfessionalTarotSkill.narrative({
    question,
    background,
    focus,
    timeframe,
    profileText: meta?.text || "",
    cards: state.selectedCards
  }) : "";
  const hidden = reversedCount
    ? `本次有 ${reversedCount} 张逆位牌，说明问题里可能存在尚未说清、尚未整理，或正在被压抑的部分。`
    : "本次牌面多以正位呈现，说明可用资源相对清晰，关键在于把理解转为行动。";

  if (yesNo) {
    return `
      <h3>Yes / No 倾向判断</h3>
      <p class="answer-pill"><strong>${yesNo.label}</strong></p>
      <p>围绕“${question}”，本次抽到的是${yesNo.cardName}${yesNo.orientationText}。${yesNo.reason}</p>
      ${background || focus ? `<p><strong>结合背景：</strong>${background ? `当前背景是“${background}”。` : ""}${focus ? `你最想确认“${focus}”。` : ""}因此这个判断更适合看作${timeframe}内的行动倾向。</p>` : ""}
      ${meta ? `<p><strong>个人档案：</strong>${meta.text}。本次解读会把它作为性格节奏与时机语境，而不是绝对命定。</p>` : ""}
      <p><strong>判断依据：</strong>${yesNo.cardName}的关键词是${first.card.keywords.join("、")}。在${state.topic.name}语境下，它主要指向${lens.focus}，因此答案不是宿命式结论，而是当前条件下的倾向。</p>
      <p><strong>隐藏影响因素：</strong>${hidden}</p>
      <p><strong>可执行建议：</strong>${lens.advice}。</p>
    `;
  }

  return `
    <h3>直接结论</h3>
    <p class="answer-pill"><strong>${skillSummary?.label || outcome.label}</strong></p>
    <p>你的问题被识别为“${skillSummary?.intent.label || outcome.q.label}”。围绕“${question}”，本次牌面出现了${names}。重点不是泛泛运势，而是${skillSummary?.intent.lens || outcome.q.core}。</p>
    <p><strong>判断依据：</strong>${skillSummary?.reason || outcome.reason}。</p>
    ${background || focus ? `<p><strong>结合背景：</strong>${background ? `你描述的背景是“${background}”。` : ""}${focus ? `本次最需要确认的是“${focus}”。` : ""}所以解读会优先放在${timeframe}内能观察和行动的部分。</p>` : ""}
    ${meta ? `<p><strong>个人档案：</strong>${meta.text}。这会作为解读的性格与时机语境，不作为绝对判断。</p>` : ""}
    <p><strong>隐藏影响因素：</strong>${hidden}${first ? `尤其是${first.card.name}带出的“${first.card.keywords[0]}”，可能是最先需要面对的入口。` : ""}</p>
    <p><strong>未来趋势：</strong>${last ? `${last.card.name}位于“${last.position}”，提示后续走向会受到“${last.card.keywords[0]}”这股能量影响。` : ""}如果你能持续校准节奏，局势可能从情绪化判断走向更可处理的现实选择。</p>
    <p><strong>可执行建议：</strong>${skillSummary?.advice || lens.advice}。</p>
    ${skillNarrative ? `<details class="narrative-reading"><summary>查看完整塔罗师式解读</summary>${skillNarrative}</details>` : ""}
  `;
}

function showResult() {
  const question = els.questionInput.value.trim();
  state.currentReading = {
    id: `reading-${Date.now()}`,
    createdAt: new Date().toISOString(),
    topicId: state.topic.id,
    topicName: state.topic.name,
    spreadId: state.spread.id,
    spreadName: state.spread.name,
    question,
    mood: els.moodSelect.value,
    timeframe: els.timeframeSelect.value,
    background: els.backgroundInput.value.trim(),
    focus: els.focusInput.value.trim(),
    favorite: state.favorite,
    cards: state.selectedCards
  };

  els.resultSummary.innerHTML = buildSummary(question);

  els.positionTabs.innerHTML = state.selectedCards.map((item, index) => `
    <button class="position-tab ${index === 0 ? "active" : ""}" data-result-index="${index}">
      ${item.position}
    </button>
  `).join("");

  els.resultList.innerHTML = state.selectedCards.map((item, index) => {
    const orientationText = item.orientation === "upright" ? "正位" : "逆位";
    const insight = buildCardInsight(item, question);
    return `
      <details class="result-card ${index === 0 ? "active" : ""}" open data-result-card="${index}">
        <summary>
          <span class="mobile-card-mini">${item.card.name}</span>
          <span class="mobile-card-title">
            <strong>${item.card.name}</strong>
            ${item.position} · ${orientationText}
          </span>
        </summary>
        <div class="result-card-body">
          <div class="card-face">
            <div>
              <strong>${item.card.name}</strong>
              <p>${orientationText}</p>
            </div>
          </div>
          <div>
          <p class="card-meta">${item.position} · ${orientationText}</p>
          <h3>${item.card.name}</h3>
          <p class="direct-answer"><strong>直接回答：</strong>${insight.direct}</p>
          <p><strong>核心关键词：</strong>${item.card.keywords.join(" / ")}</p>
          <p><strong>专业解释：</strong>${insight.meaning}</p>
          <p><strong>牌位解说：</strong>${insight.professional}</p>
          <p><strong>对问题的启示：</strong>${insight.revelation}</p>
          <p><strong>建议行动：</strong>${insight.action}</p>
          </div>
        </div>
      </details>
    `;
  }).join("");

  els.favoriteButton.textContent = "收藏";
  els.noteInput.value = "";
  els.result.hidden = false;
  els.drawSection.hidden = true;
  if (window.matchMedia("(max-width: 900px)").matches) {
    els.resultList.querySelectorAll(".result-card").forEach((card, index) => {
      card.open = index === 0;
    });
  }
  location.hash = "result";
  updateActiveTab("draw");
}

function saveReading() {
  if (!state.currentReading) {
    return;
  }
  if (getCurrentUser() === "访客") {
    els.ritualStatus.textContent = "请先登录账号，再保存本次占卜。";
    showHomeFlow();
    setAuthStatus("登录后，历史记录只会保存在你的账号下。");
    return;
  }

  const readings = getHistory();
  const saved = {
    ...state.currentReading,
    user: getCurrentUser(),
    favorite: state.favorite,
    note: els.noteInput.value.trim()
  };
  localStorage.setItem(userStorageKey("lunaArcanaReadings"), JSON.stringify([saved, ...readings.filter((item) => item.id !== saved.id)].slice(0, 24)));
  els.ritualStatus.textContent = "本次占卜已保存到历史记录。";
  renderHistory();
  els.historySection.hidden = false;
  location.hash = "history";
}

function getHistory() {
  try {
    const scoped = localStorage.getItem(userStorageKey("lunaArcanaReadings"));
    if (scoped) return JSON.parse(scoped);
    if (getCurrentUser() === "访客") {
      return JSON.parse(localStorage.getItem("lunaArcanaReadings") || "[]");
    }
    return [];
  } catch {
    return [];
  }
}

function historyCardsMarkup(readings, limit = readings.length) {
  if (!readings.length) {
    return `<article class="history-card"><p>当前用户：${getCurrentUser()}。还没有保存记录。完成一次占卜后，可以在这里复盘你的问题、心情与牌面。</p></article>`;
  }
  return readings.slice(0, limit).map((reading) => {
    const date = new Date(reading.createdAt).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" });
    const cards = reading.cards.map((item) => `${item.position}：${item.card.name}${item.orientation === "upright" ? "正位" : "逆位"}`).join("；");
    return `
      <article class="history-card">
        <header>
          <strong>${reading.favorite ? "已收藏 · " : ""}${reading.topicName} · ${reading.spreadName}</strong>
          <span>${date}</span>
        </header>
        <p><strong>用户：</strong>${reading.user || getCurrentUser()}</p>
        <p><strong>问题：</strong>${reading.question}</p>
        <p><strong>心情：</strong>${reading.mood}</p>
        ${reading.timeframe ? `<p><strong>时间：</strong>${reading.timeframe}</p>` : ""}
        ${reading.background ? `<p><strong>背景：</strong>${reading.background}</p>` : ""}
        ${reading.focus ? `<p><strong>关注点：</strong>${reading.focus}</p>` : ""}
        <p><strong>牌面：</strong>${cards}</p>
        ${reading.note ? `<p><strong>备注：</strong>${reading.note}</p>` : ""}
      </article>
    `;
  }).join("");
}

function renderHistory() {
  const readings = getHistory();
  els.historyList.innerHTML = historyCardsMarkup(readings);
  if (els.homeHistoryList) {
    els.homeHistoryList.innerHTML = historyCardsMarkup(readings, 3);
  }
}

els.topicGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-topic]");
  if (!button) return;
  state.topic = topics.find((topic) => topic.id === button.dataset.topic);
  state.shuffled = false;
  renderTopics();
});

els.spreadGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-spread]");
  if (!button) return;
  state.spread = spreads.find((spread) => spread.id === button.dataset.spread);
  state.selectedCards = [];
  state.shuffled = false;
  renderSpreads();
  renderDeck();
});

els.prepareButton.addEventListener("click", startRitual);
els.shuffleButton.addEventListener("click", shuffleDeck);
els.enterDrawButton.addEventListener("click", enterDrawFlow);
els.openModuleChooserButton.addEventListener("click", drawAstraeaCard);
els.astraeaProfileButton.addEventListener("click", showModuleChooser);
els.astraeaPrevCard.addEventListener("click", () => moveAstraeaCard(-1));
els.astraeaNextCard.addEventListener("click", () => moveAstraeaCard(1));
els.astraeaDots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-astraea-dot]");
  if (!dot) return;
  state.astraeaIndex = Number(dot.dataset.astraeaDot);
  renderAstraeaCarousel();
});
document.querySelectorAll("[data-home-shortcut]").forEach((button) => {
  button.addEventListener("click", () => {
    console.log(`Astraea shortcut: ${button.dataset.homeShortcut}`);
    showModuleChooser();
  });
});
document.querySelectorAll("[data-astraea-bottom]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.astraeaBottom;
    if (target === "home") return setAstraeaTab("home");
    if (target === "spreads") return setAstraeaTab("spreads");
    if (target === "settings") return showModuleChooser();
    showModuleChooser();
  });
});
document.querySelectorAll("[data-offering-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.offeringTarget;
    if (target === "indian") return showIndianFlow();
    if (target === "tarot") return showTarotFlow();
    if (target === "astrology") return showAstrologyFlow();
  });
});
els.showTarotButton.addEventListener("click", showTarotFlow);
els.backToHomeButton.addEventListener("click", returnHomeFlow);
els.showAstrologyButton.addEventListener("click", showAstrologyFlow);
els.showIndianButton.addEventListener("click", showIndianFlow);
els.backFromAstrologyButton.addEventListener("click", showHomeFlow);
els.backFromIndianButton.addEventListener("click", showHomeFlow);
document.querySelectorAll("[data-tab-target]").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    const target = tab.dataset.tabTarget;
    if (target === "home") showHomeFlow();
    if (target === "draw") showTarotFlow();
    if (target === "astrology") showAstrologyFlow();
    if (target === "indianAstrology") showIndianFlow();
    if (target === "history") showHistoryFlow();
  });
});
els.refreshAstrologyButton.addEventListener("click", async () => {
  await renderAstrologyPage();
  setExperienceStage("astrology", "reading");
});
document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-experience-tab]");
  if (!tab) return;
  setExperienceStage(tab.dataset.experienceTab, tab.dataset.stage);
});
els.startVedicFormButton?.addEventListener("click", () => {
  setExperienceStage("vedic", "form");
  window.setTimeout(() => els.indianBirthDate?.focus(), 250);
});

els.refreshIndianButton.addEventListener("click", async () => {
  const label = els.refreshIndianButton.querySelector("span");
  const originalLabel = label?.textContent || "Read my chart";
  els.refreshIndianButton.disabled = true;
  els.refreshIndianButton.setAttribute("aria-busy", "true");
  try {
    if (label) label.textContent = "正在生成星盘…";
    await renderIndianPage();
    setExperienceStage("vedic", "reading");
    if (label) label.textContent = "正在生成完整解读…";
    await renderIndianInterpretation();
  } finally {
    if (label) label.textContent = originalLabel;
    els.refreshIndianButton.disabled = false;
    els.refreshIndianButton.removeAttribute("aria-busy");
  }
});

function setVedicToolbarFeedback(button, message) {
  const label = button?.querySelector("span");
  if (!button || !label) return;
  const original = label.textContent;
  label.textContent = message;
  window.setTimeout(() => { label.textContent = original; }, 1500);
}

els.copyIndianReadingButton?.addEventListener("click", async () => {
  const text = els.indianReading?.innerText.trim();
  if (!text) return;
  await navigator.clipboard?.writeText(text);
  setVedicToolbarFeedback(els.copyIndianReadingButton, "已复制");
});

els.shareIndianReadingButton?.addEventListener("click", async () => {
  const text = els.indianReading?.innerText.trim().slice(0, 420) || "我的 Podo 印度占星解读";
  if (navigator.share) {
    await navigator.share({ title: "My Podo Reading", text, url: window.location.href }).catch(() => {});
  } else {
    await navigator.clipboard?.writeText(window.location.href);
  }
  setVedicToolbarFeedback(els.shareIndianReadingButton, "已分享");
});

els.downloadIndianReadingButton?.addEventListener("click", () => {
  window.print();
});

els.appMain?.addEventListener("scroll", () => {
  if (!document.body.classList.contains("indian-wellness-active") || !els.indianReadingProgress) return;
  const total = els.appMain.scrollHeight - els.appMain.clientHeight;
  const progress = total > 0 ? (els.appMain.scrollTop / total) * 100 : 0;
  const bar = els.indianReadingProgress.querySelector("span");
  if (bar) bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}, { passive: true });

els.resolveIndianLocationButton.addEventListener("click", resolveIndianLocation);
[
  "indianBirthSecond",
  "indianTimezoneHour",
  "indianTimezoneMinute",
  "indianTimezoneDirection",
  "indianDaylightSaving",
  "indianUseLmt",
  "indianLongitudeDegree",
  "indianLongitudeDirection",
  "indianLongitudeMinute",
  "indianLongitudeSecond",
  "indianLatitudeDegree",
  "indianLatitudeDirection",
  "indianLatitudeMinute",
  "indianLatitudeSecond",
  "indianAltitude",
  "indianPressure",
  "indianTemperature"
].forEach((key) => {
  els[key]?.addEventListener("input", syncIndianAdvancedToCanonical);
  els[key]?.addEventListener("change", syncIndianAdvancedToCanonical);
});
els.indianBirthTime.addEventListener("change", () => {
  const second = timeSecondFromValue(els.indianBirthTime.value);
  if (second) els.indianBirthSecond.value = second;
});
els.indianReading.addEventListener("click", (event) => {
  const startButton = event.target.closest("#startIndianReadingButton");
  if (startButton) {
    startButton.disabled = true;
    startButton.setAttribute("aria-busy", "true");
    const original = startButton.textContent;
    startButton.textContent = "正在生成完整解读…";
    renderIndianInterpretation().finally(() => {
      if (!startButton.isConnected) return;
      startButton.disabled = false;
      startButton.removeAttribute("aria-busy");
      startButton.textContent = original;
    });
  }
  const topicButton = event.target.closest("[data-indian-topic]");
  if (topicButton) {
    sendIndianQuestion(topicButton.dataset.indianTopic);
  }
  if (event.target.closest("#sendIndianQuestionButton")) {
    sendIndianQuestion();
  }
});
els.indianReading.addEventListener("keydown", (event) => {
  if (event.target.closest("#indianQuestionInput") && event.key === "Enter") {
    event.preventDefault();
    sendIndianQuestion();
  }
});
let indianLocationTimer = null;
els.indianBirthCity.addEventListener("input", () => {
  window.clearTimeout(indianLocationTimer);
  indianLocationTimer = window.setTimeout(() => {
    resolveIndianLocation({ silent: true, rerender: false });
  }, 450);
});
els.indianBirthCity.addEventListener("change", () => {
  if (!els.indianLatitude.value || !els.indianLongitude.value) {
    resolveIndianLocation({ silent: false, rerender: false });
  }
});
els.deck.addEventListener("click", (event) => {
  const button = event.target.closest(".tarot-card");
  if (button) drawCard(button);
});
els.favoriteButton.addEventListener("click", () => {
  state.favorite = !state.favorite;
  els.favoriteButton.textContent = state.favorite ? "已收藏" : "收藏";
});
els.saveButton.addEventListener("click", saveReading);
els.positionTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-result-index]");
  if (!button) return;
  const index = button.dataset.resultIndex;
  els.positionTabs.querySelectorAll(".position-tab").forEach((tab) => {
    tab.classList.toggle("active", tab === button);
  });
  els.resultList.querySelectorAll("[data-result-card]").forEach((card) => {
    card.classList.toggle("active", card.dataset.resultCard === index);
  });
});
els.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  persistProfileFromFields();
  els.profileReading.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loginAccount();
  if (isLoggedIn()) {
    const pendingView = localStorage.getItem("lunaArcanaPendingView");
    localStorage.removeItem("lunaArcanaPendingView");
    if (pendingView === "indianAstrology") showIndianFlow();
    else showAstraeaLanding();
  }
  state.selectedCards = [];
  state.currentReading = null;
  state.favorite = false;
});

els.sendCodeButton.addEventListener("click", sendVerificationCode);
els.registerButton.addEventListener("click", registerAccount);
els.showHistoryButton.addEventListener("click", showHistoryFlow);
els.showProfileButton.addEventListener("click", () => {
  els.profileDrawer.open = !els.profileDrawer.open;
  if (els.profileDrawer.open) {
    els.profileDrawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});
els.logoutButton.addEventListener("click", () => {
  localStorage.setItem("lunaArcanaCurrentUser", "Podo");
  state.selectedCards = [];
  state.currentReading = null;
  state.favorite = false;
  renderLoginState();
  renderHistory();
  setAuthStatus("已退出登录。");
  showHomeFlow();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  if (!localStorage.getItem("lunaArcanaInstallDismissed")) {
    els.installBanner.hidden = false;
  }
});

els.installButton.addEventListener("click", async () => {
  if (!state.installPrompt) return;
  state.installPrompt.prompt();
  await state.installPrompt.userChoice;
  state.installPrompt = null;
  els.installBanner.hidden = true;
});

els.dismissInstallButton.addEventListener("click", () => {
  localStorage.setItem("lunaArcanaInstallDismissed", "1");
  els.installBanner.hidden = true;
});

document.querySelectorAll('a[href="#history"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showHistoryFlow();
  });
});
document.querySelectorAll('a[href="#home"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showHomeFlow();
  });
});
document.querySelectorAll('a[href="#draw"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showTarotFlow();
  });
});

renderTopics();
renderSpreads();
renderDeck();
renderHistory();
renderProfile();
renderAstraeaCarousel();
const initialView = location.hash.replace("#", "") || "home";
if (initialView === "indianAstrology") {
  if (isLoggedIn()) showIndianFlow();
  else {
    localStorage.setItem("lunaArcanaPendingView", "indianAstrology");
    showHomeFlow();
  }
} else if (initialView === "astrology" && isLoggedIn()) {
  showAstrologyFlow();
} else if (initialView === "draw" && isLoggedIn()) {
  showTarotFlow();
} else if (initialView === "history" && isLoggedIn()) {
  showHistoryFlow();
} else if (initialView === "home" && isLoggedIn()) {
  showAstraeaLanding();
}
updateActiveTab(initialView);
