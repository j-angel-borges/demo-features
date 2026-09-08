import React from 'react';
import { Sparkles, Palette, Music, RefreshCw } from 'lucide-react';
import { organicAudio } from '../services/organicAudioService';

interface SensoryPondsProps {
  onSpawnCreature: () => void;
  onCycleScene: () => void;
  onPlayMelody: () => void;
  onClearAll: () => void;
  creaturesCount: number;
}

export const SensoryPonds: React.FC<SensoryPondsProps> = ({
  onSpawnCreature,
  onCycleScene,
  onPlayMelody,
  onClearAll,
  creaturesCount,
}) => {
  return (
    <>
      {/* 1. Estanque Izquierdo: Criaturas (assets/characters) */}
      <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center gap-3">
        <button
          onClick={() => {
            organicAudio.playWoodPop(1.2);
            onSpawnCreature();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full liquid-glass flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-200 border-2 border-[#D6C8FA]/60 shadow-lg shadow-[#533B87]/15 group cursor-pointer"
          title="assets/characters"
          aria-label="Crear criatura"
        >
          {/* Resplandor óptico */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#533B87]/20 to-[#D6C8FA]/30 pointer-events-none" />
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#533B87] dark:text-[#D6C8FA] transition-transform group-hover:scale-110" />
          <span className="text-[10px] sm:text-xs font-semibold text-[#1E1633] dark:text-white mt-0.5 tracking-tight">
            Crear
          </span>

          {/* Badge contador de criaturas en la carpeta */}
          {creaturesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#533B87] text-[#C2F4E7] text-[10px] font-bold flex items-center justify-center border border-white">
              {creaturesCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Estanque Superior: Mundos / Climas (assets/scenes) */}
      <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-4">
        <button
          onClick={() => {
            organicAudio.playWoodPop(1.0);
            onCycleScene();
          }}
          className="h-12 sm:h-14 px-5 sm:px-6 rounded-full liquid-glass flex items-center gap-2.5 active:scale-95 transition-transform duration-200 border border-[#C2F4E7]/70 shadow-md shadow-[#0E5A49]/10 group cursor-pointer"
          title="assets/scenes"
          aria-label="Cambiar clima"
        >
          <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-[#0E5A49] dark:text-[#C2F4E7] transition-transform group-hover:rotate-12" />
          <span className="text-xs sm:text-sm font-semibold text-[#1E1633] dark:text-white tracking-tight">
            Mundo
          </span>
        </button>
      </div>

      {/* 3. Estanque Derecho: Melodías / Sonidos (assets/sounds) */}
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center gap-3">
        <button
          onClick={() => {
            organicAudio.playCrystalChime(540);
            onPlayMelody();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full liquid-glass flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-200 border-2 border-[#00F2FE]/50 shadow-lg shadow-[#00F2FE]/15 group cursor-pointer"
          title="assets/sounds"
          aria-label="Tocar melodía"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00F2FE]/15 to-[#C2F4E7]/25 pointer-events-none" />
          <Music className="w-7 h-7 sm:w-8 sm:h-8 text-[#1A365D] dark:text-[#00F2FE] transition-transform group-hover:scale-110" />
          <span className="text-[10px] sm:text-xs font-semibold text-[#1E1633] dark:text-white mt-0.5 tracking-tight">
            Cantar
          </span>
        </button>
      </div>

      {/* 4. Control Inferior: Limpieza Reversible */}
      {creaturesCount > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={onClearAll}
            className="h-10 px-4 rounded-full liquid-glass flex items-center gap-2 text-xs font-medium text-[#5E6475] dark:text-[#A1A7B8] hover:text-[#1E1633] dark:hover:text-white active:scale-95 transition-all"
            aria-label="Limpiar lienzo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      )}
    </>
  );
};
