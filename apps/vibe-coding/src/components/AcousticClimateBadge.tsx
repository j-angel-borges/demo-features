import React from 'react';
import { MicOff, Waves } from 'lucide-react';
import { AcousticClimateState } from '../types';

interface AcousticClimateBadgeProps {
  state: AcousticClimateState;
  onToggleMic: () => void;
}

export const AcousticClimateBadge: React.FC<AcousticClimateBadgeProps> = ({
  state,
  onToggleMic,
}) => {
  const isCalm = state.isCalm;
  const isOverload = state.ambientMode === 'overload';

  return (
    <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-40 pointer-events-auto">
      <button
        onClick={onToggleMic}
        className={`h-11 sm:h-12 px-3.5 sm:px-4 rounded-full liquid-glass flex items-center gap-2 text-xs font-semibold transition-all duration-300 active:scale-95 shadow-sm ${
          isOverload
            ? 'border-amber-400/60 bg-amber-500/10 text-amber-800 dark:text-amber-200'
            : isCalm
            ? 'border-[#C2F4E7]/80 bg-[#C2F4E7]/25 text-[#0E5A49] dark:text-[#C2F4E7]'
            : 'border-[#D6C8FA]/80 bg-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA]'
        }`}
        title="Sensor de bienestar acústico ambiental"
        aria-label="Sensor de entorno"
      >
        {state.isListening ? (
          <div className="flex items-center gap-1.5">
            <Waves className="w-4 h-4 animate-pulse text-current" />
            <span className="text-[11px] font-medium tracking-tight">
              {isOverload ? 'Ruidoso' : isCalm ? 'Calma' : 'Vibrante'}
            </span>
            <span className="text-[10px] opacity-75 tabular-nums">
              {state.rmsDb}dB
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MicOff className="w-4 h-4 opacity-70" />
            <span className="text-[11px] font-medium tracking-tight">Sensor</span>
          </div>
        )}
      </button>
    </div>
  );
};
