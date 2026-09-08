import React from 'react';
import { Palette, HelpCircle, Wrench, Camera, Radio } from 'lucide-react';
import type { IslandAggregateStats } from '../../types';

interface ToolBreakdownCardsProps {
  stats: IslandAggregateStats;
}

export const ToolBreakdownCards: React.FC<ToolBreakdownCardsProps> = ({ stats }) => {
  const getCameraModeLabel = (mode: string) => {
    switch (mode) {
      case 'dual_bereal':
        return 'Dual BeReal (PiP)';
      case 'user':
        return 'Cámara Frontal (User)';
      case 'environment':
      default:
        return 'Cámara Trasera (Ambiente)';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Landscape Stylizer */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Palette className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-[#533B87]/30 text-[#533B87] dark:text-[#D6C8FA] border border-violet-200 dark:border-[#D6C8FA]/20">
            Icono Paisaje
          </span>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-[#EBF1F5]">
            {stats.landscapeCount} <span className="text-xs font-normal text-slate-500 dark:text-[#D6C8FA]/80">usos</span>
          </div>
          <div className="text-xs font-bold text-[#533B87] dark:text-[#D6C8FA] mt-0.5">
            Estilos Generativos
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 mt-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10 flex items-center justify-between">
          <span>Último estilo:</span>
          <span className="text-[#533B87] dark:text-[#C2F4E7] font-bold capitalize">{stats.lastGenerativeStyle || 'Cómic'}</span>
        </div>
      </div>

      {/* 2. Touch-to-Explain */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-[#C2F4E7]/20 border border-emerald-200 dark:border-[#C2F4E7]/40 text-[#1B6E5E] dark:text-[#C2F4E7]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#C2F4E7]/15 text-[#1B6E5E] dark:text-[#C2F4E7] border border-emerald-200 dark:border-[#C2F4E7]/30">
            Icono Interrogación
          </span>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-[#EBF1F5]">
            {stats.touchExplainCount} <span className="text-xs font-normal text-slate-500 dark:text-[#D6C8FA]/80">consultas</span>
          </div>
          <div className="text-xs font-bold text-[#1B6E5E] dark:text-[#C2F4E7] mt-0.5">
            Touch-to-Explain
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 mt-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10 flex items-center justify-between">
          <span>Último objeto:</span>
          <span className="text-slate-900 dark:text-[#EBF1F5] font-bold truncate max-w-[110px]">{stats.lastDetectedObject || 'Microscopio'}</span>
        </div>
      </div>

      {/* 3. Scene Redesign */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-[#FBBF24]/20 border border-amber-200 dark:border-[#FBBF24]/40 text-amber-800 dark:text-[#FBBF24]">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-[#FBBF24]/15 text-amber-800 dark:text-[#FBBF24] border border-amber-200 dark:border-[#FBBF24]/30">
            Icono Herramienta
          </span>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-[#EBF1F5]">
            {stats.sceneRedesignCount} <span className="text-xs font-normal text-slate-500 dark:text-[#D6C8FA]/80">propuestas</span>
          </div>
          <div className="text-xs font-bold text-amber-800 dark:text-[#FBBF24] mt-0.5">
            Rediseño Espacial
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 mt-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10 flex items-center justify-between">
          <span>Deliberación:</span>
          <span className="text-amber-800 dark:text-[#FBBF24] font-bold">2 Opciones 3D</span>
        </div>
      </div>

      {/* 4. Live Camera & Stream Mode */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-[#38BDF8]/20 border border-sky-200 dark:border-[#38BDF8]/40 text-sky-800 dark:text-[#38BDF8]">
            <Camera className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-[#34D399] font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>En Línea</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-[#EBF1F5] truncate">
            {getCameraModeLabel(stats.cameraMode)}
          </div>
          <div className="text-xs font-bold text-sky-800 dark:text-[#38BDF8] mt-0.5">
            Stream de Cámara Activo
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 mt-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10 flex items-center justify-between">
          <span>Latencia Gemini:</span>
          <span className="text-[#1B6E5E] dark:text-[#C2F4E7] font-mono font-bold">{stats.averageLatencyMs}ms</span>
        </div>
      </div>
    </div>
  );
};
