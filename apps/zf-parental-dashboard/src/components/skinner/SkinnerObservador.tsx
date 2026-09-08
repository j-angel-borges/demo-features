import React, { useState } from 'react';
import {
  PlayCircle,
  StopCircle,
  RotateCcw,
  Sparkles,
  BarChart3,
  FileText,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useLiveSkinner } from '../../hooks/useLiveSkinner';
import { DigitalOdometer } from './DigitalOdometer';
import { RadialRetentionRing } from './RadialRetentionRing';
import { VelocityTachometer } from './VelocityTachometer';
import { DecayCurveChart } from './DecayCurveChart';
import { ContentMetadataCard } from './ContentMetadataCard';
import { CasinoMetaphorSlotMachine } from './slot-machine/CasinoMetaphorSlotMachine';
import { ScientificReportView } from './scientific-report/ScientificReportView';
import { PedagogicalJackpotModal } from './slot-machine/PedagogicalJackpotModal';

export type SkinnerViewMode = 'casino' | 'telemetry' | 'report';

export const SkinnerObservador: React.FC = () => {
  const {
    session,
    isLive,
    hasNewScroll,
    tachometer,
    activeRetention,
    activeMilestone,
    digits,
    isJackpotActive,
    jackpotDetails,
    latestLeverEvent,
    latestReport,
    dismissJackpot,
    startMasterSession,
    endMasterSession,
    resetMasterSession,
    simulateScroll,
  } = useLiveSkinner();

  // View Mode Selector: default view is 'casino' for maximum WOW factor during demos
  const [viewMode, setViewMode] = useState<SkinnerViewMode>('casino');
  const [isCommandPending, setIsCommandPending] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  const handleStartSession = async () => {
    setIsCommandPending(true);
    try {
      await startMasterSession(session.targetProfile || 'child');
    } finally {
      setIsCommandPending(false);
    }
  };

  const handleEndSession = async () => {
    setIsCommandPending(true);
    try {
      await endMasterSession();
      setIsSummaryModalOpen(true);
    } finally {
      setIsCommandPending(false);
    }
  };

  const handleResetSession = async () => {
    setIsCommandPending(true);
    try {
      await resetMasterSession(session.targetProfile || 'child');
    } finally {
      setIsCommandPending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Skinner Live Header & Master Controls */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col gap-4">
        {/* Top Row: Title, Session ID, Mode & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] animate-ping absolute inset-0" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#EBF1F5] tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                  <span>Monitoreo de Atención en Vivo</span>
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA]">
                  ID: {session.sessionId}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Monitorea en tiempo real los hábitos de video y concentración de tu hijo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/20 flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Modo:</span>
              <span className="text-[#533B87] dark:text-[#C2F4E7] font-bold capitalize">
                {session.targetProfile || 'Niño (Curado)'}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Estado:</span>
              <span className="text-[#1B6E5E] dark:text-[#34D399] font-bold flex items-center gap-1">
                {session.status === 'active' ? (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Sesión Activa</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completada</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Master Session Control Bar + View Mode Selector */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* 1. Master Session Control Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:inline">
              Control:
            </span>

            {/* Iniciar Sesión */}
            <button
              type="button"
              onClick={handleStartSession}
              disabled={session.status === 'active' || isCommandPending}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                session.status === 'active' || isCommandPending
                  ? 'bg-emerald-500/20 text-emerald-300/50 border border-emerald-500/20 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 active:scale-95'
              }`}
              title="Iniciar una nueva sesión de Skinner Box para el menor"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Sesión</span>
            </button>

            {/* Finalizar Sesión */}
            <button
              type="button"
              onClick={handleEndSession}
              disabled={session.status !== 'active' || isCommandPending}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                session.status !== 'active' || isCommandPending
                  ? 'bg-rose-500/20 text-rose-300/50 border border-rose-500/20 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 active:scale-95'
              }`}
              title="Finalizar la sesión activa y registrar telemetría final"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Finalizar Sesión</span>
            </button>

            {/* Reiniciar Prueba */}
            <button
              type="button"
              onClick={handleResetSession}
              disabled={isCommandPending}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#533B87] hover:bg-[#684BA8] text-white border border-[#D6C8FA]/30 shadow-sm shadow-purple-900/30 active:scale-95 transition-all cursor-pointer"
              title="Reiniciar todos los contadores de telemetría a 0 e iniciar prueba limpia"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCommandPending ? 'animate-spin' : ''}`} />
              <span>Reiniciar Prueba</span>
            </button>
          </div>

          {/* 2. View Mode Selector Tabs (Single-Word, Intuitive, High Contrast) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#080D1A]/90 border border-slate-200 dark:border-[#D6C8FA]/20 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('casino')}
              data-testid="tab-casino-wow"
              className={`px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'casino'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="[ 🎰 Metáfora Casino (Factor WOW) ]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Metáfora</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('telemetry')}
              data-testid="tab-telemetry-odometer"
              className={`px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'telemetry'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="[ 📊 Telemetría & Odómetro ]"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
              <span>Odómetro</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('report')}
              data-testid="tab-scientific-report"
              className={`px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'report'
                  ? 'bg-gradient-to-r from-[#10B981] to-emerald-700 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="[ 📑 Reporte Científico ]"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>Reporte</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Casino Metaphor (WOW Factor) */}
      {viewMode === 'casino' && (
        <div className="animate-fadeIn">
          <CasinoMetaphorSlotMachine
            session={session}
            hasNewScroll={hasNewScroll}
            isJackpotActive={isJackpotActive}
            jackpotDetails={jackpotDetails}
            latestLeverEvent={latestLeverEvent}
            isModalOpen={isSummaryModalOpen}
            onOpenModal={() => setIsSummaryModalOpen(true)}
            onCloseJackpot={() => {
              setIsSummaryModalOpen(false);
              dismissJackpot();
            }}
            onViewReport={() => {
              setIsSummaryModalOpen(false);
              setViewMode('report');
            }}
            onManualPull={simulateScroll}
          />
        </div>
      )}

      {/* VIEW 2: Traditional Telemetry & Instruments */}
      {viewMode === 'telemetry' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Core Instruments Grid (3 columns on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DigitalOdometer
              digits={digits}
              totalScrolls={session.totalScrolls}
              hasNewScroll={hasNewScroll}
              activeMilestone={activeMilestone}
            />

            <RadialRetentionRing
              retentionPct={activeRetention.pct}
              elapsedSeconds={activeRetention.elapsed}
              nominalDuration={activeRetention.nominal}
              color={activeRetention.color}
              label={activeRetention.label}
              offset={activeRetention.offset}
            />

            <VelocityTachometer tachometer={tachometer} />
          </div>

          {/* Decay Curve and Content Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DecayCurveChart
                decayCurveData={session.decayCurveData || []}
                currentScroll={session.totalScrolls}
              />
            </div>
            <div>
              <ContentMetadataCard session={session} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Scientific Report (Strictly Manual Activation) */}
      {viewMode === 'report' && (
        <div className="animate-fadeIn">
          <ScientificReportView session={session} reportRecord={latestReport} />
        </div>
      )}

      {/* Session Finalization Summary Modal */}
      <PedagogicalJackpotModal
        isOpen={isSummaryModalOpen}
        onClose={() => {
          setIsSummaryModalOpen(false);
          dismissJackpot();
        }}
        onViewReport={() => {
          setIsSummaryModalOpen(false);
          setViewMode('report');
        }}
        elapsedSeconds={jackpotDetails ? jackpotDetails.elapsed : (session.activeElapsedSeconds || 0)}
        nominalDuration={jackpotDetails ? jackpotDetails.nominal : (session.activeNominalDuration || 45)}
        velocityRpm={jackpotDetails ? jackpotDetails.velocity : (session.currentScrollVelocity || 0)}
        reason={jackpotDetails ? jackpotDetails.reason : 'Salto Compulsivo (< 7s de retención)'}
      />
    </div>
  );
};
