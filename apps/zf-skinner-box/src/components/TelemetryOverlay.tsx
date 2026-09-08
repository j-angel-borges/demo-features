import React from 'react';
import type { DopamineState, SkinnerVideoItem } from '../types/skinner.types.js';
import { ChevronUp, Award, Zap, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

interface TelemetryOverlayProps {
  item: SkinnerVideoItem;
  totalScrolls: number;
  completedItemsCount: number;
  averageRetentionPct: number;
  activeElapsedSeconds: number;
  activeRetentionPct: number;
  dopamineState: DopamineState;
  showJackpotBanner: boolean;
  onManualScroll: () => void;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  item,
  totalScrolls,
  completedItemsCount,
  averageRetentionPct,
  activeElapsedSeconds,
  activeRetentionPct,
  dopamineState,
  showJackpotBanner,
  onManualScroll,
}) => {
  const nominalDuration = item.nominalDurationSeconds || 45;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Jackpot Banner */}
      <div className="mt-14 flex justify-center w-full">
        {showJackpotBanner && (
          <div className="zentry-jackpot-shimmer rounded-2xl px-5 py-3 flex items-center gap-3 animate-bounce shadow-2xl pointer-events-auto">
            <Sparkles className="w-6 h-6 text-amberJackpot animate-spin" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-menta">
                ¡RECOMPENSA DE RAZÓN VARIABLE VR-7!
              </div>
              <div className="text-sm font-extrabold text-white">
                ⭐ Jackpot Activado: Formato Largo de Alto Valor
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Right Dopamine State Capsule */}
      <div className="absolute right-3 top-24 flex flex-col items-end gap-2">
        <div className="bg-slate-900/90 rounded-xl px-3 py-2 border border-violet-400/30 flex flex-col items-end gap-1 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            {dopamineState === 'jackpot' && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            {dopamineState === 'hyper_fragmented' && <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
            {dopamineState === 'accelerated' && <Zap className="w-3.5 h-3.5 text-[#D6C8FA]" />}
            {dopamineState === 'baseline' && <Award className="w-3.5 h-3.5 text-[#C2F4E7]" />}

            <span className="text-[10px] font-bold uppercase tracking-wide text-white">
              {dopamineState === 'jackpot' && 'Jackpot VR-7'}
              {dopamineState === 'hyper_fragmented' && 'Micro-Ráfaga'}
              {dopamineState === 'accelerated' && 'Aceleración'}
              {dopamineState === 'baseline' && 'Profundidad'}
            </span>
          </div>

          <div className="text-[11px] font-mono text-violet-200 font-medium">
            Duración: <span className="font-bold text-white">{nominalDuration}s</span>
          </div>
        </div>

        {/* Live Odometer & Completed Counts */}
        <div className="bg-slate-900/90 rounded-xl px-3 py-2 border border-white/20 flex flex-col gap-1 items-end shadow-xl backdrop-blur-md">
          <div className="text-[10px] text-slate-300 uppercase font-mono font-bold">Palancazos (Scrolls)</div>
          <div className="text-lg font-mono font-extrabold text-[#C2F4E7] flex items-baseline gap-1">
            {totalScrolls} <span className="text-[10px] text-slate-300 font-normal">veces</span>
          </div>

          <div className="h-[1px] w-full bg-white/20 my-0.5" />

          <div className="flex items-center justify-between gap-3 w-full text-[10px] text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-[#C2F4E7]" /> 100% vistos:
            </span>
            <span className="font-mono font-bold text-white">{completedItemsCount}</span>
          </div>

          <div className="flex items-center justify-between gap-3 w-full text-[10px] text-slate-300">
            <span className="font-medium">Retención Media:</span>
            <span className="font-mono font-bold text-[#D6C8FA]">{averageRetentionPct}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Content Information Card & Lever Gesture Control */}
      <div className="space-y-3 pointer-events-auto">
        {/* Content Metadata Card */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/20 shadow-2xl max-w-lg mx-auto backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-950 font-mono shadow-xs"
              style={{ backgroundColor: item.accentColor }}
            >
              {item.topic}
            </span>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <span>{activeElapsedSeconds.toFixed(1)}s</span>
              <span>/</span>
              <span className="text-white font-bold">{nominalDuration}s</span>
            </div>
          </div>

          <h2 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-2">
            {item.title}
          </h2>

          <p className="text-xs text-violet-200 mt-1 font-normal leading-relaxed">
            {item.narrativeHook}
          </p>

          {/* Retention Progress Rail */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mb-1">
              <span className="font-medium">Retención en curso</span>
              <span className="font-bold text-[#C2F4E7]">{activeRetentionPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/20 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_8px_#C2F4E7]"
                style={{
                  width: `${activeRetentionPct}%`,
                  backgroundColor: activeRetentionPct >= 100 ? '#C2F4E7' : item.accentColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating Lever Pull Button / Hint */}
        <div className="flex justify-center">
          <button
            onClick={onManualScroll}
            className="bg-slate-900/90 rounded-full px-5 py-2 flex items-center gap-2 border border-violet-400/30 text-xs font-medium text-white shadow-xl hover:bg-slate-800 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <ChevronUp className="w-4 h-4 text-[#C2F4E7] animate-bounce" />
            <span className="font-mono text-slate-300">Desliza o pulsa para</span>
            <span className="font-bold text-[#D6C8FA]">Palancazo Operante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
