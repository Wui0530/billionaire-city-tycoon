import { GameEvent, PlayerStats, Company, LandPlot } from "./types";

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: "event_viral_buzz",
    title_en: "Organic Social Media Buzz",
    title_zh: "社交媒体病毒式走红",
    desc_en: "An video featuring your company's core concepts went viral on video platforms. Your brand is getting immense traction! How do you handle this?",
    desc_zh: "一部巧妙融入贵司核心理念的短视频意外在全网爆火。品牌搜索量连番暴涨！您将如何利用此次风口？",
    options: [
      {
        text_en: "Hire an agency helper to boost the trend ($500, +25% Brand Awareness)",
        text_zh: "追加 $500 签约宣发推波助澜（品牌知名度 +25%）",
        effect: (stats, company, plots) => {
          let updatedCompany = { ...company };
          let updatedStats = { ...stats };
          if (updatedStats.money >= 500) {
            updatedStats.money -= 500;
            updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 25);
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "You capitalized on the TikTok trend! Brand awareness shot up significantly.",
              log_zh: "您成功抓住泼天富贵！品牌知名度在大范围曝光中迅猛上扬。"
            };
          } else {
            // fallback if can't afford
            updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 8);
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "You couldn't afford the PR agency, but standard organic views boosted brand awareness by +8%.",
              log_zh: "由于钱包余额不足，您未能签约公关，但自然发酵的流量仍推动知名度提升了 8%。"
            };
          }
        }
      },
      {
        text_en: "Let it cool down naturally (Free, +8% Brand Awareness, +5 Happiness)",
        text_zh: "顺其自然不用刻意买量 (免费, 知名度 +8%, 幸福度 +5)",
        effect: (stats, company, plots) => {
          let updatedCompany = { ...company };
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.min(100, updatedStats.happiness + 5);
          updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 8);
          return {
            stats: updatedStats,
            company: updatedCompany,
            plots,
            log_en: "You let the trend run its course, saving cash while feeling proud of the organic growth.",
            log_zh: "您秉持顺其自然的态度，省下一笔不菲的支出，同时为自然的知名度提升而感到快乐。"
          };
        }
      }
    ]
  },
  {
    id: "event_flu_season",
    title_en: "Regional Winter Flu Outbreak",
    title_zh: "冬季流感季节性爆发",
    desc_en: "A contagious winter flu is sweeping through town. People are coughing everywhere and many offices are half empty.",
    desc_zh: "寒冷的强气流携带流感病毒横扫整座城市。大街小巷咳嗽声不断，诸多企业员工因病缺勤。",
    options: [
      {
        text_en: "Buy premium supplements and sleep more ($150, +20 Health)",
        text_zh: "购买高档滋补膳食并加强睡眠（个人现金 -$150, 健康值 +20）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.money = Math.max(0, updatedStats.money - 150);
          updatedStats.health = Math.min(100, updatedStats.health + 20);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You paid for vitamin supplements and felt energetic.",
            log_zh: "您饮用了复合维生素营养素，身体免疫力得到了有效夯实。"
          };
        }
      },
      {
        text_en: "Rely on your own immunity (Free, -15 Health, -10 Energy)",
        text_zh: "纯靠自身白细胞硬扛（免费, 健康 -15, 精力 -10）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.health = Math.max(10, updatedStats.health - 15);
          updatedStats.energy = Math.max(10, updatedStats.energy - 10);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You toughed it out, but caught a minor fever that drained your body stamina.",
            log_zh: "虽然硬挺了过去，但在轻微低烧的折磨下深受精力与健康流失之苦。"
          };
        }
      }
    ]
  },
  {
    id: "event_hacker_attack",
    title_en: "Cyber Security Incursion attempt",
    title_zh: "黑客针对性阻断攻击",
    desc_en: "A group of script kiddies tries to compromise your digital services. Decisive tech action must be taken immediately.",
    desc_zh: "一伙境外黑客尝试对你们搭建的网络服务实施拒绝服务DDoS攻击，大批对公API出现崩溃反应。",
    options: [
      {
        text_en: "Fix the server protocols yourself (Costs 40 Energy, requires Coding >= 20)",
        text_zh: "亲自动手排查拦截（消耗 40 精力, 需要编程技能 >= 20）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          let updatedCompany = { ...company };
          if (updatedStats.skills.coding >= 20) {
            updatedStats.energy = Math.max(10, updatedStats.energy - 40);
            updatedStats.skills.coding += 3; // free coding boost
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "You stayed up all night and patched the zero-day exploit! Coding skill grew (+3)!",
              log_zh: "您通宵对防御组件进行反向加固，顺利封堵高危物理漏洞，同时编程技能值获得自研提升 (+3)！"
            };
          } else {
            updatedStats.energy = Math.max(10, updatedStats.energy - 40);
            updatedCompany.capital = Math.max(0, updatedCompany.capital - 600);
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "You spent the energy but lacked the skills! The server database leaked, forcing your company to pay $600 to restore backups.",
              log_zh: "您筋疲力尽地忙活了一通但因专业不对口导致防御全面失败，后台库被黑，公司被迫支付 $600 购买备份服务器。"
            };
          }
        }
      },
      {
        text_en: "Hire external cloud security specialists ($600 company capital expense)",
        text_zh: "向知名安全厂商购买防火墙（花费企业公账 $600，免精力消耗）",
        effect: (stats, company, plots) => {
          let updatedCompany = { ...company };
          if (updatedCompany.registered) {
            updatedCompany.capital = Math.max(0, updatedCompany.capital - 600);
            return {
              stats,
              company: updatedCompany,
              plots,
              log_en: "Your enterprise capital paid for the cloud shield. Security is perfectly guaranteed.",
              log_zh: "公司对公账户扣减 $600 购得高防盾。平台服务恢复稳定，声誉极佳。"
            };
          } else {
            // player must pay personally if no registered company
            let updatedStats = { ...stats };
            updatedStats.money = Math.max(0, updatedStats.money - 400);
            return {
              stats: updatedStats,
              company,
              plots,
              log_en: "You paid $400 out of pocket to safeguard your career credentials.",
              log_zh: "由于未注册公司，您只得自掏腰包 $400 购买了应急拦截固件。"
            };
          }
        }
      }
    ]
  },
  {
    id: "event_land_subsidies",
    title_en: "Regional Land Tax Subsidies",
    title_zh: "市政规划土地税收补贴风波",
    desc_en: "The Urban Development Zoning Board announces a promotion: a limited-time 20% discount coupon is offered for purchasing land plots!",
    desc_zh: "城建局发布重磅规划招商通告：为了带动郊区和开发区人气，当前所有待售地皮买地价格享受 20% 临时直降补助！",
    options: [
      {
        text_en: "Great news! Gladly accept municipal support (+10 Happiness)",
        text_zh: "妙手空空，太好了！欣然接受扶持（个人幸福度 +10, 全场土地降价优惠在主界面生效）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.min(100, updatedStats.happiness + 10);
          // We will apply this reduction in state when the event resolves!
          // Actually, our event can mutate plots or just notify. Let's make it permanently reduce price of unowned plots by 15%!
          let updatedPlots = plots.map(p => {
            if (!p.owned) {
              return { ...p, price: Math.round(p.price * 0.85) };
            }
            return p;
          });
          return {
            stats: updatedStats,
            company,
            plots: updatedPlots,
            log_en: "All unowned properties got a permanent 15% discount as city tax incentives resolved!",
            log_zh: "政策落地成功，未被持有的闲置地皮获得永久性的 15% 价格退坡直降！"
          };
        }
      }
    ]
  },
  {
    id: "event_business_angel",
    title_en: "Angel Investor Inquiry",
    title_zh: "神秘温州天使投资人造访",
    desc_en: "An private venture capitalist is interested in your business acumen. They offer a simple capital grant if your negotiations are sharp.",
    desc_zh: "一位常年隐没在商海的天使基金合伙人慕名而来。他们表示欣赏您的魄力，如果您的“谈判技能”合格，可能提供现金授信。",
    options: [
      {
        text_en: "Pitch using negotiation tactics (Requires Negotiation >= 15)",
        text_zh: "用专业商务言论进行演说商业划饼（需要谈判技能 >= 15）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          let updatedCompany = { ...company };
          if (updatedStats.skills.negotiation >= 15) {
            updatedStats.money += 1500;
            if (updatedCompany.registered) {
              updatedCompany.capital += 1000;
            }
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "Your storytelling was brilliant! Secured $1,500 personal grant (and $1,000 corporate capital)!",
              log_zh: "您的宏伟蓝图把投资人说得心潮澎湃！成功当场获得 $1,500 个人赠款（若已注册公司，企业资本额外增加 $1,000）！"
            };
          } else {
            updatedStats.happiness = Math.max(10, updatedStats.happiness - 10);
            return {
              stats: updatedStats,
              company,
              plots,
              log_en: "Your presentation felt amateurish. The VC left after a cold handshake. Happiness decreased (-10).",
              log_zh: "由于您的逻辑不够严谨、心理谈判稚嫩，对方客套握手后直接抽身离去。感觉备受打击（幸福度 -10）。"
            };
          }
        }
      },
      {
        text_en: "Humbly decline (Free, +5 Energy)",
        text_zh: "谦虚谢绝路演，借口推脱（免费, 精力 +5）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.energy = Math.min(100, updatedStats.energy + 5);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You saved your energy by avoiding stressful public speaking.",
            log_zh: "您省去了通宵准备PPT与路演所折损的神经，静养心神（精力 +5）。"
          };
        }
      }
    ]
  },
  {
    id: "event_stock_crash",
    title_en: "Wall Street Stock Market Crash",
    title_zh: "全球股市开盘暴跌",
    desc_en: "A sudden high-interest panic triggers a massive sell-off across all international stock indexes. Rival shares are down 50%. How will you play this crisis?",
    desc_zh: "因大宗商品及汇率异动，全球股市遭遇历史性断崖暴跌！几乎所有竞争对手的股价拦腰对折（降价 50%）。",
    options: [
      {
        text_en: "Buy cheap rival dips ($800 personal cash, +120 rival shares)",
        text_zh: "全仓买入大宗廉价看涨期权（扣减 $800 个人现金，自动抄底大笔股权）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          if (updatedStats.money >= 800) {
            updatedStats.money -= 800;
            updatedStats.happiness += 5;
            return {
              stats: updatedStats,
              company,
              plots,
              log_en: "You successfully greedily bought the stock dip at massive discount! Net worth amplified.",
              log_zh: "人心惶惶之际您悍然抄底！抢购低价核心期权，随着市场修复，您的总资产将呈指数倍增。"
            };
          } else {
            return {
              stats,
              company,
              plots,
              log_en: "You don't have $800 to buy the dip!",
              log_zh: "您因手头个人现钞不够 $800，痛失本次千载难逢的金融套利机会！"
            };
          }
        }
      },
      {
        text_en: "Remain calm and hedge assets (Free, +10 Happiness)",
        text_zh: "不悲不喜、空仓避险（免费，安心指数提升 +10）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.min(100, updatedStats.happiness + 10);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You stayed out of the danger. Stable cash is king in a crash.",
            log_zh: "危机面前，现金为王。您安享宁静，毫无资产贬损负担。"
          };
        }
      }
    ]
  },
  {
    id: "event_employee_resign",
    title_en: "Key Staff Threatens Resignation",
    title_zh: "骨干大厂员工闹薪资离职",
    desc_en: "A top-talent employee claims they received an attractive offer from a Silicon Valley rival. They demand a raise, or they will quit immediately.",
    desc_zh: "公司核心大牛收到竞争对手两倍高薪Poach。威胁如果您不能给予适当关怀，将立刻递交辞职信归海。",
    options: [
      {
        text_en: "Grant RM400 retention bonus (Requires $400 Corporate Capital)",
        text_zh: "对公拨款发放 $400 专项特别年终奖（需要企业账面资金 >= 400）",
        effect: (stats, company, plots) => {
          let updatedCompany = { ...company };
          if (updatedCompany.registered && updatedCompany.capital >= 400) {
            updatedCompany.capital -= 400;
            updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 5);
            // Boost employee skills representing loyalty
            updatedCompany.employees = updatedCompany.employees.map(e => ({ ...e, skill: Math.min(10, e.skill + 2) }));
            return {
              stats,
              company: updatedCompany,
              plots,
              log_en: "Loyalty secured! Key core programmer and sales skill boosted (+2)!",
              log_zh: "用真金白银守住了人才！军心大振，全体在职员工业务娴熟技能度额外 +2。"
            };
          } else {
            return {
              stats,
              company,
              plots,
              log_en: "No company registered or insufficient capital for bonuses!",
              log_zh: "未开公司或账面流动性紧缺，未能成功下发留人安置红利。"
            };
          }
        }
      },
      {
        text_en: "Let them go (Free, lose 1 staff, company loses 5 brand awareness)",
        text_zh: "含泪批准离职（免费，员工数目 -1，知名度 -5）",
        effect: (stats, company, plots) => {
          let updatedCompany = { ...company };
          if (updatedCompany.employees && updatedCompany.employees.length > 0) {
            const popped = updatedCompany.employees.pop();
            updatedCompany.brandAwareness = Math.max(0, updatedCompany.brandAwareness - 5);
            return {
              stats,
              company: updatedCompany,
              plots,
              log_en: `Your developer ${popped?.name_en || 'staff'} packaged up and joined a rival. Operations suffered slightly.`,
              log_zh: `业务骨干离职加盟隔壁，研发进程受阻。企业总形象在同行中稍有下泄。`
            };
          } else {
            return {
              stats,
              company,
              plots,
              log_en: "No employees to fire!",
              log_zh: "您目前没有雇佣任何员工，免去骨干流失烦恼。"
            };
          }
        }
      }
    ]
  },
  {
    id: "event_fire_catastrophe",
    title_en: "Extreme Corporate Warehouse Fire",
    title_zh: "对公仓库或出租房特大火灾",
    desc_en: "An electrical issue causes a destructive blaze. Thankfully nobody is hurt, but substantial refurbishment and repairs are required immediately.",
    desc_zh: "因线路老化爆出大团火光，对公仓库受损！幸无人伤，但需紧急支付赔付金或承受幸福、资产重创。",
    options: [
      {
        text_en: "Pay RM1,500 repair bill from personal reserves",
        text_zh: "个人私账垫付 $1,500 抢修火损（个人现金 -$1,500）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.money = Math.max(0, updatedStats.money - 1500);
          updatedStats.happiness = Math.max(10, updatedStats.happiness - 5);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You paid the damages and restored your property stability quickly.",
            log_zh: "自掏私房钱硬着头皮结清。受损仓储与图纸完好如初，但痛失巨额个人储蓄。"
          };
        }
      },
      {
        text_en: "No cash! Take massive stress damage (-15 Happiness, -15 Health)",
        text_zh: "账面空空任其烧损（免费，健康 -15，心理幸福度 -15）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.max(10, updatedStats.happiness - 15);
          updatedStats.health = Math.max(10, updatedStats.health - 15);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "The disaster took a massive physical toll, resulting in insomnia and stress.",
            log_zh: "无能为责！消防处罚与财产残废使你急火攻心，健康指数与每日心情崩跌。"
          };
        }
      }
    ]
  },
  {
    id: "event_lucky_invest",
    title_en: "Underground Glove Factory Stock Tip",
    title_zh: "华侨老友提供神秘内幕",
    desc_en: "An old classmate from Penang reveals that a major local healthcare giant is about to sign a big contract. Invest RM1,000 for high stakes?",
    desc_zh: "槟城华人老同学悄悄透露，一家本地橡胶手套和AI科技巨头正准备签署天价保密合同。值得下一千马币赌注吗？",
    options: [
      {
        text_en: "YOLO RM1,000 into binary glove stock option",
        text_zh: "孤注一掷投进 $1,000 马币资产（现金 -$1,000）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          if (updatedStats.money >= 1000) {
            updatedStats.money -= 1000;
            const success = Math.random() < 0.60; // 60% win choice
            if (success) {
              updatedStats.money += 4500;
              updatedStats.happiness = Math.min(100, updatedStats.happiness + 20);
              return {
                stats: updatedStats,
                company,
                plots,
                log_en: "Jackpot! The contract was signed! You cashed out a massive +RM4,500 premium!",
                log_zh: "押注全中！股价数日连续一字板封顶，你反手套现斩获爆赚马币 $4,500！喜报满院！"
              };
            } else {
              updatedStats.happiness = Math.max(5, updatedStats.happiness - 15);
              return {
                stats: updatedStats,
                company,
                plots,
                log_en: "Alas! The leak was false. The stock was suspended and you lost all RM1,000.",
                log_zh: "噩耗！对方涉嫌违规内幕遭大发停牌调查，投资血本无归，血亏干抹净 $1,000。"
              };
            }
          } else {
            return {
              stats,
              company,
              plots,
              log_en: "You don't have enough cash reserves to invest!",
              log_zh: "囊中羞涩，连拼一把的基础 $1,000 现钞都凑不出来，只能干瞪眼。"
            };
          }
        }
      },
      {
        text_en: "Decline and buy a coffee instead (Free, +5 Happiness)",
        text_zh: "本分踏实，不贪不买（免费，踏实度提升 +5 幸福）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.min(100, updatedStats.happiness + 5);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You stayed out of greedy speculation. Wisdom pays off.",
            log_zh: "不走捷径，稳字当头。理智拒绝金融诱惑，喝杯白咖啡安神自在。"
          };
        }
      }
    ]
  },
  {
    id: "event_mysterious_billionaire",
    title_en: "Alliance proposal from KL Billionaire",
    title_zh: "吉隆坡神秘华人拿督富豪莅临",
    desc_en: "A legendary Datok billionaire from Kuala Lumpur drops by in an luxury luxury limo. They are impressed by your rise and offer a major business alliance.",
    desc_zh: "一位吉隆坡豪华劳斯莱斯上下来的华人拿督大佬慕名探访。愿意向你的私人企业直接划拨 $12,000 马币授信启动资金，但需要谈判符合要求。",
    options: [
      {
        text_en: "Pitch using high negotiations (Requires Negotiation >= 15)",
        text_zh: "利用高阶商业演说博取信任（需要谈判技能 >= 15）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          let updatedCompany = { ...company };
          if (updatedStats.skills.negotiation >= 15) {
            if (updatedCompany.registered) {
              updatedCompany.capital += 12000;
              updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 20);
            } else {
              updatedStats.money += 8000;
            }
            updatedStats.happiness = Math.min(100, updatedStats.happiness + 15);
            return {
              stats: updatedStats,
              company: updatedCompany,
              plots,
              log_en: "Alliance Sealed! Secured huge corporate capital sponsorship and massive brand prestige!",
              log_zh: "盟约大成！富民拿督巨奖注资 $12,000 企业资本（若未建公司，则补贴个人 $8,000 手头红包）！"
            };
          } else {
            updatedStats.happiness = Math.max(10, updatedStats.happiness - 5);
            return {
              stats: updatedStats,
              company,
              plots,
              log_en: "Your negotiation skill was too low. They politely declined and drove off.",
              log_zh: "大腕嫌你谈吐稍显稚嫩、商业阅历薄弱，礼貌合影后扬长而去。甚是可惜。"
            };
          }
        }
      }
    ]
  },
  {
    id: "event_ai_wave_boom",
    title_en: "Global AI SaaS Wave Explosion",
    title_zh: "全球爆火 AI 人工智能浪潮",
    desc_en: "The rise of generative AI models triggers a global rush. Any company that integrates AI technology sees double demand overnight. Do you pivot?",
    desc_zh: "硅谷通用AI新模型引爆全球！所有接入AI算力与人工智能服务的企业股价与销售暴涨。你是否全面拥抱转型？",
    options: [
      {
        text_en: "Adopt AI SaaS engine (Requires Coding >= 15)",
        text_zh: "自修转型接入商业智脑SaaS（需要编程技能 >= 15，免费提升 20 研发进度）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          let updatedCompany = { ...company };
          if (updatedStats.skills.coding >= 15) {
            updatedCompany.techProgress = Math.min(100, updatedCompany.techProgress + 20);
            updatedCompany.brandAwareness = Math.min(100, updatedCompany.brandAwareness + 15);
            return {
              stats,
              company: updatedCompany,
              plots,
              log_en: "Perfect pivot! Added generative services. R&D +20 and Brand Awareness +15!",
              log_zh: "顺畅转型！成功接入AI微调算力，产品研发进度暴增 20%，曝光率全线飙红 +15。"
            };
          } else {
            return {
              stats,
              company,
              plots,
              log_en: "Your coding level is insufficient to integrate the SDK!",
              log_zh: "您的专业编程研发底蕴尚浅（当前编程不满 15），看不懂架构图，转型胎死腹中。"
            };
          }
        }
      },
      {
        text_en: "Do nothing (Free, +5 Happiness)",
        text_zh: "坚守传统实业（免费，心灵宁静幸福 +5）",
        effect: (stats, company, plots) => {
          let updatedStats = { ...stats };
          updatedStats.happiness = Math.min(100, updatedStats.happiness + 5);
          return {
            stats: updatedStats,
            company,
            plots,
            log_en: "You avoided the bubbles. Steady and healthy beats hot buzz.",
            log_zh: "坚守传统底线，深耕固有渠道。不为噱头虚胖动摇，活得踏实开心。"
          };
        }
      }
    ]
  }
];
