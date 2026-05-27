import React, { useState } from "react";
import { 
  X, 
  Award, 
  Globe, 
  Crown, 
  TrendingUp, 
  ArrowUpRight, 
  Flame, 
  User, 
  Coins, 
  Briefcase 
} from "lucide-react";
import { RivalPlayer, Language } from "../types";

interface LeaderboardProps {
  language: Language;
  playerNetWorth: number;
  playerName: string;
  rivals: RivalPlayer[];
  onClose: () => void;
  playAudioBeep: (type: 'coin' | 'levelup' | 'achievement' | 'alert') => void;
}

interface SimulatedElite {
  name: string;
  companyName: string;
  netWorth: number;
  sector_en: string;
  sector_zh: string;
  country: string;
  countryCode: string;
  avatarInitials: string;
  badge_en?: string;
  badge_zh?: string;
  isPlayer?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardProps> = ({
  language,
  playerNetWorth,
  playerName,
  rivals,
  onClose,
  playAudioBeep
}) => {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'global' | 'regional' | 'college'>('global');

  // Hardcode some extremely wealthy simulated elite names, and then blend the player and active rivals in it!
  const getCombinedLeaderboard = (): SimulatedElite[] => {
    const rawRivals: SimulatedElite[] = rivals.map(r => ({
      name: r.name_en || r.name_zh,
      companyName: r.companyName || "Tycoon Corp",
      netWorth: r.companyCapital + (r.sharesOwnedByRival * r.sharePrice) + Math.floor(Math.random() * 5000), 
      sector_en: r.companySector.toUpperCase(),
      sector_zh: r.companySector === 'tech' ? "高精尖AI科技" : r.companySector === 'finance' ? "量化金融投资" : r.companySector === 'real_estate' ? "商业地产帝国" : "连锁零售产业",
      country: r.countryCode === 'SG' ? "Singapore 🇸🇬" : r.countryCode === 'CN' ? "China 🇨🇳" : "Malaysia 🇲🇾",
      countryCode: r.countryCode || "MY",
      avatarInitials: r.name_en?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "EC"
    }));

    // Player Elite Stats
    const playerElite: SimulatedElite = {
      name: playerName || (language==='en'?"You (Alpha Mogul)":"您 (商界新星)"),
      companyName: language === 'en' ? "Your Personal Holdings" : "您的控股实业帝国",
      netWorth: playerNetWorth,
      sector_en: "CONGLOMERATE",
      sector_zh: "综合集团大亨",
      country: "Malaysia 🇲🇾",
      countryCode: "MY",
      avatarInitials: playerName ? playerName.slice(0, 2).toUpperCase() : "ME",
      isPlayer: true
    };

    // Static Mega Billionaires
    const staticMegaBillionaires: SimulatedElite[] = [
      {
        name: "ElonKL",
        companyName: "Neural-Orbit Space Grid",
        netWorth: 84200000000,
        sector_en: "AEROSPACE TECH",
        sector_zh: "星际轨道太空开发",
        country: "USA 🇺🇸",
        countryCode: "US",
        avatarInitials: "EK",
        badge_en: "Cyberlord",
        badge_zh: "硅谷钢铁侠"
      },
      {
        name: "CyberTan",
        companyName: "X-Digital Syndicate Tech",
        netWorth: 64500000000,
        sector_en: "AI CORE SYSTEMS",
        sector_zh: "智源系统神经网络",
        country: "Singapore 🇸🇬",
        countryCode: "SG",
        avatarInitials: "CT",
        badge_en: "Deep Mind Head",
        badge_zh: "量子神学先驱"
      },
      {
        name: "TonyAnwar",
        companyName: "Merdeka Premier Capitals",
        netWorth: 12300000000,
        sector_en: "PRIVATE EQUITY",
        sector_zh: "联邦超级不动产私募",
        country: "Malaysia 标识 🇲🇾",
        countryCode: "MY",
        avatarInitials: "TA",
        badge_en: "National Advisor",
        badge_zh: "吉隆坡地产掌门"
      }
    ];

    if (activeLeaderboardTab === 'global') {
      const combined = [...staticMegaBillionaires, playerElite, ...rawRivals];
      return combined.sort((a,b) => b.netWorth - a.netWorth);
    } else if (activeLeaderboardTab === 'regional') {
      // Filter primarily Malaysia/SEA
      const seaElites = [
        playerElite,
        ...rawRivals,
        {
          name: "Tan Sri Robert Quek",
          companyName: "Golden Palm Agro-Holdings",
          netWorth: 41000000000,
          sector_en: "AGRO-INDUSTRIAL",
          sector_zh: "东南亚棕榈油生态集团",
          country: "Malaysia 🇲🇾",
          countryCode: "MY",
          avatarInitials: "RQ",
          badge_en: "Sugar King",
          badge_zh: "南洋糖王"
        },
        staticMegaBillionaires[2] // TonyAnwar
      ];
      return seaElites.sort((a,b) => b.netWorth - a.netWorth);
    } else {
      // College Rivals level (much smaller, highly competitive!)
      const studentElites: SimulatedElite[] = [
        playerElite,
        {
          name: "Lim Zhe Han",
          companyName: "Sunway Tutor AI App",
          netWorth: 24000,
          sector_en: "EDUTECH APP",
          sector_zh: "学科解题助手小程序",
          country: "Malaysia 🇲🇾",
          countryCode: "MY",
          avatarInitials: "ZH"
        },
        {
          name: "Siti Humaira",
          companyName: "Raja Nasi Lemak Franchise",
          netWorth: 45000,
          sector_en: "FOOD DELIVERY",
          sector_zh: "连锁定点辣死你妈加盟商",
          country: "Malaysia 🇲🇾",
          countryCode: "MY",
          avatarInitials: "SH"
        },
        {
          name: "Daniel Kumar",
          companyName: "Bukit Bintang Coding Loft",
          netWorth: 85000,
          sector_en: "SOFTWARE HOUSE",
          sector_zh: "独立建站外包工作室",
          country: "Malaysia 🇲🇾",
          countryCode: "MY",
          avatarInitials: "DK"
        }
      ];
      // Blend any active rivals who also have smaller assets
      rawRivals.forEach(r => {
        if (r.netWorth < 5000000) {
          studentElites.push(r);
        }
      });
      return studentElites.sort((a,b) => b.netWorth - a.netWorth);
    }
  };

  const cleanFormatMoney = (val: number): string => {
    if (val >= 1000000000) {
      return `RM ${(val / 1000000000).toFixed(2)}B`;
    }
    if (val >= 1000000) {
      return `RM ${(val / 1000000).toFixed(2)}M`;
    }
    return `RM ${val.toLocaleString()}`;
  };

  return (
    <div id="leaderboard-full-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-md z-60 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header Section */}
        <div className="p-5 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-950/50 border border-yellow-800/40 flex items-center justify-center text-yellow-500">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-100 uppercase tracking-tight">
                {language === 'en' ? "Global Rich List & Rankings" : "世界首富排行榜 (联网仿真目录)"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                {language === 'en' ? "Active Competitors & Megaliths" : "您与全球科技大鳄、大马商界宿将财富指数实时PK"}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/50 p-2 gap-1 justify-around">
          {[
            { id: 'global', label_en: "Global Elites", label_zh: "全球超级大鳄", icon: <Globe size={13} /> },
            { id: 'regional', label_en: "Malaysia Local", label_zh: "大马本土豪客", icon: <TrendingUp size={13} /> },
            { id: 'college', label_en: "Student League", label_zh: "高校学生领袖", icon: <Flame size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveLeaderboardTab(tab.id as any);
                playAudioBeep('coin');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black font-mono transition cursor-pointer ${
                activeLeaderboardTab === tab.id 
                  ? 'bg-zinc-900 text-yellow-500 border border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span>{language === 'en' ? tab.label_en : tab.label_zh}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard scrollable entries column */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-black/20">
          {getCombinedLeaderboard().map((elite, index) => {
            const rank = index + 1;
            const isRank1 = rank === 1;
            const isRank2 = rank === 2;
            const isRank3 = rank === 3;
            const rankBg = isRank1 ? "bg-yellow-500 text-black border-yellow-600 font-black shadow-lg shadow-yellow-950/15" : 
                           isRank2 ? "bg-zinc-300 text-black border-zinc-400 font-bold" : 
                           isRank3 ? "bg-amber-700 text-white border-amber-800 font-bold" : 
                           "bg-zinc-900/60 text-zinc-400 border-zinc-850";

            return (
              <div 
                key={`elite-${elite.name}-${rank}`}
                className={`py-3.5 px-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                  elite.isPlayer 
                    ? 'bg-emerald-950/25 border-emerald-900 shadow-md shadow-emerald-950/5 relative overflow-hidden ring-1 ring-emerald-500/20' 
                    : 'bg-zinc-900/30 border-zinc-900/60 hover:bg-zinc-900/50 hover:border-zinc-800'
                }`}
              >
                {/* Decorative glow layer for active player */}
                {elite.isPlayer && (
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                )}

                {/* Left Block (Rank badge, Avatar and Corporate title) */}
                <div className="flex items-center gap-4.5 min-w-0">
                  {/* Badged Rank */}
                  <div className={`w-6.5 h-6.5 rounded-lg border flex items-center justify-center font-mono text-[11px] leading-none select-none shrink-0 ${rankBg}`}>
                    {rank}
                  </div>

                  {/* Initials Avatar */}
                  <div className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 select-none ${
                    elite.isPlayer 
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    {elite.isPlayer ? "👑" : elite.avatarInitials}
                  </div>

                  {/* Names block */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs truncate ${
                        elite.isPlayer ? 'text-emerald-400 font-black text-sm' : 'text-zinc-150 font-bold'
                      }`}>
                        {elite.name}
                      </span>

                      {/* Super elite badge tag */}
                      {(elite.badge_en || elite.badge_zh) && (
                        <span className="text-[7.5px] uppercase font-mono font-black border border-yellow-900/60 text-yellow-500 bg-yellow-950/40 px-1 py-0.5 rounded leading-none">
                          {language === 'en' ? elite.badge_en : elite.badge_zh}
                        </span>
                      )}

                      {/* You player bubble */}
                      {elite.isPlayer && (
                        <span className="text-[7.5px] uppercase font-mono font-black border border-emerald-900/60 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded leading-none">
                          {language === 'en' ? "YOU" : "您"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                      <span className="text-[10px] text-zinc-500 truncate max-w-[130px] font-sans">
                        🏢 {elite.companyName}
                      </span>
                      <span className="text-[9px] text-zinc-600 block shrink-0">·</span>
                      <span className="text-[8px] font-mono tracking-wide text-indigo-400 block truncate leading-none shrink-0">
                        {language === 'en' ? elite.sector_en : elite.sector_zh}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Block (Country flag, net worth RM value, upward arrow) */}
                <div className="text-right shrink-0">
                  <div className="font-extrabold font-mono text-[11px] text-zinc-100 tracking-tight flex items-center gap-1 justify-end">
                    <span>{cleanFormatMoney(elite.netWorth)}</span>
                    <span className="text-emerald-500"><ArrowUpRight size={10} strokeWidth={3} /></span>
                  </div>
                  <span className="text-[9px] text-zinc-550 block font-sans">
                    {elite.country}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer rank stats indicator */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span>{language === 'en' ? "Status: Dynamic Real-time Indexes Connected" : "状态：大马商赛虚拟网络已就位"}</span>
          <span>{language === 'en' ? "Updated Every Turn" : "每步跨越将重定权重"}</span>
        </div>

      </div>
    </div>
  );
};
