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
    <div className="glass-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden border border-[#D6C8FA]/25 shadow-xl flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Child Avatar & Core Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#533B87] to-[#D6C8FA] p-[2px] shadow-md">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#080D1A] flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-black font-mono tracking-wider text-[#533B87] dark:text-[#D6C8FA]">MZ</span>
                )}
              </div>
            </div>
            {/* Online Heartbeat Pulse */}
            <div
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#080D1A] ${
                profile.isOnline ? 'bg-[#34D399]' : 'bg-slate-400'
              } flex items-center justify-center`}
            >
              {profile.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#EBF1F5] tracking-tight truncate">
                {profile.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {profile.grade} • {profile.school}
            </p>
          </div>
        </div>

        {/* Top Right Actions: Age Tag & Settings Gear */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-xl bg-violet-50 dark:bg-[#533B87]/30 border border-violet-200/80 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA] text-xs font-bold font-mono">
            {profile.age} años
          </span>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-violet-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-[#D6C8FA]/20 text-slate-600 dark:text-[#D6C8FA] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Configurar Perfil & Restricciones"
            aria-label="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Symmetrical Status & Device Row */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-violet-50/80 dark:bg-[#533B87]/25 border border-violet-200/70 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA] text-xs font-semibold truncate shadow-2xs">
          {profile.activeApp === 'skinner' ? (
            <>
              <Gamepad2 className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7] shrink-0" />
              <span className="truncate">En Skinner Box</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="truncate text-slate-600 dark:text-slate-300 font-medium">En Reposo</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium truncate shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="truncate font-mono">{profile.devicePaired}</span>
        </div>
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
      <div className="grid grid-cols-2 gap-2.5">
        {/* Battery Telemetry */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-[#1B6E5E] dark:text-[#34D399] border border-emerald-200/60 dark:border-emerald-500/20 shrink-0">
            {profile.batteryPct > 80 ? <BatteryCharging className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">Nivel de Batería</span>
            <span className="text-xs font-bold text-slate-900 dark:text-[#EBF1F5] font-mono">{profile.batteryPct}%</span>
          </div>
        </div>

        {/* Cognitive Attention Index */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-[#533B87]/30 text-[#533B87] dark:text-[#C2F4E7] border border-violet-200/60 dark:border-[#D6C8FA]/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">Índice de Atención</span>
            <span className="text-xs font-bold text-[#533B87] dark:text-[#C2F4E7] font-mono">8.4 / 10</span>
          </div>
        </div>
      </div>

      {/* Immediate Emergency Lock Action Row */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 transition-colors ${isEmergencyLocked ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
              {isEmergencyLocked ? 'Bloqueo Inmediato Activo' : 'Control de Acceso'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {isEmergencyLocked ? 'Dispositivos pausados' : 'Bloqueo rápido de sesión'}
            </span>
          </div>
        </div>

        {onToggleEmergencyLock && (
          <button
            onClick={onToggleEmergencyLock}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
              isEmergencyLocked
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-red-50/90 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
            }`}
          >
            {isEmergencyLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Bloquear</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
