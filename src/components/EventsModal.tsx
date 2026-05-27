import React from "react";
import { AlertTriangle, Sparkles, HelpCircle } from "lucide-react";
import { GameEvent, PlayerStats, Company, LandPlot, Language } from "../types";
import { i18n } from "../i18n";
import { motion, AnimatePresence } from "motion/react";

interface EventsModalProps {
  event: GameEvent | null;
  language: Language;
  stats: PlayerStats;
  company: Company;
  plots: LandPlot[];
  onResolve: (effectFn: (stats: PlayerStats, company: Company, plots: LandPlot[]) => {
    stats: PlayerStats;
    company: Company;
    plots: LandPlot[];
    log_en: string;
    log_zh: string;
  }) => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  event,
  language,
  stats,
  company,
  plots,
  onResolve
}) => {
  if (!event) return null;
  const t = i18n[language];

  return (
    <AnimatePresence>
      <div id="event-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          id="event-modal-box"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900 border border-zinc-750 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Visual Alert Top Strip indicator */}
          <div className="bg-gradient-to-r from-amber-600 to-indigo-600 h-2 w-full shrink-0" />

          {/* Modal Header */}
          <div className="p-6 pb-2 flex items-center gap-3 select-none">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg shrink-0">
              <Sparkles size={20} className="animate-spin-slow" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-extrabold text-amber-500 tracking-wider">
                {language === 'en' ? 'Decision Required' : '紧急突发事件决策'}
              </span>
              <h2 className="text-lg font-black text-zinc-100 font-sans tracking-tight">
                {language === 'en' ? event.title_en : event.title_zh}
              </h2>
            </div>
          </div>

          {/* Modal Description */}
          <div className="p-6 py-4 space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed font-sans font-medium">
              {language === 'en' ? event.desc_en : event.desc_zh}
            </p>

            {/* List options choice buttons */}
            <div className="space-y-3 pt-2">
              {event.options.map((opt, idx) => {
                return (
                  <button
                    key={idx}
                    id={`event-option-${idx}`}
                    onClick={() => onResolve(opt.effect)}
                    className="w-full cursor-pointer text-left p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 hover:border-zinc-700 transition duration-150 active:translate-y-0.5"
                  >
                    <div className="flex gap-2 text-xs font-bold text-zinc-300">
                      <span className="text-amber-500 font-mono font-extrabold select-none">[{idx + 1}]</span>
                      <p className="text-zinc-100 tracking-tight leading-relaxed">
                        {language === 'en' ? opt.text_en : opt.text_zh}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer warning */}
          <div className="bg-zinc-950 px-6 py-3.5 border-t border-zinc-850 flex items-start gap-2 select-none">
            <AlertTriangle className="text-zinc-600 shrink-0 mt-0.5" size={14} />
            <p className="text-[10px] text-zinc-500 leading-normal">
              {language === 'en' 
                ? "Effects resolve instantly on confirm. Choose wisely according to cash reserves or available skills."
                : "决议选择当场生效并引发关联变化。请权衡个人现金与技能积累做出审慎选择。"}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
