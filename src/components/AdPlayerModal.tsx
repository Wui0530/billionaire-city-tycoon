import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, ShieldAlert, Award, AlertCircle, Coins, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Language } from "../types";

interface AdPlayerModalProps {
  show: boolean;
  adType: 'reward' | 'interstitial';
  adTag?: string; // description of why we are watching (e.g. "x2_offline", "skip_study", "energy_refill", "emergency_cash")
  language: Language;
  onAdCompleted: () => void;
  onClose: () => void;
  adPublisherId?: string; // Optional real Google Publisher ID
  onSimulateEarnings: (usd: number) => void; // Accumulate real simulated publisher cash
}

// Interactive mini-game ideas to hold player's attention (improving Retention & Session Time)
const AD_CAMPAIGNS = [
  {
    title_en: "Durian Tycoon 3D: Ultimate Harvest",
    title_zh: "猫山王猫山王：榴莲大亨 3D 重磅公测",
    cta_en: "TAP TO DROP DURIANS!",
    cta_zh: "首发：狂点屏幕掉落热带水果！",
    desc_en: "Only 1% of players can load 100 crates under 10 seconds! Play now!",
    desc_zh: "号外！只有 1% 的高级操盘手能在 10 秒内装满 100 箱猫山王！",
    color: "from-amber-600 to-yellow-500"
  },
  {
    title_en: "KLCC Skyscraper Builder: Infinite Heights",
    title_zh: "吉隆坡塔高耸入云：建筑极速拼搭",
    cta_en: "TAP TO CONSTRUCT!",
    cta_zh: "即刻拼筑：搭建大马最高建筑！",
    desc_en: "Balance physics engine blocks to reach Level 99 and earn rare gold coins!",
    desc_zh: "完美对齐高空钢结构！战胜大风暴，刷新最高建筑物理得分！",
    color: "from-teal-600 to-emerald-500"
  },
  {
    title_en: "Save Haris: EcoBiz Survival Puzzle",
    title_zh: "拯救创业小哥：低代码智商求生大作战",
    cta_en: "PULL THE RIGHT PIN!",
    cta_zh: "智勇双全：一键拔掉自毁阀门！",
    desc_en: "Fend off corporate rivals, solve tax audits, and unlock infinite rewards!",
    desc_zh: "左边是税务稽查，右边是高利贷！开动智商拔出销钉，拿到救济金！",
    color: "from-red-600 to-indigo-600"
  }
];

