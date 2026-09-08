import React from 'react';
import { Eye, Radio, Sparkles } from 'lucide-react';
import { useLiveIsland } from '../../hooks/useLiveIsland';
import { ToolBreakdownCards } from './ToolBreakdownCards';
import { SpatialPinpointViewer } from './SpatialPinpointViewer';
import { GenerativeStyleComparison } from './GenerativeStyleComparison';
import { MultimodalConversationLog } from './MultimodalConversationLog';

export const IslandObservador: React.FC = () => {
  const { events, stats, isLive } = useLiveIsland();

  return (
    <div className="space-y-4">
      {/* Island Live Header */}
      <div className="glass-panel rounded-2xl p-4 border border-[#D6C8FA]/60 dark:border-[#533B87]/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0284C7] dark:bg-[#38BDF8] animate-ping absolute inset-0" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#0284C7] dark:bg-[#38BDF8] relative flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EBF1F5] tracking-wide flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#533B87] dark:text-[#38BDF8]" />
                <span>Observador de Isla Dinámica Multimodal</span>
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-sky-100 dark:bg-[#38BDF8]/20 border border-sky-300 dark:border-[#38BDF8]/30 text-sky-800 dark:text-[#38BDF8]">
                Gemini 2.0 Flash Live
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#D6C8FA]/80">
              Telemetría de visión computacional, acciones de esquina y voz interactiva sub-800ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/20 flex items-center gap-2">
            <span className="text-slate-500 dark:text-[#EBF1F5]/60 font-medium">Cámara:</span>
            <span className="text-[#533B87] dark:text-[#C2F4E7] font-bold capitalize">{stats.cameraMode.replace('_', ' ')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#080D1A]/80 border border-emerald-200 dark:border-[#D6C8FA]/20 flex items-center gap-2">
            <span className="text-slate-500 dark:text-[#EBF1F5]/60 font-medium">Agente:</span>
            <span className="text-[#1B6E5E] dark:text-[#34D399] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Conectado
            </span>
          </div>
        </div>
      </div>

      {/* 4 Tool Breakdown Metric Cards */}
      <ToolBreakdownCards stats={stats} />

      {/* Spatial Pinpoint & Generative Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpatialPinpointViewer stats={stats} />
        <GenerativeStyleComparison stats={stats} />
      </div>

      {/* Multimodal Conversation Log */}
      <MultimodalConversationLog events={events} />
    </div>
  );
};
