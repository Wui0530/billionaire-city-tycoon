import React, { useState } from "react";
import { Home, Hammer, Paintbrush, TreePine, Lock, Compass, Grid, DollarSign, BedDouble, Coffee, Monitor, Wind, Sun } from "lucide-react";
import { LandPlot, PlayerStats, Language, Furniture } from "../types";
import { i18n, BLUEPRINTS, FURNITURE_STORE } from "../i18n";
import { motion } from "motion/react";

interface RealEstatePanelProps {
  plots: LandPlot[];
  stats: PlayerStats;
  language: Language;
  onBuyLand: (plotId: string) => void;
  onBuildBlueprint: (plotId: string, blueprintId: string) => void;
  onRenovateHouse: (plotId: string) => void;
  onBuyFurniture: (plotId: string, furniture: Furniture) => void;
  onToggleRent?: (plotId: string, termDays?: number, rateMult?: number) => void;
}

export const RealEstatePanel: React.FC<RealEstatePanelProps> = ({
  plots,
  stats,
  language,
  onBuyLand,
  onBuildBlueprint,
  onRenovateHouse,
  onBuyFurniture,
  onToggleRent
}) => {
  const t = i18n[language];
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || "");
  const [selectedTerm, setSelectedTerm] = useState<number>(-1);

  const activePlot = plots.find((p) => p.id === selectedPlotId);

  const calculatePlotDailyRent = (plot: LandPlot, previewTerm?: number) => {
    if (!plot.house.built) return 0;
    let base = 0;
    const type = plot.house.type;
    if (type === 'cabin') base = 80;
    else if (type === 'apartment') base = 220;
    else if (type === 'villa') base = 650;
    else if (type === 'hotel') base = 1800;
    else if (type === 'mansion') base = 3200;
    else if (type === 'bunker') base = 8500;
    else if (type === 'skyscraper') base = 52050;
    else if (type === 'moonbase') base = 380000;

    let zoneMult = 1.0;
    if (plot.zone === 'suburbs') zoneMult = 1.0;
    else if (plot.zone === 'industrial') zoneMult = 1.1;
    else if (plot.zone === 'beachfront') zoneMult = 1.4;
    else if (plot.zone === 'downtown') zoneMult = 1.6;

    const renoMult = 1.0 + (plot.house.renovationLevel / 100);
    const furnitureCount = plot.house.furnituresOwned ? plot.house.furnituresOwned.length : 0;
    const furnMult = 1.0 + (furnitureCount * 0.15);

    let rentRateMult = 1.0;
    const activeTerm = plot.isRented ? (plot.rentTermTotal ?? -1) : (previewTerm ?? -1);
    if (activeTerm === 3) rentRateMult = 1.25;
    else if (activeTerm === 7) rentRateMult = 1.00;
    else if (activeTerm === 30) rentRateMult = 0.85;
    else if (activeTerm === -1) rentRateMult = 0.90;

    const demandMult = plot.districtDemand ?? 1.05;
    const satisfactionMult = plot.tenantSatisfaction ? (0.8 + (plot.tenantSatisfaction / 100) * 0.2) : 1.0;
    const vacancyPenalty = plot.vacancyRisk ? (1.0 - plot.vacancyRisk * 0.15) : 1.0;

    return Math.round(base * zoneMult * renoMult * furnMult * rentRateMult * demandMult * satisfactionMult * vacancyPenalty);
  };

  // Helper inside layout
  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'suburbs': return language === 'en' ? 'Suburbs Residential' : '郊区绿色住区';
      case 'downtown': return language === 'en' ? 'Downtown Center' : '城市商务中心';
      case 'beachfront': return language === 'en' ? 'Ocean beach sands' : '黄金阳光海滩';
      case 'industrial': return language === 'en' ? 'Industrial sector' : '高新工业园区';
      default: return zone;
    }
  };

  // Icon mapping helper for furniture
  const renderFurnitureIcon = (iconName: string, cn: string) => {
    switch (iconName) {
      case "BedDouble": return <BedDouble className={cn} size={15} />;
      case "Coffee": return <Coffee className={cn} size={15} />;
      case "Monitor": return <Monitor className={cn} size={15} />;
      case "Wind": return <Wind className={cn} size={15} />;
      case "Sun": return <Sun className={cn} size={15} />;
      default: return <Home className={cn} size={15} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* LEFT: ZONING GRID MAP */}
      <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
            <Compass size={16} className="text-indigo-400" />
            <span>{t.estateTitle}</span>
          </h3>
          <span className="text-[10px] bg-zinc-950 font-mono text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded">
            {plots.filter(p => p.owned).length}/{plots.length} Owned
          </span>
        </div>

        {/* Dynamic Grid Layout */}
        <div id="land-map-grid" className="grid grid-cols-1 gap-2.5">
          {plots.map((plot) => {
            const isSelected = plot.id === selectedPlotId;
            return (
              <button
                key={plot.id}
                id={`land-plot-${plot.id}`}
                onClick={() => setSelectedPlotId(plot.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  isSelected
                    ? "bg-indigo-950/20 border-indigo-500 shadow"
                    : plot.owned
                      ? "bg-zinc-950 border-emerald-900/60 hover:border-emerald-800 text-zinc-200"
                      : "bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <div className="space-y-1 select-none">
                  <div className="text-xs uppercase font-mono font-bold text-zinc-500 flex items-center gap-1">
                    <TreePine size={11} className={plot.owned ? "text-emerald-500" : "text-zinc-600"} />
                    <span>{getZoneLabel(plot.zone)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">
                    {language === 'en' ? plot.name_en : plot.name_zh}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {plot.size} sqm | {plot.house.built ? `${language==='en'?'Built':'已建'}: ${plot.house.type.toUpperCase()}` : (language==='en'?'Vacant Earth':'荒草旷地')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {plot.owned ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
                      {language === 'en' ? 'Prop' : '已购置'}
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-yellow-500 flex items-center gap-0.5 justify-end">
                      <DollarSign size={13} />
                      <span>{plot.price.toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* RIGHT: DETAILED CONSTRUCTION & BUILDING CANVAS */}
      <div className="lg:col-span-7 space-y-6">
        {activePlot ? (
          <div className="space-y-6">
            
            {/* HOUSE VISUAL VIEWPORT CANVAS */}
            <div id="plot-building-viewport" className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner flex flex-col">
              {/* Plot Header Info */}
              <div className="bg-zinc-900 border-b border-zinc-850/80 px-4 py-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{language === 'en' ? activePlot.name_en : activePlot.name_zh}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wide">{getZoneLabel(activePlot.zone)}</span>
                </div>
                {activePlot.house.built && (
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                    {activePlot.house.type} ({t.builtStatus})
                  </span>
                )}
              </div>

              {/* Physical Render Box */}
              <div className="h-[220px] bg-gradient-to-b from-sky-950/60 to-zinc-900/90 relative flex flex-col items-center justify-end p-4 overflow-hidden border-b border-zinc-900">
                {/* Visual Sun or Moon depending on Day state */}
                <div className="absolute top-4 right-6 w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-500/40 flex items-center justify-center animate-pulse">
                  <Sun className="text-yellow-400" size={16} />
                </div>

                {/* Suburbs or Downtown background silhouette details */}
                <div className="absolute inset-x-0 bottom-10 h-1/3 flex justify-between items-end opacity-10 px-8">
                  {activePlot.zone === 'downtown' ? (
                    <>
                      <div className="w-12 h-24 bg-zinc-200" />
                      <div className="w-16 h-36 bg-zinc-100" />
                      <div className="w-10 h-28 bg-zinc-200" />
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-12 bg-emerald-300 rounded-full" />
                      <div className="w-6 h-18 bg-emerald-200 rounded-full" />
                      <div className="w-4 h-16 bg-emerald-300 rounded-full" />
                    </>
                  )}
                </div>

                {/* House Construction Drawing container */}
                {activePlot.house.built ? (
                  <motion.div 
                    initial={{ scale: 0.8, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-56 flex flex-col items-center z-10"
                  >
                    {/* Roof Shape */}
                    <div 
                      className={`w-0 h-0 transition-all duration-500 ${
                        activePlot.house.type === 'moonbase'
                          ? 'border-l-[112px] border-r-[112px] border-b-[60px] border-l-transparent border-r-transparent border-b-pink-500 rounded-t-full shadow-[0_-5px_15px_rgba(236,72,153,0.3)]'
                          : activePlot.house.type === 'skyscraper'
                            ? 'border-l-[112px] border-r-[112px] border-b-[20px] border-l-transparent border-r-transparent border-b-emerald-400'
                            : activePlot.house.type === 'hotel'
                              ? 'border-l-[112px] border-r-[112px] border-b-[35px] border-l-transparent border-r-transparent border-b-yellow-500 shadow-[0_-3px_10px_rgba(234,179,8,0.4)]'
                              : activePlot.house.type === 'bunker'
                                ? 'border-l-[140px] border-r-[140px] border-b-[15px] border-l-transparent border-r-transparent border-b-zinc-650'
                                : activePlot.house.type === 'mansion' 
                                  ? 'border-l-[112px] border-r-[112px] border-b-[45px] border-l-transparent border-r-transparent border-b-indigo-500' 
                                  : activePlot.house.type === 'villa' 
                                    ? 'border-l-[112px] border-r-[112px] border-b-[45px] border-l-transparent border-r-transparent border-b-cyan-500' 
                                    : activePlot.house.type === 'apartment' 
                                      ? 'border-l-[112px] border-r-[112px] border-b-[45px] border-l-transparent border-r-transparent border-b-red-500 animate-pulse' 
                                      : 'border-l-[112px] border-r-[112px] border-b-[45px] border-l-transparent border-r-transparent border-b-amber-700'
                      }`}
                    />

                    {/* Main Building Frame */}
                    <div 
                      className={`w-48 bg-zinc-800 border-x-4 border-b-4 rounded-b-md p-3 relative flex flex-col justify-between transition-all duration-500 ${
                        activePlot.house.type === 'moonbase'
                          ? 'h-40 border-pink-500 bg-pink-950/20 shadow-[0_10px_25px_rgba(236,72,153,0.25)]'
                          : activePlot.house.type === 'skyscraper'
                            ? 'h-52 border-emerald-500 bg-emerald-950/20 shadow-[0_10px_30px_rgba(16,185,129,0.3)]'
                            : activePlot.house.type === 'hotel'
                              ? 'h-44 border-yellow-500 bg-yellow-950/20 shadow-[0_10px_30px_rgba(234,179,8,0.35)]'
                              : activePlot.house.type === 'bunker'
                                ? 'h-16 border-zinc-600 bg-zinc-950/80'
                                : activePlot.house.type === 'mansion' 
                                  ? 'h-36 border-indigo-600 bg-indigo-950/20' 
                                  : activePlot.house.type === 'villa' 
                                    ? 'h-28 border-cyan-500 bg-cyan-950/10' 
                                    : activePlot.house.type === 'apartment' 
                                      ? 'h-32 border-red-500' 
                                      : 'h-20 border-amber-800 bg-amber-950/5'
                      }`}
                    >
                      {/* Windows according to renovation tier */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`h-6 rounded border transition-all ${
                          activePlot.house.renovationLevel >= 15 ? 'bg-yellow-300/40 border-yellow-300' : 'bg-transparent border-zinc-700'
                        }`} />
                        <div className={`h-6 rounded border transition-all ${
                          activePlot.house.renovationLevel >= 45 ? 'bg-yellow-300/40 border-yellow-300' : 'bg-transparent border-zinc-705'
                        }`} />
                        <div className={`h-6 rounded border transition-all ${
                          activePlot.house.renovationLevel >= 75 ? 'bg-yellow-300/40 border-yellow-300' : 'bg-transparent border-zinc-705'
                        }`} />
                      </div>

                      {/* Display active physical furniture status icons inside house container */}
                      <div className="flex justify-center gap-1.5 py-1 flex-wrap">
                        {activePlot.house.furnituresOwned.map((fid) => {
                          const fObj = FURNITURE_STORE.find(it => it.id === fid);
                          if (!fObj) return null;
                          return (
                            <div key={fid} title={fObj.name_en} className="p-1 rounded bg-zinc-900 border border-zinc-800 text-yellow-300 flex items-center justify-center">
                              {renderFurnitureIcon(fObj.icon, "text-yellow-400")}
                            </div>
                          );
                        })}
                      </div>

                      {/* Traditional wooden/steel door */}
                      <div className="w-8 h-12 bg-amber-900 rounded-t border border-amber-800 self-center" />
                    </div>
                  </motion.div>
                ) : (
                  /* Wild Vacant Land Grass */
                  <div className="text-zinc-500 text-xs font-semibold z-10 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Hammer size={12} className="text-zinc-400" />
                    <span>{language === 'en' ? 'Blank Lot - Execute a Blueprint construction!' : '空旷荒废地皮 - 批准建筑施工方案！'}</span>
                  </div>
                )}

                {/* Bottom ground line lawn */}
                <div className="w-full h-3.5 bg-emerald-800 border-t border-emerald-600 rounded-t-sm z-0 self-stretch shrink-0" />
              </div>

              {/* Status Metrics for active Plot */}
              {activePlot.house.built && (
                <div className="border-t border-zinc-850 bg-zinc-900/45 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.renovateTitle}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-zinc-805 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${activePlot.house.renovationLevel}%` }} />
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-300">{activePlot.house.renovationLevel}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.furnituresOwned}</span>
                      <span className="text-xs font-semibold text-zinc-300 block mt-1">
                        {activePlot.house.furnituresOwned.length} / {FURNITURE_STORE.length} {language === 'en' ? 'Equipped' : '已配置'}
                      </span>
                    </div>
                  </div>

                  {/* Operational Renting out Block */}
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activePlot.isRented ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                          <span className="text-[11px] font-black uppercase tracking-wide text-zinc-350">
                            {activePlot.house.type === 'hotel' 
                              ? (activePlot.isRented ? (language === 'en' ? "HOTEL OPEN FOR CHECK-INS" : "大酒店客满迎客营运中") : (language === 'en' ? "HOTEL PRIVATE RETREAT" : "大酒店归为自主度假别苑"))
                              : (activePlot.isRented ? (language === 'en' ? "COMMERCIAL ONGOING LEASE" : "地产房屋长期租赁托管中") : (language === 'en' ? "PERSONAL PRIMARY RESIDENCE" : "名下自持个人自住房产"))
                            }
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-200">
                          {activePlot.isRented 
                            ? (language === 'en' 
                                ? `Generating RM ${calculatePlotDailyRent(activePlot).toLocaleString()} / day direct in your pockets.` 
                                : `每天自动往您口袋里打款：RM ${calculatePlotDailyRent(activePlot).toLocaleString()} 营业红利。`)
                            : (language === 'en' 
                                ? `Estimated: RM ${calculatePlotDailyRent(activePlot, selectedTerm).toLocaleString()} / day (Based on selected term).` 
                                : `预估租金：日收入 RM ${calculatePlotDailyRent(activePlot, selectedTerm).toLocaleString()}（按选定租赁期限计算）。`)
                          }
                        </p>
                        {activePlot.isRented && (
                          <div className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-400 inline-block font-mono">
                            {language === 'en' 
                              ? `Lease Type: ${activePlot.rentTermTotal === -1 ? 'Continuous / Automatic Autopilot' : `${activePlot.rentTermTotal}-day term (${activePlot.rentTermRemaining} days left)`}`
                              : `租约类型：${activePlot.rentTermTotal === -1 ? '无限期托管 / 自动永续' : `${activePlot.rentTermTotal} 天合约（剩余 ${activePlot.rentTermRemaining} 天期满）`}`
                            }
                          </div>
                        )}

                        {activePlot.isRented && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                            {/* Tenant details */}
                            <div className="space-y-1 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900">
                              <span className="text-[8px] uppercase font-extrabold text-zinc-500 block">👤 Active Tenant Group / 租客身份</span>
                              <div className="font-extrabold text-zinc-100 font-sans flex items-center gap-1 mt-0.5">
                                <span>{language === 'en' ? (activePlot.tenantType_en || "Digital Nomad Corp Node") : (activePlot.tenantType_zh || "独立极客/数字游民合伙社群")}</span>
                              </div>
                              <div className="text-[9px] text-zinc-400 mt-1.5 flex items-center justify-between">
                                <span>{language==='en'?'Satisfaction:':'租客满意度：'}</span>
                                <span className="font-mono font-bold text-emerald-400">{(activePlot.tenantSatisfaction || 85)}%</span>
                              </div>
                              <div className="bg-zinc-900 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activePlot.tenantSatisfaction || 85}%` }} />
                              </div>
                            </div>

                            {/* Market and district factors */}
                            <div className="space-y-1 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900">
                              <span className="text-[8px] uppercase font-extrabold text-zinc-500 block">📈 District Market Index / 地段指数</span>
                              <div className="font-black text-indigo-400 font-mono mt-0.5">
                                {activePlot.districtDemand ? `${activePlot.districtDemand.toFixed(2)}x` : "1.12x"} Demand Mult
                              </div>
                              <div className="text-[9px] text-zinc-400 mt-1 flex justify-between items-center">
                                <span>{language==='en'?'Vacancy Risk:':'预期退房空置概率：'}</span>
                                <span className="font-mono font-bold text-yellow-500">{activePlot.vacancyRisk ? `${(activePlot.vacancyRisk * 100).toFixed(1)}%` : "3.5%"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        id={`toggle-rent-btn-${activePlot.id}`}
                        onClick={() => {
                          const rateMult = selectedTerm === 3 ? 1.25 : selectedTerm === 7 ? 1.00 : selectedTerm === 30 ? 0.85 : 0.90;
                          onToggleRent && onToggleRent(activePlot.id, selectedTerm, rateMult);
                        }}
                        className={`shrink-0 cursor-pointer text-[10.5px] font-black tracking-widest uppercase px-4 py-2.5 rounded-lg transition active:translate-y-0.5 shadow-md ${
                          activePlot.isRented
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-305 border border-zinc-700'
                            : activePlot.house.type === 'hotel'
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 font-extrabold'
                              : 'bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold'
                        }`}
                      >
                        {activePlot.isRented 
                          ? (activePlot.house.type === 'hotel' ? (language === 'en' ? "Close Entry" : "收回自享") : (language === 'en' ? "Reclaim Use" : "收回自住"))
                          : (activePlot.house.type === 'hotel' ? (language === 'en' ? "Open Booking" : "对外应召") : (language === 'en' ? "Sign Lease" : "长期出租"))
                        }
                      </button>
                    </div>

                    {/* SELECTOR FOR LEASE DURATION (If not currently rented) */}
                    {!activePlot.isRented && (
                      <div className="pt-2 border-t border-zinc-850/80">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5 block">
                          {language === 'en' ? "Select Lease Duration:" : "选择租约/营业宿期："}
                        </span>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {[
                            { days: 3, label_en: "3 Days Airbnb", label_zh: "3天短租 (1.25x)", mult: 1.25, icon: "🏨" },
                            { days: 7, label_en: "7 Days Vacation", label_zh: "7天中合约 (1.0x)", mult: 1.00, icon: "📅" },
                            { days: 30, label_en: "30 Days Lease", label_zh: "30天长合约 (0.85x)", mult: 0.85, icon: "📜" },
                            { days: -1, label_en: "Continuous Rent", label_zh: "自动长租代管 (0.9x)", mult: 0.90, icon: "🔄" }
                          ].map((opt) => (
                            <button
                              key={opt.days}
                              type="button"
                              onClick={() => setSelectedTerm(opt.days)}
                              className={`p-2 rounded-xl border text-left transition select-none cursor-pointer ${
                                selectedTerm === opt.days 
                                  ? 'bg-indigo-950/40 border-indigo-500 text-zinc-100 shadow-sm' 
                                  : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs font-black flex items-center gap-1">
                                <span className="opacity-90">{opt.icon}</span>
                                <span>{language==='en' ? (opt.days === -1 ? 'Infinite' : `${opt.days} Days`) : (opt.days === -1 ? '无限期' : `${opt.days}天`)}</span>
                              </div>
                              <div className="text-[9.5px] opacity-75 mt-0.5">
                                {language === 'en' ? `${opt.mult}x Yield` : `收益率 ${opt.mult}x`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* CONTROL AND ACTIONS BUTTONS FOR PLOT */}
            <div className="space-y-4">
              
              {/* IF NOT OWNED: INVESTMENT DECISION */}
              {!activePlot.owned ? (
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-100">{t.buyLandBtn}</h3>
                    <p className="text-xs text-zinc-400">
                      {language === "en" 
                        ? `Secure permanent ownership of this land for $${activePlot.price.toLocaleString()} to build estates.`
                        : `出资 $${activePlot.price.toLocaleString()} 全款购得此块城市土地以开工盖楼。`}
                    </p>
                  </div>

                  <button
                    id="buy-land-action-btn"
                    onClick={() => onBuyLand(activePlot.id)}
                    disabled={stats.money < activePlot.price}
                    className="cursor-pointer w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 text-black font-extrabold text-xs px-5 py-2.5 rounded-lg transition shadow-md shrink-0 border border-yellow-600"
                  >
                    <span>{t.buyLandBtn}</span>
                  </button>
                </div>
              ) : (
                /* IF OWNED: BUILDING & FURNITURE PANELS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* BLUEPRINT ERECTION */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hammer size={14} className="text-indigo-400" />
                      <span>{t.blueprintTitle}</span>
                    </h4>

                    {activePlot.house.built ? (
                      <div className="bg-zinc-950 p-4 rounded border border-zinc-850 text-center space-y-1.5 py-6">
                        <Home size={22} className="text-emerald-400 mx-auto" />
                        <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider leading-none mt-1">{t.builtStatus}: {activePlot.house.type.toUpperCase()}</h5>
                        <p className="text-[10.5px] text-zinc-500 leading-normal max-w-[220px] mx-auto">
                          {language === 'en' 
                            ? "Structure is finalized. Upgrade renovation or pick high-end furniture items below!" 
                            : "地基盖楼主体施工完成。您可以升级室内硬装或购买奢华软装。"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {BLUEPRINTS.map((bp) => {
                          const metSkill = stats.skills.construction >= bp.reqConstruction;
                          const affordable = stats.money >= bp.cost;
                          return (
                            <div
                              key={bp.id}
                              id={`blueprint-row-${bp.id}`}
                              className="bg-zinc-955 border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-zinc-200">{language === 'en' ? bp.name_en : bp.name_zh}</div>
                                <div className="text-[10px] text-zinc-500">
                                  {language === 'en' ? `Req Construction Lvl ${bp.reqConstruction}` : `需建造等级 ${bp.reqConstruction}`}
                                  {" "}|{" "}
                                  <span className="text-pink-400 flex-inline items-center font-semibold">Happiness +{bp.happinessBonus}</span>
                                </div>
                              </div>

                              <button
                                id={`build-house-btn-${bp.id}`}
                                disabled={!metSkill || !affordable}
                                onClick={() => onBuildBlueprint(activePlot.id, bp.id)}
                                className="cursor-pointer shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-zinc-100 font-bold text-[10px] py-1 px-2.5 rounded transition"
                              >
                                ${bp.cost}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ROOM OR FURNITURE RENOVATION SHOP */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Paintbrush size={14} className="text-indigo-400" />
                      <span>{t.renovateTitle}</span>
                    </h4>

                    {activePlot.house.built ? (
                      <div className="space-y-3">
                        {/* Renovation hard upgrade button */}
                        <button
                          id="renovate-hard-wood-btn"
                          disabled={activePlot.house.renovationLevel >= 100 || stats.money < 400}
                          onClick={() => onRenovateHouse(activePlot.id)}
                          className="w-full cursor-pointer bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 p-2.5 rounded-lg flex justify-between items-center transition-all disabled:opacity-45"
                        >
                          <div className="text-left text-xs max-w-sm">
                            <span className="font-bold block text-zinc-200">{language === 'en' ? 'Hard Renovation upgrade' : '全功能硬装工艺优化'}</span>
                            <span className="text-[10px] text-emerald-400 block mt-0.5">+$400 | +15% Renovation, +5 Happiness</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-yellow-500 shrink-0">$400</span>
                        </button>

                        {/* Soft Furnitures lists */}
                        <div className="space-y-1.5">
                          <span className="text-[9.5px] uppercase font-bold text-zinc-500 tracking-wider block">{t.buyFurniture}</span>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {FURNITURE_STORE.map((furniture) => {
                              const alreadyOwnedVal = activePlot.house.furnituresOwned.includes(furniture.id);
                              const affordable = stats.money >= furniture.cost;

                              return (
                                <div
                                  key={furniture.id}
                                  id={`furniture-row-${furniture.id}`}
                                  className="bg-zinc-950 p-2 rounded flex items-center justify-between gap-3 text-[11px]"
                                >
                                  <div className="flex items-center gap-2 select-none">
                                    {renderFurnitureIcon(furniture.icon, "text-zinc-400")}
                                    <div>
                                      <span className="font-semibold block text-zinc-300">{language === 'en' ? furniture.name_en : furniture.name_zh}</span>
                                      <span className="text-[9.5px] text-zinc-500 block">
                                        {language === 'en' ? `+${furniture.happinessBonus} Hap, +${furniture.energyBonus} Energ` : `永久 +${furniture.happinessBonus} 幸福, +${furniture.energyBonus} 睡觉精力`}
                                      </span>
                                    </div>
                                  </div>

                                  {alreadyOwnedVal ? (
                                    <span className="text-[9.5px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900">
                                      {language === 'en' ? 'Equipped' : '已配置'}
                                    </span>
                                  ) : (
                                    <button
                                      id={`buy-furniture-btn-${furniture.id}`}
                                      disabled={!affordable}
                                      onClick={() => onBuyFurniture(activePlot.id, furniture)}
                                      className="cursor-pointer shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-[9.5px] py-1 px-2.5 rounded transition"
                                    >
                                      ${furniture.cost}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-zinc-500 text-xs font-sans text-center py-8">
                        {language === 'en' ? 'Must construct a house first to initiate decoration!' : '请先立地起家建造完一栋房子，方可精修软装。'}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="text-zinc-500 text-xs text-center py-10">Select a plot to view.</div>
        )}
      </div>

    </motion.div>
  );
};
