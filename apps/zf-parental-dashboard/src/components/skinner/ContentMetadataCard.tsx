import React from 'react';
import { Film, CheckCircle2, PieChart, Layers } from 'lucide-react';
import type { SkinnerSessionRecord } from '@zentry/shared';

interface ContentMetadataCardProps {
  session: SkinnerSessionRecord;
}

export const ContentMetadataCard: React.FC<ContentMetadataCardProps> = ({ session }) => {
  const topics = Object.entries(session.topicDistribution || {});
  const totalTopicPct = topics.reduce((sum, [, val]) => sum + val, 0) || 100;

  const getTopicColor = (index: number) => {
    const colors = ['#533B87', '#10B981', '#F59E0B', '#EF4444', '#0284C7'];
    return colors[index % colors.length];
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
              Contenido & Distribución Temática
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Metadatos del stream de estímulos</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#C2F4E7]/15 border border-emerald-300 dark:border-[#C2F4E7]/30 text-[#1B6E5E] dark:text-[#C2F4E7] text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{session.completedItemsCount} completados</span>
        </div>
      </div>

      {/* Active Content Pill */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D1A]/70 border border-slate-200 dark:border-[#D6C8FA]/15 mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#533B87] dark:text-[#D6C8FA] font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
            Ítem Activo: {session.activeContentId || 'Micro-Dopamine Loop #07'}
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            {session.activeElapsedSeconds}s / {session.activeNominalDuration}s
          </span>
        </div>
        <p className="text-[11px] text-slate-700 dark:text-slate-300">
          Modo: <span className="text-[#533B87] dark:text-[#C2F4E7] font-bold capitalize">{session.targetProfile || 'Niño'}</span> | Retención Media: <span className="text-[#533B87] dark:text-[#D6C8FA] font-bold font-mono">{session.averageRetentionPct}%</span>
        </p>
      </div>

      {/* Topic Distribution Stacked Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#533B87] dark:text-[#D6C8FA] mb-1.5 font-bold">
          <span className="flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5" />
            Distribución Temática Consumida
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-[#131B30] overflow-hidden flex gap-0.5 p-0.5 border border-slate-300 dark:border-[#D6C8FA]/10">
          {topics.map(([topic, pct], idx) => (
            <div
              key={topic}
              className="h-full rounded-sm transition-all duration-500"
              style={{
                width: `${(pct / totalTopicPct) * 100}%`,
                backgroundColor: getTopicColor(idx),
              }}
              title={`${topic}: ${pct}%`}
            />
          ))}
        </div>

        {/* Topic Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {topics.map(([topic, pct], idx) => (
            <div key={topic} className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#080D1A]/50 border border-slate-200 dark:border-[#D6C8FA]/10">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getTopicColor(idx) }}
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{topic}</span>
              </div>
              <span className="font-mono text-[#533B87] dark:text-[#D6C8FA] font-bold ml-1">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
