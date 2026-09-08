import React, { useState } from 'react';
import type { CatalogMode } from '../types/skinner.types.js';
import { Search, Sun, Moon, Sparkles, Tv, Palette } from 'lucide-react';

interface SessionHeaderProps {
  mode: CatalogMode;
  onToggleMode: (m: CatalogMode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch?: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  mode,
  onToggleMode,
  theme,
  onToggleTheme,
  onOpenSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  const isLight = theme === 'light';

  return (
    <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 pointer-events-auto bg-gradient-to-b from-black/60 via-black/20 to-transparent">
      {/* Left Action: Live Feed & Mode Selector & Z-Art Quick Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleMode(mode === 'child' ? 'adult' : 'child')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md text-white text-[11px] font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
          title={`Cambiar catálogo (Activo: ${mode === 'child' ? 'Niño' : 'Adulto'})`}
        >
          <Tv className="w-3 h-3 text-[#C2F4E7]" />
          <span className="capitalize">{mode === 'child' ? 'Kids' : 'Mix'}</span>
        </button>

        <a
          href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5176' : 'https://zentry-creative-demo.web.app'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 backdrop-blur-md text-pink-200 text-[11px] font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
          title="Abrir Z-Art Creative WOW Studio (Puerto 5176)"
        >
          <Palette className="w-3 h-3 text-pink-400" />
          <span className="hidden sm:inline">Z-Art</span>
        </a>
      </div>

      {/* Center Tabs: Siguiendo | Para ti (Native TikTok Style) */}
      <div className="flex items-center gap-4 text-sm font-bold text-white drop-shadow-md select-none">
        <button
          onClick={() => setActiveTab('following')}
          className={`relative transition-colors cursor-pointer ${
            activeTab === 'following' ? 'text-white' : 'text-white/60 hover:text-white/80'
          }`}
        >
          <span>Siguiendo</span>
          {activeTab === 'following' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white" />
          )}
        </button>

        <span className="text-white/30">|</span>

        <button
          onClick={() => setActiveTab('foryou')}
          className={`relative transition-colors cursor-pointer ${
            activeTab === 'foryou' ? 'text-white' : 'text-white/60 hover:text-white/80'
          }`}
        >
          <span className="flex items-center gap-1">
            Para ti
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
          {activeTab === 'foryou' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-white shadow-sm" />
          )}
        </button>
      </div>

      {/* Right Action: Search Glyph & Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Search Glyph (Visual Only) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md text-white transition-transform active:scale-95 cursor-pointer"
          title="Buscar vídeos"
          aria-label="Buscar vídeos"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md text-white transition-transform active:scale-95 cursor-pointer"
          title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
        >
          {isLight ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
        </button>
      </div>
    </header>
  );
};
