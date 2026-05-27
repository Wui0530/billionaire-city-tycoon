import React from "react";
import { Coins, Zap, Heart, Smile, Calendar, Globe, BookOpen } from "lucide-react";
import { PlayerStats, Language } from "../types";
import { i18n } from "../i18n";

interface StatsBarProps {
  stats: PlayerStats;
  language: Language;
  onLanguageToggle: () => void;
  onAdvanceDay: (days: number) => void;
  isProcessing: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  language,
  onLanguageToggle,
  onAdvanceDay,
  isProcessing,
}) => {
  const t = i18n[language];

  // Helper values
  const getDegreeText = (edu: string) => {
    switch (edu) {
      case "high_school": return t.high_school;
      case "bachelor": return t.bachelor;
      case "master": return t.master;
      case "phd": return t.phd;
      default: return edu;
    }
  };

  return (
    <div id="stats-header" className="sticky top-0 z-40 bg-zinc-900/90 border-b border-zinc-800 text-zinc-100 backdrop-blur-md px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Language Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-zinc-950 font-sans shadow-md shadow-emerald-900/30">
              EB
            </div>
            <div>
              <h1 className="text-md font-bold text-zinc-100 tracking-tight leading-tight">{t.title}</h1>
              <div className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                <BookOpen size={12} />
                <span>{getDegreeText(stats.education)}</span>
              </div>
            </div>
          </div>
          
          <button
            id="lang-toggle-btn"
            onClick={onLanguageToggle}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium border border-zinc-700 transition cursor-pointer text-zinc-300"
          >
            <Globe size={13} className="text-emerald-400" />
            <span>{language === 'en' ? '中文' : 'English'}</span>
          </button>
        </div>

        {/* Player Core Indicators */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center">
          {/* Cash */}
          <div id="stat-indicator-cash" className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 min-w-[120px]">
            <Coins size={16} className="text-yellow-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold font-sans tracking-wide leading-none">{t.cash}</span>
              <span className="text-md font-bold text-yellow-300 font-mono leading-tight mt-0.5">
                ${stats.money.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Energy */}
          <div id="stat-indicator-energy" className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 min-w-[100px]">
            <Zap size={16} className="text-teal-400 shrink-0" />
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wide leading-none gap-2">
                <span>{t.energy}</span>
                <span className="font-mono text-teal-300">{stats.energy}/100</span>
              </div>
              <div className="w-20 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    stats.energy < 25 ? 'bg-red-500' : 'bg-teal-500'
                  }`} 
                  style={{ width: `${stats.energy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Health */}
          <div id="stat-indicator-health" className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 min-w-[100px]">
            <Heart size={16} className="text-red-400 shrink-0" />
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wide leading-none gap-2">
                <span>{t.health}</span>
                <span className="font-mono text-red-300">{stats.health}/100</span>
              </div>
              <div className="w-20 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    stats.health < 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${stats.health}%` }}
                />
              </div>
            </div>
          </div>

          {/* Happiness */}
          <div id="stat-indicator-happiness" className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 min-w-[100px]">
            <Smile size={16} className="text-pink-400 shrink-0" />
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wide leading-none gap-2">
                <span>{t.happiness}</span>
                <span className="font-mono text-pink-300">{stats.happiness}/100</span>
              </div>
              <div className="w-20 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    stats.happiness < 25 ? 'bg-red-500' : 'bg-pink-500'
                  }`} 
                  style={{ width: `${stats.happiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Calendar Time Status */}
          <div id="stat-indicator-time" className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5">
            <Calendar size={16} className="text-indigo-400 shrink-0" />
            <div className="text-right font-mono flex gap-3 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">{t.year}</span>
                <span className="font-bold text-indigo-300">{stats.year}</span>
              </div>
              <div className="flex flex-col items-center border-l border-zinc-800 pl-3">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">{t.week}</span>
                <span className="font-bold text-indigo-300">{stats.week}</span>
              </div>
              <div className="flex flex-col items-center border-l border-zinc-800 pl-3">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">{t.day}</span>
                <span className="font-bold text-zinc-100">{stats.day}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advance Day Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="advance-day-1-btn"
            disabled={isProcessing}
            onClick={() => onAdvanceDay(1)}
            className="flex-1 md:flex-initial cursor-pointer bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 disabled:opacity-40 text-black py-2 px-3.5 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Zap size={13} className="fill-black text-black" />
            <span>{t.nextDayBtn}</span>
          </button>
          
          <button
            id="advance-day-5-btn"
            disabled={isProcessing}
            onClick={() => onAdvanceDay(5)}
            className="flex-1 md:flex-initial cursor-pointer bg-zinc-800 hover:bg-zinc-750 active:translate-y-0.5 border border-zinc-700 disabled:opacity-40 text-zinc-100 py-2 px-3.5 rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
          >
            <Calendar size={13} className="text-zinc-400" />
            <span>{t.nextDaysBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
