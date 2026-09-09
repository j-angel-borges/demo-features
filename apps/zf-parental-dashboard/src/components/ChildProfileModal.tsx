import React, { useState } from 'react';
import { X, Save, Clock, ShieldCheck, Phone, Moon, Smartphone } from 'lucide-react';
import type { ChildProfileState } from '../types';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfileState;
  onSave: (updated: Partial<ChildProfileState>) => void;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [dailyLimit, setDailyLimit] = useState(profile.dailyLimitMinutes);
  const [sleepStart, setSleepStart] = useState(profile.sleepScheduleStart);
  const [sleepEnd, setSleepEnd] = useState(profile.sleepScheduleEnd);
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContact);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      dailyLimitMinutes: dailyLimit,
      sleepScheduleStart: sleepStart,
      sleepScheduleEnd: sleepEnd,
      emergencyContact: emergencyPhone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-lg border border-[#D6C8FA]/30 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#D6C8FA]/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#EBF1F5]">Configurar Perfil & Restricciones</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Mateo Zegarra Mendoza • 10 años</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B6E5E] dark:text-[#C2F4E7]" />
                Límite de Pantalla Diario
              </label>
              <span className="font-mono text-[#533B87] dark:text-[#C2F4E7] font-bold">{dailyLimit} minutos</span>
            </div>
            <input
              type="range"
              min="30"
              max="240"
              step="15"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-[#131B30] rounded-lg appearance-none cursor-pointer accent-[#533B87]"
            />
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              <span>30 min</span>
              <span>90 min (Recomendado)</span>
              <span>240 min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-amber-500" />
                Inicio de Descanso
              </label>
              <input
                type="time"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] font-mono focus:border-[#533B87] outline-none shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
                Fin de Descanso
              </label>
              <input
                type="time"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] font-mono focus:border-[#533B87] outline-none shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
              Teléfono de Contacto de Emergencia
            </label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+51 999 000 111"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#533B87] outline-none shadow-xs"
            />
          </div>

          <div className="p-3 rounded-2xl bg-violet-50 dark:bg-[#533B87]/20 border border-violet-200 dark:border-[#D6C8FA]/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-[#533B87] dark:text-[#C2F4E7] shrink-0 mt-0.5" />
            <p>
              Las restricciones se sincronizan automáticamente con todos los dispositivos de Mateo.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#D6C8FA]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#44326E] text-xs text-white font-bold flex items-center gap-2 shadow-md shadow-[#533B87]/30 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#C2F4E7]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
