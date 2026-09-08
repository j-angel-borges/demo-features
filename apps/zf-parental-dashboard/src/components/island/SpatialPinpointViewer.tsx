import React from 'react';
import { Crosshair, Volume2, Sparkles, Target } from 'lucide-react';
import type { IslandAggregateStats } from '../../types';

interface SpatialPinpointViewerProps {
  stats: IslandAggregateStats;
}

export const SpatialPinpointViewer: React.FC<SpatialPinpointViewerProps> = ({ stats }) => {
  const coords = stats.lastTouchCoordinates || { x: 0.42, y: 0.68 };
  const posX = `${(coords.x * 100).toFixed(0)}%`;
  const posY = `${(coords.y * 100).toFixed(0)}%`;

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-[#C2F4E7]/20 border border-emerald-200 dark:border-[#C2F4E7]/30 text-[#1B6E5E] dark:text-[#C2F4E7]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Visor Espacial Touch-to-Explain
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60">
              Coordenadas de toque del menor & reconocimiento IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA] text-[10px] font-mono font-bold">
          <Crosshair className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7]" />
          <span>X: {posX}, Y: {posY}</span>
        </div>
      </div>

      {/* Frame Snapshot with Interactive Crosshair */}
      <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-900 dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 group shadow-inner">
        <img
          src={stats.lastSnapshotUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
          alt="Captura de Cámara Isla Dinámica"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

        {/* Animated Target Crosshair at (X, Y) */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: posX, top: posY }}
        >
          {/* Pulsing Ripple Rings */}
          <div className="w-14 h-14 rounded-full border-2 border-[#C2F4E7] animate-ping opacity-60 absolute -inset-3" />
          <div className="w-8 h-8 rounded-full border border-[#D6C8FA] bg-[#533B87]/60 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(194,244,231,0.8)]">
            <Crosshair className="w-5 h-5 text-[#C2F4E7]" />
          </div>

          {/* Coordinate Tag Bubble */}
          <div className="absolute top-9 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/95 border border-[#C2F4E7] text-[#C2F4E7] text-[10px] font-mono whitespace-nowrap shadow-lg">
            {stats.lastDetectedObject}
          </div>
        </div>

        {/* Camera Overlay Mode Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-white/20 text-[10px] text-white font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Fotograma Congelado (60fps)
        </div>
      </div>

      {/* AI Grounded Explanation Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D1A]/75 border border-slate-200 dark:border-[#D6C8FA]/15 mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#533B87] dark:text-[#C2F4E7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
            Objeto: {stats.lastDetectedObject || 'Microscopio Óptico Monocular'}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-[#533B87]/30 text-[#533B87] dark:text-[#D6C8FA] text-[10px] font-bold border border-violet-200 dark:border-[#D6C8FA]/20">
            <Volume2 className="w-3 h-3 text-[#533B87] dark:text-[#C2F4E7]" />
            <span>Voz Sintetizada</span>
          </div>
        </div>
        <p className="text-xs text-slate-700 dark:text-[#EBF1F5]/80 leading-relaxed">
          {stats.lastExplanation || 'Este instrumento óptico permite ampliar muestras biológicas hasta 400 veces usando un sistema de lentes refractarias.'}
        </p>
      </div>
    </div>
  );
};
