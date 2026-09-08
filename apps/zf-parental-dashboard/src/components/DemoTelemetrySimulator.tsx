import React from 'react';
import {
  Sliders,
  Play,
  Star,
  Flame,
} from 'lucide-react';
import { parentFirestoreService } from '../services/parentFirestore';
import type { SkinnerSessionRecord } from '@zentry/shared';

interface DemoTelemetrySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: SkinnerSessionRecord;
}

export const DemoTelemetrySimulator: React.FC<DemoTelemetrySimulatorProps> = ({
  isOpen,
  onClose,
  currentSession,
}) => {
  if (!isOpen) return null;

  const handleSimulateScroll = async () => {
    const newScrolls = currentSession.totalScrolls + 1;
    const isJackpot = newScrolls % 7 === 0;
    const nominal = isJackpot ? 38 : Math.max(5, 45 - Math.floor(newScrolls * 0.8));
    const actual = Math.max(3, Math.floor(nominal * 0.75));
    const retention = Math.min(100, Math.round((actual / nominal) * 100));

    const updated: SkinnerSessionRecord = {
      ...currentSession,
      totalScrolls: newScrolls,
      totalDurationSeconds: currentSession.totalDurationSeconds + actual,
      currentScrollVelocity: Math.min(180, currentSession.currentScrollVelocity + 1.5),
      activeElapsedSeconds: actual,
      activeNominalDuration: nominal,
      activeRetentionPct: retention,
      decayCurveData: [
        ...(currentSession.decayCurveData || []),
        {
          scrollIndex: newScrolls,
          nominalDurationSeconds: nominal,
          actualViewSeconds: actual,
          retentionPct: retention,
          isJackpot,
          timestamp: Date.now(),
        },
      ].slice(-15),
      lastUpdated: Date.now(),
    };

    await parentFirestoreService.publishSkinnerUpdate(updated);
  };

  const handleTriggerJackpot = async () => {
    const newScrolls = currentSession.totalScrolls + 1;
    const nominal = 42;
    const actual = 40;
    const retention = 95;

    const updated: SkinnerSessionRecord = {
      ...currentSession,
      totalScrolls: newScrolls,
      activeElapsedSeconds: actual,
      activeNominalDuration: nominal,
      activeRetentionPct: retention,
      decayCurveData: [
        ...(currentSession.decayCurveData || []),
        {
          scrollIndex: newScrolls,
          nominalDurationSeconds: nominal,
          actualViewSeconds: actual,
          retentionPct: retention,
          isJackpot: true,
          timestamp: Date.now(),
        },
      ].slice(-15),
      lastUpdated: Date.now(),
    };

    await parentFirestoreService.publishSkinnerUpdate(updated);
  };

  const handleTriggerDopamineSpike = async () => {
    const updated: SkinnerSessionRecord = {
      ...currentSession,
      currentScrollVelocity: 24.5,
      lastUpdated: Date.now(),
    };
    await parentFirestoreService.publishSkinnerUpdate(updated);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-3xl p-5 border border-[#533B87]/30 dark:border-[#C2F4E7]/40 shadow-2xl max-w-sm w-full animate-bounce-in">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#D6C8FA]/20 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-[#EBF1F5]">
          <Sliders className="w-4 h-4 text-[#533B87] dark:text-[#C2F4E7]" />
          <span>Simulador Telemetría en Vivo (Demo)</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 font-medium cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
          Inyecta eventos a Firestore para evaluar reactividad en tiempo real:
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSimulateScroll}
            className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-[#533B87]/40 dark:hover:bg-[#533B87]/80 border border-violet-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#EBF1F5] flex items-center gap-1.5 font-bold transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7]" />
            <span>+1 Scroll Palanca</span>
          </button>

          <button
            onClick={handleTriggerJackpot}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-[#FBBF24]/20 dark:hover:bg-[#FBBF24]/40 border border-amber-300 dark:border-[#FBBF24]/30 text-amber-900 dark:text-[#FBBF24] flex items-center gap-1.5 font-bold transition-all cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>Jackpot VR-7</span>
          </button>
        </div>

        <button
          onClick={handleTriggerDopamineSpike}
          className="w-full p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-[#F87171]/20 dark:hover:bg-[#F87171]/40 border border-red-200 dark:border-[#F87171]/30 text-red-700 dark:text-[#F87171] flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Acelerar a 24.5 RPM (Alerta Dopamina)</span>
        </button>
      </div>
    </div>
  );
};
