import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, Clock } from 'lucide-react';
import { islandTelemetryService } from '../services/islandTelemetryService';

export interface CircadianPhaseInfo {
  phase: 'morning' | 'afternoon' | 'dusk' | 'night';
  title: string;
  subtitle: string;
  color: string;
  gradientId: string;
  lightLevelPct: number;
  recommendation: string;
  isDaytime: boolean;
}

interface CircadianClockWidgetProps {
  isHighlighted?: boolean;
  onClearHighlight?: () => void;
  className?: string;
}

export const CircadianClockWidget: React.FC<CircadianClockWidgetProps> = ({
  isHighlighted = false,
  onClearHighlight,
  className = '',
}) => {
  const [now, setNow] = useState(() => new Date());

  // Update clock every second for live smoothness
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute 24-hour solar coordinates
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const decimalHour = hours + minutes / 60 + seconds / 3600;

  // 24-hour cycle progression: 0.0 -> 1.0 (from 00:00 to 24:00)
  const dayProgress = decimalHour / 24;

  // Circadian phase classification based on chronobiology & solar elevation
  const phaseInfo: CircadianPhaseInfo = useMemo(() => {
    if (decimalHour >= 6.0 && decimalHour < 12.0) {
      return {
        phase: 'morning',
        title: 'Mañana Solar',
        subtitle: 'Luz dorada matutina',
        color: '#FACC15',
        gradientId: 'morningSolarGrad',
        lightLevelPct: Math.round(70 + ((decimalHour - 6) / 6) * 30),
        recommendation: 'Pico de atención y vitalidad: Ideal para explorar y crear.',
        isDaytime: true,
      };
    } else if (decimalHour >= 12.0 && decimalHour < 18.5) {
      return {
        phase: 'afternoon',
        title: 'Tarde Cálida',
        subtitle: 'Luz ámbar de enfoque',
        color: '#FB923C',
        gradientId: 'afternoonAmberGrad',
        lightLevelPct: Math.round(100 - ((decimalHour - 12) / 6.5) * 50),
        recommendation: 'Atención sostenida: Perfecto para proyectos lúdicos y arte sin prisa.',
        isDaytime: true,
      };
    } else if (decimalHour >= 18.5 && decimalHour < 21.0) {
      return {
        phase: 'dusk',
        title: 'Crepúsculo y Calma',
        subtitle: 'Transición hacia el descanso',
        color: '#533B87',
        gradientId: 'duskPurpleGrad',
        lightLevelPct: Math.round(50 - ((decimalHour - 18.5) / 2.5) * 35),
        recommendation: 'Atenuación lumínica: Cero luz azul y actividades tranquilas.',
        isDaytime: false,
      };
    } else {
      return {
        phase: 'night',
        title: 'Noche de Estrellas',
        subtitle: 'Descanso neurocognitivo',
        color: '#1E1B4B',
        gradientId: 'nightIndigoGrad',
        lightLevelPct: 8,
        recommendation: 'Regeneración y sueño profundo: Hora de descansar la mente.',
        isDaytime: false,
      };
    }
  }, [decimalHour]);

  // Log phase transition telemetry when phase changes
  useEffect(() => {
    islandTelemetryService.logCircadianEvent(
      phaseInfo.phase,
      Math.round(decimalHour),
      `${phaseInfo.title} - ${phaseInfo.recommendation}`
    );
  }, [phaseInfo.phase]);

  // Auto-clear highlight after 5 seconds
  useEffect(() => {
    if (isHighlighted && onClearHighlight) {
      const timeout = setTimeout(() => {
        onClearHighlight();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isHighlighted, onClearHighlight]);

  // SVG Geometry for the 360° Circadian Orbital Ring
  const viewBoxSize = 220;
  const center = viewBoxSize / 2;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - dayProgress);

  // Celestial glyph position (Sun / Moon) traveling along the 360° perimeter
  // 00:00 is at top (-90 degrees)
  const angleDeg = dayProgress * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const glyphX = center + radius * Math.cos(angleRad);
  const glyphY = center + radius * Math.sin(angleRad);

  // Formatted digital time
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  // Remaining daylight or rest time calculation
  const remainingTimeStr = useMemo(() => {
    if (decimalHour < 18.5 && decimalHour >= 6.0) {
      const diffHours = 18.5 - decimalHour;
      const h = Math.floor(diffHours);
      const m = Math.round((diffHours - h) * 60);
      return `${h}h ${m}m de sol restante`;
    } else {
      return 'Modo descanso nocturno activo';
    }
  }, [decimalHour]);

  return (
    <div
      className={`relative w-full max-w-[340px] mx-auto flex flex-col items-center select-none ${className}`}
    >
      {/* Outer Luminous Aura (Activated when highlighted by Agentic Copilot) */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: [0.5, 0.9, 0.5],
              scale: [1, 1.06, 1],
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'easeInOut',
            }}
            className="absolute -inset-4 rounded-full blur-2xl pointer-events-none z-0"
            style={{
              backgroundColor: `${phaseInfo.color}35`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Dial Central Liquid Glass Chassis */}
      <div className="relative z-10 w-[220px] h-[220px] flex items-center justify-center">
        {/* SVG Orbital Track & Gradients */}
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
        >
          <defs>
            {/* Morning Gold Gradient */}
            <linearGradient id="morningSolarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            {/* Afternoon Amber Gradient */}
            <linearGradient id="afternoonAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Dusk Purple Gradient */}
            <linearGradient id="duskPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="40%" stopColor="#533B87" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Night Indigo Gradient */}
            <linearGradient id="nightIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#533B87" />
              <stop offset="60%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0B1020" />
            </linearGradient>

            {/* Specular Edge Glow Filter */}
            <filter id="circadianGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={phaseInfo.color} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Ambient Circle Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-slate-200/80 dark:text-white/10"
          />

          {/* Progressive 360° Circadian Active Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${phaseInfo.gradientId})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#circadianGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Liquid Glass Core with High Specular Borders */}
        <div
          className={`relative w-[158px] h-[158px] rounded-full flex flex-col items-center justify-center p-3 text-center transition-all duration-500 shadow-xl border ${
            isHighlighted
              ? 'border-amber-400/90 dark:border-amber-300/80 shadow-amber-400/20'
              : 'border-[#D6C8FA]/50 dark:border-white/15'
          } bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-2xl`}
        >
          {/* Micro-stars for Night or Dusk */}
          {!phaseInfo.isDaytime && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <span className="absolute top-4 left-6 w-1 h-1 bg-white/70 rounded-full animate-ping" />
              <span className="absolute top-10 right-5 w-1 h-1 bg-purple-200/80 rounded-full animate-pulse" />
              <span className="absolute bottom-5 left-10 w-0.5 h-0.5 bg-blue-100/90 rounded-full" />
              <span className="absolute bottom-8 right-8 w-1 h-1 bg-[#C2F4E7]/60 rounded-full animate-pulse" />
            </div>
          )}

          {/* Clean High-Contrast Digital Time Display */}
          <div className="flex items-center justify-center font-mono font-black tracking-tight text-slate-900 dark:text-[#EBF1F5]">
            <span className="text-4xl leading-none">{formattedHours}</span>
            <span className="text-3xl leading-none text-slate-400 dark:text-slate-500 mx-1 animate-pulse">
              :
            </span>
            <span className="text-4xl leading-none">{formattedMinutes}</span>
          </div>
        </div>

        {/* Traveling Solar / Lunar Glyph Orbiting Along Perimeter */}
        <motion.div
          animate={{
            x: glyphX - center,
            y: glyphY - center,
          }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18,
          }}
          className="absolute z-20 w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center shadow-lg pointer-events-none"
          style={{
            left: `${center}px`,
            top: `${center}px`,
            background: phaseInfo.isDaytime
              ? 'linear-gradient(135deg, #FEF08A, #F59E0B)'
              : 'linear-gradient(135deg, #533B87, #1E1B4B)',
            boxShadow: `0 0 14px ${phaseInfo.color}`,
            border: '2px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {phaseInfo.isDaytime ? (
            <Sun className="w-4 h-4 text-amber-950 animate-spin" style={{ animationDuration: '16s' }} />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-lavender-200 text-[#C2F4E7]" />
          )}
        </motion.div>
      </div>

      {/* Highlighted Response Card from Copilot (When user queries time/rhythm) */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#120E24]/95 border border-amber-400/70 shadow-lg text-center text-xs text-slate-800 dark:text-amber-100 flex items-center gap-1.5 font-medium z-20"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{remainingTimeStr}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
