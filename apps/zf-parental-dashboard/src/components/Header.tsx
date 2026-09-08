import React from 'react';
import {
  Radio,
  Sliders,
  Moon,
  Sun,
  LayoutDashboard,
  Gamepad2,
  Eye,
  FolderLock,
  UserCheck,
  ShieldAlert,
  Lock,
  Palette,
  Sparkles,
  ExternalLink,
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
  const getCreativeStudioUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:5176`;
      }
    }
    return 'https://zentry-creative-demo.web.app';
  };

  const tabs: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'General', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'creative', label: 'Z-Art Creativo', icon: <Palette className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'skinner', label: 'Observador', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'vault', label: 'Bóveda', icon: <FolderLock className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Ficha', icon: <UserCheck className="w-3.5 h-3.5" /> },
  ];

  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#D6C8FA]/40 dark:border-[#D6C8FA]/15 px-4 lg:px-8 py-3 mb-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#533B87] to-[#D6C8FA] p-[1.5px] shadow-md shadow-[#533B87]/30 flex items-center justify-center">
              <div className={`w-full h-full rounded-[10px] ${isLight ? 'bg-white' : 'bg-[#080D1A]'} flex items-center justify-center transition-colors`}>
                <span className="font-mono font-bold text-sm text-[#533B87] dark:text-[#D6C8FA]">Z</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black tracking-wider ${isLight ? 'text-slate-900' : 'text-[#EBF1F5]'} font-sans`}>
                  ZENTRY
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-[#533B87]/15 dark:bg-[#533B87]/40 border border-[#D6C8FA]/60 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA] font-bold">
                  PARENT LIVE
                </span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} font-medium`}>
                Observador en Vivo & Bóveda Familiar
              </p>
            </div>
          </div>

          {/* Cloud Sync Status Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isLight ? 'bg-emerald-50 border border-emerald-200/80 shadow-xs' : 'bg-[#080D1A]/80 border border-[#D6C8FA]/20'} text-[10px]`}>
            <Radio className="w-3 h-3 text-[#1B6E5E] dark:text-[#34D399] animate-pulse" />
            <span className={`${isLight ? 'text-[#1B6E5E]' : 'text-[#34D399]'} font-semibold`}>
              {isFirebaseOnline ? 'Nube Sincronizada' : 'Modo Local Activo'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#533B87] text-white border border-[#533B87] shadow-md shadow-[#533B87]/25'
                  : isLight
                    ? 'text-slate-700 hover:text-[#533B87] hover:bg-violet-50 border border-transparent'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
              isLight
                ? 'bg-slate-100 border-slate-300/80 text-slate-800 hover:bg-slate-200'
                : 'bg-[#131B30] border-[#D6C8FA]/30 text-[#EBF1F5] hover:bg-[#1C2644]'
            }`}
            title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold font-mono">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#D6C8FA]" />
                <span className="text-[11px] font-bold font-mono">Modo Oscuro</span>
              </>
            )}
          </button>

          {/* Circadian Toggle */}
          <button
            onClick={onToggleCircadian}
            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
              circadianActive
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-[#FBBF24]/20 dark:border-[#FBBF24] dark:text-[#FBBF24]'
                : isLight
                  ? 'bg-slate-100 border-slate-300/80 text-slate-700 hover:text-[#533B87] hover:bg-slate-200'
                  : 'bg-[#131B30] border-[#D6C8FA]/20 text-slate-300 hover:text-white hover:bg-[#1C2644]'
            }`}
            title="Alternar Modo Calidez Circadiana"
          >
            <Sun className={`w-4 h-4 ${circadianActive ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-[11px] font-medium font-mono hidden sm:inline">Calidez</span>
          </button>

          {/* Immediate Emergency Lock Button */}
          <button
            onClick={onToggleEmergencyLock}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isEmergencyLocked
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
                : isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/40 text-red-300'
            }`}
            title={isEmergencyLocked ? 'Desbloquear dispositivos del menor' : 'Bloquear inmediatamente todos los dispositivos (Isla Dinámica y Skinner Box)'}
          >
            {isEmergencyLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span>Bloqueo Inmediato</span>
              </>
            )}
          </button>

          {/* Z-Art Creative Studio Launcher */}
          <a
            href={getCreativeStudioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLight
                ? 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
                : 'bg-pink-950/40 hover:bg-pink-900/60 border-pink-500/30 text-pink-300'
            }`}
            title="Abrir Z-Art Creative WOW Studio (Puerto 5176)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Z-Art Studio</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {/* Demo Telemetry Simulator Trigger */}
          <button
            onClick={onToggleSimulator}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulatorOpen
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-[#C2F4E7]/30 dark:border-[#C2F4E7]/60 dark:text-[#C2F4E7]'
                : isLight
                  ? 'bg-violet-50 border-violet-200 text-[#533B87] hover:bg-violet-100'
                  : 'bg-[#533B87]/30 border-[#D6C8FA]/25 text-[#D6C8FA] hover:bg-[#533B87]/60'
            }`}
            title="Abrir Simulador de Telemetría Comercial"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulador Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
