import React from 'react';
import { MessageSquare, Bot, User, Mic, Radio } from 'lucide-react';
import type { IslandTelemetryEvent } from '@zentry/shared';

interface MultimodalConversationLogProps {
  events: IslandTelemetryEvent[];
}

export const MultimodalConversationLog: React.FC<MultimodalConversationLogProps> = ({ events }) => {
  const recentEvents = events.slice(0, 5);

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toTimeString().split(' ')[0];
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Registro Multimodal en Vivo
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-[#EBF1F5]/60">
              Intercambio de voz & visión entre el menor y Gemini 2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-800 dark:text-[#34D399] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#34D399]/10 border border-emerald-200 dark:border-[#34D399]/20">
          <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
          <span>Stream Audio Activo</span>
        </div>
      </div>

      {/* Transcript List */}
      <div className="space-y-3 my-1 max-h-72 overflow-y-auto pr-1">
        {recentEvents.map((e, idx) => (
          <div
            key={e.eventId || idx}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/15 space-y-2 hover:border-[#533B87]/40 dark:hover:border-[#D6C8FA]/30 transition-all duration-200 shadow-xs"
          >
            {/* Header / Timestamp */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#D6C8FA]/70 font-semibold">
              <span className="font-mono">{formatTime(e.timestamp)}</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-[#533B87]/30 border border-violet-200 dark:border-[#D6C8FA]/20 capitalize font-bold text-[#533B87] dark:text-[#C2F4E7]">
                {e.activeAction ? e.activeAction.replace('_', ' ') : 'Voz Interactiva'}
              </span>
            </div>

            {/* Child Input */}
            {e.aiPrompt && (
              <div className="flex items-start gap-2 text-xs">
                <div className="p-1 rounded bg-violet-200 dark:bg-[#533B87]/40 text-[#533B87] dark:text-[#D6C8FA] shrink-0 mt-0.5">
                  <User className="w-3 h-3" />
                </div>
                <div className="text-slate-900 dark:text-[#EBF1F5]/90">
                  <span className="text-[10px] font-bold text-[#533B87] dark:text-[#D6C8FA] block">Mateo:</span>
                  {e.aiPrompt}
                </div>
              </div>
            )}

            {/* Gemini Response */}
            {e.aiResponse && (
              <div className="flex items-start gap-2 text-xs bg-violet-50 dark:bg-[#533B87]/15 p-2.5 rounded-lg border border-violet-200 dark:border-[#533B87]/30">
                <div className="p-1 rounded bg-emerald-100 dark:bg-[#C2F4E7]/20 text-[#1B6E5E] dark:text-[#C2F4E7] shrink-0 mt-0.5">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="text-slate-800 dark:text-[#EBF1F5]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1B6E5E] dark:text-[#C2F4E7]">
                    <span>Gemini 2.0 Flash:</span>
                    <Mic className="w-2.5 h-2.5 text-[#1B6E5E] animate-pulse" />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-700 dark:text-[#EBF1F5]/85 leading-relaxed font-normal">
                    {e.aiResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[#EBF1F5]/60 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/10">
        <span>Síntesis de voz en español (IA Live)</span>
        <span className="text-[#533B87] dark:text-[#D6C8FA] font-bold">{recentEvents.length} interacciones recientes</span>
      </div>
    </div>
  );
};
