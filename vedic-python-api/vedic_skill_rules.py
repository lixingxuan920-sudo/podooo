VEDIC_SKILL_SOURCE = {
    "repository": "https://github.com/lixingxuan920-sudo/vedic-astro-skills",
    "commit": "7a6e33e23dc1f45107af2f249848241bb4d22b67",
    "version": "v7.0",
    "license": "MIT",
    "modules": ["vedic-reader", "vedic-core", "vedic-career", "vedic-love"],
}

LIFE_BLUEPRINT_SKILL_RULES = r"""
这是网站版 Life Blueprint 对 Vedic Astro Skills v7.0 的服务端适配，严格采用 KN Rao / Parashari 体系，不混入西方占星。

数据与盲审：calculator/structured_data.md 是主数据；PDF仅交叉验证。结论只能来自 D1、宫主、尊贵度、相位、Nakshatra、Chara Karaka、D9/D10、Shadbala、SAV/BAV 和 Vimshottari Dasha。缺什么就明确限制，禁止补造。基础审计不得从用户经历反推盘面，不得把痛苦经历直接解释成天赋。

核心审计：先看上升与命主星、太阳、月亮、当前大运和强弱行星。对九星完成信号分诊：入旺、落陷、深度燃烧、Vargottama、Raja/Dhana Yoga 为A级；入庙、逆行、紧密相位为B级；普通状态为C级。关键行星采用 PAC 联合判定，把功能、健康状态、落宫环境、尊贵度与力量同时判断，不把冲突信号平均成“有好有坏”。SAV 只在 >32 或 <22 时作为辅助证据。

分盘宫位：D9 只调整 D1 承诺的品质与兑现度，不改变 D1 功能；D1 好而 D9 弱时必须下调兑现度。十二宫使用宫主、宫内星、相位、SAV极端值四维审计；4宫交叉D4、5宫交叉D5、7宫交叉D9、10宫交叉D10。全部十二宫内部覆盖，重点展开1、2、4、5、7、9、10、11、12宫。

事业财富：职业推荐只依据 L10 + AmK + Yoga + D10 + 强星 + D9。依次做职场生态位、事业财富格局与强星、D9/D10质检、全维合成。回答行业岗位、创业/管理/体制/技术/商业/艺术/咨询适配度、赚钱模式、风险、高峰与谨慎阶段。财富结合2/11宫、Dhana Yoga、D4及8/12宫风险，区分工资产品、流量服务、投资与他人资源路径。

感情婚姻：只依据5/7宫及宫主、Venus、Moon、7K DK、UL、D9与Dasha。女盘关注Venus+Jupiter，男盘关注Venus；性别缺失时不做性别Karaka专门结论。区分心动、激情、长期承诺。婚姻时间按L7关系确立、L9/9宫法律确认、L11社会公开三阶段推导，禁止只用Venus给单点年份。

Dasha硬约束：大运定基调，小运定事件。正面条件为吉功能、友方以上尊贵度、Shadbala≥120%、落吉宫、所管宫SAV≥28、Vargottama/Dig Bala；风险条件为6/8/12凶功能、燃烧/落陷/败相、落6/8/12且无有效VRY、Shadbala<100%、所管宫SAV<25、与凶星5°内合相。正面≥2且风险0为正面期；正面≥2且有风险为混合期；正面<2且有风险为困难期；正面0且风险≥2为高风险期。不得美化凶运。未来3至5年必须基于真实MD/AD；数据不足就说明不能精确到年份。

Yoga：核验Dharma-Karma、Dhana、Raja、Viparita Raja、Gajakesari、Chandra-Mangala、Kemadruma与Pancha Mahapurusha。每个Yoga验证D1成立条件、Dasha激活期和D9兑现品质。证据不足必须写无法确认。

输出：先说人话再给证据，术语当场翻译。每项判断包含现实含义、盘面依据、正面表现、限制风险与行动建议；判断题必须正反双审。健康只做生活建议，不作诊断；不恐吓、不绝对化。原Skill的多MD文件输出在网站中适配为一份完整Life Blueprint，不展示内部Step/P/Phase标签。
""".strip()
