import { 
  PlayerStats, 
  Company, 
  LandPlot, 
  Mission, 
  RivalPlayer, 
  FriendVenture, 
  LogEntry 
} from "../types";
import { 
  VEHICLES_LIST, 
  JOBS_LIST, 
  BLUEPRINTS, 
  FURNITURE_STORE, 
  EDUCATION_PROGRAMS 
} from "../i18n";
import { RANDOM_EVENTS } from "../events";

export class GameEngine {
  /**
   * Evaluates a full chronologically sequenced Day Transition (or multi-day batch)
   * on all modular state systems under a single rule engine.
   */
  public static tickDay(params: {
    language: 'en' | 'zh';
    stats: PlayerStats;
    company: Company;
    plots: LandPlot[];
    studyingProg: { degreeId: string; daysRemaining: number } | null;
    rivals: RivalPlayer[];
    friendVentures: FriendVenture[];
    missions: Mission[];
    autopilotEnabled: boolean;
    autopilotSettings: {
      autoEat: boolean;
      autoHospital: boolean;
      autoStudy: boolean;
      autoTradingGrid: boolean;
    };
    batchDays: number;
    appendLog: (textEn: string, textZh: string, type: LogEntry['type']) => void;
  }): {
    stats: PlayerStats;
    company: Company;
    plots: LandPlot[];
    studyingProg: { degreeId: string; daysRemaining: number } | null;
    rivals: RivalPlayer[];
    friendVentures: FriendVenture[];
    missions: Mission[];
    triggeredEvent: any | null;
  } {
    const {
      language,
      appendLog,
      autopilotEnabled,
      autopilotSettings,
      batchDays
    } = params;

    // Create deep copies to ensure zero side-effects during mutable ticks
    let currentStats = JSON.parse(JSON.stringify(params.stats)) as PlayerStats;
    let currentCompany = JSON.parse(JSON.stringify(params.company)) as Company;
    let currentPlots = JSON.parse(JSON.stringify(params.plots)) as LandPlot[];
    let currentStudyingProg = params.studyingProg ? { ...params.studyingProg } : null;
    let currentRivals = JSON.parse(JSON.stringify(params.rivals)) as RivalPlayer[];
    let currentFriendVentures = JSON.parse(JSON.stringify(params.friendVentures)) as FriendVenture[];
    let currentMissions = JSON.parse(JSON.stringify(params.missions)) as Mission[];

    let totalEarnings = 0;
    let totalDeductions = 0;
    let didGraduateEnrolled = false;
    let graduatedName_en = "";
    let graduatedName_zh = "";

    // Chronological loop for multi-day fast forward
    for (let d = 0; d < batchDays; d++) {
      // ==========================================
      // SECTION 0: AI AUTOPILOT STEERING EXECUTIVE
      // ==========================================
      if (autopilotEnabled && autopilotSettings) {
        // a. Auto food nourishment recharges
        if (autopilotSettings.autoEat && currentStats.energy <= 30) {
          if (currentStats.money >= 500) {
            currentStats.money -= 45;
            currentStats.energy = Math.min(100, currentStats.energy + 40);
            currentStats.happiness = Math.min(100, currentStats.happiness + 6);
            appendLog(
              "[Autopilot AI] Automatically purchased a Premium Gourmet Lunch to restore Energy and Happiness (-$45).",
              "【AI智能助理】检测到体能赤字，自动购买米其林对公商务午餐，恢复大额精力 (-$45，幸福度 +6)。",
              "success"
            );
          } else if (currentStats.money >= 100) {
            currentStats.money -= 22;
            currentStats.energy = Math.min(100, currentStats.energy + 25);
            currentStats.happiness = Math.min(100, currentStats.happiness + 2);
            appendLog(
              "[Autopilot AI] Automatically ordered Hot Coffee & Sandwiches (-$22).",
              "【AI智能助理】体能亮起黄灯，自动定点叫咖啡速递与火腿三明治 (-$22，精力 +25)。",
              "success"
            );
          } else if (currentStats.money >= 35) {
            currentStats.money -= 12;
            currentStats.energy = Math.min(100, currentStats.energy + 15);
            appendLog(
              "[Autopilot AI] Purchased cheap street food skewers to restore vital breathing energy (-$12).",
              "【AI智能助理】手头额度匮乏，自动吃路边煎饼果子强补基本体力 (-$12，生命垂危防御中)。",
              "warning"
            );
          }
        }

        // b. Prevent critical health crashes via automatic hospital checkups
        if (autopilotSettings.autoHospital && currentStats.health <= 46) {
          if (currentStats.money >= 200) {
            currentStats.money -= 200;
            currentStats.health = Math.min(100, currentStats.health + 45);
            currentStats.happiness = Math.min(100, currentStats.happiness + 5);
            appendLog(
              "[Autopilot AI] Pre-emptive clinic diagnosis checkup performed to defend against ICU dismissal (-$200).",
              "【AI智能助理】个人生命体征跌暴临界线，自动去三甲全科理疗规避ICU病重惩罚 (-$200，生命 +45)！",
              "success"
            );
          } else if (currentStats.savingsBalance >= 200) {
            currentStats.savingsBalance -= 200;
            currentStats.health = Math.min(100, currentStats.health + 45);
            appendLog(
              "[Autopilot AI] Withdrew emergency cash of $200 from Wall Street savings to treat extreme fatigue.",
              "【AI智能助理】身上现钞紧抠，自动从银行提存 $200 支付急救全科检修费用！",
              "success"
            );
          }
        }

        // c. Auto executive seminar training
        if (autopilotSettings.autoStudy && currentStats.energy >= 45 && currentStats.money >= 260) {
          currentStats.money -= 75;
          currentStats.energy -= 12;
          const trainingType = Math.random();
          if (trainingType < 0.34) {
            currentStats.skills.business = Math.min(100, (currentStats.skills.business || 0) + 1);
          } else if (trainingType < 0.67) {
            currentStats.skills.management = Math.min(100, (currentStats.skills.management || 0) + 1);
          } else {
            currentStats.skills.negotiation = Math.min(100, (currentStats.skills.negotiation || 0) + 1);
          }
          appendLog(
            "[Autopilot AI] Enrolled automatically in an Elite Executive Leadership webinar (-$75, -12 Energy).",
            "【AI智能助理】投资未来！利用溢余精力和现金购买晚间MBA财商网课研学 (-$75，精力 -12)，提升管理商业基础。",
            "info"
          );
        }

        // d. Auto Stock Quantitative Grid Sweep
        if (autopilotSettings.autoTradingGrid) {
          let hasExecutedSellThisTurn = false;
          currentRivals = currentRivals.map(rival => {
            if (rival.playerSharesOwned > 0 && !rival.isBankrupt && Math.random() < 0.3) {
              const profitYieldAmount = rival.playerSharesOwned * rival.sharePrice;
              currentStats.money += profitYieldAmount;
              appendLog(
                `[Auto Trading Bot] Locked-in profits! Dispatched sale of ${rival.playerSharesOwned} shares of '${rival.companyName}' at peak price $${rival.sharePrice} (Cashed out: +$${profitYieldAmount}).`,
                `【量化网格神探】自动获利离场！按最新标价 $${rival.sharePrice} 全面抛售所持有的 ${rival.playerSharesOwned} 份【${rival.name_zh || rival.name_en}】权益资产（套现盈利 +$${profitYieldAmount}）！`,
                "success"
              );
              hasExecutedSellThisTurn = true;
              return { ...rival, playerSharesOwned: 0 };
            }
            return rival;
          });

          if (!hasExecutedSellThisTurn && currentStats.money >= 1200) {
            const activeOptions = currentRivals.filter(r => !r.isBankrupt && r.sharePrice >= 4);
            if (activeOptions.length > 0) {
              const targetDepressedRival = activeOptions.reduce((a, b) => a.sharePrice < b.sharePrice ? a : b);
              const deployBudgetLimit = 350;
              const sharesQuant = Math.floor(deployBudgetLimit / targetDepressedRival.sharePrice);
              if (sharesQuant > 3) {
                const totalInvoiceCost = sharesQuant * targetDepressedRival.sharePrice;
                currentStats.money -= totalInvoiceCost;
                
                currentRivals = currentRivals.map(r => {
                  if (r.id === targetDepressedRival.id) {
                    return { ...r, playerSharesOwned: (r.playerSharesOwned || 0) + sharesQuant };
                  }
                  return r;
                });

                appendLog(
                  `[Auto Trading Bot] Low-value Dip Bought! Acquired ${sharesQuant} shares of rival '${targetDepressedRival.companyName}' at floor price $${targetDepressedRival.sharePrice} (-$${totalInvoiceCost}).`,
                  `【量化网格神探】探坑抄底！按单股 $${targetDepressedRival.sharePrice} 极佳扣费点自动补仓吃进竞争巨头【${targetDepressedRival.name_zh || targetDepressedRival.name_en}】 ${sharesQuant} 股（支出 -$${totalInvoiceCost}）。`,
                  "info"
                );
              }
            }
          }
        }

        // e. Auto strategic corporate budget replenishment
        if (currentCompany.registered && currentCompany.capital >= 15000) {
          if (currentCompany.rdBudget === 0) {
            currentCompany.rdBudget = 150;
            appendLog(
              "[Autopilot AI] Set corporate daily R&D Budget to $150 to accelerate product progression.",
              "【AI智能助理】检查到企业账面资金丰厚，自动调高科研每日预算至 $150，推进核心技术积累。",
              "info"
            );
          }
          if (currentCompany.marketingBudget === 0) {
            currentCompany.marketingBudget = 100;
            appendLog(
              "[Autopilot AI] Set corporate daily Marketing Budget to $100 to boost organic brand outreach.",
              "【AI智能助理】自动优化配置宣传预算至 $100/日，提升全球获客市占效率。",
              "info"
            );
          }
        }
      }

      // ==========================================
      // SECTION 1: CALENDAR CHRONOGRAPH INCREMENT
      // ==========================================
      currentStats.day += 1;
      if (currentStats.day > 7) {
        currentStats.day = 1;
        currentStats.week += 1;
      }
      if (currentStats.week > 52) {
        currentStats.week = 1;
        currentStats.year += 1;
      }

      // ==========================================
      // SECTION 2: PHYSICAL METABOLISM & DECAY
      // ==========================================
      let energyDecay = 3;
      let vehicleCommuteMultiplier = 1.0;
      
      if (currentStats.activeVehicleId) {
        const activeVeh = VEHICLES_LIST.find(v => v.id === currentStats.activeVehicleId);
        if (activeVeh) {
          energyDecay = Math.max(0, 3 - activeVeh.energyReductionPerDay);
          vehicleCommuteMultiplier = activeVeh.salaryBonusMultiplier || 1.1;
          currentStats.happiness = Math.min(100, currentStats.happiness + activeVeh.happinessBonusPerDay);
        }
      }
      
      currentStats.energy = Math.max(0, currentStats.energy - energyDecay);

      // ==========================================
      // SECTION 3: WORK CAREER COMPENSATION
      // ==========================================
      if (currentStats.activeJobId) {
        const job = JOBS_LIST.find(j => j.id === currentStats.activeJobId);
        if (job) {
          const adjustedSalary = Math.round(job.salaryPerDay * vehicleCommuteMultiplier * (currentStats.prestigeMultiplier || 1.0));
          currentStats.money += adjustedSalary;
          currentStats.energy = Math.max(0, currentStats.energy - job.energyCost);
          totalEarnings += adjustedSalary;
          
          currentStats.experienceDays[job.id] = (currentStats.experienceDays[job.id] || 0) + 1;
        }
      }

      // ==========================================
      // SECTION 4: REAL ESTATE PORTFOLIO LEDGER
      // ==========================================
      currentPlots.forEach(p => {
        if (p.owned && p.house.built) {
          // Initialize factors if undefined
          if (p.districtDemand === undefined) p.districtDemand = 1.05;
          if (p.tenantSatisfaction === undefined) p.tenantSatisfaction = 85;
          if (p.vacancyRisk === undefined) p.vacancyRisk = 0.03;

          // Fluctuate local demand
          const changeFactor = (Math.random() * 0.06 - 0.03); 
          p.districtDemand = Math.min(1.45, Math.max(0.85, p.districtDemand + changeFactor));

          // Tenant satisfaction drains
          if (p.house.renovationLevel < 20) {
            p.tenantSatisfaction = Math.max(10, p.tenantSatisfaction - 1.5);
          } else if (p.house.renovationLevel >= 75) {
            p.tenantSatisfaction = Math.min(100, p.tenantSatisfaction + 1.0);
          }

          // Maintenance upkeep cost deductions
          let upkeepCost = 8;
          const type = p.house.type;
          if (type === 'cabin') upkeepCost = 10;
          else if (type === 'apartment') upkeepCost = 28;
          else if (type === 'villa') upkeepCost = 90;
          else if (type === 'hotel') upkeepCost = 250;
          else if (type === 'mansion') upkeepCost = 500;
          else if (type === 'bunker') upkeepCost = 1200;
          else if (type === 'skyscraper') upkeepCost = 4200;
          else if (type === 'moonbase') upkeepCost = 26000;

          currentStats.money = Math.max(0, currentStats.money - upkeepCost);
          totalDeductions += upkeepCost;

          // Tenant incidental reports
          if (p.isRented && Math.random() < 0.03) {
            p.tenantSatisfaction = Math.max(10, p.tenantSatisfaction - 12);
            const pNameEn = p.name_en;
            const pNameZh = p.name_zh;
            appendLog(
              `[Estate Incident] Minor water piping leakage reported in '${pNameEn}'! Tenant satisfaction dropped.`,
              `【房屋运维警报】名下房产【${pNameZh}】租客反馈管道轻微渗水。满意度下跌，需重新修缮。`,
              "warning"
            );
          }

          // Adjust vacancies rate
          p.vacancyRisk = Math.min(0.95, Math.max(0.01, (100 - p.tenantSatisfaction) / 100 + 0.01));

          if (p.isRented) {
            let base = 0;
            if (type === 'cabin') base = 80;
            else if (type === 'apartment') base = 220;
            else if (type === 'villa') base = 650;
            else if (type === 'hotel') base = 1800;
            else if (type === 'mansion') base = 3200;
            else if (type === 'bunker') base = 8500;
            else if (type === 'skyscraper') base = 52050;
            else if (type === 'moonbase') base = 380000;

            let zoneMult = 1.0;
            if (p.zone === 'suburbs') zoneMult = 1.0;
            else if (p.zone === 'industrial') zoneMult = 1.1;
            else if (p.zone === 'beachfront') zoneMult = 1.4;
            else if (p.zone === 'downtown') zoneMult = 1.6;

            const renoMult = 1.0 + (p.house.renovationLevel / 100);
            const furnitureCount = p.house.furnituresOwned ? p.house.furnituresOwned.length : 0;
            const furnMult = 1.0 + (furnitureCount * 0.15);

            const activeTerm = p.rentTermTotal ?? -1;
            let rentRateMult = 1.0;
            if (activeTerm === 3) rentRateMult = 1.25;
            else if (activeTerm === 7) rentRateMult = 1.00;
            else if (activeTerm === 30) rentRateMult = 0.85;
            else if (activeTerm === -1) rentRateMult = 0.90;

            const demandMult = p.districtDemand ?? 1.05;
            const satisfactionMult = (0.8 + (p.tenantSatisfaction / 100) * 0.2);
            const vacancyPenalty = (1.0 - p.vacancyRisk * 0.15);

            const dailyRent = Math.round(base * zoneMult * renoMult * furnMult * rentRateMult * demandMult * satisfactionMult * vacancyPenalty * (currentStats.prestigeMultiplier || 1.0));
            currentStats.money += dailyRent;
            totalEarnings += dailyRent;

            // Manage contract durations
            if (p.rentTermRemaining !== undefined && p.rentTermRemaining > 0) {
              p.rentTermRemaining -= 1;
              if (p.rentTermRemaining === 0) {
                p.isRented = false;
                p.rentTermRemaining = undefined;
                p.rentTermTotal = undefined;
                p.rentRateMultiplier = undefined;
                p.tenantType_en = undefined;
                p.tenantType_zh = undefined;
                
                const nameEn = p.name_en;
                const nameZh = p.name_zh;
                appendLog(
                  `Commercial lease of '${nameEn}' has fully expired! returned to inventory.`,
                  `名下房产【${nameZh}】在今天租约期满！租客腾退出室并移交回库。`,
                  "info"
                );
              }
            }
          } else {
            // Wellness recharge from player residing inside
            const bp = BLUEPRINTS.find(b => b.id === p.house.type);
            if (bp) {
              currentStats.happiness = Math.min(100, currentStats.happiness + Math.round(bp.happinessBonus * 0.1));
              currentStats.energy = Math.min(100, currentStats.energy + Math.round(bp.energyBonus * 0.1));
            }

            p.house.furnituresOwned.forEach(fid => {
              const fObj = FURNITURE_STORE.find(it => it.id === fid);
              if (fObj) {
                currentStats.energy = Math.min(100, currentStats.energy + Math.round(fObj.energyBonus * 0.08));
                currentStats.happiness = Math.min(100, currentStats.happiness + Math.round(fObj.happinessBonus * 0.08));
              }
            });
          }
        }
      });

      // ==========================================
      // SECTION 5: ACADEMIC PROGRESS SCHOLASTICS
      // ==========================================
      if (currentStudyingProg) {
        currentStudyingProg.daysRemaining -= 1;
        currentStats.energy = Math.max(0, currentStats.energy - 7);

        if (currentStudyingProg.daysRemaining <= 0) {
          didGraduateEnrolled = true;
          const finishedId = currentStudyingProg.degreeId;
          currentStats.education = finishedId as any;

          const prog = EDUCATION_PROGRAMS.find(pr => pr.id === finishedId);
          if (prog) {
            graduatedName_en = prog.name_en;
            graduatedName_zh = prog.name_zh;
            if (finishedId === 'bachelor') {
              currentStats.skills.business += 15;
              currentStats.skills.coding += 15;
            } else if (finishedId === 'master') {
              currentStats.skills.business += 30;
              currentStats.skills.management += 30;
            } else if (finishedId === 'phd') {
              currentStats.skills.coding += 40;
              currentStats.skills.business += 40;
            }
          }
          currentStudyingProg = null; // graduate
        }
      }

      // ==========================================
      // SECTION 6: CORPORATE OPERATIONS LEDGER
      // ==========================================
      if (currentCompany.registered) {
        const curPartners = currentCompany.partners || [];
        const hasSteve = curPartners.includes('part_steve');
        const hasSherry = curPartners.includes('part_sherry');
        const hasRaymond = curPartners.includes('part_raymond');
        const hasElon = curPartners.includes('part_elon_co');

        const officeRentTable = [0, 60, 180, 650, 2400];
        const equipmentCostTable = [0, 35, 110, 480, 1800];
        const benefitsCostTable = [0, 20, 90, 340, 1250];
        const marketingCostTable = [0, 40, 165, 620, 2500];

        const oTier = currentCompany.officeTier || 0;
        const eTier = currentCompany.equipmentTier || 0;
        const bTier = currentCompany.benefitsTier || 0;
        const mTier = currentCompany.marketingTier || 0;

        const dailyCapexCost = officeRentTable[oTier] + equipmentCostTable[eTier] + benefitsCostTable[bTier] + marketingCostTable[mTier];
        const totalWages = currentCompany.employees.reduce((acc, em) => acc + em.salaryPerDay, 0);
        
        const managersCount = currentCompany.employees.filter(e => e.role === 'manager').length;
        let wagesDiscountRatio = 1.0;
        if (bTier === 2) wagesDiscountRatio = 0.90;
        else if (bTier === 3) wagesDiscountRatio = 0.75;
        else if (bTier === 4) wagesDiscountRatio = 0.60;

        let discountWages = Math.round(totalWages * (1 - Math.min(0.24, managersCount * 0.04)) * wagesDiscountRatio);

        if (hasRaymond) {
          discountWages = Math.round(discountWages * 0.75);
          currentStats.energy = Math.min(100, currentStats.energy + 2);
        }
        
        if (hasElon) {
          currentStats.skills.construction = Math.min(100, (currentStats.skills.construction || 0) + 1);
        }

        if (bTier === 1) {
          currentStats.happiness = Math.min(100, currentStats.happiness + 1);
        } else if (bTier === 2) {
          currentStats.happiness = Math.min(100, currentStats.happiness + 2);
        } else if (bTier === 3) {
          currentStats.happiness = Math.min(100, currentStats.happiness + 5);
          currentStats.health = Math.min(100, currentStats.health + 1);
        } else if (bTier === 4) {
          currentStats.happiness = Math.min(100, currentStats.happiness + 12);
          currentStats.health = Math.min(100, currentStats.health + 3);
        }

        const dailyOperExpense = discountWages + currentCompany.rdBudget + currentCompany.marketingBudget + dailyCapexCost;
        currentCompany.capital -= dailyOperExpense;
        totalDeductions += dailyOperExpense;

        if (currentCompany.capital > 0) {
          if (hasRaymond) {
            currentCompany.capital += 150;
          }

          let benefitsSkillBonus = 0;
          if (bTier === 1) benefitsSkillBonus = 0.5;
          else if (bTier === 2) benefitsSkillBonus = 1.2;
          else if (bTier === 3) benefitsSkillBonus = 2.5;
          else if (bTier === 4) benefitsSkillBonus = 5.0;

          const developersSum = currentCompany.employees.filter(e => e.role === 'developer').reduce((sum, e) => sum + (e.skill + benefitsSkillBonus), 0);
          
          let techMult = 1.0;
          if (hasSteve) techMult += 0.50;

          let officeTechMult = 1.0;
          if (oTier === 2) officeTechMult += 0.10;
          else if (oTier === 3) officeTechMult += 0.35;
          else if (oTier === 4) officeTechMult += 0.90;

          let equipTechBonusMult = 1.0;
          if (eTier === 1) equipTechBonusMult += 0.15;
          else if (eTier === 2) equipTechBonusMult += 0.40;
          else if (eTier === 3) equipTechBonusMult += 0.90;
          else if (eTier === 4) equipTechBonusMult += 2.20;

          let flatTechBoost = 0;
          if (hasElon) flatTechBoost += 4;
          if (eTier === 2) flatTechBoost += 2;
          else if (eTier === 3) flatTechBoost += 6;
          else if (eTier === 4) flatTechBoost += 20;

          const techGain = (((currentCompany.rdBudget * 0.08) + (developersSum * 0.35 * equipTechBonusMult)) * techMult * officeTechMult) + flatTechBoost;
          currentCompany.techProgress = currentCompany.techProgress + techGain;

          const salesSum = currentCompany.employees.filter(e => e.role === 'sales').reduce((sum, e) => sum + (e.skill + benefitsSkillBonus), 0);
          
          let officeBrandMult = 1.0;
          if (oTier === 1) officeBrandMult += 0.10;
          else if (oTier === 2) officeBrandMult += 0.25;
          else if (oTier === 3) officeBrandMult += 0.60;
          else if (oTier === 4) officeBrandMult += 1.50;

          let marketingBrandMult = 1.0;
          if (mTier === 1) marketingBrandMult += 0.20;
          else if (mTier === 2) marketingBrandMult += 0.55;
          else if (mTier === 3) marketingBrandMult += 1.40;
          else if (mTier === 4) marketingBrandMult += 3.50;

          let flatBrandBoost = 0;
          if (hasSherry) flatBrandBoost += 3.0;
          if (mTier === 1) flatBrandBoost += 1.0;
          else if (mTier === 2) flatBrandBoost += 2.5;
          else if (mTier === 3) flatBrandBoost += 6.5;
          else if (mTier === 4) flatBrandBoost += 16.0;

          const brandGain = (((currentCompany.marketingBudget * 0.1) + (salesSum * 0.35)) * officeBrandMult * marketingBrandMult) + flatBrandBoost;
          currentCompany.brandAwareness = Math.min(100, currentCompany.brandAwareness + brandGain);

          let baseSectorDemand = 10;
          let sectorBasePrice = 12;

          if (currentCompany.type === 'tech') {
            baseSectorDemand = Math.round(currentCompany.brandAwareness * 1.6 + currentCompany.techProgress * 2.8 + 10);
            sectorBasePrice = 18;
          } else if (currentCompany.type === 'retail') {
            baseSectorDemand = Math.round(currentCompany.brandAwareness * 3.2 + currentCompany.techProgress * 1.1 + 14);
            sectorBasePrice = 11;
          } else if (currentCompany.type === 'real_estate') {
            baseSectorDemand = Math.round(currentCompany.brandAwareness * 1.1 + currentCompany.techProgress * 1.4 + 5);
            sectorBasePrice = 145;
          } else if (currentCompany.type === 'finance') {
            baseSectorDemand = Math.round(currentCompany.brandAwareness * 1.1 + currentCompany.techProgress * 2.1 + 8);
            sectorBasePrice = 60;
          }

          let equipmentDemandBoost = 1.0;
          if (eTier === 3) equipmentDemandBoost += 0.20;
          else if (eTier === 4) equipmentDemandBoost += 0.50;

          let marketingDemandBoost = 1.0;
          if (mTier === 3) marketingDemandBoost += 0.25;
          else if (mTier === 4) marketingDemandBoost += 0.70;

          baseSectorDemand = Math.round(baseSectorDemand * equipmentDemandBoost * marketingDemandBoost);

          let officeCushionBonus = 0;
          if (oTier === 3) officeCushionBonus += 0.15;
          else if (oTier === 4) officeCushionBonus += 0.40;

          const steveCushionBonus = hasSteve ? 1.6 : 2.0;
          const demandFactor = 1.0 / Math.pow(currentCompany.priceFactor, Math.max(0.7, steveCushionBonus - officeCushionBonus));
          
          let marketingSalesVolumeMult = 1.0;
          if (mTier === 3) marketingSalesVolumeMult += 0.20;
          else if (mTier === 4) marketingSalesVolumeMult += 0.50;

          let salesVolumeMult = 1.0;
          if (hasSherry) salesVolumeMult += 0.35;
          salesVolumeMult *= marketingSalesVolumeMult;

          const finalUnitsSold = Math.max(0, Math.round(baseSectorDemand * demandFactor * 0.65 * salesVolumeMult));
          const cashRevenuesOfToday = Math.round(finalUnitsSold * sectorBasePrice * currentCompany.priceFactor);
          currentCompany.capital += cashRevenuesOfToday;

          currentCompany.salesHistory = [
            ...currentCompany.salesHistory,
            { day: currentStats.day, sales: finalUnitsSold, profit: cashRevenuesOfToday }
          ].slice(-15);
        } else {
          currentCompany.brandAwareness = Math.max(5, currentCompany.brandAwareness - 3);
          currentCompany.salesHistory = [
            ...currentCompany.salesHistory,
            { day: currentStats.day, sales: 0, profit: 0 }
          ].slice(-15);
        }
      }

      // ==========================================
      // SECTION 7: BANK LEDGER COMPOUNDS
      // ==========================================
      if (currentStats.savingsBalance && currentStats.savingsBalance > 0) {
        const savingsInterest = Math.floor(currentStats.savingsBalance * 0.0005);
        if (savingsInterest > 0) {
          currentStats.savingsBalance += savingsInterest;
        }
      }
      if (currentStats.loanBalance && currentStats.loanBalance > 0) {
        const loanInterest = Math.ceil(currentStats.loanBalance * 0.0012);
        if (loanInterest > 0) {
          currentStats.loanBalance += loanInterest;
        }
      }

      // ==========================================
      // SECTION 8: RIVAL QUANTATIVE UPDATES
      // ==========================================
      currentRivals = currentRivals.map(rival => {
        if (rival.isBankrupt) return rival;
        let dailyRivalProfit = 0;
        if (rival.companySector === 'tech') dailyRivalProfit = Math.floor(Math.random() * 3500 - 1000);
        else if (rival.companySector === 'retail') dailyRivalProfit = Math.floor(Math.random() * 1800 - 500);
        else if (rival.companySector === 'real_estate') dailyRivalProfit = Math.floor(Math.random() * 5500 - 1500);
        else if (rival.companySector === 'finance') dailyRivalProfit = Math.floor(Math.random() * 4200 - 1200);

        const rollEvent = Math.random();
        let eventCapitalShift = 0;
        if (rollEvent < 0.05) {
          eventCapitalShift = Math.floor(rival.companyCapital * (Math.random() * 0.20 + 0.10));
        } else if (rollEvent > 0.95) {
          eventCapitalShift = -Math.floor(rival.companyCapital * (Math.random() * 0.15 + 0.05));
        }

        const updatedCapital = Math.max(5000, rival.companyCapital + dailyRivalProfit + eventCapitalShift);
        const valueChangeRatio = rival.companyCapital > 0 ? (updatedCapital - rival.companyCapital) / rival.companyCapital : 0;
        const noiseRatio = (Math.random() - 0.5) * 0.12;
        const updatedPrice = Math.max(5, Math.round(rival.sharePrice * (1 + valueChangeRatio * 1.5 + noiseRatio)));
        const isBankruptNow = updatedCapital < 2000 || updatedPrice < 2;

        return {
          ...rival,
          companyCapital: updatedCapital,
          sharePrice: updatedPrice,
          prevSharePrices: [...(rival.prevSharePrices || []), updatedPrice].slice(-15),
          isBankrupt: isBankruptNow
        };
      });

      // ==========================================
      // SECTION 9: SOCIAL FRIEND VENTURES TRANSITION
      // ==========================================
      currentFriendVentures = currentFriendVentures.map(fv => {
        let dailyChange = 0;
        if (fv.sector === 'tech') dailyChange = (Math.random() - 0.44) * 0.16;
        else if (fv.sector === 'retail') dailyChange = (Math.random() - 0.47) * 0.08;
        else if (fv.sector === 'finance') dailyChange = (Math.random() - 0.5) * 0.25;

        let eventFactor = 1.0;
        const rollEvent = Math.random();
        if (rollEvent < 0.03) {
          eventFactor = 1.22;
        } else if (rollEvent > 0.97) {
          eventFactor = 0.82;
        }

        const nextVal = Math.max(8000, Math.round(fv.currentValuation * (1 + dailyChange) * eventFactor));
        return {
          ...fv,
          currentValuation: nextVal,
          growthHistory: [...(fv.growthHistory || []), nextVal].slice(-10)
        };
      });

      // ==========================================
      // SECTION 10: ACTIVE SLEEP METABOLISM BUFF
      // ==========================================
      if (batchDays === 1) {
        currentStats.energy = Math.min(100, currentStats.energy + 40);
        currentStats.health = Math.min(100, currentStats.health + 15);
        currentStats.happiness = Math.min(100, currentStats.happiness + 8);
      }

      // Clamp stats bounds
      currentStats.energy = Math.min(100, Math.max(0, currentStats.energy));
      currentStats.health = Math.min(100, Math.max(0, currentStats.health));
      currentStats.happiness = Math.min(100, Math.max(0, currentStats.happiness));

      // Exhaustion drain check
      if (currentStats.energy <= 0) {
        currentStats.health = Math.max(0, currentStats.health - 20);
        currentStats.happiness = Math.max(0, currentStats.happiness - 15);
      }

      // Hospital & Coma detection / Inheritance Succession check
      if (currentStats.health <= 0) {
        if (currentStats.childrenCount && currentStats.childrenCount > 0) {
          // Succession
          currentStats.money = Math.round(currentStats.money * 0.90);
          currentStats.savingsBalance = Math.round(currentStats.savingsBalance * 0.95);
          currentStats.health = 100;
          currentStats.energy = 100;
          currentStats.happiness = 100;
          currentStats.education = "high_school";
          currentStats.activeJobId = "delivery_driver";
          currentStats.day = 1;
          currentStats.week = 1;
          currentStats.year += 1;
          currentStats.spouseId = null;
          currentStats.childrenCount = 0;
          currentStats.partnerAffection = 0;
          
          appendLog(
            "LEGACY SUCCESSION: Your heir officially took over the company, land plots, and family estate! Deducted 10% estate duty.",
            "帝国家族传承：创始人由于过度劳累逝世，二代继承人正式接管家族基业！继承名下全部地产物权与公司股份，抵扣 10% 遗产税后满血起航！",
            "success"
          );
        } else {
          currentStats.money = Math.max(0, currentStats.money - 500); 
          currentStats.health = 70;
          currentStats.energy = 85;
          currentStats.happiness = 45;
          currentStats.activeJobId = null; 
          
          currentStats.day += 3;
          if (currentStats.day > 7) { currentStats.day = 1; currentStats.week += 1; }

          appendLog(
            "ICU Emergency hospitalized! Spent $500 medical fee, lost active employment, and was bedridden for 3 days to recover.",
            "由于生命指标衰弱至零，您被紧急送往急诊ICU病房！共花费医疗费 $500，失去当前供职岗位，且被迫在病榻静养 3 天恢复。",
            "error"
          );
        }
      }
    }

    // ==========================================
    // SECTION 11: GRADUATION SUCCESS WRAPPER 
    // ==========================================
    if (didGraduateEnrolled) {
      appendLog(
        `Academics Concluded! Successfully graduated with '${graduatedName_en}'! Academic rewards applied.`,
        `学业终成！您顺利通过重重学术答辩，荣获【${graduatedName_zh}】文凭学位！相应的专业知识基础已大幅提升。`,
        "success"
      );
    }

    // ==========================================
    // SECTION 12: CORE BATCH METRIC WRITER
    // ==========================================
    if (batchDays > 1) {
      appendLog(
        `Fast-forward completed ${batchDays} days. Career salary net sum: +$${totalEarnings}. Operations cost subtracted.`,
        `长周期快进前进 ${batchDays} 日圆满。期间职业总薪酬结余 +$${totalEarnings}，各项商业开销已结算剔除。`,
        "info"
      );
    } else {
      appendLog(
        `Completed Day transition step. Private funds changed. Core metabolism refreshed.`,
        `度过了一天。个人账户已交易收支。休养心神精力恢复。`,
        "info"
      );
    }

    // ==========================================
    // SECTION 13: CORE ACHIEVEMENT MILESTONES
    // ==========================================
    currentMissions = currentMissions.map((m) => {
      if (m.completed) return m;
      let check = false;

      if (m.id === "m_first_job_day") {
        const sumExp = (Object.values(currentStats.experienceDays) as number[]).reduce((a, b) => a + b, 0);
        check = sumExp >= 5;
      } else if (m.id === "m_bachelor") {
        check = currentStats.education !== "high_school";
      } else if (m.id === "m_first_land") {
        check = currentPlots.some(p => p.owned);
      } else if (m.id === "m_cabin") {
        check = currentPlots.some(p => p.owned && p.house.built);
      } else if (m.id === "m_register_co") {
        check = currentCompany.registered;
      } else if (m.id === "m_money_100k") {
        check = currentStats.money >= 100000;
      }

      if (check) {
        currentStats.money += m.rewardMoney;
        currentStats.happiness = Math.min(100, currentStats.happiness + m.rewardHappiness);
        
        appendLog(
          `Achievement standard met! Completed: '${m.title_en}'. Bonus awarded: +$${m.rewardMoney}.`,
          `【里程碑达成】恭喜解锁终合成就：【${m.title_zh}】！当场获颁专项成就金 $${m.rewardMoney} 以及幸福度加倍。`,
          "success"
        );
        return { ...m, completed: true };
      }
      return m;
    });

    // Optional Event calculation
    let triggeredEvent: any | null = null;
    const roll = Math.random() < 0.20;
    if (roll && RANDOM_EVENTS.length > 0) {
      const idx = Math.floor(Math.random() * RANDOM_EVENTS.length);
      triggeredEvent = RANDOM_EVENTS[idx];
    }

    return {
      stats: currentStats,
      company: currentCompany,
      plots: currentPlots,
      studyingProg: currentStudyingProg,
      rivals: currentRivals,
      friendVentures: currentFriendVentures,
      missions: currentMissions,
      triggeredEvent
    };
  }
}
