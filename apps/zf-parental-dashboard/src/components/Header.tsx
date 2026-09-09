import React from 'react';
import {
  Radio,
  Sliders,
  Moon,
  Sun,
  LayoutDashboard,
  Gamepad2,
  FolderLock,
  UserCheck,
  ShieldAlert,
  Lock,
  Palette,
} from 'lucide-react';
import type { DashboardTab } from '../types';

interface HeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isFirebaseOnline: boolean;
  circadianActive: boolean;
  onToggleCircadian: () => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  isEmergencyLocked: boolean;
  onToggleEmergencyLock: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isFirebaseOnline,
  circadianActive,
  onToggleCircadian,
  onToggleSimulator,
  isSimulatorOpen,
  isEmergencyLocked,
  onToggleEmergencyLock,
  theme,
  onToggleTheme,
}) => {
  const tabs: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'General', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vault', label: 'Bóveda', icon: <FolderLock className="w-4 h-4" /> },
    { id: 'skinner', label: 'Observador', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'profile', label: 'Ficha', icon: <UserCheck className="w-4 h-4" /> },
  ];

  // Micro-PWA 4 Cross-App Navigation Contract Helper (Z-Art Studio Port 5176)
  const _getCreativeStudioUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') return `http://${hostname}:5176`;
    }
    return 'https://zf-creative-studio.web.app';
  };

  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#D6C8FA]/30 dark:border-[#D6C8FA]/15 px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Minimalist Icon + Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#533B87] to-[#D6C8FA] p-[1.5px] shadow-sm flex items-center justify-center">
              <div className={`w-full h-full rounded-[9px] ${isLight ? 'bg-white' : 'bg-[#080D1A]'} flex items-center justify-center transition-colors`}>
                <span className="font-mono font-bold text-xs text-[#533B87] dark:text-[#D6C8FA]">Z</span>
              </div>
            </div>
            <span className={`text-sm font-black tracking-wider ${isLight ? 'text-slate-900' : 'text-[#EBF1F5]'} font-sans`}>
              ZENTRY
            </span>
          </div>

          {/* Sync Dot Icon Only */}
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-lg ${
              isLight ? 'bg-emerald-50 border border-emerald-200/80 text-[#1B6E5E]' : 'bg-[#080D1A]/80 border border-[#D6C8FA]/20 text-[#34D399]'
            }`}
            title={isFirebaseOnline ? 'Nube Sincronizada' : 'Modo Local Activo'}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>

        {/* Tab Navigation (Segmented padOS pill bar) */}
        <nav className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-[#080D1A]/60 border border-slate-200/80 dark:border-[#D6C8FA]/15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#533B87] text-white shadow-sm'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Utility Actions - Minimalist Icon Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher Toggle (Icon only) */}
          <button
            onClick={onToggleTheme}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#131B30] border-[#D6C8FA]/20 text-[#D6C8FA] hover:bg-[#1C2644]'
            }`}
            title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            aria-label="Alternar Modo Oscuro"
          >
            {isLight ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-[#D6C8FA]" />
            )}
          </button>

          {/* Circadian Toggle (Icon only) */}
          <button
            onClick={onToggleCircadian}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              circadianActive
                ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-[#FBBF24]/30 dark:border-[#FBBF24] dark:text-[#FBBF24]'
                : isLight
                  ? 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                  : 'bg-[#131B30] border-[#D6C8FA]/20 text-slate-400 hover:text-[#FBBF24] hover:bg-[#1C2644]'
            }`}
            title="Alternar Modo Calidez Circadiana"
            aria-label="Modo Calidez Circadiana"
          >
            <Sun className={`w-4 h-4 ${circadianActive ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>

          {/* Emergency Lock (Icon only) */}
          <button
            onClick={onToggleEmergencyLock}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isEmergencyLocked
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                : isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                  : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/30 text-red-400'
            }`}
            title={isEmergencyLocked ? 'Desbloquear dispositivos del menor' : 'Bloqueo Inmediato de dispositivos'}
            aria-label="Bloqueo Inmediato"
          >
            {isEmergencyLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </button>

          {/* Demo Telemetry Simulator Trigger (Icon only) */}
          <button
            onClick={onToggleSimulator}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isSimulatorOpen
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-[#C2F4E7]/30 dark:border-[#C2F4E7]/60 dark:text-[#C2F4E7]'
                : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:text-[#533B87] hover:bg-slate-100'
                  : 'bg-[#131B30] border-[#D6C8FA]/20 text-[#D6C8FA] hover:bg-[#1C2644]'
            }`}
            title="Abrir Simulador de Telemetría"
            aria-label="Simulador Demo"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
