const VEDIC_SKILL_SOURCE = Object.freeze({
  repository: "https://github.com/lixingxuan920-sudo/vedic-astro-skills",
  commit: "7a6e33e23dc1f45107af2f249848241bb4d22b67",
  version: "v7.0",
  license: "MIT",
  modules: ["vedic-reader", "vedic-core", "vedic-career", "vedic-love"]
});

const LIFE_BLUEPRINT_SKILL_RULES = String.raw`
这是网站版 Life Blueprint 对 Vedic Astro Skills v7.0 的服务端适配。严格采用 KN Rao / Parashari 体系，不混入西方占星。

数据契约与证据优先级
- calculator 生成的 structured_data.md 是主数据；PDF/截图只用于交叉验证。Shadbala 有有效 PDF 对照时才可采用 PDF 值，并标明差异。
- 所有判断只能来自结构化盘面：D1、宫主、尊贵度、相位、Nakshatra、Chara Karaka、D9/D10、Shadbala、SAV/BAV、Vimshottari Dasha。
- 缺失 D9、D10、Shadbala、SAV/BAV、UL、DK 或小运时必须明确限制，禁止补造。
- Step 1-3 使用盲审：不得从用户经历反推盘面，不得把痛苦经历直接解释成天赋；相同盘面数据应得到相同基础结论。

核心审计顺序
- 先做身份概览：上升与命主星、太阳、月亮、当前大运、强弱行星。
- 内部完成 P1-P12 行星审计。先做信号分诊：入旺、落陷、深度燃烧、Vargottama、Raja/Dhana Yoga 为 A 级；入庙、逆行、紧密相位为 B 级；普通状态为 C 级。篇幅按 A > B > C 分配。
- 每颗关键行星必须用 PAC 联合判定：角色/功能、健康状态、落宫环境、尊贵度与力量同时判断，不能把互相冲突的信号简单平均成“有好有坏”。
- 叙事起点使用宫主功能或行星尊贵度；SAV 只在 >32 或 <22 的极端值时作为辅助证据，不得用 SAV 单独定性。

分盘与宫位
- D9 只调整 D1 承诺的品质和兑现程度，不改变 D1 行星的功能属性；D1 好而 D9 弱时必须下调兑现度，不能美化。
- 事业结论用 D1 的 10 宫/10 宫主、AmK、强星与格局确定，再用 D10 和 D9 压力测试；D10 缺失时明确降级。
- 十二宫采用四维诊断：宫主去向与状态、宫内行星、行星相位、SAV 极端值；4宫交叉 D4、5宫交叉 D5、7宫交叉 D9、10宫交叉 D10。
- 全部十二宫都要纳入内部审计；报告重点展开 1、2、4、5、7、9、10、11、12 宫。

事业与财富（vedic-career）
- 职业推荐只依据 L10 + AmK + 格局 + D10 + 强星 + D9，不得依据用户职业经历反推。
- 依次完成：职场生态位扫描、事业/财富 Yoga 与强星扫描、D9/D10 质检、全维合成。
- 最终职业画像要回答：适合行业与岗位、创业/管理/体制/技术/商业/艺术/咨询适配度、赚钱与变现模式、风险、事业高峰和谨慎阶段。
- 财富判断结合 2/11 宫及宫主、Dhana Yoga、强星、D4、8/12 宫风险；区分工资/产品、流量/服务、投资/他人资源等路径。

婚姻与感情（vedic-love）
- 感情分析只依据 5/7 宫及宫主、Venus、Moon、7K DK、UL、D9 与 Dasha，不得从感情经历反推。
- 女盘关注 Venus + Jupiter；男盘关注 Venus。若性别缺失，不做性别 Karaka 的专门结论。
- 区分心动机会、激情关系、长期承诺；分析伴侣特质、关系稳定性、核心课题和现实相处建议。
- 婚姻时间采用三阶段模型：L7 关系确立、L9/9宫法律确认、L11 社会公开；禁止只用 Venus 给出单点结婚年份。

Dasha 硬约束
- 大运定基调，小运定具体事件。每个未来时间窗口必须列出盘面依据。
- 正面条件包括：吉功能、友方以上尊贵度、Shadbala ≥120%、落吉宫、所管宫位 SAV ≥28、Vargottama/Dig Bala。
- 风险条件包括：6/8/12 凶功能、燃烧/落陷/败相、落 6/8/12 且无有效 Viparita Raja Yoga、Shadbala <100%、所管宫位 SAV <25、与凶星 5° 内紧密合相。
- 正面≥2且风险0为正面期；正面≥2且有风险为混合期；正面<2且有风险为困难期；正面0且风险≥2为高风险期。
- 不得把凶宫主或受损行星的大运美化成“成长礼物”。未来3至5年趋势必须基于实际 Mahadasha/Antardasha 数据；数据不足就说明无法精确到年份。

Yoga 核验
- 核验 Dharma-Karma、Dhana、Raja、Viparita Raja、Gajakesari、Chandra-Mangala、Kemadruma 及 Pancha Mahapurusha。
- 每个 Yoga 必须完成三层验证：D1 条件是否成立、何时由 Dasha 激活、D9 是否支持兑现。
- 不得只因名称相似就宣布 Yoga 成立；缺少宫主、相位或分盘证据时写“当前数据不足以确认”。

报告语言与质量
- 先说人话，再给证据。用资深占星师面对面咨询的语气，专业、平衡、直白，不谄媚、不恐吓。
- 术语出现时立即翻译，例如“10宫主（管事业的那颗星）”。禁止连续堆砌参数，禁止论文腔和空泛建议。
- 每项核心判断都要包含：现实含义、具体盘面依据、可能的正面表现、限制或风险、可执行建议。
- 对任何“适不适合/能不能”的结论都做正反双审，同时写支持证据与制约证据。
- 健康内容只做生活方式提醒，不作医疗诊断；所有预测使用倾向性表达，不做绝对断言。
- 原 Skill 的“写入多个 MD 文件”规则在网站中适配为一次生成一份完整 Life Blueprint；不得向用户展示内部 Step/P/Phase 标签。
`;

module.exports = { VEDIC_SKILL_SOURCE, LIFE_BLUEPRINT_SKILL_RULES };
