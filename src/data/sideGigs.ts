export interface SideGig {
  id: string;
  name_en: string;
  name_zh: string;
  description_en: string;
  description_zh: string;
  earnings: number;
  energy: number;
  stress: number;
  xp: number;
  cooldownDays: number; // 0 for unlimited spam, 1 for daily limit
  requiredLevel: number;
  requiredSkills: {
    business?: number;
    management?: number;
    coding?: number;
    construction?: number;
    negotiation?: number;
  };
  skillGains: {
    business?: number;
    management?: number;
    coding?: number;
    construction?: number;
    negotiation?: number;
  };
  baseSuccessRate: number; // e.g. 0.90 for 90%
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

export const SIDE_GIGS: SideGig[] = [
  {
    id: "gig_delivery",
    name_en: "🛵 Delivery Sprint (KL Foodie)",
    name_zh: "🛵 KL外卖闪送跑腿",
    description_en: "Weave through bumper-to-bumper traffic to drop off hot laksa & bubble tea. Fast but physically exhausting.",
    description_zh: "骑摩托车在吉隆坡拥堵车龙中疯狂穿梭，配送热腾腾的叻沙和珍珠奶茶。来钱快但非常耗体力。",
    earnings: 22,
    energy: 5,
    stress: 3,
    xp: 4,
    cooldownDays: 0,
    requiredLevel: 1,
    requiredSkills: {},
    skillGains: { negotiation: 1 },
    baseSuccessRate: 0.96,
    tier: "common"
  },
  {
    id: "gig_tea_helper",
    name_en: "🍵 Bubble Tea Shake Artisan",
    name_zh: "🍵 奶茶店金牌调茶师",
    description_en: "Prepare custom ice-levels and brown sugar boba at a busy campus franchise. Demands strict manual coordination.",
    description_zh: "在繁忙的高校奶茶加盟店调制各种冰度、甜度的黑糖波霸奶茶。极其考验双手协调配合度。",
    earnings: 38,
    energy: 8,
    stress: 4,
    xp: 6,
    cooldownDays: 0,
    requiredLevel: 1,
    requiredSkills: {},
    skillGains: { management: 1 },
    baseSuccessRate: 0.95,
    tier: "common"
  },
  {
    id: "gig_cashier",
    name_en: "🛒 Supermarket Night Cashier",
    name_zh: "🛒 24H便利店深夜收银员",
    description_en: "Scan groceries and tally up register balances. Great for quiet business study on midnight shifts.",
    description_zh: "深夜在超市给杂货扫码，盘点款箱余额。是深夜安静空档处自修商业管理知识的绝佳时机。",
    earnings: 65,
    energy: 12,
    stress: 6,
    xp: 12,
    cooldownDays: 0,
    requiredLevel: 2,
    requiredSkills: { business: 5 },
    skillGains: { business: 2 },
    baseSuccessRate: 0.98,
    tier: "common"
  },
  {
    id: "gig_website_builder",
    name_en: "💻 Local Cafe Landing Page",
    name_zh: "💻 帮路边摊开发订餐网页",
    description_en: "Build a responsive static landing page for a local cafe. Simple coding, but managing non-tech clients is stressful.",
    description_zh: "为街角面包店搭建具备自适应功能的静态订餐网页。开发难度不高，但应付外行老板的需求比较心累。",
    earnings: 190,
    energy: 18,
    stress: 12,
    xp: 25,
    cooldownDays: 1,
    requiredLevel: 2,
    requiredSkills: { coding: 8 },
    skillGains: { coding: 3, negotiation: 1 },
    baseSuccessRate: 0.88,
    tier: "rare"
  },
  {
    id: "gig_copier_it",
    name_en: "🔧 PC Maintenance & IT Support",
    name_zh: "🔧 写字楼电脑重装与IT故障排查",
    description_en: "Clean dust from servers, recover corrupted hard disks, and purge adware. Requires hands-on hardware intuition.",
    description_zh: "进入大厂写字楼帮他们给旧服务器清灰、挽救损坏的硬盘、清理病毒弹窗。需要较强的手工维修灵性。",
    earnings: 120,
    energy: 15,
    stress: 9,
    xp: 18,
    cooldownDays: 0,
    requiredLevel: 2,
    requiredSkills: { management: 10 },
    skillGains: { management: 2, construction: 1 },
    baseSuccessRate: 0.92,
    tier: "rare"
  },
  {
    id: "gig_copywriter",
    name_en: "✍️ TikTok Viral Scriptwriter",
    name_zh: "✍️ 社交媒体短视频爆款编导",
    description_en: "Write snappy 30-second scripts designed to beat the algorithm. Demands strong negotiation and business perception.",
    description_zh: "撰写30秒超高完播率的抖音爆款引流脚本，破解大马流量算法。对文案说服力与商业嗅觉要求极高。",
    earnings: 280,
    energy: 16,
    stress: 15,
    xp: 35,
    cooldownDays: 1,
    requiredLevel: 3,
    requiredSkills: { negotiation: 15, business: 15 },
    skillGains: { negotiation: 3, business: 2 },
    baseSuccessRate: 0.84,
    tier: "rare"
  },
  {
    id: "gig_smart_contracts",
    name_en: "🛡️ Solidity Security Audit",
    name_zh: "🛡️ 以太坊智能合约安全代码审计",
    description_en: "Review decentralised finance (DeFi) contracts for buffer overflows & private key re-entrancies. High stakes.",
    description_zh: "审查跨国去中代币理财合约，确保没有溢出和重入漏洞。佣金优渥，任何细微失误都会引发被黑客巨款卷走盗窃的风险！",
    earnings: 950,
    energy: 25,
    stress: 22,
    xp: 60,
    cooldownDays: 1,
    requiredLevel: 4,
    requiredSkills: { coding: 35 },
    skillGains: { coding: 6 },
    baseSuccessRate: 0.75,
    tier: "epic"
  },
  {
    id: "gig_ai_voiceover",
    name_en: "🎙️ Synthetic Narration Fine-Tuner",
    name_zh: "🎙️ 人工智能中英双语语音微调专员",
    description_en: "Annotate linguistic stress and emotions for enterprise generative voice models. Lucrative cutting edge tech work.",
    description_zh: "为大中华区跨国大型AI音色模型进行韵味、重音及情绪参数微调标注。极具时代前沿感的黑科技兼职。",
    earnings: 750,
    energy: 20,
    stress: 18,
    xp: 50,
    cooldownDays: 1,
    requiredLevel: 4,
    requiredSkills: { coding: 20, management: 20 },
    skillGains: { coding: 3, management: 3 },
    baseSuccessRate: 0.90,
    tier: "epic"
  },
  {
    id: "gig_cloud_migration",
    name_en: "☁️ Multi-Region Server Migration",
    name_zh: "☁️ 集团多地域云服务器零停机迁移",
    description_en: "Port critical databases across distributed clusters under active enterprise workloads. Zero room for error.",
    description_zh: "在不停机状态下将大型集团的百万级客户数据库，从亚太区平稳迁移到欧洲新租的分布式云集群。不能容纳任何差错。",
    earnings: 2400,
    energy: 35,
    stress: 30,
    xp: 120,
    cooldownDays: 2,
    requiredLevel: 5,
    requiredSkills: { coding: 50, management: 40 },
    skillGains: { coding: 5, management: 4, business: 2 },
    baseSuccessRate: 0.80,
    tier: "epic"
  },
  {
    id: "gig_ai_agent_consultant",
    name_en: "🌟 Enterprise AI Agent Designer",
    name_zh: "🌟 500强企业级智能体自动化总设计师",
    description_en: "Configure highly automated LLM agency workflows for fortune-100 executive clusters. Legend class revenue.",
    description_zh: "为500强上市公司高级决策层量身定制定制LLM智能体自动化链条，连通多端办公生态。神仙级高净值回报兼职。",
    earnings: 8200,
    energy: 45,
    stress: 35,
    xp: 250,
    cooldownDays: 3,
    requiredLevel: 6,
    requiredSkills: { coding: 75, business: 60 },
    skillGains: { coding: 8, business: 8, negotiation: 4 },
    baseSuccessRate: 0.72,
    tier: "legendary"
  }
];
