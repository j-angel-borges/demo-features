import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  ArrowLeft,
  Smile,
  Heart,
  Star,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { voiceService } from '../../../services/voiceSpeech';
import type { InteractiveAvatarData } from '@zentry/shared';

interface TalkingAvatarPlayerProps {
  avatarData: InteractiveAvatarData;
  characterImageUrl?: string;
  onBack: () => void;
}

export const TalkingAvatarPlayer: React.FC<TalkingAvatarPlayerProps> = ({
  avatarData,
  characterImageUrl,
  onBack
}) => {
  const [currentSpeech, setCurrentSpeech] = useState<string>(
    avatarData.speechScript[0] || '¡Hola! ¡Qué felicidad conocerte!'
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentMission, setCurrentMission] = useState<string>(avatarData.mission);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    sounds.playStarBurst();
    const timer = setTimeout(() => {
      speakPhrase(currentSpeech);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const maxOffset = 14;

    const angle = Math.atan2(deltaY, deltaX);
    const dist = Math.min(maxOffset, Math.hypot(deltaX, deltaY) / 12);

    setEyeOffset({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist
    });
  };

  const handlePointerLeave = () => {
    setEyeOffset({ x: 0, y: 0 });
  };

  const speakPhrase = (text: string) => {
    setCurrentSpeech(text);
    setIsSpeaking(true);
    sounds.playSparkle();

    voiceService.speakFeedback(text);
    const duration = Math.max(2200, text.length * 75);
    setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  };

  const handleTapAvatar = () => {
    sounds.playTap();
    sounds.vibrate([15, 25, 15]);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    const randomIdx = Math.floor(Math.random() * avatarData.speechScript.length);
    const nextPhrase = avatarData.speechScript[randomIdx] || '¡Yujuuu! ¡Me encanta jugar contigo!';
    speakPhrase(nextPhrase);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.5 }
    });
  };

  const handleAskMission = () => {
    sounds.playSuccess();
    const missions = [
      '¡Tu misión secreta: da tres saltos gigantes y toca el suelo!',
      '¡Encuentra un objeto de color amarillo en tu habitación y muéstralo!',
      '¡Dime el nombre de tu superhéroe favorito!',
      '¡Pon cara de león rugiendo muy fuerte!',
      '¡Dibuja un círculo imaginario en el aire con tu dedo mágico!'
    ];
    const pick = missions[Math.floor(Math.random() * missions.length)];
    setCurrentMission(pick);
    speakPhrase(pick);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#150F2C] via-[#0E0A20] to-[#080512] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden touch-none"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between w-full max-w-xl mx-auto">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2 cursor-pointer zentry-spring-press shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase">Volver</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <Smile className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-black text-purple-200">{avatarData.name}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <button
          onClick={handleTapAvatar}
          className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-amber-300 cursor-pointer zentry-spring-press shadow-md"
          title="Tocar"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 max-w-xl mx-auto w-full my-auto">
        <div className="relative max-w-xs sm:max-w-md p-4 rounded-[28px] bg-white/95 text-slate-900 border-2 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.4)] animate-spring-in">
          <p className="text-sm sm:text-base font-black text-center leading-snug">
            "{currentSpeech}"
          </p>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />
        </div>

        <div
          onClick={handleTapAvatar}
          className={`relative w-64 h-64 sm:w-76 sm:h-76 cursor-pointer transition-transform duration-300 ease-out zentry-spring-press ${
            isBouncing ? '-translate-y-6 scale-110' : 'translate-y-0 scale-100'
          }`}
        >
          {characterImageUrl ? (
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-purple-400/80 shadow-[0_0_50px_rgba(236,72,153,0.45)] bg-slate-900">
              <img
                src={characterImageUrl}
                alt={avatarData.name}
                className="w-full h-full object-cover"
              />
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping pointer-events-none opacity-50" />
              )}
            </div>
          ) : (
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_10px_35px_rgba(236,72,153,0.6)]"
            >
              <defs>
                <radialGradient id="bodyGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor={avatarData.primaryColor} />
                  <stop offset="100%" stopColor="#4C1D95" />
                </radialGradient>
              </defs>

              <circle cx="50" cy="50" r="24" fill={avatarData.secondaryColor} />
              <circle cx="150" cy="50" r="24" fill={avatarData.secondaryColor} />
              <circle cx="100" cy="105" r="75" fill="url(#bodyGrad)" stroke="#FFFFFF" strokeWidth="4" />
              <ellipse cx="55" cy="120" rx="12" ry="7" fill="#F43F5E" opacity="0.6" />
              <ellipse cx="145" cy="120" rx="12" ry="7" fill="#F43F5E" opacity="0.6" />

              <circle cx="70" cy="95" r="18" fill="#FFFFFF" />
              <circle
                cx={70 + eyeOffset.x}
                cy={95 + eyeOffset.y}
                r="9"
                fill="#1E1B4B"
              />
              <circle
                cx={70 + eyeOffset.x - 3}
                cy={95 + eyeOffset.y - 3}
                r="3"
                fill="#FFFFFF"
              />

              <circle cx="130" cy="95" r="18" fill="#FFFFFF" />
              <circle
                cx={130 + eyeOffset.x}
                cy={95 + eyeOffset.y}
                r="9"
                fill="#1E1B4B"
              />
              <circle
                cx={130 + eyeOffset.x - 3}
                cy={95 + eyeOffset.y - 3}
                r="3"
                fill="#FFFFFF"
              />

              {isSpeaking ? (
                <ellipse cx="100" cy="132" rx="14" ry="12" fill="#BE185D" stroke="#FFFFFF" strokeWidth="2" />
              ) : (
                <path
                  d="M 82 126 Q 100 144 118 126"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          )}

          <div className="absolute -bottom-2 right-4 p-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-lg border-2 border-white animate-bounce">
            <Heart className="w-5 h-5 fill-slate-950" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-purple-400/40 backdrop-blur-md max-w-sm text-center">
          <Award className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-xs font-bold text-purple-100">{currentMission}</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-around gap-2 p-2 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
        <button
          onClick={handleTapAvatar}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer zentry-spring-press shadow-md"
        >
          <Volume2 className="w-4 h-4" />
          <span>¡Saludar!</span>
        </button>

        <button
          onClick={handleAskMission}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer zentry-spring-press shadow-md"
        >
          <Star className="w-4 h-4 fill-slate-950" />
          <span>Nueva Misión</span>
        </button>
      </div>
    </div>
  );
};