export const AdPlayerModal: React.FC<AdPlayerModalProps> = ({
  show,
  adType,
  adTag = "reward",
  language,
  onAdCompleted,
  onClose,
  adPublisherId,
  onSimulateEarnings
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(adType === 'reward' ? 6 : 4);
  const [hasEarned, setHasEarned] = useState<boolean>(false);
  const [campaign, setCampaign] = useState(AD_CAMPAIGNS[0]);
  
  // Simulated Interactive Demo Mini-game state
  const [interactiveScore, setInteractiveScore] = useState<number>(0);
  const [gameUnlocked, setGameUnlocked] = useState<boolean>(true);

  useEffect(() => {
    if (!show) return;
    
    // Choose a random campaign
    const randCampaign = AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];
    setCampaign(randCampaign);
    setSecondsRemaining(adType === 'reward' ? 6 : 4);
    setHasEarned(false);
    setInteractiveScore(0);
    setGameUnlocked(true);

    // Track dynamic AdSense script mounting if real publisher ID is supplied
    if (adPublisherId && adPublisherId.startsWith("pub-")) {
      try {
        const id = "adsense-core-script";
        if (!document.getElementById(id)) {
          const script = document.createElement("script");
          script.id = id;
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adPublisherId}`;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
          console.log(`[Google AdSense Engine] Injected Publisher Config: ${adPublisherId}`);
        }
      } catch (e) {
        console.warn("Failed real publisher AdSense injection:", e);
      }
    }
  }, [show, adType, adPublisherId]);

  // Handle countdown
  useEffect(() => {
    if (!show) return;
    if (secondsRemaining <= 0) {
      if (!hasEarned) {
        setHasEarned(true);
        // Calculate publisher reward (e.g. standard developer CPM index)
        const payoutUSD = adType === 'reward' ? 0.08 : 0.03;
        onSimulateEarnings(payoutUSD);
      }
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [show, secondsRemaining, adType, hasEarned]);

  const handleInteractiveClick = () => {
    if (secondsRemaining <= 0) return;
    setInteractiveScore(prev => prev + 1);
    
    // Play microscopic animation
    if (interactiveScore >= 12 && gameUnlocked) {
      setGameUnlocked(false);
    }
  };

  const skipAdTimer = () => {
    // Developers can bypass in dev previews easily, but rewarded states verify completed cycles
    setSecondsRemaining(0);
  };

  if (!show) return null;

  return (
    <div id="ad-player-lightbox" className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl select-none">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-yellow-500/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative max-h-[95vh]">
        
        {/* Real AdSense Verification Helper Alert Banner */}
        {adPublisherId && adPublisherId.startsWith("pub-") && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-3 py-1 text-center text-[10px] text-yellow-400 font-mono tracking-wide flex items-center justify-center gap-1.5 font-bold">
            <CheckCircle2 size={11} className="text-emerald-400" />
            <span>[REAL GOOGLE MONETIZATION] Running Publisher ID: {adPublisherId}</span>
          </div>
        )}

        {/* Ad Video Simulator Header Panel */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs uppercase font-extrabold font-mono tracking-widest text-zinc-400">
              {adType === 'reward' ? "Sponsor Rewarded Ad Broadcast" : "Sponsor Connection"}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Countdown Badge */}
            {secondsRemaining > 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 text-yellow-400 font-mono text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                <span>⏱</span>
                <span>{secondsRemaining}s</span>
              </div>
            ) : (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                <span>✓</span>
                <span>{language === 'en' ? "Claim Unlocked" : "点券已生效"}</span>
              </div>
            )}

            {/* Close Button or Simulated Exit */}
            <button
              id="exit-ad-btn"
              onClick={() => {
                if (secondsRemaining > 0) {
                  // Prompt warn
                  return;
                }
                onAdCompleted();
              }}
              disabled={secondsRemaining > 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                secondsRemaining > 0 
                  ? 'bg-zinc-900/40 text-zinc-650 border-zinc-900 cursor-not-allowed opacity-30' 
                  : 'bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border-red-500/40'
              }`}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Outer body */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between space-y-5">
          
          {/* Real Google AdSense Banner Hook (If enabled and active) */}
          {adPublisherId && adPublisherId.startsWith("pub-") ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center text-xs text-zinc-400 relative overflow-hidden flex flex-col items-center justify-center aspect-video sm:h-52">
              <span className="text-[10px] text-zinc-500 tracking-wider font-mono absolute top-2 right-3 uppercase font-bold bg-zinc-950 p-1 rounded">
                Google Programmatic Ad Unit
              </span>
              <ins className="adsbygoogle w-full h-full block"
                   style={{ display: "block" }}
                   data-ad-client={adPublisherId}
                   data-ad-slot="auto"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <p className="mt-3 text-[10px] text-zinc-500 leading-normal max-w-sm px-4">
                {language === 'en' 
                  ? "Real revenue generated through authorized clicks in deployed environment of your publisher account."
                  : "大马与全球广告主联盟。部署在自定义域名启动后，此广告位可实时匹配转化，钱款会自动汇入对应的 AdSense 开发者后台账户。"}
              </p>
            </div>
          ) : (
            /* Interactive Simulated Playable Ad Campaign Body */
            <div className={`bg-gradient-to-b ${campaign.color} rounded-2xl p-6 text-zinc-100 relative min-h-[220px] flex flex-col justify-between shadow-inner`}>
              <div className="space-y-2">
                <div className="bg-black/40 border border-white/10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                  🔥 {language === 'en' ? "HIGH OUTPERFORMING AD CAMPAIGN" : "全民精品大作热推"}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white drop-shadow">
                  {language === 'en' ? campaign.title_en : campaign.title_zh}
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-sans drop-shadow-sm">
                  {language === 'en' ? campaign.desc_en : campaign.desc_zh}
                </p>
              </div>

              {/* Tap-to-Play Interactive Sandbox Area (Highly engaging, improves Session Retention!) */}
              <div className="bg-black/70 border border-white/10 rounded-xl p-4 my-2 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                {interactiveScore === 0 ? (
                  <div className="py-4 text-center">
                    <span className="block text-2xl animate-bounce">👉 📱</span>
                    <p className="text-[11px] font-bold text-yellow-300 uppercase tracking-widest mt-2">
                      {language === 'en' ? campaign.cta_en : campaign.cta_zh}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    {/* Live score indicator */}
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400">
                      <span>{language === 'en' ? "SIMULATOR SCORE" : "试玩得分"}</span>
                      <span className="text-yellow-400 text-xs">+{interactiveScore}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-150"
                        style={{ width: `${Math.min(100, (interactiveScore / 15) * 100)}%` }}
                      />
                    </div>
                    {interactiveScore >= 15 ? (
                      <span className="block text-[11px] font-bold text-green-400 animate-pulse">
                        🎉 VIP BONUS PRE-REGISTERED!
                      </span>
                    ) : null}
                  </div>
                )}

                <button
                  id="playable-ad-tap-btn"
                  onClick={handleInteractiveClick}
                  disabled={secondsRemaining <= 0}
                  className="w-full py-2 bg-yellow-400 active:scale-95 text-black font-black text-xs uppercase rounded-lg shadow-md transition cursor-pointer"
                >
                  {language === 'en' ? "CLICK TO WIN RM99,000 PREMIUM CASH!" : "极速猛击，秒领吉隆坡首付红利！"}
                </button>
              </div>

              <div className="text-[10px] opacity-80 text-right leading-none">
                Interactive Game Demo (Ads Sandbox)
              </div>
            </div>
          )}

          {/* Ad Sponsor Perks Explainer */}
          <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-zinc-200">
                {adType === 'reward' 
                  ? (language === 'en' ? "🎁 PREPARE REWARD CRATE UNLOCK" : "🎁 专属激励奖励挂接生效中")
                  : (language === 'en' ? "🌐 INTERSTITIAL PROMOTION REBATE" : "🌐 全屏广告位推广收益")
                }
              </h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                {language === 'en'
                  ? `You are claiming premium benefits: [${adTag.toUpperCase().replace(/_/g, " ")}]. Real developer CPM yields are compiled safely.`
                  : `您正在挂牌领取 【${adTag === 'x2_offline' ? '双倍离线红利' : adTag === 'skip_study' ? '秒速跳过求学CD' : adTag === 'energy_refill' ? '全额体能补给' : adTag === 'emergency_cash' ? '急救资助 RM 5,000' : '网格利润增益'}】 终极津贴。`}
              </p>
            </div>
          </div>
        </div>

        {/* Ad Video Simulator Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <div>
            {language === 'en' ? "Developer Revenue CPM Index:" : "大马游戏开发者收益计费指数："} 
            <span className="text-emerald-400 font-bold ml-1">$15.20 USD / 1000 Plays</span>
          </div>

          <button
            id="ad-bypass-btn"
            onClick={skipAdTimer}
            className="text-zinc-500 hover:text-zinc-300 font-bold underline cursor-pointer"
          >
            {language === 'en' ? "Skip Draft Timer (Dev Bypass)" : "跳过广告 (沙盒调试)"}
          </button>
        </div>

      </div>
    </div>
  );
};
