import React, { useState } from 'react';
import { BookOpen, HeartPulse, Sparkles, Compass, CheckCircle, Tag } from 'lucide-react';
import type { SkinnerSessionRecord, SkinnerSessionReportRecord } from '@zentry/shared';
import { DigitalHealthTrafficLight } from './DigitalHealthTrafficLight';
import { OfflineHabitRecommendations } from './OfflineHabitRecommendations';
import { AcademicCitationsVault } from './AcademicCitationsVault';

interface ScientificReportViewProps {
  session: SkinnerSessionRecord;
  reportRecord?: SkinnerSessionReportRecord | null;
}

export const ScientificReportView: React.FC<ScientificReportViewProps> = ({ session, reportRecord }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'traffic_light' | 'habits' | 'citations'>('all');

  return (
    <div className="space-y-6">
      {/* Executive Report Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-[#533B87]/30 dark:border-[#D6C8FA]/20 bg-gradient-to-r from-violet-500/10 via-emerald-500/5 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-[#533B87]/50 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#EBF1F5]">
                  Informe Neurocognitivo & Salud Digital
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  Activación Manual Exclusiva
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Diagnóstico del nivel de atención y actividades recomendadas para equilibrar su día
              </p>
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/15 text-xs">
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completo
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('traffic_light')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'traffic_light'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semáforo
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('habits')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'habits'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hábitos
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('citations')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === 'citations'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ciencia
            </button>
          </div>
        </div>
      </div>

      {/* Dominant Categories & Scientific Affinities (DOC_TECNICO Section 4.1 & 5.1) */}
      {reportRecord && reportRecord.dominantCategories && reportRecord.dominantCategories.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D1A]/70 border border-slate-200 dark:border-[#D6C8FA]/20 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#533B87] dark:text-[#C2F4E7]" />
            <span className="font-bold text-slate-800 dark:text-white">Afinidades Temáticas Detectadas en Sesión:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {reportRecord.dominantCategories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/25 text-[#533B87] dark:text-[#D6C8FA] font-medium"
              >
                {cat.category}: <strong>{cat.affinityPercent || cat.interestAffinityPercent || 0}%</strong> ({cat.dwellSeconds}s)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 1. Semáforo Continuo de Salud Digital */}
      {(activeSection === 'all' || activeSection === 'traffic_light') && (
        <DigitalHealthTrafficLight session={session} />
      )}

      {/* 2. Recomendaciones Prácticas de Hábitos en el Mundo Real (Offline) */}
      {(activeSection === 'all' || activeSection === 'habits') && (
        <OfflineHabitRecommendations
          topicDistribution={session.topicDistribution || {}}
          totalScrolls={session.totalScrolls}
        />
      )}

      {/* 3. Fundamentación Académica Formal */}
      {(activeSection === 'all' || activeSection === 'citations') && (
        <AcademicCitationsVault />
      )}
    </div>
  );
};
