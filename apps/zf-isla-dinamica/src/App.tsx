import React, { useState, useEffect } from 'react';
import { DynamicIsland } from './components/DynamicIsland';
import { CircadianClockWidget } from './components/CircadianClockWidget';
import { Radio, Sun, Moon, ShieldAlert, Lock, Palette } from 'lucide-react';
import { subscribeToEmergencyLock, getEmergencyLock } from '@zentry/shared';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zentry_theme') as 'light' | 'dark') || 'light';
  });

  const [isEmergencyLocked, setIsEmergencyLocked] = useState<boolean>(() => {
    return getEmergencyLock();
  });

  const [isCircadianHighlighted, setIsCircadianHighlighted] = useState<boolean>(false);

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

  const isLight = theme === 'light';

  return (
    <div
      className={`relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 select-none transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#080D1A] text-[#EBF1F5]'
      }`}
    >
      {/* Luminous Specular Optics Background Glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] ${
          isLight
            ? 'bg-linear-to-b from-[#D6C8FA]/45 via-[#C2F4E7]/25 to-transparent'
            : 'bg-linear-to-b from-[#533B87]/25 via-[#C2F4E7]/8 to-transparent'
        } blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-20 -right-20 w-80 h-80 ${
          isLight ? 'bg-[#D6C8FA]/35' : 'bg-[#533B87]/20'
        } rounded-full blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-20 -left-20 w-80 h-80 ${
          isLight ? 'bg-[#C2F4E7]/35' : 'bg-[#1B6E5E]/15'
        } rounded-full blur-3xl pointer-events-none`}
      />

      {/* Top Header with Responsive Theme Switcher & Cross-App Link */}
      <header className="relative z-40 w-full flex items-center justify-between px-2 pt-0.5">
        <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-[#533B87] dark:text-[#D6C8FA]">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-white/10 border border-purple-500/20 dark:border-white/15">
            ZENTRY OS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Link to Z-Art Creative WOW Studio */}
          <a
            href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5176' : 'https://zentry-creative-demo.web.app'}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isLight
                ? 'bg-white/95 border-pink-300 text-pink-600 hover:bg-pink-50'
                : 'bg-[#120E24]/95 border-pink-500/30 text-pink-300 hover:bg-[#1E1A36]'
            }`}
            title="Abrir Z-Art Creative WOW Studio (Puerto 5176)"
          >
            <Palette className="w-3.5 h-3.5 text-pink-500" />
            <span className="font-mono text-[11px] hidden sm:inline">Z-Art</span>
          </a>

          {/* Floating Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isLight
                ? 'bg-white/95 border-[#D6C8FA] text-[#533B87] hover:bg-[#F2EEFD]'
                : 'bg-[#120E24]/95 border-[#D6C8FA]/30 text-[#D6C8FA] hover:bg-[#1E1A36]'
            }`}
            title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#533B87]" />
                <span className="font-mono text-[11px]">Noche</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-mono text-[11px]">Luz</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main OS Canvas: Island at top, Circadian Clock */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center w-full max-w-[430px] mx-auto min-h-0 overflow-y-auto no-scrollbar space-y-8 pt-1 pb-2">
        {/* Dynamic Island Morphing Hub (Capsule in Repose or Expanded) */}
        <div className="w-full flex justify-center shrink-0 z-40">
          <DynamicIsland
            theme={theme}
            onThemeToggle={toggleTheme}
            onTriggerCircadianHighlight={() => setIsCircadianHighlighted(true)}
          />
        </div>

        {/* Circadian Clock Widget */}
        <div className="w-full shrink-0 flex justify-center pt-2">
          <CircadianClockWidget
            isHighlighted={isCircadianHighlighted}
            onClearHighlight={() => setIsCircadianHighlighted(false)}
          />
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer
        className={`relative z-20 w-full max-w-[430px] mx-auto flex items-center justify-between px-4 py-2 rounded-2xl border text-[11px] backdrop-blur-md shadow-sm transition-colors ${
          isLight
            ? 'border-[#D6C8FA]/70 bg-white/90 text-slate-700'
            : 'border-[#D6C8FA]/20 bg-[#0C1121]/90 text-[#EBF1F5]/70'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7] animate-pulse" />
          <span className="font-medium">GCP quarz-group</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[#1B6E5E] dark:text-[#C2F4E7] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span>Firestore Live</span>
        </div>
      </footer>

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
