import React, { useState, useEffect } from 'react';
import { useSkinnerSession } from './hooks/useSkinnerSession.js';
import { SessionHeader } from './components/SessionHeader.js';
import { VideoFeed } from './components/VideoFeed.js';
import { TikTokEngagementOverlay } from './components/TikTokEngagementOverlay.js';
import { subscribeToEmergencyLock, getEmergencyLock } from '@zentry/shared';
import { Lock, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zentry_theme') as 'light' | 'dark') || 'light';
  });

  const [isEmergencyLocked, setIsEmergencyLocked] = useState<boolean>(() => {
    return getEmergencyLock();
  });

  useEffect(() => {
    const unsubscribe = subscribeToEmergencyLock((locked) => {
      setIsEmergencyLocked(locked);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('zentry_theme', next);
  };

  const isLight = theme === 'light';

  const {
    mode,
    setMode,
    currentItem,
    showDopamineFlash,
    activeRetentionPct,
    triggerScroll,
  } = useSkinnerSession('child');

  // Keyboard navigation for desktop testing and demo presenter convenience
  useEffect(() => {
    if (isEmergencyLocked) return; // Block keyboard interaction when locked

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space' || e.code === 'PageDown') {
        e.preventDefault();
        triggerScroll();
      } else if (e.code === 'KeyM') {
        setMode(mode === 'child' ? 'adult' : 'child');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerScroll, mode, setMode, isEmergencyLocked]);

  const [isMuted, setIsMuted] = useState<boolean>(true);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <main className={`w-full h-[100dvh] ${isLight ? 'theme-light bg-slate-950' : 'theme-dark bg-black dark'} flex items-center justify-center overflow-hidden select-none`}>
      {/* Immersive Mobile-First Locked Viewport Frame (iPhone / Android 100dvh) */}
      <div className="w-full max-w-[430px] h-full relative overflow-hidden bg-black shadow-2xl sm:border-x sm:border-white/10 flex flex-col justify-between">
        {/* Floating Top Native Feed Navigation */}
        <SessionHeader
          mode={mode}
          onToggleMode={setMode}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Video Stage Feed (Swipeable & Double-Tap Heart Support) */}
        <VideoFeed
          currentItem={currentItem}
          onScrollTrigger={isEmergencyLocked ? () => {} : triggerScroll}
          showDopamineFlash={showDopamineFlash}
          isMuted={isEmergencyLocked || isMuted}
        />

        {/* Native TikTok Social Engagement Overlay (Likes, Comments, Share, Creator, Sound) */}
        {!isEmergencyLocked && (
          <TikTokEngagementOverlay
            item={currentItem}
            activeRetentionPct={activeRetentionPct}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}

        {/* Fullscreen Immediate Lock Overlay (Controlled Exclusively from Parent Dashboard) */}
        {isEmergencyLocked && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
            <div className="max-w-xs w-full p-6 rounded-3xl bg-slate-900/90 border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                <Lock className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                  Bloqueo Inmediato
                </span>
                <h2 className="text-lg font-black text-white tracking-wide pt-1">
                  Feed de Videos Pausado
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El tiempo de pantalla y la navegación de videos han sido restringidos por el Control Parental.
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
    </main>
  );
};

export default App;
