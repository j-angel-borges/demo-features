import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SunMedium, Moon, Sparkles, Brain, Leaf, Compass } from 'lucide-react';

interface CircadianBiologicalCardProps {
  className?: string;
  onOpenArtBreak?: () => void;
}

export const CircadianBiologicalCard: React.FC<CircadianBiologicalCardProps> = ({
  className = '',
  onOpenArtBreak,
}) => {
  const [currentHour, setCurrentHour] = useState(() => {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentHour(d.getHours() + d.getMinutes() / 60);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const bioStatus = useMemo(() => {
    if (currentHour >= 6 && currentHour < 12) {
      return {
        modeName: 'Hora de Crear y Jugar',
        icon: <SunMedium className="w-4 h-4 text-amber-500" />,
        accentColor: '#FACC15',
        lightLevel: Math.round(75 + ((currentHour - 6) / 6) * 25),
        summary: 'Luz solar matutina plena. Pico natural de dopamina constructiva.',
        tip: 'Excelente momento para retos de memoria y exploración al aire libre.',
        tag: 'Dopamina Constructiva',
      };
    } else if (currentHour >= 12 && currentHour < 18.5) {
      return {
        modeName: 'Enfoque y Descubrimiento',
        icon: <Compass className="w-4 h-4 text-orange-500" />,
        accentColor: '#FB923C',
        lightLevel: Math.round(100 - ((currentHour - 12) / 6.5) * 45),
        summary: 'Luz ámbar de la tarde. Ventana de atención profunda y calma.',
        tip: 'Fomenta el dibujo o construcción de modelos sin distracciones digitales.',
        tag: 'Atención Sostenida',
      };
    } else if (currentHour >= 18.5 && currentHour < 21) {
      return {
        modeName: 'Transición Suave y Crepúsculo',
        icon: <Leaf className="w-4 h-4 text-emerald-400" />,
        accentColor: '#533B87',
        lightLevel: Math.round(45 - ((currentHour - 18.5) / 2.5) * 30),
        summary: 'Atenuación lumínica natural. Reducción de estímulos hiperactivos.',
        tip: 'Tiempo de desconexión: cuentos leídos en voz alta y luz tenue cálida.',
        tag: 'Restauración ART',
      };
    } else {
      return {
        modeName: 'Modo Calma y Estrellas',
        icon: <Moon className="w-4 h-4 text-[#D6C8FA]" />,
        accentColor: '#1E1B4B',
        lightLevel: 5,
        summary: 'Cero luz azul. Consolidación de memoria y reposo biológico.',
        tip: 'El sueño profundo repara los circuitos de atención para el día siguiente.',
        tag: 'Neuroplasticidad',
      };
    }
  }, [currentHour]);

  return (
    <div
      className={`w-full max-w-[380px] mx-auto rounded-2xl p-3.5 border transition-all duration-300 shadow-md backdrop-blur-xl ${className} bg-white/80 dark:bg-[#0B1020]/80 border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20`}
    >
      {/* Header: Status title and tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
            {bioStatus.icon}
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-slate-900 dark:text-[#EBF1F5]">
              {bioStatus.modeName}
            </h4>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Estado Biológico Zentry
            </span>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 dark:bg-purple-400/20 text-[#533B87] dark:text-[#D6C8FA] border border-[#533B87]/20 dark:border-[#D6C8FA]/30">
          {bioStatus.tag}
        </span>
      </div>

      {/* Natural Light Meter */}
      <div className="space-y-1 my-2">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Nivel de Luz Natural
          </span>
          <span className="font-mono">{bioStatus.lightLevel}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bioStatus.lightLevel}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #FACC15, ${bioStatus.accentColor})`,
            }}
          />
        </div>
      </div>

      {/* Summary and Pedagogy / ART Tip */}
      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
        {bioStatus.summary}
      </p>

      <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 flex-1 truncate">
          <Brain className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7] shrink-0" />
          <span className="truncate">{bioStatus.tip}</span>
        </div>

        {onOpenArtBreak && (
          <button
            onClick={onOpenArtBreak}
            className="shrink-0 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold cursor-pointer transition-all active:scale-95"
            title="Activar Pausa Activa ART"
          >
            Pausa ART
          </button>
        )}
      </div>
    </div>
  );
};
