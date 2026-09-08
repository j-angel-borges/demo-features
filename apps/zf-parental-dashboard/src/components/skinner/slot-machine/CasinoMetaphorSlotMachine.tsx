import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Clock,
  Brain,
  Gauge,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { SkinnerSessionRecord, SkinnerLeverEvent } from '@zentry/shared';
import { SlotReel, CASINO_SYMBOLS } from './SlotReel';
import { MechanicalLever } from './MechanicalLever';
import { JackpotParticleShower } from './JackpotParticleShower';

interface CasinoMetaphorSlotMachineProps {
  session: SkinnerSessionRecord;
  hasNewScroll: boolean;
  isJackpotActive: boolean;
  jackpotDetails: {
    elapsed: number;
    nominal: number;
    velocity: number;
    reason: string;
  } | null;
  latestLeverEvent?: SkinnerLeverEvent | null;
  isModalOpen?: boolean;
  onOpenModal?: () => void;
  onCloseJackpot: () => void;
  onViewReport: () => void;
  onManualPull?: () => void;
}

export const CasinoMetaphorSlotMachine: React.FC<CasinoMetaphorSlotMachineProps> = ({
  session,
  hasNewScroll,
  isJackpotActive,
  jackpotDetails,
  latestLeverEvent,
  isModalOpen = false,
  onOpenModal,
  onCloseJackpot,
  onViewReport,
  onManualPull,
}) => {
  // Lever state: pulls down whenever hasNewScroll fires or on manual click
  const [isLeverPulled, setIsLeverPulled] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reelTargets, setReelTargets] = useState<string[]>(['zap', 'sparkles', 'brain']);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  // Audio synthesizer via Web Audio API (zero external assets needed)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
      }
    } catch {}
  };

  // React to incoming scroll events from Skinner Box
  useEffect(() => {
    if (hasNewScroll) {
      setIsLeverPulled(true);
      setIsSpinning(true);
      playChime(320, 0.2);

      // Select target symbols based on retention and scroll speed
      const isRapid = latestLeverEvent
        ? latestLeverEvent.dwellTimeSeconds < 6.0
        : (session.activeElapsedSeconds || 0) < 7;
      const isVR7 = latestLeverEvent
        ? latestLeverEvent.isVariableRatioJackpot
        : session.totalScrolls > 0 && session.totalScrolls % 7 === 0;

      let nextTargets: string[];
      if (isJackpotActive || isRapid || isVR7) {
        // Triple dopamine jackpot symbols
        nextTargets = ['zap', 'zap', 'zap'];
      } else if ((session.currentScrollVelocity || 0) > 12) {
        nextTargets = ['clock', 'brain', 'bell'];
      } else {
        const symbolIds = CASINO_SYMBOLS.map((s) => s.id);
        const r1 = symbolIds[session.totalScrolls % symbolIds.length];
        const r2 = symbolIds[(session.totalScrolls + 2) % symbolIds.length];
        const r3 = symbolIds[(session.totalScrolls + 4) % symbolIds.length];
        nextTargets = [r1, r2, r3];
      }
      setReelTargets(nextTargets);

      // Release lever after 400ms
      const leverTimer = setTimeout(() => {
        setIsLeverPulled(false);
      }, 400);

      // Stop spinning after staggered settle (1100ms)
      const spinTimer = setTimeout(() => {
        setIsSpinning(false);
        playChime(580, 0.3);
      }, 1100);

      return () => {
        clearTimeout(leverTimer);
        clearTimeout(spinTimer);
      };
    }
  }, [hasNewScroll, session.totalScrolls, isJackpotActive, latestLeverEvent]);

  const handleManualTrigger = () => {
    setIsLeverPulled(true);
    setIsSpinning(true);
    playChime(320, 0.2);

    const symbolIds = CASINO_SYMBOLS.map((s) => s.id);
    const r1 = symbolIds[Math.floor(Math.random() * symbolIds.length)];
    const r2 = symbolIds[Math.floor(Math.random() * symbolIds.length)];
    const r3 = symbolIds[Math.floor(Math.random() * symbolIds.length)];
    setReelTargets([r1, r2, r3]);

    setTimeout(() => setIsLeverPulled(false), 400);
    setTimeout(() => {
      setIsSpinning(false);
      playChime(580, 0.3);
    }, 1100);

    if (onManualPull) {
      onManualPull();
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Visual Particle Cascade when Jackpot is Active */}
      {isJackpotActive && <JackpotParticleShower />}

      {/* Main Retro-Futuristic Slot Machine Chassis */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#131B30] via-[#0D1322] to-[#080D1A] border-2 border-[#D6C8FA]/40 shadow-[0_0_50px_rgba(83,59,135,0.35)] overflow-hidden">
        {/* Chassis Top Arch Glow */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />

        {/* Header Marquee Lights */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/80 to-slate-900 border border-[#D6C8FA]/30 shadow-inner flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Metáfora
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                Simulador de Hábitos
              </h2>
            </div>
          </div>

          {/* Marquee Audio & Explanatory Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPaytable(!showPaytable)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Guía de Símbolos"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Guía</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={soundEnabled ? 'Desactivar Audio' : 'Activar Audio FX'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#C2F4E7]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Non-intrusive Live Jackpot Alert Banner */}
        {isJackpotActive && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span><strong>Salto Rápido:</strong> El menor deslizó en &lt;6s sin procesar el contenido.</span>
            </div>
            {onOpenModal && (
              <button
                type="button"
                onClick={onOpenModal}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors cursor-pointer shrink-0"
              >
                Ver Diagnóstico
              </button>
            )}
          </div>
        )}

        {/* Paytable Neurocognitive Glossary Overlay / Drawer */}
        {showPaytable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-2xl bg-black/70 border border-amber-400/30 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs"
          >
            {CASINO_SYMBOLS.map((sym) => {
              const SymIcon = sym.icon;
              return (
                <div
                  key={sym.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col items-center text-center"
                >
                  <SymIcon className="w-5 h-5 mb-1" style={{ color: sym.color }} />
                  <span className="font-bold text-white text-[11px]">{sym.name}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {sym.description}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Central Stage: Reels Bay + Right-Mounted Mechanical Lever */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4 px-2">
          {/* Inner Reels Chamber with Metallic Chrome Bezel */}
          <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-black border-4 border-slate-700/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex items-center justify-center gap-3 sm:gap-5">
            {/* Top Reel Chamber Light Bars */}
            <div className="absolute top-2 inset-x-6 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-75" />

            {/* Reel 1 */}
            <SlotReel
              reelIndex={0}
              isSpinning={isSpinning}
              targetSymbolId={reelTargets[0]}
              isJackpot={isJackpotActive}
            />

            {/* Reel 2 */}
            <SlotReel
              reelIndex={1}
              isSpinning={isSpinning}
              targetSymbolId={reelTargets[1]}
              isJackpot={isJackpotActive}
            />

            {/* Reel 3 */}
            <SlotReel
              reelIndex={2}
              isSpinning={isSpinning}
              targetSymbolId={reelTargets[2]}
              isJackpot={isJackpotActive}
            />

            {/* Bottom Reel Chamber Light Bars */}
            <div className="absolute bottom-2 inset-x-6 h-1 rounded-full bg-gradient-to-r from-transparent via-[#C2F4E7] to-transparent opacity-60" />
          </div>

          {/* Right Mechanical Lever Column */}
          <div className="flex flex-col items-center justify-center pl-2">
            <MechanicalLever
              isPulled={isLeverPulled}
              onManualPull={handleManualTrigger}
            />
            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 block">
                PALANCAZO
              </span>
              <span className="text-xs font-mono font-extrabold text-amber-400">
                {session.totalScrolls} scrolls
              </span>
            </div>
          </div>
        </div>

        {/* Machine Lower Dashboard: Intuitive Indicators */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Permanencia</span>
            <p className="text-lg font-mono font-bold text-[#C2F4E7]">
              {session.activeElapsedSeconds || 0}s
            </p>
            <span className="text-[9px] text-slate-400">
              por video
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Velocidad</span>
            <p className="text-lg font-mono font-bold text-[#FBBF24]">
              {(session.currentScrollVelocity || 0).toFixed(1)} RPM
            </p>
            <span className="text-[9px] text-slate-400">
              {(session.currentScrollVelocity || 0) > 12 ? 'Cadencia Rápida' : 'Ritmo Calmo'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retención</span>
            <p className="text-lg font-mono font-bold text-[#D6C8FA]">
              {(session.averageRetentionPct || 0).toFixed(1)}%
            </p>
            <span className="text-[9px] text-slate-400">
              {session.completedItemsCount || 0} videos al 100%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Simular</span>
            <button
              type="button"
              onClick={handleManualTrigger}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3" />
              <span>Girar Rodillos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
