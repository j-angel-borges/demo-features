import React from 'react';
import { Palette, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react';
import type { IslandAggregateStats } from '../../types';

interface GenerativeStyleComparisonProps {
  stats: IslandAggregateStats;
}

export const GenerativeStyleComparison: React.FC<GenerativeStyleComparisonProps> = ({ stats }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Transformación Generativa Visual
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60">
              Comparativa Side-by-Side (Cámara Real vs Render IA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#C2F4E7]/15 border border-emerald-300 dark:border-[#C2F4E7]/30 text-[#1B6E5E] dark:text-[#C2F4E7] text-[10px] font-bold">
          <Zap className="w-3 h-3 text-[#1B6E5E] dark:text-[#C2F4E7]" />
          <span>{stats.averageLatencyMs}ms Latencia</span>
        </div>
      </div>

      {/* Dual Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
        {/* Original Frame */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 h-40 group shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=80"
            alt="Original Camera Snapshot"
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-sky-400" />
            Fotograma Real
          </div>
          <div className="absolute bottom-2 inset-x-2 p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-sm text-[10px] text-white/90 font-medium truncate">
            Escena: Mesa de trabajo & laboratorio escolar
          </div>
        </div>

        {/* AI Stylized Render */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 dark:bg-[#080D1A] border border-emerald-300 dark:border-[#C2F4E7]/40 h-40 group shadow-md">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80"
            alt="AI Generative Render"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#533B87] backdrop-blur-md border border-violet-300 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
            <Palette className="w-3 h-3 text-[#C2F4E7]" />
            Estilo: {stats.lastGenerativeStyle ? stats.lastGenerativeStyle.toUpperCase() : 'CÓMIC'}
          </div>
          <div className="absolute bottom-2 inset-x-2 p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-sm text-[10px] text-[#C2F4E7] font-bold truncate flex items-center justify-between">
            <span>Gemini 2.0 Flash Vision</span>
            <span className="font-mono text-[9px] text-[#D6C8FA]">Prompt Sub-800ms</span>
          </div>
        </div>
      </div>

      {/* Metadata pill */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 mt-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10">
        <span className="flex items-center gap-1 text-[#533B87] dark:text-[#D6C8FA] font-bold">
          <span>Modelo: Gemini 2.0 Flash Live</span>
        </span>
        <span className="text-[#1B6E5E] dark:text-[#C2F4E7] font-bold">thinkingBudget: 0 (Ultra Low Latency)</span>
      </div>
    </div>
  );
};
