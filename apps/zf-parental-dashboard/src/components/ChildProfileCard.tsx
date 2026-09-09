import React from 'react';
import {
  User,
  Battery,
  BatteryCharging,
  Smartphone,
  Moon,
  Clock,
  Settings,
  ShieldAlert,
  Lock,
  Sparkles,
  Gamepad2,
  Eye,
} from 'lucide-react';
import type { ChildProfileState } from '../types';

interface ChildProfileCardProps {
  profile: ChildProfileState;
  onOpenSettings: () => void;
  onToggleCircadian: () => void;
  isEmergencyLocked?: boolean;
  onToggleEmergencyLock?: () => void;
}

export const ChildProfileCard: React.FC<ChildProfileCardProps> = ({
  profile,
  onOpenSettings,
  onToggleCircadian,
  isEmergencyLocked = false,
  onToggleEmergencyLock,
}) => {
  const usagePct = Math.min(100, Math.round((profile.usedMinutesToday / profile.dailyLimitMinutes) * 100));

  const getActiveAppBadge = () => {
    switch (profile.activeApp) {
      case 'skinner':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-[#533B87]/50 border border-violet-200 dark:border-[#D6C8FA]/40 text-[#533B87] dark:text-[#D6C8FA] text-xs font-semibold shadow-xs">
            <Gamepad2 className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
            En Skinner Box
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#131B30] border border-slate-200 dark:border-[#D6C8FA]/20 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <Moon className="w-3.5 h-3.5 text-[#533B87] dark:text-[#D6C8FA]" />
            En Reposo
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/20 flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Child Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#533B87] to-[#D6C8FA] p-[2px] shadow-lg">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-[#080D1A] flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold font-mono text-[#533B87] dark:text-[#D6C8FA]">MQ</span>
                )}
              </div>
            </div>
            {/* Online Heartbeat Pulse */}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#080D1A] ${
                profile.isOnline ? 'bg-[#34D399]' : 'bg-gray-500'
              } flex items-center justify-center`}
            >
              {profile.isOnline && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#EBF1F5] tracking-tight">{profile.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA] text-[11px] font-semibold">
                {profile.age} años
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {profile.grade} • {profile.school}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getActiveAppBadge()}
              <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#080D1A]/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#D6C8FA]/15">
                <Smartphone className="w-3 h-3 text-[#533B87] dark:text-[#D6C8FA]" />
                <span>{profile.devicePaired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Settings Action */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-violet-100 dark:bg-[#533B87]/30 dark:hover:bg-[#533B87]/60 border border-slate-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Configurar Perfil & Restricciones"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Time Progress Bar */}
      <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080D1A]/70 border border-slate-200 dark:border-[#D6C8FA]/15">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#533B87] dark:text-[#D6C8FA] font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
            Tiempo de Pantalla Diario
          </span>
          <span className="font-mono text-slate-900 dark:text-[#EBF1F5] font-semibold">
            {profile.usedMinutesToday} <span className="text-slate-500 dark:text-slate-400 font-normal">/ {profile.dailyLimitMinutes} min</span>
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#131B30] overflow-hidden p-0.5 border border-[#D6C8FA]/30 dark:border-[#D6C8FA]/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePct >= 90
                ? 'bg-gradient-to-r from-[#FBBF24] to-[#F87171]'
                : usagePct >= 70
                ? 'bg-gradient-to-r from-[#533B87] to-[#FBBF24]'
                : 'bg-gradient-to-r from-[#533B87] to-[#C2F4E7]'
            }`}
            style={{ width: `${usagePct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 mt-2">
          <span>Horario de Descanso: {profile.sleepScheduleStart} - {profile.sleepScheduleEnd}</span>
          <span className="text-[#1B6E5E] dark:text-[#C2F4E7] font-bold">{100 - usagePct}% disponible hoy</span>
        </div>
      </div>

      {/* Metric Badges Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Battery Telemetry */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#131B30]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-[#34D399]/20 text-[#1B6E5E] dark:text-[#34D399]">
            {profile.batteryPct > 80 ? <BatteryCharging className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">Nivel de Batería</span>
            <span className="text-xs font-bold text-slate-900 dark:text-[#EBF1F5] font-mono">{profile.batteryPct}%</span>
          </div>
        </div>

        {/* Cognitive Attention Index */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#131B30]/60 border border-slate-200 dark:border-[#D6C8FA]/15">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 text-[#533B87] dark:text-[#C2F4E7]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">Índice de Atención</span>
            <span className="text-xs font-bold text-[#533B87] dark:text-[#C2F4E7] font-mono">8.4 / 10</span>
          </div>
        </div>
      </div>

      {/* Immediate Emergency Lock Action Row */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#D6C8FA]/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${isEmergencyLocked ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-850 dark:text-white block leading-tight">
              {isEmergencyLocked ? 'Bloqueo Inmediato Activo' : 'Control de Acceso'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isEmergencyLocked ? 'Dispositivos bloqueados' : 'Bloqueo rápido de sesión'}
            </span>
          </div>
        </div>

        {onToggleEmergencyLock && (
          <button
            onClick={onToggleEmergencyLock}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
              isEmergencyLocked
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300'
            }`}
          >
            {isEmergencyLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Bloquear</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
