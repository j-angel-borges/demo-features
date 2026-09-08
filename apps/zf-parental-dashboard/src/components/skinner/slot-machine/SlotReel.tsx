import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Clock,
  Sparkles,
  Brain,
  Heart,
  BellRing,
  type LucideIcon,
} from 'lucide-react';

export interface ReelSymbol {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgRgba: string;
  borderRgba: string;
  glowColor: string;
  description: string;
}

export const CASINO_SYMBOLS: ReelSymbol[] = [
  {
    id: 'zap',
    name: 'Dopamina',
    icon: Zap,
    color: '#FBBF24', // Amber
    bgRgba: 'rgba(251, 191, 36, 0.18)',
    borderRgba: 'rgba(251, 191, 36, 0.45)',
    glowColor: 'rgba(251, 191, 36, 0.8)',
    description: 'Descarga dopaminérgica instantánea',
  },
  {
    id: 'clock',
    name: '5s Rush',
    icon: Clock,
    color: '#C2F4E7', // Menta Zentry
    bgRgba: 'rgba(194, 244, 231, 0.18)',
    borderRgba: 'rgba(194, 244, 231, 0.45)',
    glowColor: 'rgba(194, 244, 231, 0.8)',
    description: 'Temporizador de decaimiento atencional',
  },
  {
    id: 'sparkles',
    name: 'VR-7 Azar',
    icon: Sparkles,
    color: '#D6C8FA', // Lavanda Zentry
    bgRgba: 'rgba(214, 200, 250, 0.20)',
    borderRgba: 'rgba(214, 200, 250, 0.50)',
    glowColor: 'rgba(214, 200, 250, 0.8)',
    description: 'Recompensa variable de Skinner',
  },
  {
    id: 'brain',
    name: 'Fragmentación',
    icon: Brain,
    color: '#F472B6', // Neon Pink
    bgRgba: 'rgba(244, 114, 182, 0.18)',
    borderRgba: 'rgba(244, 114, 182, 0.45)',
    glowColor: 'rgba(244, 114, 182, 0.8)',
    description: 'Sobrecarga de corteza prefrontal',
  },
  {
    id: 'heart',
    name: 'Validación',
    icon: Heart,
    color: '#EF4444', // Crimson Red
    bgRgba: 'rgba(239, 68, 68, 0.18)',
    borderRgba: 'rgba(239, 68, 68, 0.45)',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    description: 'Refuerzo de validación y likes',
  },
  {
    id: 'bell',
    name: 'Compulsión',
    icon: BellRing,
    color: '#818CF8', // Electric Indigo
    bgRgba: 'rgba(129, 140, 248, 0.18)',
    borderRgba: 'rgba(129, 140, 248, 0.45)',
    glowColor: 'rgba(129, 140, 248, 0.8)',
    description: 'Alerta condicionada de Pavlov',
  },
];

interface SlotReelProps {
  reelIndex: number;
  isSpinning: boolean;
  targetSymbolId: string;
  isJackpot: boolean;
}

export const SlotReel: React.FC<SlotReelProps> = ({
  reelIndex,
  isSpinning,
  targetSymbolId,
  isJackpot,
}) => {
  const activeSymbol = useMemo(() => {
    return CASINO_SYMBOLS.find((s) => s.id === targetSymbolId) || CASINO_SYMBOLS[0];
  }, [targetSymbolId]);

  const IconComponent = activeSymbol.icon;

  // Staggered settling delays: Reel 0 -> 350ms, Reel 1 -> 650ms, Reel 2 -> 950ms
  const settleDelaySeconds = 0.35 + reelIndex * 0.30;

  return (
    <div className="relative w-28 sm:w-36 h-48 rounded-2xl bg-gradient-to-b from-black/90 via-slate-950 to-black/90 border-2 border-[#D6C8FA]/30 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center p-2">
      {/* Cylindrical Optical Vignette Shadow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/80 z-20" />

      {/* Payline Focus Laser Indicators */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 border-y border-[#FBBF24]/30 pointer-events-none z-20 bg-gradient-to-r from-[#FBBF24]/5 via-transparent to-[#FBBF24]/5" />
      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FBBF24] rounded-r-full z-20 opacity-80" />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FBBF24] rounded-l-full z-20 opacity-80" />

      {/* Reel Rolling Track */}
      <motion.div
        className="w-full flex flex-col items-center justify-center z-10"
        animate={{
          y: isSpinning ? [-240, 0] : 0,
          filter: isSpinning ? 'blur(5px)' : 'blur(0px)',
        }}
        transition={{
          y: isSpinning
            ? {
                repeat: Infinity,
                duration: 0.14 + reelIndex * 0.04,
                ease: 'linear',
              }
            : {
                type: 'spring',
                stiffness: 400,
                damping: 22,
                delay: settleDelaySeconds,
              },
          filter: {
            duration: 0.25,
            delay: isSpinning ? 0 : settleDelaySeconds,
          },
        }}
      >
        {/* Active Target Symbol Display Card */}
        <div
          className="w-full py-3.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: activeSymbol.bgRgba,
            border: `1.5px solid ${activeSymbol.borderRgba}`,
            boxShadow: isJackpot
              ? `0 0 30px ${activeSymbol.glowColor}`
              : `0 0 12px ${activeSymbol.glowColor}20`,
          }}
        >
          <div
            className="p-3 rounded-full mb-1.5 transition-transform duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              boxShadow: `0 0 16px ${activeSymbol.glowColor}`,
            }}
          >
            <IconComponent
              className="w-8 h-8"
              style={{
                color: activeSymbol.color,
                filter: `drop-shadow(0 0 8px ${activeSymbol.color})`,
              }}
            />
          </div>

          <span
            className="text-[11px] font-mono font-black tracking-wider uppercase"
            style={{ color: activeSymbol.color }}
          >
            {activeSymbol.name}
          </span>
          <span className="text-[9px] text-slate-300 dark:text-slate-400 font-sans text-center leading-tight mt-0.5 line-clamp-1 max-w-[110px]">
            {activeSymbol.description}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
