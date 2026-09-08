import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface DigitalOdometerProps {
  digits: string[];
  totalScrolls: number;
  hasNewScroll: boolean;
  activeMilestone: string | null;
}

export const DigitalOdometer: React.FC<DigitalOdometerProps> = ({
  digits,
  totalScrolls,
  hasNewScroll,
  activeMilestone,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      {/* Background ambient illumination */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#533B87]/10 dark:bg-[#533B87]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Odómetro de Scroll
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Palancazos acumulados en vivo</p>
          </div>
        </div>

        {activeMilestone && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-[#FBBF24]/20 border border-amber-300 dark:border-[#FBBF24]/40 text-amber-800 dark:text-[#FBBF24] text-[10px] font-bold animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>{activeMilestone}</span>
          </div>
        )}
      </div>

      {/* Odometer Digit Reels */}
      <div className="my-2 flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#080D1A]/90 p-4 rounded-xl border border-slate-700 dark:border-[#D6C8FA]/15 shadow-inner">
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className={`w-12 h-16 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 dark:from-[#131B30] dark:to-[#080D1A] border ${
              hasNewScroll && idx === digits.length - 1
                ? 'border-[#C2F4E7] shadow-[0_0_15px_rgba(194,244,231,0.5)]'
                : 'border-slate-700 dark:border-[#533B87]/40'
            } flex items-center justify-center relative overflow-hidden transition-all duration-300`}
          >
            {/* Specular horizontal highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40" />

            <span
              key={`${idx}-${digit}`}
              className={`text-3xl font-mono font-bold tracking-tight ${
                hasNewScroll && idx === digits.length - 1
                  ? 'text-[#C2F4E7] scale-110'
                  : 'text-[#EBF1F5]'
              } transition-transform duration-200`}
            >
              {digit}
            </span>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
        <span>Fórmula: Skinner VR-7</span>
        <span className="font-mono text-[#533B87] dark:text-[#D6C8FA] font-bold">Total: {totalScrolls} impulsos</span>
      </div>
    </div>
  );
};
