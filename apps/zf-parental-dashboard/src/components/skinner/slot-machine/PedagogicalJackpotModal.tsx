import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';
import { setEmergencyLock } from '@zentry/shared';

interface PedagogicalJackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
  elapsedSeconds: number;
  nominalDuration: number;
  velocityRpm: number;
  reason: string;
}

export const PedagogicalJackpotModal: React.FC<PedagogicalJackpotModalProps> = ({
  isOpen,
  onClose,
  onViewReport,
  elapsedSeconds,
  nominalDuration,
  velocityRpm,
  reason,
}) => {
  if (!isOpen) return null;

  const retentionPct = Math.min(100, Math.round((elapsedSeconds / (nominalDuration || 1)) * 100));

  const handleTriggerSafePause = () => {
    setEmergencyLock(true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/35 backdrop-blur-xl transition-all">
        <motion.div
          className="relative max-w-lg w-full rounded-[2rem] p-6 sm:p-7 overflow-hidden border border-white/80 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.3),inset_0_1px_2px_rgba(255,255,255,0.95)]"
          style={{
            background: 'rgba(255, 255, 255, 0.84)',
            backdropFilter: 'blur(40px) saturate(190%)',
            WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          }}
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

          {/* Header Marquee Badge */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-600 shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase block">
                  ALERTA NEUROCOGNITIVA
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Jackpot Dopamínico Detectado
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trigger Context Banner */}
          <div className="mb-4 px-3.5 py-2 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-center gap-2.5 text-xs text-amber-900 shadow-xs">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">Motivo:</span>
            <span className="font-semibold text-slate-800">{reason}</span>
          </div>

          {/* Real-time Trigger Metrics Grid (Frosted Glass Pods with Dark Text) */}
          <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
            <div className="p-3 rounded-2xl bg-white/70 border border-white shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">TIEMPO VISTO</span>
              <p className="text-lg font-mono font-extrabold text-slate-900 my-0.5">{elapsedSeconds}s</p>
              <span className="text-[10px] text-rose-600 font-bold">&lt; 7s Salto Rápido</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-white shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">RETENCIÓN</span>
              <p className="text-lg font-mono font-extrabold text-slate-900 my-0.5">{retentionPct}%</p>
              <span className="text-[10px] text-slate-500">de {nominalDuration}s nominales</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-white shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">VELOCIDAD</span>
              <p className="text-lg font-mono font-extrabold text-slate-900 my-0.5">{velocityRpm.toFixed(1)} RPM</p>
              <span className="text-[10px] text-rose-600 font-bold">Impulso Compulsivo</span>
            </div>
          </div>

          {/* Concise Parent-First Insights (Frosted Cards with Dark High-Contrast Typography) */}
          <div className="space-y-3 mb-5">
            <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200/60 shadow-xs">
              <h4 className="font-extrabold text-violet-950 text-xs mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-violet-600" />
                ¿Qué ocurrió en el cerebro del menor?
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Tu hijo pasó varios videos en menos de 7 segundos buscando estímulos rápidos (patrón de refuerzo de B.F. Skinner en el núcleo accumbens).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 shadow-xs">
              <h4 className="font-extrabold text-emerald-950 text-xs mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                Beneficio para ti como padre
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Intervenir ahora protege su paciencia, previene la adicción a pantallas y fortalece su concentración en la lectura y el aprendizaje profundo.
              </p>
            </div>
          </div>

          {/* Actionable Parental Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleTriggerSafePause}
              className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Aplicar Pausa de Seguridad</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewReport();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#533B87] hover:bg-[#684BA8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C2F4E7]" />
              <span>Ver Reporte Científico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
