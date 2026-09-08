import React from 'react';
import type { DecayCurvePoint } from '../types/skinner.types.js';
import { Award, RotateCcw, BarChart3 } from 'lucide-react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onRestart: () => void;
  totalScrolls: number;
  completedItemsCount: number;
  averageRetentionPct: number;
  velocityRpm: number;
  decayCurveData: DecayCurvePoint[];
  topicDistribution: Record<string, number>;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onRestart,
  totalScrolls,
  completedItemsCount,
  averageRetentionPct,
  velocityRpm,
  decayCurveData,
  topicDistribution,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-[#D6C8FA]/40 dark:border-lavanda/30 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-full bg-violet-100 dark:bg-purpura/40 border border-violet-200 dark:border-lavanda/30 text-[#533B87] dark:text-menta mb-1">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-glacial">Resumen de Sesión Skinner Box</h2>
          <p className="text-xs text-slate-600 dark:text-slate-muted font-medium">
            Telemetría de condicionamiento operante guardada en Firestore
          </p>
        </div>

        {/* 4-Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-[#080D1A]/80 rounded-2xl p-3 border border-slate-200 dark:border-white/10 flex flex-col gap-0.5 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-muted uppercase font-mono font-bold">Palancazos</span>
            <span className="text-2xl font-mono font-extrabold text-[#533B87] dark:text-menta">{totalScrolls}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-muted">Scrolls acumulados</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#080D1A]/80 rounded-2xl p-3 border border-slate-200 dark:border-white/10 flex flex-col gap-0.5 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-muted uppercase font-mono font-bold">Retención Media</span>
            <span className="text-2xl font-mono font-extrabold text-[#1B6E5E] dark:text-lavanda">{averageRetentionPct}%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-muted">Tiempo visualizado</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#080D1A]/80 rounded-2xl p-3 border border-slate-200 dark:border-white/10 flex flex-col gap-0.5 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-muted uppercase font-mono font-bold">Completados</span>
            <span className="text-2xl font-mono font-extrabold text-amber-700 dark:text-amberJackpot">{completedItemsCount}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-muted">Videos 100% vistos</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#080D1A]/80 rounded-2xl p-3 border border-slate-200 dark:border-white/10 flex flex-col gap-0.5 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-muted uppercase font-mono font-bold">Velocidad</span>
            <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-glacial">{velocityRpm} <span className="text-xs font-normal text-slate-500 dark:text-slate-muted">RPM</span></span>
            <span className="text-[10px] text-slate-500 dark:text-slate-muted">Frecuencia de consumo</span>
          </div>
        </div>

        {/* Mini SVG Decay Curve Visualization */}
        <div className="bg-slate-50 dark:bg-[#080D1A]/80 rounded-2xl p-3.5 border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-muted font-mono">
            <span className="flex items-center gap-1 text-slate-900 dark:text-glacial font-bold">
              <BarChart3 className="w-3.5 h-3.5 text-[#533B87] dark:text-menta" /> Curva de Decaimiento Temporal
            </span>
            <span className="font-bold">45s → 5s</span>
          </div>

          <div className="h-28 w-full bg-slate-900 dark:bg-dark/60 rounded-xl p-2 flex items-end relative overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
            {decayCurveData.length > 0 ? (
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />

                {/* Polyline connecting points */}
                <polyline
                  fill="none"
                  stroke="#D6C8FA"
                  strokeWidth="2.5"
                  points={decayCurveData
                    .map((p, idx) => {
                      const x = (idx / Math.max(1, decayCurveData.length - 1)) * 100;
                      // Nominal duration mapped 0..50s to 100..0
                      const y = 100 - (p.nominalDurationSeconds / 50) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Point markers */}
                {decayCurveData.map((p, idx) => {
                  const x = (idx / Math.max(1, decayCurveData.length - 1)) * 100;
                  const y = 100 - (p.nominalDurationSeconds / 50) * 100;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={p.isJackpot ? 4.5 : 3}
                      fill={p.isJackpot ? '#FBBF24' : '#C2F4E7'}
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Sin datos de decaimiento registrados
              </div>
            )}
          </div>
        </div>

        {/* Topic Distribution Breakdown */}
        {Object.keys(topicDistribution).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-600 dark:text-slate-muted uppercase font-mono font-bold">Temas Consumidos</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(topicDistribution).map(([topic, count]) => (
                <span
                  key={topic}
                  className="bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 dark:text-glacial border border-slate-200 dark:border-white/10 flex items-center gap-1.5 font-semibold"
                >
                  <span>{topic}</span>
                  <span className="font-mono font-bold text-[#533B87] dark:text-menta">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-2xl bg-[#533B87] hover:bg-[#44326E] text-white font-bold text-sm border border-violet-300 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#C2F4E7]" />
          <span>Iniciar Nueva Sesión</span>
        </button>
      </div>
    </div>
  );
};
