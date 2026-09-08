import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  RotateCw,
  PartyPopper,
  Gauge,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { voiceService } from '../../../services/voiceSpeech';
import type { InteractiveToyData } from '@zentry/shared';

interface InteractiveToyPlayerProps {
  toyData: InteractiveToyData;
  toyImageUrl?: string;
  onBack: () => void;
}

export const InteractiveToyPlayer: React.FC<InteractiveToyPlayerProps> = ({
  toyData,
  toyImageUrl,
  onBack
}) => {
  const [powerMeter, setPowerMeter] = useState<number>(toyData.powerLevel || 50);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [leverPulled, setLeverPulled] = useState<boolean>(false);
  const [gearRotation, setGearRotation] = useState<number>(0);

  useEffect(() => {
    sounds.playVictoryFanfare();
    voiceService.speakFeedback(
      `¡Tu invento ${toyData.toyName} está encendido! Toca los botones de energía y activa sus resortes.`
    );
  }, []);

  const triggerButtonAction = (soundType: string, actionType: string) => {
    sounds.playTap();
    sounds.vibrate([20, 30, 20]);
    setActiveAnimation(actionType);

    if (soundType === 'sparkle') sounds.playSparkle();
    else if (soundType === 'starburst') sounds.playStarBurst();
    else if (soundType === 'victory') sounds.playVictoryFanfare();
    else sounds.playBrushStroke();

    setPowerMeter((prev) => {
      const next = Math.min(100, prev + 12);
      if (next >= 100) {
        sounds.playSuccess();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      return next;
    });

    setGearRotation((prev) => (prev + 45) % 360);

    setTimeout(() => {
      setActiveAnimation(null);
    }, 600);
  };

  const handlePullLever = () => {
    sounds.playStarBurst();
    sounds.vibrate([30, 50, 30]);
    setLeverPulled(true);
    setGearRotation((prev) => (prev + 90) % 360);

    setPowerMeter(100);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 }
    });

    setTimeout(() => {
      setLeverPulled(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1C1438] via-[#120D26] to-[#0A0717] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden touch-none">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2 cursor-pointer zentry-spring-press"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase">Volver</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
          <Zap className="w-4 h-4 text-amber-300" />
          <span className="text-xs sm:text-sm font-black text-white">{toyData.toyName}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
          <Gauge className="w-4 h-4" />
          <span className="text-xs font-black">{powerMeter}%</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 max-w-sm sm:max-w-md mx-auto w-full my-auto">
        <div
          className={`relative w-64 h-64 sm:w-76 sm:h-76 rounded-[40px] p-3 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-4 border-purple-500/60 shadow-[0_0_50px_rgba(99,102,241,0.4)] flex items-center justify-center transition-transform duration-200 ${
            activeAnimation === 'launch' || leverPulled
              ? 'scale-108 -translate-y-3'
              : activeAnimation === 'bounce'
              ? 'scale-105'
              : 'scale-100'
          }`}
        >
          <div
            style={{ transform: `rotate(${gearRotation}deg)` }}
            className="absolute top-2 right-2 text-white/15 transition-transform duration-500 pointer-events-none"
          >
            <RotateCw className="w-16 h-16" />
          </div>

          {toyImageUrl ? (
            <div className="relative w-full h-full rounded-[32px] overflow-hidden border-2 border-white/30 bg-black">
              <img
                src={toyImageUrl}
                alt={toyData.toyName}
                className="w-full h-full object-cover"
              />
              <div
                style={{ opacity: powerMeter / 100 }}
                className="absolute inset-0 bg-gradient-to-t from-purple-600/30 via-transparent to-amber-400/30 pointer-events-none transition-opacity"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <Zap className="w-20 h-20 text-amber-300 animate-pulse" />
              <span className="text-xs font-black uppercase text-purple-200">Núcleo Activo</span>
            </div>
          )}

          <button
            onClick={handlePullLever}
            className={`absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-20 rounded-full bg-gradient-to-b from-rose-500 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 zentry-spring-press ${
              leverPulled ? 'translate-y-4 scale-95' : '-translate-y-1/2 scale-100'
            }`}
            title="Tirar de la Palanca Turbo"
          >
            <Sliders className="w-5 h-5 text-white stroke-[3]" />
          </button>
        </div>

        <div className="w-full max-w-xs space-y-1">
          <div className="flex justify-between text-[11px] font-black uppercase text-purple-200 px-1">
            <span>Energía Zentry</span>
            <span>{powerMeter}%</span>
          </div>
          <div className="w-full h-4 rounded-full bg-black/60 border border-white/20 overflow-hidden p-0.5">
            <div
              style={{ width: `${powerMeter}%` }}
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.7)]"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto grid grid-cols-4 gap-2 sm:gap-3 p-2 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
        {toyData.controls && toyData.controls.length > 0 ? (
          toyData.controls.map((btn) => (
            <button
              key={btn.id}
              onClick={() => triggerButtonAction(btn.soundFx, btn.actionType)}
              style={{ backgroundColor: btn.color }}
              className="py-3 rounded-2xl border-2 border-white/80 shadow-lg text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 cursor-pointer zentry-spring-press hover:scale-105 transition-transform"
            >
              {btn.icon === 'Sparkles' && <Sparkles className="w-5 h-5" />}
              {btn.icon === 'Zap' && <Zap className="w-5 h-5 fill-slate-950" />}
              {btn.icon === 'RotateCw' && <RotateCw className="w-5 h-5" />}
              {btn.icon === 'PartyPopper' && <PartyPopper className="w-5 h-5" />}
              <span className="text-[10px] uppercase tracking-tighter">{btn.label}</span>
            </button>
          ))
        ) : (
          <>
            <button
              onClick={() => triggerButtonAction('sparkle', 'glow')}
              className="py-3 rounded-2xl bg-pink-500 border-2 border-white shadow-lg text-white font-black text-xs flex flex-col items-center gap-1 cursor-pointer zentry-spring-press"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">Magia</span>
            </button>
            <button
              onClick={() => triggerButtonAction('starburst', 'launch')}
              className="py-3 rounded-2xl bg-amber-400 border-2 border-white shadow-lg text-slate-950 font-black text-xs flex flex-col items-center gap-1 cursor-pointer zentry-spring-press"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span className="text-[10px]">Turbo</span>
            </button>
            <button
              onClick={() => triggerButtonAction('brush', 'spin')}
              className="py-3 rounded-2xl bg-cyan-400 border-2 border-white shadow-lg text-slate-950 font-black text-xs flex flex-col items-center gap-1 cursor-pointer zentry-spring-press"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[10px]">Girar</span>
            </button>
            <button
              onClick={() => triggerButtonAction('victory', 'bounce')}
              className="py-3 rounded-2xl bg-emerald-400 border-2 border-white shadow-lg text-slate-950 font-black text-xs flex flex-col items-center gap-1 cursor-pointer zentry-spring-press"
            >
              <PartyPopper className="w-5 h-5" />
              <span className="text-[10px]">Fiesta</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
