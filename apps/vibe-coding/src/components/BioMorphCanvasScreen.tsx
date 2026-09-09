import React, { useEffect, useRef, useState } from 'react';
import { BioMorphEngine } from '../engine/bioMorphEngine';
import { acousticSensor, SensoryClimateState } from '../services/acousticSensor';
import { sounds } from '../services/soundSynthesizer';
import { Sparkles, Mic, MicOff, Sun, Moon, Volume2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BioMorphCanvasScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BioMorphEngine | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [climate, setClimate] = useState<SensoryClimateState>({
    rmsDb: 42,
    spectralFlatness: 0.25,
    climateMode: 'balanced',
    isListening: false,
  });

  // Inicializar motor Canvas a 60fps
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BioMorphEngine(canvasRef.current);
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, []);

  // Suscripción al sensor acústico ambiental
  useEffect(() => {
    const unsubscribe = acousticSensor.subscribe((state) => {
      setClimate(state);
      if (engineRef.current) {
        engineRef.current.setCalmMode(state.climateMode === 'calm');
      }
    });
    return () => unsubscribe();
  }, []);

  // Toggle de escucha acústica del entorno
  const toggleClimateMic = async () => {
    sounds.playSpawnNote();
    if (climate.isListening) {
      acousticSensor.stopListening();
    } else {
      await acousticSensor.startListening();
    }
  };

  // Botón de magia / fiesta
  const triggerMagicBurst = () => {
    sounds.playSuccessCelebration();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.4 },
    });
    if (engineRef.current && canvasRef.current) {
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      engineRef.current.createCreature(w / 2, h * 0.35, true);
    }
  };

  const toggleTheme = () => {
    sounds.playSpawnNote();
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`relative w-full h-[100dvh] overflow-hidden select-none flex flex-col ${theme === 'dark' ? 'bg-[#0A0813] text-[#EBF1F5]' : 'bg-[#F8F6FE] text-[#1E1633]'}`}>
      {/* Resplandor Aurora Superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[250px] bg-gradient-to-b from-[#7A59BF]/15 via-[#C2F4E7]/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Cabecera ZentryOS (Alineada con la Mesa de Trabajo: Cero fugas técnicas) */}
      <header className="relative z-20 w-full px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/10 backdrop-blur-md">
        {/* Identidad de la App */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7A59BF] to-[#533B87] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-[#C2F4E7] animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Bio-Morph Canvas
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C2F4E7] text-[#1E3A34] dark:bg-[#1E3A34] dark:text-[#C2F4E7] font-medium">
                2 a 5 Años
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vibe Coding Táctil & Exploración Viva
            </p>
          </div>
        </div>

        {/* Controles Principales */}
        <div className="flex items-center gap-2">
          {/* Sensor de Clima Acústico */}
          <button
            onClick={toggleClimateMic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              climate.isListening
                ? climate.climateMode === 'calm'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Monitoreo de Clima de la Habitación"
          >
            {climate.isListening ? (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>{climate.rmsDb} dB • {climate.climateMode === 'calm' ? 'Calma' : 'Creativo'}</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Clima Sensorial</span>
              </>
            )}
          </button>

          {/* Botón de Magia */}
          <button
            onClick={triggerMagicBurst}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2F4E7] to-[#D6C8FA] dark:from-[#2D224D] dark:to-[#1E3A34] flex items-center justify-center text-slate-800 dark:text-white border border-purple-200 dark:border-purple-800 shadow-sm active:scale-95 transition-transform"
            title="¡Magia!"
          >
            <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-300" />
          </button>

          {/* Switch Tema */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Banner Socrático y de Guía Motriz */}
      <div className="relative z-10 px-4 py-1.5 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100/50 dark:border-purple-900/40 text-center text-xs text-purple-900 dark:text-purple-200 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>
          <strong>Para el infante:</strong> Toca con 1 dedo para seres pequeños • Usa toda la mano para seres gigantes • Arrastra hacia los estanques para organizar tus creaciones.
        </span>
      </div>

      {/* Lienzo Principal de Físicas 60fps */}
      <main className="relative z-10 flex-1 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-pointer"
        />

        {/* Indicadores flotantes de los Estanques (Pre-carpetas) */}
        <div className="absolute bottom-2 inset-x-0 pointer-events-none flex justify-around px-6 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <div className="text-center">📁 Carpeta: Seres</div>
          <div className="text-center">📁 Carpeta: Colores</div>
          <div className="text-center">📁 Carpeta: Sonidos</div>
        </div>
      </main>
    </div>
  );
};
