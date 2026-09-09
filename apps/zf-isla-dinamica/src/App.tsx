import React, { useState, useEffect } from 'react';
import { DynamicIsland } from './components/DynamicIsland';
import { CircadianClockWidget } from './components/CircadianClockWidget';
import { Sun, Moon, ShieldAlert, Lock, Wifi, Battery, Signal } from 'lucide-react';
import { subscribeToEmergencyLock, getEmergencyLock } from '@zentry/shared';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zentry_theme') as 'light' | 'dark') || 'light';
  });

  const [isEmergencyLocked, setIsEmergencyLocked] = useState<boolean>(() => {
    return getEmergencyLock();
  });

  const [isCircadianHighlighted, setIsCircadianHighlighted] = useState<boolean>(false);

  // Live status bar digital time (iOS style)
  const [statusTime, setStatusTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setStatusTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('zentry_theme', theme);
  }, [theme]);

  // Real-time Emergency Lock Subscription from Parental Dashboard
  useEffect(() => {
    const unsubscribe = subscribeToEmergencyLock((locked) => {
      setIsEmergencyLocked(locked);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Micro-PWA 4 Cross-App Navigation Contract Helper (Z-Art Studio Port 5176)
  const _getCreativeStudioUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') return `http://${hostname}:5176`;
    }
    return 'https://zf-creative-studio.web.app';
  };
  if (false as boolean) {
    _getCreativeStudioUrl();
  }

  const isLight = theme === 'light';

  return (
    <div
      className={`relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-b from-[#F0F4FD] via-[#F8FAFC] to-[#F1EEFD] text-slate-900'
          : 'bg-gradient-to-b from-[#060913] via-[#0B1020] to-[#050812] text-[#EBF1F5]'
      }`}
    >
      {/* Specular Ambient Optical Glow - Fluid Responsive Proportions */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-[900px] h-[50vh] max-h-[500px] ${
          isLight
            ? 'bg-gradient-to-b from-[#D6C8FA]/35 via-[#C2F4E7]/20 to-transparent'
            : 'bg-gradient-to-b from-[#533B87]/30 via-[#1B6E5E]/15 to-transparent'
        } blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-20 -right-20 w-[40vw] max-w-[400px] h-[40vw] max-h-[400px] ${
          isLight ? 'bg-[#D6C8FA]/25' : 'bg-[#533B87]/15'
        } rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-20 -left-20 w-[40vw] max-w-[400px] h-[40vw] max-h-[400px] ${
          isLight ? 'bg-[#C2F4E7]/25' : 'bg-[#1B6E5E]/10'
        } rounded-full blur-3xl pointer-events-none`}
      />

      {/* Pinned Dynamic Island (Fixed at top center, fluid responsive) */}
      <div className="absolute top-2 sm:top-3 md:top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[420px] md:max-w-[480px] flex justify-center">
          <DynamicIsland
            theme={theme}
            onThemeToggle={toggleTheme}
            onTriggerCircadianHighlight={() => setIsCircadianHighlighted(true)}
          />
        </div>
      </div>

      {/* Native OS Status Bar Header */}
      <header className="relative z-40 w-full px-5 sm:px-8 md:px-12 pt-2.5 sm:pt-3.5 pb-2 flex items-center justify-between select-none">
        {/* Left: Status Bar Clock */}
        <div className="min-w-[70px] sm:min-w-[90px] flex items-center">
          <span className="font-semibold text-[13px] sm:text-[14px] md:text-[16px] tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            {statusTime}
          </span>
        </div>

        {/* Center: Reserved Gap for Compact Dynamic Island Pill */}
        <div className="w-[160px] sm:w-[170px] h-8 shrink-0 pointer-events-none" />

        {/* Right: OS Status Indicators & Theme Switcher */}
        <div className="min-w-[70px] sm:min-w-[90px] flex items-center justify-end gap-2 sm:gap-3 text-slate-800 dark:text-slate-100">
          <Signal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
          <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
          <Battery className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
          <button
            onClick={toggleTheme}
            className="ml-1 sm:ml-2 p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isLight ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      </header>

      {/* Main OS Canvas / Home Screen Desktop Area */}
      <main className="relative z-20 flex-1 w-full flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
        {/* Responsive scaling container for Circadian Clock Widget */}
        <div className="flex flex-col items-center justify-center transform-gpu transition-all duration-300 scale-95 sm:scale-100 md:scale-125 lg:scale-140 xl:scale-150 max-h-[calc(100dvh-120px)] landscape:scale-[0.72] sm:landscape:scale-85 md:landscape:scale-105 lg:landscape:scale-125">
          <CircadianClockWidget
            isHighlighted={isCircadianHighlighted}
            onClearHighlight={() => setIsCircadianHighlighted(false)}
          />
        </div>
      </main>

      {/* Native OS Home Indicator */}
      <div className="relative z-30 pb-2.5 sm:pb-3.5 pt-1 w-full flex justify-center pointer-events-none">
        <div className="w-32 sm:w-44 md:w-56 h-1 sm:h-1.5 rounded-full bg-slate-900/30 dark:bg-white/40 transition-colors" />
      </div>

      {/* Fullscreen Immediate Lock Overlay (Controlled Exclusively from Parent Dashboard) */}
      {isEmergencyLocked && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <div className="max-w-xs w-full p-6 rounded-3xl bg-slate-900/90 border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                Bloqueo Inmediato
              </span>
              <h2 className="text-lg font-black text-white tracking-wide pt-1">
                Dispositivo Pausado
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                El acceso a la cámara y visión de la Isla Dinámica ha sido restringido por el Control Parental.
              </p>
            </div>

            <div className="w-full pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Solo desactivable desde Parental Dashboard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
