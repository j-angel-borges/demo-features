import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sunset,
  Sparkles,
  TreePine,
  Cloud,
  Gem,
  Dog,
  Save,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/soundEffects';
import { voiceService } from '../../../services/voiceSpeech';
import type { InteractiveWorldData, WorldProp } from '@zentry/shared';

interface Diorama3DWorldPlayerProps {
  worldData: InteractiveWorldData;
  landscapeImageUrl?: string;
  onBack: () => void;
  onSaveWorld?: (updatedData: InteractiveWorldData) => void;
}

export const Diorama3DWorldPlayer: React.FC<Diorama3DWorldPlayerProps> = ({
  worldData,
  landscapeImageUrl,
  onBack,
  onSaveWorld
}) => {
  const [rotationAngle, setRotationAngle] = useState<number>(35);
  const [pitchAngle, setPitchAngle] = useState<number>(30);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>(
    worldData.dayNightCycle || 'day'
  );
  const [propsList, setPropsList] = useState<WorldProp[]>(worldData.props || []);
  const [selectedTool, setSelectedTool] = useState<'tree' | 'cloud' | 'crystal' | 'creature'>('tree');
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    sounds.playVictoryFanfare();
    voiceService.speakFeedback(
      `¡Bienvenido a ${worldData.worldName}! Puedes rotar este mundo con tu dedo y plantar nuevos elementos mágicos.`
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    setRotationAngle((prev) => (prev + dx * 0.6) % 360);
    setPitchAngle((prev) => Math.max(15, Math.min(65, prev - dy * 0.4)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleAddPropOnGround = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(e.movementX) > 4 || Math.abs(e.movementY) > 4) return;

    sounds.playSparkle();
    sounds.vibrate(8);

    const randomOffset = (Math.random() - 0.5) * 1.8;
    const randomZ = (Math.random() - 0.5) * 1.8;

    const newProp: WorldProp = {
      id: `prop_${Date.now()}`,
      name: selectedTool,
      type: selectedTool,
      x: Math.round(randomOffset * 10) / 10,
      y: selectedTool === 'cloud' ? 2 : 0,
      z: Math.round(randomZ * 10) / 10,
      scale: 0.9 + Math.random() * 0.4,
      color:
        selectedTool === 'tree'
          ? '#10B981'
          : selectedTool === 'crystal'
          ? '#38BDF8'
          : selectedTool === 'cloud'
          ? '#FFFFFF'
          : '#F59E0B'
    };

    setPropsList((prev) => [...prev, newProp]);
  };

  const handleToggleTime = () => {
    sounds.playTap();
    sounds.vibrate(6);
    const nextTime = timeOfDay === 'day' ? 'sunset' : timeOfDay === 'sunset' ? 'night' : 'day';
    setTimeOfDay(nextTime);
  };

  const handleSaveState = () => {
    sounds.playSuccess();
    confetti({ particleCount: 70, spread: 70 });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);

    if (onSaveWorld) {
      onSaveWorld({
        ...worldData,
        dayNightCycle: timeOfDay,
        props: propsList
      });
    }
  };

  const skyBg =
    timeOfDay === 'day'
      ? 'from-sky-400 via-indigo-200 to-amber-100'
      : timeOfDay === 'sunset'
      ? 'from-purple-900 via-rose-700 to-amber-500'
      : 'from-[#0A051B] via-[#0E0B28] to-[#19153E]';

  const groundColor =
    timeOfDay === 'night'
      ? '#0F382A'
      : timeOfDay === 'sunset'
      ? '#78350F'
      : worldData.groundColor || '#22C55E';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`fixed inset-0 z-50 bg-gradient-to-b ${skyBg} transition-colors duration-700 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden touch-none`}
    >
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 pointer-events-none opacity-80">
          <div className="absolute top-12 left-20 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <div className="absolute top-28 right-32 w-2 h-2 bg-amber-200 rounded-full animate-pulse" />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-ping" />
          <div className="absolute top-16 right-1/4 w-1 h-1 bg-white rounded-full" />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between w-full max-w-2xl mx-auto">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-2 cursor-pointer zentry-spring-press"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase">Volver</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs sm:text-sm font-black tracking-tight">{worldData.worldName}</span>
        </div>

        <button
          onClick={handleToggleTime}
          className="p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 cursor-pointer zentry-spring-press"
          title="Cambiar Iluminación"
        >
          {timeOfDay === 'day' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : timeOfDay === 'sunset' ? (
            <Sunset className="w-5 h-5 text-orange-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-300" />
          )}
        </button>
      </div>

      <div
        className="relative z-10 flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing my-auto"
        style={{ perspective: 1000 }}
      >
        <div
          onClick={handleAddPropOnGround}
          style={{
            transform: `rotateX(${pitchAngle}deg) rotateZ(${rotationAngle}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative w-64 h-64 sm:w-84 sm:h-84 rounded-[48px] shadow-[0_30px_70px_rgba(0,0,0,0.5)] border-4 border-white/40 cursor-pointer"
        >
          <div
            style={{ backgroundColor: groundColor }}
            className="w-full h-full rounded-[44px] overflow-hidden relative shadow-inner border-2 border-black/20"
          >
            {landscapeImageUrl && (
              <img
                src={landscapeImageUrl}
                alt="Textura Terreno"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
            )}

            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {propsList.map((prop) => {
              const leftPercent = 50 + prop.x * 24;
              const topPercent = 50 + prop.z * 24;

              return (
                <div
                  key={prop.id}
                  style={{
                    left: `${Math.max(10, Math.min(85, leftPercent))}%`,
                    top: `${Math.max(10, Math.min(85, topPercent))}%`,
                    transform: `translate(-50%, -50%) rotateZ(${-rotationAngle}deg) rotateX(${-pitchAngle}deg) scale(${prop.scale})`,
                    transformStyle: 'preserve-3d'
                  }}
                  className="absolute p-2 rounded-2xl bg-black/40 backdrop-blur-xs border border-white/40 shadow-lg text-white animate-spring-in pointer-events-none"
                >
                  {prop.type === 'tree' && <TreePine className="w-6 h-6 text-emerald-400 stroke-[2.5]" />}
                  {prop.type === 'cloud' && <Cloud className="w-6 h-6 text-white stroke-[2.5]" />}
                  {prop.type === 'crystal' && <Gem className="w-6 h-6 text-cyan-300 stroke-[2.5]" />}
                  {prop.type === 'creature' && <Dog className="w-6 h-6 text-amber-300 stroke-[2.5]" />}
                </div>
              );
            })}
          </div>

          <div
            style={{ transform: 'translateZ(-40px)' }}
            className="absolute inset-0 bg-black/40 rounded-[48px] filter blur-xl -z-10"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-2">
        <p className="text-[11px] font-bold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
          Arrastra para rotar • Toca el terreno para añadir
        </p>

        <div className="w-full flex items-center justify-between gap-2 p-2 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'tree', label: 'Árbol', icon: TreePine, color: 'text-emerald-400' },
              { id: 'cloud', label: 'Nube', icon: Cloud, color: 'text-white' },
              { id: 'crystal', label: 'Cristal', icon: Gem, color: 'text-cyan-400' },
              { id: 'creature', label: 'Amigo', icon: Dog, color: 'text-amber-400' }
            ].map((tool) => {
              const IconComp = tool.icon;
              const isSelected = selectedTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    sounds.playTap();
                    sounds.vibrate(5);
                    setSelectedTool(tool.id as any);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer zentry-spring-press ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  }`}
                  title={tool.label}
                >
                  <IconComp className={`w-5 h-5 ${isSelected ? 'text-slate-900' : tool.color} stroke-[2.5]`} />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveState}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer zentry-spring-press"
          >
            {hasSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
            <span>{hasSaved ? '¡Guardado!' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
