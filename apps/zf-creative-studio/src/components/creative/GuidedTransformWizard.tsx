import React, { useState } from 'react';
import {
  User,
  Mountain,
  Sparkles,
  X,
  RefreshCw,
  LucideIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import {
  analyzeAndGenerateFromDoodle,
  preloadImageWithTimeout
} from '../../services/vertexCreativeService';
import type {
  CreativeCategory,
  DoodleAnalysis,
  InteractiveAvatarData,
  InteractiveWorldData,
  InteractiveToyData
} from '@zentry/shared';

interface WizardProps {
  doodleBase64: string;
  onClose: () => void;
  onGenerated: (data: {
    analysis: DoodleAnalysis;
    generatedImageUrl: string;
    miniAppData: InteractiveAvatarData | InteractiveWorldData | InteractiveToyData;
  }) => void;
}

interface CategoryCard {
  id: CreativeCategory;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  gradient: string;
  badgeColor: string;
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'character',
    title: 'Personaje',
    subtitle: 'Un amigo',
    Icon: User,
    gradient: 'from-fuchsia-500/25 via-purple-600/30 to-indigo-600/30',
    badgeColor: 'bg-purple-500/30 text-purple-200 border-purple-400/40'
  },
  {
    id: 'landscape',
    title: 'Paisaje',
    subtitle: 'Un mundo',
    Icon: Mountain,
    gradient: 'from-emerald-500/25 via-teal-600/30 to-cyan-600/30',
    badgeColor: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
  },
  {
    id: 'object',
    title: 'Cosa',
    subtitle: 'Un invento',
    Icon: Sparkles,
    gradient: 'from-amber-500/25 via-orange-600/30 to-rose-600/30',
    badgeColor: 'bg-amber-500/30 text-amber-200 border-amber-400/40'
  }
];

export const GuidedTransformWizard: React.FC<WizardProps> = ({
  doodleBase64,
  onClose,
  onGenerated
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('Analizando tus formas mágicas...');
  const [progress, setProgress] = useState<number>(0);

  const handleSelectCategory = async (category: CreativeCategory) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProgress(15);
    setLoadingStage('Inspeccionando trazos y silueta en tu lienzo...');

    sounds.playStarBurst();
    sounds.vibrate([15, 30, 15]);

    try {
      const result = await analyzeAndGenerateFromDoodle(
        doodleBase64,
        category,
        (stageText, pct) => {
          setLoadingStage(stageText);
          setProgress(pct);
        }
      );

      setProgress(100);
      setLoadingStage('¡Tu diseño 3D está listo!');

      sounds.playVictoryFanfare();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#533B87', '#00F2FE', '#C2F4E7', '#FDE047']
      });

      if (result.analysis.speechFeedback) {
        voiceService.speakFeedback(result.analysis.speechFeedback);
      }

      // Aseguramos decodificación total del bitmap en memoria GPU antes de realizar la transición atómica
      await preloadImageWithTimeout(result.generatedImageUrl, 2000);
      onGenerated(result);
    } catch (err) {
      console.warn('[GuidedTransformWizard] Generation error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1E1633]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="relative max-w-sm sm:max-w-md landscape:max-w-xl w-full rounded-[30px] sm:rounded-[36px] p-3.5 sm:p-5 landscape:p-3 bg-white/95 backdrop-blur-2xl border-2 border-[#D6C8FA]/80 shadow-[0_25px_60px_-15px_rgba(83,59,135,0.25)] flex flex-col items-center gap-2.5 sm:gap-3.5 text-center overflow-hidden animate-spring-in max-h-[96vh] overflow-y-auto no-scrollbar text-[#1E1633]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#D6C8FA]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#C2F4E7]/40 rounded-full blur-3xl pointer-events-none" />

        {!isProcessing && (
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer zentry-spring-press border border-slate-200"
            title="Cerrar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {isProcessing ? (
          /* PANTALLA DE CARGA PROGRESIVA CON ESTADO EN VIVO */
          <div className="flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-5 w-full animate-in fade-in">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-4 border-[#D6C8FA]/40 border-t-[#533B87] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#533B87] animate-pulse" />
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#533B87]">
                <span>{loadingStage}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-[#D6C8FA]/40">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#533B87] via-[#00F2FE] to-[#C2F4E7] rounded-full transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-semibold text-[#5E6475]">
              Esculpiendo textura 3D Pixar de alta resolución...
            </p>
          </div>
        ) : (
          /* SELECCIÓN DE CATEGORÍA (Adaptada a Portrait y Landscape) */
          <div className="flex flex-col landscape:flex-row items-center gap-3 landscape:gap-4 w-full justify-center">
            {/* Vista Previa del Trazo Original */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-full bg-[#533B87]/10 border border-[#533B87]/20">
                  <Sparkles className="w-3 h-3 text-[#533B87]" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#533B87]">
                  Mágico
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-black text-[#1E1633] tracking-tight">
                ¿Qué dibujaste?
              </h2>

              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#D6C8FA] shadow-sm bg-white p-1 my-0.5">
                <img
                  src={doodleBase64}
                  alt="Tu dibujo"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#533B87]/80 backdrop-blur-xs text-[8px] font-bold text-white uppercase">
                  Dibujo
                </div>
              </div>
            </div>

            {/* Opciones de Categoría */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs sm:max-w-sm">
              {CATEGORY_CARDS.map((card) => {
                const IconComponent = card.Icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCategory(card.id)}
                    className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-[20px] bg-[#F8F6FE] hover:bg-white border-2 border-[#D6C8FA]/60 hover:border-[#533B87] shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 zentry-spring-press overflow-hidden"
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-[#533B87] stroke-[2.2]" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[11px] sm:text-xs font-black text-[#1E1633] tracking-tight">
                        {card.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#5E6475]">
                        "{card.subtitle}"
                      </span>
                    </div>

                    <span className="mt-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#533B87] text-white shadow-xs">
                      Elegir
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
