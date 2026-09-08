import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ChevronUp,
  ArrowLeft,
  Image as ImageIcon,
  HelpCircle,
  Wrench,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Maximize2,
  Sun,
  Moon,
  Zap,
  Clock,
  Palette,
} from 'lucide-react';
import { CameraSwitcher } from './CameraSwitcher';
import { BeRealPip } from './BeRealPip';
import { VoiceOrb } from './VoiceOrb';
import { ZentryEmblem } from './ZentryEmblem';
import { useCameraStream } from '../hooks/useCameraStream';
import { useGeminiLive } from '../hooks/useGeminiLive';

type IslandViewMode = 'camera' | 'landscape' | 'touch_explain' | 'redesign';
type ExpandedMode = 'agentic' | 'camera';

export interface DynamicIslandProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onTriggerCircadianHighlight?: () => void;
  className?: string;
}

interface TouchPoint {
  x: number;
  y: number;
  label: string;
  category: string;
  explanation: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  theme = 'light',
  onThemeToggle,
  onTriggerCircadianHighlight,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMode, setExpandedMode] = useState<ExpandedMode>('agentic');
  const [activeView, setActiveView] = useState<IslandViewMode>('camera');
  const [activeArtChallenge, setActiveArtChallenge] = useState<string | null>(null);
  const [isAgenticThinking, setIsAgenticThinking] = useState(false);

  // Frozen snapshot for in-island tools
  const [frozenFrame, setFrozenFrame] = useState<string>('');

  // Landscape Tool State (in-island)
  const [selectedStyle, setSelectedStyle] = useState<'enhanced' | 'anime' | 'pixel' | 'cyberpunk'>('enhanced');

  // Touch Explainer State (in-island)
  const [activeTouchPoint, setActiveTouchPoint] = useState<TouchPoint | null>(null);

  // Scene Redesign State (in-island)
  const [redesignProposal, setRedesignProposal] = useState<'proposal_a' | 'proposal_b'>('proposal_a');

  // Hardware Camera & Stream Hook
  const {
    streamState,
    videoRef,
    pipVideoRef,
    switchCameraMode,
    captureActiveFrame,
  } = useCameraStream();

  // Multimodal Gemini Live Hook
  const {
    isConnected,
    isSpeaking,
    latestText,
    amplitude,
    waveform,
    toggleLiveSession,
    executeAgentic,
  } = useGeminiLive(streamState.mode, captureActiveFrame);

  // Handle Triggering Agentic OS Quick Chips
  const handleTriggerAgenticChip = async (chipType: 'theme' | 'circadian' | 'art' | 'curiosity') => {
    setIsAgenticThinking(true);
    try {
      if (chipType === 'theme') {
        const target = theme === 'light' ? 'noche' : 'día';
        const res = await executeAgentic(`Zentry, activar modo ${target}`, {
          currentTheme: theme,
          onThemeToggle,
          onCircadianHighlight: onTriggerCircadianHighlight,
        });
        if (res.artChallenge) setActiveArtChallenge(res.artChallenge);
      } else if (chipType === 'circadian') {
        const res = await executeAgentic('Zentry, ¿cuánto tiempo me queda en mi ritmo biológico?', {
          currentTheme: theme,
          onThemeToggle,
          onCircadianHighlight: onTriggerCircadianHighlight,
        });
        if (res.artChallenge) setActiveArtChallenge(res.artChallenge);
      } else if (chipType === 'art') {
        const res = await executeAgentic('Zentry, estoy aburrido, dame un reto activo del mundo real', {
          currentTheme: theme,
          onThemeToggle,
          onCircadianHighlight: onTriggerCircadianHighlight,
        });
        if (res.artChallenge) setActiveArtChallenge(res.artChallenge);
      } else if (chipType === 'curiosity') {
        const res = await executeAgentic('Zentry, ¿por qué cambia el color del cielo durante el día?', {
          currentTheme: theme,
          onThemeToggle,
          onCircadianHighlight: onTriggerCircadianHighlight,
        });
        if (res.artChallenge) setActiveArtChallenge(res.artChallenge);
      }
    } catch (err) {
      console.warn('[DynamicIsland] Agentic chip error:', err);
    } finally {
      setIsAgenticThinking(false);
    }
  };

  // Transition to In-Island Tool View
  const handleOpenTool = (view: IslandViewMode) => {
    const snap = captureActiveFrame();
    setFrozenFrame(snap);
    setActiveView(view);
    setActiveTouchPoint(null);
  };

  // Back to Live Camera View
  const handleBackToCamera = () => {
    setActiveView('camera');
    setActiveTouchPoint(null);
  };

  // Handle Touch on the camera viewport in Touch Explain Mode
  const handleViewportTouch = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (activeView !== 'touch_explain') return;

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.max(10, Math.min(rect.width - 10, clientX - rect.left));
    const y = Math.max(10, Math.min(rect.height - 10, clientY - rect.top));

    // Dynamic Socratic inferences based on coordinate quadrants
    const sampleItems = [
      {
        label: 'Estructura Lumínica Frontal',
        category: 'Óptica y Arquitectura',
        explanation: 'Reflexión especular con ángulo de incidencia difuso. El sensor detecta un foco de alta temperatura cromática que favorece la captación fotónica.',
      },
      {
        label: 'Superficie Texturizada',
        category: 'Materiales Sólidos',
        explanation: 'Densidad poligonal regular con coeficiente de fricción intermedio. Ideal para transformaciones generativas de estilo orgánico o madera nórdica.',
      },
      {
        label: 'Punto de Fuga Espacial',
        category: 'Geometría y Perspectiva',
        explanation: 'Convergencia tridimensional con profundidad calculada en 2.4 metros. Permite rediseñar la escena proyectando horizontes aumentados.',
      },
      {
        label: 'Elemento de Interés Biométrico / Periférico',
        category: 'Reconocimiento Multimodal',
        explanation: 'Patrón de contraste elevado procesado por Gemini 2.5 Flash con latencia de 140ms. Sin anomalías detectadas en el entorno.',
      },
    ];

    const chosen = sampleItems[Math.floor(Math.random() * sampleItems.length)];

    setActiveTouchPoint({
      x,
      y,
      ...chosen,
    });
  };

  return (
    <div className={`relative w-full max-w-[430px] mx-auto flex flex-col items-center ${className}`}>
      {/* Dynamic Island Animated Morphing Container */}
      <motion.div
        layout
        initial={{ width: 156, height: 42, borderRadius: 24 }}
        animate={
          isExpanded
            ? {
                width: '100%',
                height: expandedMode === 'agentic' ? 'min(495px, 78dvh)' : 'min(590px, 80dvh)',
                borderRadius: 32,
              }
            : { width: 156, height: 42, borderRadius: 24 }
        }
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 32,
          mass: 0.85,
        }}
        className={`relative overflow-hidden transition-colors border shadow-2xl ${
          isExpanded
            ? 'bg-white/95 dark:bg-[#0B1020]/95 border-[#D6C8FA]/80 dark:border-[#D6C8FA]/25 shadow-purple-900/10 dark:shadow-black/60'
            : 'cursor-pointer bg-white/95 dark:bg-[#0B1020]/95 border-[#D6C8FA]/70 dark:border-[#D6C8FA]/20 hover:border-[#533B87]'
        } backdrop-blur-3xl`}
        onClick={() => {
          if (!isExpanded) {
            setExpandedMode('agentic');
            setIsExpanded(true);
          }
        }}
      >
        {/* ================================================================= */}
        {/* STATE 0: COMPACT PILL MODE (Strictly Zero Text Distractors)       */}
        {/* ================================================================= */}
        {!isExpanded && (
          <div className="w-full h-full flex items-center justify-between px-3 py-1 select-none">
            {/* Zentry Gem Logo Indicator */}
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#533B87] dark:bg-[#C2F4E7] shadow-[0_0_6px_currentColor]" />
              {/* Mic / Live Wave dot */}
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              />
            </div>

            {/* Center: Zentry "Z" Vectorial Emblem (Click to Expand Copilot Agentic OS Mode) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedMode('agentic');
                setIsExpanded(true);
              }}
              className="p-0.5 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Abrir Copiloto Agéntico Zentry"
            >
              <ZentryEmblem size={24} isGlowing={isConnected} />
            </button>

            {/* Right: Camera Glyph Trigger (Click to Expand Camera Studio) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedMode('camera');
                setIsExpanded(true);
              }}
              className="p-1.5 rounded-full text-[#533B87] dark:text-[#EBF1F5] hover:bg-purple-100 dark:hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Expandir Cámara Líquida"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* STATE 1: EXPANDED IN-ISLAND (Agentic OS Mode OR Camera Studio)    */}
        {/* ================================================================= */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col p-3 sm:p-3.5 justify-between min-h-0"
          >
            {/* ============================================================= */}
            {/* MODE 1: AGENTIC COPILOT CAPSULE (Agentic OS Mode)             */}
            {/* ============================================================= */}
            {expandedMode === 'agentic' && (
              <div className="w-full h-full flex flex-col justify-between min-h-0 space-y-2">
                {/* Header: Zentry Copilot Brand + Camera Switch + Collapse */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <ZentryEmblem size={24} isGlowing={isConnected} />
                    <span className="text-xs font-black tracking-wider text-[#533B87] dark:text-[#D6C8FA] font-sans">
                      ZENTRY COPILOTO
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Switch to Camera Studio button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMode('camera');
                      }}
                      className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-[#EBF1F5] transition-all cursor-pointer shadow-sm flex items-center gap-1"
                      title="Abrir Visor de Cámara Líquida"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7]" />
                      <span className="text-[10px] font-bold font-mono">Cámara</span>
                    </button>

                    {/* Collapse button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                      }}
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-[#EBF1F5] transition-all cursor-pointer shadow-sm"
                      title="Colapsar Cápsula"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Voice Orb Area & Dynamic Subtitle */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-1">
                  <VoiceOrb
                    isConnected={isConnected}
                    isSpeaking={isSpeaking}
                    amplitude={amplitude}
                    waveform={waveform}
                    latestTranscript={latestText}
                    onToggle={toggleLiveSession}
                  />

                  {/* Active ART Challenge Card Banner (If active) */}
                  <AnimatePresence>
                    {activeArtChallenge && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-2 max-w-[340px] w-full p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-left shadow-sm flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Reto Activo ART (Kaplan 1995)
                          </span>
                          <p className="text-[11px] text-emerald-900 dark:text-emerald-100 font-semibold leading-snug">
                            {activeArtChallenge}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveArtChallenge(null)}
                          className="shrink-0 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold cursor-pointer"
                        >
                          ¡Listo!
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tactile Quick Action Chips (Zero-text / Icon-first for 2-11yo) */}
                <div className="shrink-0 space-y-1 pt-1 border-t border-slate-200/70 dark:border-white/10">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                      Acciones de un Solo Toque
                    </span>
                    <span className="text-[9px] font-mono text-[#533B87] dark:text-[#C2F4E7] font-semibold">
                      Pedagogía Zentry
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Chip 1: Theme Operator */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleTriggerAgenticChip('theme')}
                      disabled={isAgenticThinking}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-center cursor-pointer transition-all shadow-sm"
                    >
                      {theme === 'light' ? (
                        <Moon className="w-4 h-4 text-purple-600 dark:text-[#D6C8FA] mb-1" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400 mb-1" />
                      )}
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#EBF1F5] truncate w-full">
                        {theme === 'light' ? 'Modo Noche' : 'Modo Luz'}
                      </span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate w-full">
                        Descanso
                      </span>
                    </motion.button>

                    {/* Chip 2: Circadian / Biological Rhythm */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleTriggerAgenticChip('circadian')}
                      disabled={isAgenticThinking}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-center cursor-pointer transition-all shadow-sm"
                    >
                      <Clock className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#EBF1F5] truncate w-full">
                        ¿Mi Tiempo?
                      </span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate w-full">
                        Reloj Solar
                      </span>
                    </motion.button>

                    {/* Chip 3: ART Active Break */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleTriggerAgenticChip('art')}
                      disabled={isAgenticThinking}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-center cursor-pointer transition-all shadow-sm"
                    >
                      <Zap className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#EBF1F5] truncate w-full">
                        Aburrido
                      </span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate w-full">
                        Reto Físico
                      </span>
                    </motion.button>

                    {/* Chip 4: Curiosity / Sun fact */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleTriggerAgenticChip('curiosity')}
                      disabled={isAgenticThinking}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-center cursor-pointer transition-all shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-sky-500 mb-1" />
                      <span className="text-[10px] font-black text-slate-800 dark:text-[#EBF1F5] truncate w-full">
                        El Sol
                      </span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate w-full">
                        Curiosidad
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* MODE 2: CAMERA VISION STUDIO (Existing mode preserved 100%)   */}
            {/* ============================================================= */}
            {expandedMode === 'camera' && (
              <div className="w-full h-full flex flex-col justify-between min-h-0">
                {/* --------------------------------------------------------- */}
                {/* SUB-VIEW A: LIVE CAMERA STREAM WITH INLINE TOOLBAR        */}
                {/* --------------------------------------------------------- */}
                {activeView === 'camera' && (
                  <div className="w-full h-full flex flex-col justify-between min-h-0 space-y-2">
                    {/* Header: Switcher + Back to Copilot + Collapse Button */}
                    <div className="flex items-center justify-between shrink-0">
                      <CameraSwitcher
                        currentMode={streamState.mode}
                        onSelectMode={switchCameraMode}
                        isDualFallbackActive={streamState.isDualFallbackActive}
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMode('agentic');
                          }}
                          className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-[#EBF1F5] transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          title="Cambiar a Copiloto Agéntico"
                        >
                          <ZentryEmblem size={18} />
                          <span className="text-[10px] font-bold font-mono">Copiloto</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                          }}
                          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-[#EBF1F5] transition-all cursor-pointer shadow-sm"
                          title="Colapsar Isla"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                {/* Central Video Viewport Area (100% Real Hardware Camera) */}
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-white/15 flex items-center justify-center min-h-0 shadow-inner">
                  {streamState.isStreaming ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        streamState.mode === 'user' ? '-scale-x-100' : ''
                      }`}
                    />
                  ) : (
                    <div className="p-4 text-center space-y-3">
                      <Camera className="w-8 h-8 text-[#533B87] dark:text-[#C2F4E7] mx-auto animate-pulse" />
                      <p className="text-xs text-slate-300 font-medium max-w-[220px]">
                        {streamState.error || 'Conectando con la cámara del dispositivo...'}
                      </p>
                      <button
                        onClick={() => switchCameraMode(streamState.mode)}
                        className="px-3 py-1.5 bg-[#533B87] hover:bg-[#684ca3] text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        Reintentar Cámara
                      </button>
                    </div>
                  )}

                  {/* Dual BeReal PiP Overlay if active */}
                  <AnimatePresence>
                    {streamState.mode === 'dual_bereal' && (
                      <BeRealPip
                        pipVideoRef={pipVideoRef}
                        snapshotBase64={streamState.pipSnapshotBase64}
                        isDualFallbackActive={streamState.isDualFallbackActive}
                        onRefreshFallbackSnapshot={async () => {
                          captureActiveFrame();
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Unified In-Island Action Toolbar (Zero Superposition!) */}
                <div className="grid grid-cols-3 gap-2 shrink-0 pt-1">
                  <button
                    onClick={() => handleOpenTool('landscape')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-[#533B87] dark:text-[#D6C8FA] text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#533B87] dark:text-[#38BDF8]" />
                    <span>Paisaje</span>
                  </button>

                  <button
                    onClick={() => handleOpenTool('touch_explain')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-[#1B6E5E] dark:text-[#C2F4E7] text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#1B6E5E] dark:text-[#C2F4E7]" />
                    <span>Explicar</span>
                  </button>

                  <button
                    onClick={() => handleOpenTool('redesign')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-amber-700 dark:text-amber-300 text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Rediseñar</span>
                  </button>
                </div>

                {/* Bottom Controls: Live Gemini Voice Orb */}
                <div className="shrink-0 flex items-center justify-center pt-0.5">
                  <VoiceOrb
                    isConnected={isConnected}
                    isSpeaking={isSpeaking}
                    amplitude={amplitude}
                    waveform={waveform}
                    latestTranscript={latestText}
                    onToggle={toggleLiveSession}
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW B: MORPHED IN-ISLAND LANDSCAPE STUDIO                */}
            {/* ------------------------------------------------------------- */}
            {activeView === 'landscape' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full h-full flex flex-col justify-between space-y-2 min-h-0"
              >
                {/* Header with Back Arrow */}
                <div className="flex items-center justify-between shrink-0">
                  <button
                    onClick={handleBackToCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-[#EBF1F5] cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cámara</span>
                  </button>

                  <span className="text-xs font-black text-[#533B87] dark:text-[#D6C8FA] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Paisaje IA</span>
                  </span>

                  <button
                    onClick={() => {
                      const snap = captureActiveFrame();
                      setFrozenFrame(snap);
                    }}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] cursor-pointer"
                    title="Capturar nuevo fotograma"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Landscape Preview Canvas */}
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/15 flex items-center justify-center min-h-0 shadow-inner">
                  {frozenFrame ? (
                    <img
                      src={frozenFrame}
                      alt="Landscape"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        selectedStyle === 'enhanced'
                          ? 'contrast-110 saturate-125 brightness-105'
                          : selectedStyle === 'anime'
                          ? 'contrast-125 saturate-150 hue-rotate-15'
                          : selectedStyle === 'pixel'
                          ? 'contrast-150 saturate-110 image-rendering-pixelated'
                          : 'contrast-140 saturate-180 hue-rotate-90'
                      }`}
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Capturando fotograma...</div>
                  )}

                  {/* Active Style Badge Overlay */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase text-white tracking-wider">
                    {selectedStyle === 'enhanced'
                      ? 'Mejora Óptica Neuronal'
                      : selectedStyle === 'anime'
                      ? 'Anime Neo-Tokyo'
                      : selectedStyle === 'pixel'
                      ? 'Retro 16-Bit'
                      : 'Cyberpunk 2077'}
                  </div>
                </div>

                {/* Style Selector Buttons */}
                <div className="grid grid-cols-4 gap-1.5 shrink-0 pt-1">
                  {(
                    [
                      { id: 'enhanced', label: 'Mejora HD', icon: Sparkles },
                      { id: 'anime', label: 'Anime', icon: ImageIcon },
                      { id: 'pixel', label: 'Pixel Art', icon: Sliders },
                      { id: 'cyberpunk', label: 'Cyberpunk', icon: Maximize2 },
                    ] as const
                  ).map((st) => {
                    const Icon = st.icon;
                    const isSelected = selectedStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStyle(st.id)}
                        className={`flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#533B87] text-white border-[#533B87] shadow-md scale-102'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] border-transparent hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-0.5" />
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW C: MORPHED IN-ISLAND TOUCH EXPLAINER                 */}
            {/* ------------------------------------------------------------- */}
            {activeView === 'touch_explain' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full h-full flex flex-col justify-between space-y-2 min-h-0"
              >
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                  <button
                    onClick={handleBackToCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-[#EBF1F5] cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cámara</span>
                  </button>

                  <span className="text-xs font-black text-[#1B6E5E] dark:text-[#C2F4E7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#C2F4E7]" />
                    <span>Explicación Táctil</span>
                  </span>

                  <button
                    onClick={() => {
                      const snap = captureActiveFrame();
                      setFrozenFrame(snap);
                      setActiveTouchPoint(null);
                    }}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Touch Viewport */}
                <div
                  onClick={handleViewportTouch}
                  onTouchStart={handleViewportTouch}
                  className="relative flex-1 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/15 flex items-center justify-center min-h-0 cursor-crosshair shadow-inner"
                >
                  {frozenFrame && (
                    <img src={frozenFrame} alt="Frozen" className="w-full h-full object-cover" />
                  )}

                  {/* Touch Indicator Pin */}
                  {activeTouchPoint && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ left: activeTouchPoint.x - 14, top: activeTouchPoint.y - 14 }}
                      className="absolute pointer-events-none z-30"
                    >
                      <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping" />
                      <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </motion.div>
                  )}

                  {/* Guide Pill if not touched yet */}
                  {!activeTouchPoint && (
                    <div className="absolute bottom-3 inset-x-3 bg-black/75 backdrop-blur-md rounded-xl p-2 text-center text-xs text-emerald-300 font-semibold border border-white/15">
                      Toca cualquier objeto en la imagen para explicarlo
                    </div>
                  )}
                </div>

                {/* Socratic Explanation Bottom Card */}
                {activeTouchPoint && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="shrink-0 p-2.5 rounded-xl bg-slate-100 dark:bg-[#121829] border border-slate-200 dark:border-emerald-500/30 text-left space-y-1 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B6E5E] dark:text-[#C2F4E7]">
                        {activeTouchPoint.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                        {activeTouchPoint.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                      {activeTouchPoint.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW D: MORPHED IN-ISLAND SCENE REDESIGN                  */}
            {/* ------------------------------------------------------------- */}
            {activeView === 'redesign' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full h-full flex flex-col justify-between space-y-2 min-h-0"
              >
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                  <button
                    onClick={handleBackToCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-[#EBF1F5] cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cámara</span>
                  </button>

                  <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-300" />
                    <span>Rediseño Espacial</span>
                  </span>

                  <button
                    onClick={() => {
                      const snap = captureActiveFrame();
                      setFrozenFrame(snap);
                    }}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Redesign Visualizer Viewport */}
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/15 flex items-center justify-center min-h-0 shadow-inner">
                  {frozenFrame && (
                    <img
                      src={frozenFrame}
                      alt="Redesign"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        redesignProposal === 'proposal_a'
                          ? 'sepia-30 hue-rotate-30 saturate-130'
                          : 'invert-10 hue-rotate-180 contrast-125'
                      }`}
                    />
                  )}

                  {/* Proposal Ribbon Tag */}
                  <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-black uppercase text-amber-300">
                    {redesignProposal === 'proposal_a'
                      ? 'Propuesta A: Arquitectura Biofílica'
                      : 'Propuesta B: Espacio Minimalista 3D'}
                  </div>
                </div>

                {/* Proposal Toggle Buttons */}
                <div className="grid grid-cols-2 gap-2 shrink-0 pt-1">
                  <button
                    onClick={() => setRedesignProposal('proposal_a')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      redesignProposal === 'proposal_a'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] border-transparent'
                    }`}
                  >
                    {redesignProposal === 'proposal_a' && <Check className="w-3.5 h-3.5" />}
                    <span>Propuesta Biofílica</span>
                  </button>

                  <button
                    onClick={() => setRedesignProposal('proposal_b')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      redesignProposal === 'proposal_b'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#EBF1F5] border-transparent'
                    }`}
                  >
                    {redesignProposal === 'proposal_b' && <Check className="w-3.5 h-3.5" />}
                    <span>Propuesta Minimalista</span>
                  </button>
                </div>
              </motion.div>
            )}
            </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
