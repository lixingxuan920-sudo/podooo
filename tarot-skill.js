(function () {
  const intents = [
    {
      id: "reconcile",
      label: "复合与关系修复",
      words: ["复合", "和好", "挽回", "前任", "回来", "修复", "破冰"],
      lens: "对方是否仍愿意靠近、旧问题是否被看见、双方是否有重新建立信任的空间",
      actions: {
        yes: "可以尝试修复，但不要用情绪逼结果；更适合用一次低压力沟通测试对方回应。",
        maybe: "还有牵连，但条件未成熟；先确认旧问题是否真的有新处理方式。",
        no: "不适合强行挽回；当前更需要收回能量，避免再次进入同样的拉扯。"
      }
    },
    {
      id: "contact",
      label: "主动联系与沟通",
      words: ["主动", "联系", "发消息", "找他", "找她", "表白", "沟通", "开口", "见面"],
      lens: "主动之后能否得到真实互动，而不是只换来短暂回应或更强的不确定感",
      actions: {
        yes: "可以主动，但内容要短、清楚、不给压力，重点是观察对方是否接住。",
        maybe: "可以先试探，不适合一次性把需求和委屈全倒出来。",
        no: "暂时不建议主动；对方或局势还没有给出足够接纳信号。"
      }
    },
    {
      id: "love",
      label: "感情发展",
      words: ["关系", "喜欢", "爱", "暧昧", "感情", "婚姻", "恋爱", "他", "她", "对象"],
      lens: "双方需求是否一致、互动是否稳定、关系能否从情绪吸引走向现实承接",
      actions: {
        yes: "关系有发展空间，但需要更清楚地表达期待和边界。",
        maybe: "关系有吸引也有不稳定，先看行动连续性，不要只听语言。",
        no: "目前关系消耗或落差偏大，不适合用幻想替代现实判断。"
      }
    },
    {
      id: "career",
      label: "事业与工作",
      words: ["工作", "事业", "跳槽", "offer", "领导", "同事", "职业", "项目", "升职", "面试"],
      lens: "机会是否匹配长期发展、现实资源、能力位置和你当前能承受的节奏",
      actions: {
        yes: "可以推进职业行动，但要把目标拆成可验证的下一步。",
        maybe: "机会存在，但信息、资源或时机仍需要确认。",
        no: "当前不适合贸然改变；先处理风险、能力缺口或资源不足。"
      }
    },
    {
      id: "money",
      label: "财富与资源",
      words: ["钱", "财富", "投资", "赚钱", "收入", "副业", "买", "卖", "生意", "亏", "赚"],
      lens: "收益、风险、现金流、时间成本和长期稳定性是否平衡",
      actions: {
        yes: "有机会，但要小步验证，不宜一次投入过多。",
        maybe: "需要先算清成本、风险和最坏情况，条件清楚后再决定。",
        no: "风险或消耗偏高，目前不适合冲动投入。"
      }
    },
    {
      id: "choice",
      label: "选择与决策",
      words: ["选择", "选", "要不要", "该不该", "是否", "能不能", "可以吗", "哪一个", "怎么办"],
      lens: "哪个选择更符合真实价值、现实条件和你愿意承担的代价",
      actions: {
        yes: "倾向可以推进，但要保留回旋空间。",
        maybe: "答案取决于补足条件，先别急着做不可逆决定。",
        no: "当前选项代价偏高，不建议只凭情绪决定。"
      }
    },
    {
      id: "timing",
      label: "时机与等待",
      words: ["什么时候", "多久", "近期", "未来", "等待", "时机", "会不会", "能否"],
      lens: "条件是否成熟、外部节奏是否配合、现在行动会打开局面还是制造消耗",
      actions: {
        yes: "时机正在靠近，可以准备行动。",
        maybe: "时机未完全成熟，先观察关键反馈。",
        no: "目前不是好时机，贸然推动容易适得其反。"
      }
    }
  ];

  const questionFrames = [
    { id: "result", label: "结果趋势", words: ["结果", "未来", "会不会", "能否", "有没有机会", "发展"] },
    { id: "reason", label: "原因分析", words: ["为什么", "原因", "怎么回事", "问题在哪", "卡住"] },
    { id: "mind", label: "对方想法", words: ["对方", "他想", "她想", "态度", "怎么看", "心里"] },
    { id: "advice", label: "行动建议", words: ["怎么办", "怎么做", "该如何", "建议", "要不要"] },
    { id: "timing", label: "时机判断", words: ["什么时候", "多久", "近期", "时间", "等待"] }
  ];

  const positionMeanings = {
    "核心指引": "直接抓住本题的中心答案",
    "是或否倾向": "判断当前条件下的是/否倾向",
    "过去影响": "说明过去留下的惯性和旧模式",
    "当前状态": "回答现在局面的真实质量",
    "未来趋势": "显示当前模式延续后的走向",
    "我的状态": "指出你的期待、盲点和可控部分",
    "对方状态": "观察对方倾向，但仍要用现实行为验证",
    "关系现状": "判断双方互动是否稳定、对等、可持续",
    "潜在阻碍": "指出真正拖住事情的深层因素",
    "行动建议": "把牌义转成下一步可执行动作",
    "选项 A": "评估选项 A 的潜力和代价",
    "选项 B": "评估选项 B 的潜力和代价",
    "隐藏因素": "提醒仍未说清或未看见的变量"
  };

  const majorArchetypes = {
    "the-fool": "新开始、未知、自由与风险",
    "the-magician": "资源整合、主动创造、把想法落地",
    "the-high-priestess": "隐秘信息、直觉、暂时不宜强问",
    "the-empress": "滋养、吸引力、关系中的照顾与生长",
    "the-emperor": "边界、结构、责任与掌控",
    "the-hierophant": "承诺、规则、传统路径与专业建议",
    "the-lovers": "价值选择、关系契合、真实心意",
    "the-chariot": "推进、意志、主动掌控方向",
    strength: "温柔的力量、耐心、稳定情绪",
    "the-hermit": "独处省思、暂缓外求、寻找内在答案",
    "wheel-of-fortune": "周期变化、转机、不可控变量",
    justice: "事实、公平、责任、因果",
    "the-hanged-man": "暂停、换位思考、放下控制",
    death: "结束旧模式、转化、必要告别",
    temperance: "调和、修复、渐进式融合",
    "the-devil": "执念、依赖、诱惑、不自由的关系",
    "the-tower": "真相冲击、旧结构崩塌、重建",
    "the-star": "希望、疗愈、恢复信任",
    "the-moon": "不确定、投射、情绪迷雾",
    "the-sun": "清晰、公开、积极回应",
    judgement: "复盘、觉醒、重新回应召唤",
    "the-world": "完成、整合、阶段性成熟"
  };

  const suitMeanings = {
    权杖: "行动力、热情、事业推进、主动表达",
    圣杯: "情感需求、关系流动、直觉、疗愈",
    宝剑: "沟通、判断、冲突、事实与思维",
    星币: "现实资源、金钱、工作成果、长期稳定"
  };

  const rankMeanings = {
    ace: "新机会刚出现，潜力大但仍需培育",
    two: "处在选择、平衡或观望阶段",
    three: "开始扩展，需要合作或外部反馈",
    four: "趋于稳定，也可能进入停滞",
    five: "冲突、失落或调整压力明显",
    six: "有修复、互助和过渡的可能",
    seven: "需要防守、评估和坚持边界",
    eight: "速度加快，适合练习或持续推进",
    nine: "接近临界点，积累和疲惫并存",
    ten: "周期结果显现，责任或负担也变重",
    page: "信息初现，适合学习、观察、试探",
    knight: "行动力强，但节奏和方向需要校准",
    queen: "成熟承接、内在稳定、柔性掌控",
    king: "成熟决策、外在掌控、承担结果"
  };

  const positiveCards = new Set([
    "the-sun", "the-star", "the-world", "the-magician", "the-chariot", "strength", "temperance",
    "wands-ace", "wands-three", "wands-six", "wands-eight",
    "cups-two", "cups-three", "cups-six", "cups-ten",
    "pentacles-ace", "pentacles-three", "pentacles-six", "pentacles-nine", "pentacles-ten"
  ]);

  const negativeCards = new Set([
    "the-devil", "the-tower", "death", "the-moon",
    "swords-three", "swords-five", "swords-seven", "swords-nine", "swords-ten",
    "cups-five", "wands-five", "wands-ten", "pentacles-five"
  ]);

  function includesAny(text, words) {
    return words.some((word) => text.includes(word));
  }

  function detectIntent(question, extraText = "") {
    const text = `${question || ""} ${extraText || ""}`;
    return intents.find((intent) => includesAny(text, intent.words)) || {
      id: "general",
      label: "当前问题",
      lens: "你真正能掌控的部分、现实反馈和下一步行动",
      actions: {
        yes: "可以推进，但要保持边界并观察反馈。",
        maybe: "先观察条件，再做决定。",
        no: "暂缓行动，先整理核心问题。"
      }
    };
  }

  function detectFrame(question) {
    return questionFrames.find((frame) => includesAny(question || "", frame.words)) || {
      id: "general",
      label: "综合判断"
    };
  }

  function getTone(card, orientation, position = "") {
    let tone = "maybe";
    if (positiveCards.has(card.id) || card.yesNo === "yes") tone = "yes";
    if (negativeCards.has(card.id) || card.yesNo === "no") tone = "no";
    if (orientation === "reversed") {
      tone = tone === "yes" ? "maybe" : "no";
    }
    if (position.includes("阻碍") && tone === "yes") tone = "maybe";
    if (position.includes("建议") && tone === "no") tone = "maybe";
    return tone;
  }

  function toneLabel(tone) {
    return tone === "yes" ? "偏支持" : tone === "no" ? "偏警示" : "条件未明";
  }

  function findByPosition(cards, patterns) {
    return cards.find((item) => patterns.some((pattern) => item.position.includes(pattern)));
  }

  function relationshipAnalysis(input) {
    const cards = input.cards;
    const current = findByPosition(cards, ["当前", "关系现状", "核心", "是或否"]);
    const past = findByPosition(cards, ["过去"]);
    const future = findByPosition(cards, ["未来", "结果"]);
    const block = findByPosition(cards, ["阻碍", "隐藏", "未达成"]);
    const advice = findByPosition(cards, ["建议", "进展"]);
    const self = findByPosition(cards, ["我的"]);
    const other = findByPosition(cards, ["对方"]);
    const optionA = findByPosition(cards, ["选项 A"]);
    const optionB = findByPosition(cards, ["选项 B"]);
    const tones = cards.map((item) => getTone(item.card, item.orientation, item.position));
    const reversedCount = cards.filter((item) => item.orientation === "reversed").length;
    const warningCount = tones.filter((tone) => tone === "no").length;
    const supportCount = tones.filter((tone) => tone === "yes").length;

    const notes = [];
    let score = supportCount - warningCount - (reversedCount >= Math.ceil(cards.length / 2) ? 1 : 0);

    if (current && future) {
      const currentTone = getTone(current.card, current.orientation, current.position);
      const futureTone = getTone(future.card, future.orientation, future.position);
      if (currentTone === "yes" && futureTone === "no") {
        notes.push(`当前看似能推进，但未来牌转为警示，说明现在的动力如果不调整，后面容易遇到反噬或卡顿。`);
        score -= 1;
      } else if (currentTone === "no" && futureTone === "yes") {
        notes.push(`现在压力较重，但未来牌转向支持，说明问题不是没机会，而是需要先穿过眼前阻力。`);
        score += 1;
      } else if (currentTone === futureTone) {
        notes.push(`当前牌和未来牌能量一致，说明这件事的走势比较连续，短期选择会直接影响后续结果。`);
      }
    }

    if (block && advice) {
      const blockTone = getTone(block.card, block.orientation, block.position);
      const adviceTone = getTone(advice.card, advice.orientation, advice.position);
      if (blockTone === "no" && adviceTone !== "yes") {
        notes.push(`阻碍牌比建议牌更重，表示现在最重要的不是马上行动，而是先处理卡点。`);
        score -= 1;
      } else if (blockTone === "no" && adviceTone === "yes") {
        notes.push(`阻碍明确，但建议牌给出可用路径，说明不是不能做，而是必须换方式做。`);
      }
    }

    if (self && other) {
      const selfTone = getTone(self.card, self.orientation, self.position);
      const otherTone = getTone(other.card, other.orientation, other.position);
      if (selfTone === "yes" && otherTone === "no") {
        notes.push(`你的能量比对方更主动，对方承接度不足，容易形成你推进、对方退后的落差。`);
        score -= 1;
      } else if (selfTone === "no" && otherTone === "yes") {
        notes.push(`对方或外部并非完全关闭，反而是你这边的顾虑、防御或疲惫更明显。`);
      } else {
        notes.push(`你和对方的牌面没有明显断裂，关键在于现实沟通是否能跟上。`);
      }
    }

    if (optionA && optionB) {
      const a = getTone(optionA.card, optionA.orientation, optionA.position);
      const b = getTone(optionB.card, optionB.orientation, optionB.position);
      if (a !== b) {
        notes.push(`两个选项能量不一样：选项 A 偏${toneLabel(a)}，选项 B 偏${toneLabel(b)}，建议优先考虑更能带来稳定反馈的一方。`);
        score += a === "yes" ? 1 : b === "yes" ? 1 : 0;
      } else {
        notes.push(`两个选项的牌面倾向接近，真正差异不在结果好坏，而在你愿意承担哪一种代价。`);
      }
    }

    if (past && current) {
      notes.push(`过去牌会影响当前牌，说明这件事不是突然发生的，而是旧模式延续到了现在。`);
    }

    if (reversedCount >= Math.ceil(cards.length / 2)) {
      notes.push(`逆位牌比例偏高，表示这件事里有压抑、延迟、误解或尚未说清的部分，不能只看表面机会。`);
    }

    const label = score > 1 ? "可以推进，但要按牌面提示调整方式" : score < 0 ? "建议暂缓，先处理核心阻碍" : "可以观察试探，不宜立刻定死";
    return { label, score, notes };
  }

  function cardEssence(card) {
    if (card.arcana === "major") {
      return majorArchetypes[card.id] || card.keywords.join("、");
    }
    return `${card.suit}的${suitMeanings[card.suit] || "现实事件"}，以及${rankMeanings[card.rank] || card.keywords.join("、")}`;
  }

  function answerForFrame(frame, tone, intent, input) {
    const cardText = `${input.card.name}${input.orientation === "upright" ? "正位" : "逆位"}`;
    const pos = input.position || "";
    if (pos.includes("阻碍") || pos.includes("隐藏") || pos.includes("未达成")) {
      if (tone === "yes") return `阻碍并非不可破，但你还没有用对方式。${cardText}说明突破口在${cardEssence(input.card)}。`;
      if (tone === "no") return `这里是整组牌最需要重视的卡点。${cardText}显示${intent.lens}里存在真实阻力。`;
      return `这里不是定论，而是盲区。${cardText}提示你要先把没说清、没确认的部分弄明白。`;
    }
    if (pos.includes("建议") || pos.includes("进展")) {
      if (tone === "yes") return `建议是可以行动，但要顺着${cardEssence(input.card)}去做。`;
      if (tone === "no") return `建议不是硬冲，而是停止旧方式。${cardText}要求你先避开消耗。`;
      return `建议是试探和校准，不是马上做大决定。${cardText}更像一个观察方法。`;
    }
    if (pos.includes("未来") || pos.includes("结果")) {
      if (tone === "yes") return `结果趋势有打开空间，但需要现在的选择持续配合。`;
      if (tone === "no") return `结果趋势偏紧，若维持当前模式，后面容易出现压力或停滞。`;
      return `结果还没有定型，关键变量仍在变化。`;
    }
    if (pos.includes("当前") || pos.includes("现状")) {
      if (tone === "yes") return `当前局面仍有可用资源，不是完全卡死。`;
      if (tone === "no") return `当前状态压力较重，不能只靠意志硬撑。`;
      return `当前局面暧昧或未定，需要先确认事实。`;
    }
    if (frame.id === "reason") {
      return `原因主要不在单一事件，而在“${intent.lens}”没有被处理清楚。${cardText}指出的关键是${cardEssence(input.card)}。`;
    }
    if (frame.id === "mind") {
      if (tone === "yes") return `对方倾向并非完全关闭，但更看重现实反馈。${cardText}显示还有回应空间。`;
      if (tone === "no") return `对方状态可能防御、逃避或压力较重。${cardText}不支持你把对方态度解读得过于乐观。`;
      return `对方态度并不稳定，可能有想法但未形成明确行动。${cardText}提示要看后续行为。`;
    }
    if (frame.id === "advice") {
      return intent.actions[tone] || intent.actions.maybe;
    }
    if (frame.id === "timing") {
      if (tone === "yes") return `时机正在靠近，可以准备行动，但动作要轻。`;
      if (tone === "no") return `现在不是理想时机，先不要硬推。`;
      return `时机还没完全成熟，先观察一个明确反馈点。`;
    }
    return intent.actions[tone] || intent.actions.maybe;
  }

  function directAnswer(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const frame = detectFrame(input.question);
    const tone = getTone(input.card, input.orientation, input.position);
    const position = positionMeanings[input.position] || "补充当前牌阵语境";
    const frameAnswer = answerForFrame(frame, tone, intent, input);
    return `【${toneLabel(tone)}】${frameAnswer} 这张牌落在“${input.position}”，负责${position}，所以它回答的是“${intent.lens}”，不是泛泛运势。`;
  }

  function positionInsight(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const frame = detectFrame(input.question);
    const tone = getTone(input.card, input.orientation, input.position);
    const profile = input.profileText ? `结合个人档案“${input.profileText}”，` : "";
    const orientation = input.orientation === "upright" ? "正位表示这股能量较容易显化" : "逆位表示这股能量被压抑、失衡或延迟";
    return `${profile}${input.card.name}的核心是${cardEssence(input.card)}；${orientation}。在“${input.position}”里，它专门服务于“${frame.label}”这个提问方式，说明${intent.lens}目前呈现“${toneLabel(tone)}”的状态。`;
  }

  function action(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const tone = getTone(input.card, input.orientation, input.position);
    const timeframe = input.timeframe || "当前阶段";
    if (tone === "yes") {
      return `${timeframe}内可以推进一个小动作：围绕“${intent.lens}”去验证现实反馈。不要一次性摊牌，先看对方或环境是否接得住。`;
    }
    if (tone === "no") {
      return `${timeframe}内先暂停强推。把注意力放在止损、厘清事实、恢复边界上，避免用焦虑换取短暂答案。`;
    }
    return `${timeframe}内先做信息确认：问一个具体问题、观察一次具体行为，或把选项的代价写清楚，再决定是否继续。`;
  }

  function summary(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const frame = detectFrame(input.question);
    const relation = relationshipAnalysis(input);
    const tones = input.cards.map((item) => getTone(item.card, item.orientation, item.position));
    const score = tones.reduce((sum, tone) => sum + (tone === "yes" ? 1 : tone === "no" ? -1 : 0), 0);
    const label = relation.label || (score > 0 ? "整体偏可推进" : score < 0 ? "整体建议暂缓" : "整体需要观察");
    const reason = input.cards.map((item) => {
      const tone = getTone(item.card, item.orientation, item.position);
      return `${item.position}的${item.card.name}${item.orientation === "upright" ? "正位" : "逆位"}为“${toneLabel(tone)}”`;
    }).join("；") + (relation.notes.length ? `。牌阵关系显示：${relation.notes.join("；")}` : "");
    return {
      label,
      intent,
      frame,
      reason,
      advice: `${input.timeframe || "当前阶段"}内，围绕“${intent.lens}”做一次可验证的小行动；如果现实反馈和牌面警示相冲突，以现实反馈为准。`,
      relation
    };
  }

  function suitPattern(cards) {
    const counts = cards.reduce((acc, item) => {
      const key = item.card.arcana === "major" ? "大阿卡那" : item.card.suit;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const parts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => `${name}${count}张`);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "牌面";
    const patternText = {
      圣杯: "情绪、依赖、关系感受和内在安全感是这次问题的底色",
      宝剑: "思考、焦虑、沟通和理性判断正在主导局面",
      权杖: "行动冲动、事业动力和想要突破的火气很明显",
      星币: "现实资源、稳定性、金钱和长期建设是关键",
      大阿卡那: "这不是单纯的小事件，而是牵涉到更深层的人生课题和选择模式"
    };
    return {
      counts: parts.join("、"),
      top,
      meaning: patternText[top] || "这组牌呈现出混合而复杂的能量"
    };
  }

  function positionNarrative(item, input) {
    const tone = getTone(item.card, item.orientation, item.position);
    const orientation = item.orientation === "upright" ? "正位" : "逆位";
    const essence = cardEssence(item.card);
    const position = positionMeanings[item.position] || "补充当前牌阵语境";
    const toneText = tone === "yes"
      ? "这是一股可以被你使用的能量"
      : tone === "no"
        ? "这是一张需要认真对待的警示牌"
        : "这张牌给出的不是立即行动，而是观察与校准";
    const practical = action({
      ...input,
      card: item.card,
      orientation: item.orientation,
      position: item.position
    });

    return `<p>我们来看“${item.position}”这张${item.card.name}${orientation}。它在这个位置的任务是${position}。${item.card.name}的核心是${essence}，所以它不是在泛泛地说好或不好，而是在提醒你：${toneText}。${practical}</p>`;
  }

  function deepQuestionLayer(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const frame = detectFrame(input.question);
    const relation = relationshipAnalysis(input);
    const reversedCount = input.cards.filter((item) => item.orientation === "reversed").length;
    const warningCards = input.cards.filter((item) => getTone(item.card, item.orientation, item.position) === "no");
    const supportCards = input.cards.filter((item) => getTone(item.card, item.orientation, item.position) === "yes");
    const dominantWarning = warningCards[0];
    const dominantSupport = supportCards[0];

    const maps = {
      reconcile: {
        surface: "表面上你是在问这段关系还有没有机会、对方会不会回来。",
        deeper: "更深一层，你其实是在确认：这段关系里让你受伤或不安的模式，是否真的有被修复的可能。",
        fear: "你可能害怕的不是失去一个人，而是承认自己曾经投入的感情没有得到同等承接。",
        strategy: "不要先问“还能不能复合”，先问“旧问题有没有新答案”。如果没有，新开始也容易重复旧循环。"
      },
      contact: {
        surface: "表面上你是在问要不要主动、要不要开口。",
        deeper: "更深一层，你是在问：主动之后，你会不会更有尊严、更清楚，还是更被动、更焦虑。",
        fear: "你可能害怕错过窗口，也害怕主动后得不到回应，证明自己不被重视。",
        strategy: "主动可以被设计成一次低风险验证，而不是情绪摊牌。看对方是否接住，比你说得多不多更重要。"
      },
      love: {
        surface: "表面上你是在问关系会不会继续、对方是不是认真。",
        deeper: "更深一层，你是在问这段关系能不能给你稳定、回应和现实里的确定感。",
        fear: "你可能害怕自己看错人，也害怕一旦放下期待，就等于否定之前的心动。",
        strategy: "把注意力从“对方怎么想”移到“对方持续做了什么”。稳定的行动比强烈表达更可信。"
      },
      career: {
        surface: "表面上你是在问工作、跳槽、转行或机会是否值得。",
        deeper: "更深一层，你是在问现在的职业路径还能不能承载你的成长感、安全感和价值感。",
        fear: "你可能害怕继续留在原地消耗，也害怕改变之后失去已有的稳定。",
        strategy: "先不要把问题简化成走或留。更准确的做法是判断：当前平台还有没有可谈判、可调整、可试验的新空间。"
      },
      money: {
        surface: "表面上你是在问钱、投资、收入或机会能不能带来收益。",
        deeper: "更深一层，你是在问这件事是否真的可持续，还是只是在缓解短期焦虑。",
        fear: "你可能害怕错过机会，也害怕承认自己的资源并没有准备好。",
        strategy: "先做风险分层：最小投入是多少、最坏损失是什么、多久能看到反馈。算清楚再动。"
      },
      choice: {
        surface: "表面上你是在问该不该选、能不能做、哪个更好。",
        deeper: "更深一层，你是在问哪个选择更接近你真正想成为的人，以及你愿意承担哪一种代价。",
        fear: "你可能不是没有答案，而是害怕选择之后要面对失去另一种可能。",
        strategy: "不要只比较好处，比较代价。真正适合你的选择，通常不是零代价，而是你愿意承担的代价。"
      },
      timing: {
        surface: "表面上你是在问什么时候会发生、近期有没有机会。",
        deeper: "更深一层，你是在问现在行动会打开局面，还是只会制造更多不确定。",
        fear: "你可能害怕等待太久，也害怕行动太早毁掉机会。",
        strategy: "时机不是只看时间点，而是看条件是否齐：信息、情绪、资源和对方/环境反馈是否到位。"
      },
      general: {
        surface: "表面上你是在寻求一个明确答案。",
        deeper: "更深一层，你是在寻找一种能让自己安心行动的判断依据。",
        fear: "你可能害怕做错决定，也害怕一直停在不确定里。",
        strategy: "把问题拆成事实、感受、可控行动三部分，先处理最可控的一环。"
      }
    };

    const layer = maps[intent.id] || maps.general;
    const pressure = reversedCount
      ? `这组牌里有 ${reversedCount} 张逆位，说明你的问题并不是单纯缺机会，而是有压抑、拖延、误解或内在阻力。`
      : "这组牌的逆位压力不重，说明问题的关键更多在行动选择，而不是完全被卡住。";
    const anchor = dominantWarning
      ? `最需要警惕的是${dominantWarning.position}的${dominantWarning.card.name}，它像是在指出当前最容易让你误判或消耗的地方。`
      : dominantSupport
        ? `最能支持你的是${dominantSupport.position}的${dominantSupport.card.name}，它说明你并非没有资源，只是需要把资源用在正确的位置。`
        : "这组牌没有给出极端信号，更像是在要求你把信息补齐后再判断。";
    const relationLine = relation.notes.length
      ? `从牌阵关系看，${relation.notes.join("；")}。`
      : "从牌阵关系看，当前信息还不够极端，更适合做阶段性观察。";

    return `
      <p><strong>更深层的问题：</strong>${layer.surface}${layer.deeper}</p>
      <p><strong>你真正卡住的地方：</strong>${layer.fear}${pressure}${anchor}</p>
      <p><strong>牌面给出的深层策略：</strong>${layer.strategy}${relationLine}所以这次解读的重点，不是替你制造一个绝对答案，而是帮你找到下一步最该验证的现实环节。</p>
    `;
  }

  function narrative(input) {
    const intent = detectIntent(input.question, `${input.background || ""} ${input.focus || ""}`);
    const frame = detectFrame(input.question);
    const base = summary(input);
    const pattern = suitPattern(input.cards);
    const profile = input.profileText ? `我也会把你的个人档案作为性格节奏和当下语境参考：${input.profileText}。` : "";
    const opening = `亲爱的，我先直接告诉你我的判断：${base.label}。这不是一句绝对预言，而是根据你问的“${input.question}”、牌阵位置和整组牌面能量得出的倾向。你的问题属于“${intent.label}”，更具体地说，是在问“${frame.label}”。所以这组牌真正回答的核心不是泛泛运势，而是：${intent.lens}。`;
    const relationText = base.relation?.notes?.length ? `更关键的是牌位之间的关系：${base.relation.notes.join("；")}。` : "";
    const patternParagraph = `整组牌的模式也很重要。你这次抽到的牌面分布是：${pattern.counts}。这说明${pattern.meaning}。${relationText}如果某一组牌特别多，通常表示这件事不是只靠一个动作就能解决，而是有一整套心理、现实或关系模式正在运作。${profile}`;
    const deepLayer = deepQuestionLayer(input);
    const cardParagraphs = input.cards.map((item) => positionNarrative(item, input)).join("");
    const close = `最后给你一个落地建议：${base.advice} 你不需要马上把所有问题一次解决。真正准确的占卜，不是替你制造确定性，而是帮你看见当下最该处理的那个结。先处理它，后面的路会清楚很多。`;

    return `
      <p>${opening}</p>
      <p>${patternParagraph}</p>
      ${deepLayer}
      ${cardParagraphs}
      <p>${close}</p>
    `;
  }

  window.ProfessionalTarotSkill = {
    detectIntent,
    detectFrame,
    relationshipAnalysis,
    deepQuestionLayer,
    directAnswer,
    positionInsight,
    action,
    summary,
    narrative
  };
})();
