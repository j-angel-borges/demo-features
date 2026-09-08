import React, { useState } from 'react';
import {
  Paintbrush,
  BookOpen,
  Wand2,
  Volume2,
  Download,
  X,
  Maximize2,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  Shirt,
  Smile,
  Zap,
  Check,
  User,
  Mountain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import {
  generateColoringBookFromImage,
  semanticInpaintPart
} from '../../services/vertexCreativeService';
import type {
  CreativeCategory,
  DoodleAnalysis,
  InteractiveAvatarData,
  InteractiveWorldData,
  InteractiveToyData
} from '@zentry/shared';

interface PostGenToolsPanelProps {
  category: CreativeCategory;
  title: string;
  imageUrl: string;
  analysis: DoodleAnalysis;
  miniAppData: InteractiveAvatarData | InteractiveWorldData | InteractiveToyData;
  onClose: () => void;
  onContinueDrawing: (bgImageUrl: string) => void;
  onStartColoringBook: (coloringBookUrl: string) => void;
  onLaunchMiniApp?: () => void;
  onUpdateImage: (newImageUrl: string) => void;
}

export const PostGenToolsPanel: React.FC<PostGenToolsPanelProps> = ({
  category,
  title,
  imageUrl,
  analysis,
  onClose,
  onContinueDrawing,
  onStartColoringBook,
  onUpdateImage
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'touch_edit'>('overview');
  const [isProcessingEffect, setIsProcessingEffect] = useState<boolean>(false);
  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<'head' | 'body' | 'sky' | 'ground' | 'accent'>(
    category === 'character' ? 'head' : category === 'landscape' ? 'sky' : 'accent'
  );

  const handleContinueDrawing = () => {
    sounds.playTap();
    sounds.vibrate(8);
    onContinueDrawing(imageUrl);
  };

  const handleColoringBook = async () => {
    sounds.playTap();
    sounds.vibrate([10, 20]);
    setIsProcessingEffect(true);

    try {
      const lineArtUrl = await generateColoringBookFromImage(imageUrl);
      sounds.playSuccess();
      confetti({ particleCount: 60, spread: 60 });
      onStartColoringBook(lineArtUrl);
    } catch (err) {
      console.warn('Coloring book error:', err);
    } finally {
      setIsProcessingEffect(false);
    }
  };

  const handleSemanticChange = async (zone: string, value: string) => {
    if (isProcessingEffect) return;
    sounds.playSparkle();
    sounds.vibrate(10);
    setIsProcessingEffect(true);

    try {
      const updatedUrl = await semanticInpaintPart(
        imageUrl,
        category,
        zone,
        value,
        analysis.enhancedPrompt
      );
      sounds.playSuccess();
      onUpdateImage(updatedUrl);
    } catch (err) {
      console.warn('Semantic inpaint error:', err);
    } finally {
      setIsProcessingEffect(false);
    }
  };

  const handleDownload = () => {
    sounds.playSuccess();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `zentry-${category}-${Date.now()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1E1633]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-md landscape:max-w-2xl w-full rounded-[38px] p-4 sm:p-5 bg-white/95 backdrop-blur-2xl border-2 border-[#D6C8FA]/80 shadow-[0_25px_60px_-15px_rgba(83,59,135,0.25)] flex flex-col items-center gap-3.5 text-center overflow-hidden animate-spring-in max-h-[94vh] overflow-y-auto no-scrollbar text-[#1E1633]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con microcopy e iconografía limpia */}
        <div className="flex items-center justify-between w-full border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 text-left min-w-0">
            <span className="p-1.5 rounded-xl bg-[#533B87]/10 text-[#533B87]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1E1633] truncate">{title}</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#533B87]">
                {category === 'character' ? (
                  <>
                    <User className="w-3.5 h-3.5 text-[#533B87]" />
                    <span>Personaje</span>
                  </>
                ) : category === 'landscape' ? (
                  <>
                    <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Paisaje</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Invento</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer zentry-spring-press border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor 3D y Controles (1 Columna en Portrait, 2 Columnas en Landscape Móvil) */}
        <div className="flex flex-col landscape:flex-row items-center gap-3.5 w-full">
          {/* Visor de Ilustración 3D con Botón de Maximizar */}
          <div className="relative w-full aspect-square max-w-[320px] landscape:max-w-[210px] shrink-0 rounded-[28px] overflow-hidden border-2 border-[#D6C8FA] shadow-md bg-slate-50 group">
            <img
              key={imageUrl}
              src={imageUrl}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isProcessingEffect ? 'scale-105 filter blur-xs' : 'scale-100'
              }`}
            />

            {/* Pantalla de Carga de Efectos / Inpainting */}
            {isProcessingEffect && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in z-20">
                <div className="w-12 h-12 rounded-full border-4 border-[#D6C8FA]/40 border-t-[#533B87] animate-spin" />
                <span className="text-xs font-black text-[#533B87]">Actualizando magia 3D...</span>
              </div>
            )}

            {/* Botón Ver Completa (Maximize) */}
            <button
              onClick={() => {
                sounds.playTap();
                setShowFullscreen(true);
              }}
              className="absolute bottom-2.5 left-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-[#533B87] shadow-md border border-[#D6C8FA]/60 backdrop-blur-md cursor-pointer zentry-spring-press"
              title="Ver imagen completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                voiceService.speakFeedback(analysis.speechFeedback);
              }}
              className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-[#533B87] shadow-md border border-[#D6C8FA]/60 backdrop-blur-md cursor-pointer zentry-spring-press"
              title="Escuchar"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Columna de Acciones y Herramientas */}
          <div className="flex-1 flex flex-col justify-between w-full gap-2.5">
            {/* Tarjeta Contextual de Imaginación y Reflexión */}
            <div className="p-3 rounded-2xl bg-[#F8F6FE] border border-[#D6C8FA]/60 text-left space-y-1 shadow-xs">
              <span className="text-[10px] font-black text-[#533B87] uppercase tracking-wider block">
                Pregunta Mágica
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-snug">
                "{analysis.childQuestion}"
              </p>
            </div>

            {/* Barra de Herramientas Creativas (Dibujar, Colorear, Personalizar) */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                onClick={handleContinueDrawing}
                className="flex flex-col items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-[#F8F6FE] hover:bg-white border border-[#D6C8FA]/60 shadow-xs text-[#1E1633] cursor-pointer zentry-spring-press group"
                title="Pintar encima de la imagen"
              >
                <div className="p-1.5 sm:p-2 rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition-transform">
                  <Paintbrush className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Dibujar</span>
              </button>

              <button
                onClick={handleColoringBook}
                disabled={isProcessingEffect}
                className="flex flex-col items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-[#F8F6FE] hover:bg-white border border-[#D6C8FA]/60 shadow-xs text-[#1E1633] cursor-pointer zentry-spring-press group disabled:opacity-50"
                title="Convertir a contorno para colorear"
              >
                <div className="p-1.5 sm:p-2 rounded-xl bg-purple-100 text-[#533B87] group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Colorear</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab(activeTab === 'touch_edit' ? 'overview' : 'touch_edit');
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-2xl border cursor-pointer zentry-spring-press group ${
                  activeTab === 'touch_edit'
                    ? 'bg-[#533B87]/15 border-[#533B87] text-[#533B87]'
                    : 'bg-[#F8F6FE] hover:bg-white border-[#D6C8FA]/60 text-[#1E1633] shadow-xs'
                }`}
                title="Cambiar detalles del modelo"
              >
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Personalizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Personalización Táctil en Tema Claro */}
        {activeTab === 'touch_edit' && (
          <div className="w-full p-3 rounded-2xl bg-slate-50 border border-[#D6C8FA]/60 shadow-inner flex flex-col gap-2.5 animate-in fade-in text-[#1E1633]">
            <div className="flex items-center justify-center gap-2 pb-1 border-b border-slate-200">
              {category === 'character' ? (
                <>
                  <button
                    onClick={() => setSelectedPart('head')}
                    className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer zentry-spring-press ${
                      selectedPart === 'head' ? 'bg-[#533B87] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Cabello</span>
                  </button>
                  <button
                    onClick={() => setSelectedPart('body')}
                    className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer zentry-spring-press ${
                      selectedPart === 'body' ? 'bg-[#533B87] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Atuendo</span>
                  </button>
                </>
              ) : category === 'landscape' ? (
                <>
                  <button
                    onClick={() => setSelectedPart('sky')}
                    className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer zentry-spring-press ${
                      selectedPart === 'sky' ? 'bg-[#533B87] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Cielo</span>
                  </button>
                  <button
                    onClick={() => setSelectedPart('ground')}
                    className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer zentry-spring-press ${
                      selectedPart === 'ground' ? 'bg-[#533B87] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Terreno</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedPart('accent')}
                  className="px-3 py-1 rounded-xl text-xs font-black bg-[#533B87] text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Luces</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-around gap-2 pt-1 overflow-x-auto no-scrollbar">
              {category === 'character' && selectedPart === 'head' && (
                <>
                  {[
                    { label: 'Rosa', color: '#EC4899', val: 'pink' },
                    { label: 'Azul', color: '#38BDF8', val: 'cyan blue' },
                    { label: 'Dorado', color: '#FDE047', val: 'golden yellow' },
                    { label: 'Púrpura', color: '#A855F7', val: 'violet purple' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSemanticChange('head', opt.val)}
                      className="flex flex-col items-center gap-1 cursor-pointer zentry-spring-press"
                    >
                      <span
                        style={{ backgroundColor: opt.color }}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                      <span className="text-[10px] font-bold text-slate-700">{opt.label}</span>
                    </button>
                  ))}
                </>
              )}

              {category === 'character' && selectedPart === 'body' && (
                <>
                  {[
                    { label: 'Héroe', val: 'superhero cape' },
                    { label: 'Astronauta', val: 'cute space suit' },
                    { label: 'Mago', val: 'sparkly magical robe' },
                    { label: 'Pijama', val: 'fluffy cozy pajamas' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSemanticChange('body', opt.val)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer zentry-spring-press"
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}

              {category === 'landscape' && selectedPart === 'sky' && (
                <>
                  {[
                    { label: 'Día', icon: Sun, val: 'day' },
                    { label: 'Atardecer', icon: Sunset, val: 'sunset' },
                    { label: 'Noche', icon: Moon, val: 'night' }
                  ].map((opt) => {
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => handleSemanticChange('sky', opt.val)}
                        className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-800 shadow-xs cursor-pointer zentry-spring-press"
                      >
                        <IconComp className="w-5 h-5 text-amber-500" />
                        <span className="text-[10px] font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {category === 'landscape' && selectedPart === 'ground' && (
                <>
                  {[
                    { label: 'Bosque', val: 'enchanted forest with moss' },
                    { label: 'Dulces', val: 'candy lollipop sugar' },
                    { label: 'Cristal', val: 'glowing crystal peaks' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSemanticChange('ground', opt.val)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer zentry-spring-press"
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}

              {category === 'object' && (
                <>
                  {[
                    { label: 'Neón Rosa', val: 'pink neon' },
                    { label: 'Electro Azul', val: 'cyan electric' },
                    { label: 'Oro Solar', val: 'golden glow' },
                    { label: 'Esmeralda', val: 'green laser' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSemanticChange('accent', opt.val)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer zentry-spring-press"
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Barra Inferior de Acciones */}
        <div className="flex items-center justify-between w-full pt-1">
          <button
            onClick={handleDownload}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#1E1633] text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-spring-press border border-slate-200"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Guardar</span>
          </button>

          <button
            onClick={() => {
              sounds.playSuccess();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-[#533B87] hover:bg-[#6A4CA8] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-spring-press shadow-sm"
          >
            <Check className="w-4 h-4 text-[#00F2FE] stroke-[2.5]" />
            <span>Listo</span>
          </button>
        </div>
      </div>

      {/* Lightbox / Modal de Imagen Completa en Alta Resolución */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-60 bg-[#080D1A]/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in select-none"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="flex items-center justify-between w-full max-w-4xl z-10 px-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-white">
                <Sparkles className="w-4 h-4 text-[#00F2FE]" />
              </span>
              <span className="text-white text-xs sm:text-sm font-black tracking-wide truncate max-w-xs">{title}</span>
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all border border-white/20 zentry-spring-press"
              title="Cerrar vista completa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center w-full max-w-4xl p-2 min-h-0">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[78vh] landscape:max-h-[82vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white/20 animate-spring-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex items-center justify-center w-full z-10 pb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="px-6 py-2.5 rounded-full bg-white text-[#1E1633] text-xs font-black flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
            >
              <Download className="w-4 h-4 text-[#533B87]" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
