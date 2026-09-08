import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  ExternalLink,
  UserCheck,
  Mountain,
  Box,
  Eye,
  Clock,
  Heart,
  Volume2,
  Compass,
  Cpu,
  RefreshCw,
  Radio,
  User,
  X,
} from 'lucide-react';
import { useCreativeCreations } from '../../hooks/useCreativeCreations';
import type {
  CreativeCreationRecord,
  CreativeCategory,
  InteractiveAvatarData,
  InteractiveWorldData,
  InteractiveToyData
} from '@zentry/shared';

export const CreativeStudioGallery: React.FC = () => {
  const { creations, isLoading } = useCreativeCreations();
  const [selectedCategory, setSelectedCategory] = useState<'all' | CreativeCategory>('all');
  const [inspectingCreation, setInspectingCreation] = useState<CreativeCreationRecord | null>(null);
  const [viewMode, setViewMode] = useState<'compare' | 'rendered' | 'original'>('compare');

  const getCreativeStudioUrl = (creationId?: string) => {
    let baseUrl = 'https://zentry-creative-demo.web.app';
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        baseUrl = `http://${hostname}:5176`;
      }
    }
    return creationId ? `${baseUrl}?creationId=${creationId}` : baseUrl;
  };

  const filteredCreations = creations.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const categoryCounts = {
    all: creations.length,
    character: creations.filter((c) => c.category === 'character').length,
    landscape: creations.filter((c) => c.category === 'landscape').length,
    object: creations.filter((c) => c.category === 'object').length,
  };

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Control Hub */}
      <div className="p-6 rounded-3xl glass-panel border border-[#D6C8FA]/30 bg-gradient-to-r from-[#533B87]/15 via-[#EC4899]/10 to-[#38BDF8]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#EC4899]/20 border border-[#EC4899]/40 text-pink-400 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Factor WOW Z-Art Studio
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Nube Sincronizada</span>
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Galería Multimodal & Mini-Apps Vivas
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Supervisa las creaciones de Mateo en tiempo real. Los trazos infantiles se metamorfosean con Gemini 2.5 Flash en ilustraciones estilo 3D Pixar y mini-apps interactivas con pedagogía socrática.
          </p>
        </div>

        {/* CTA Launch Studio */}
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <a
            href={getCreativeStudioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#533B87] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#533B87]/30 transition-all cursor-pointer group"
          >
            <Palette className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Lanzar Z-Art Studio</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </a>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-[#D6C8FA]/20">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Creaciones</span>
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {categoryCounts.all}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sincronizadas con Firestore</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-[#D6C8FA]/20">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Personajes Vivos</span>
            <UserCheck className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {categoryCounts.character}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Avatares con voz y ojos</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-[#D6C8FA]/20">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Mundos 3D</span>
            <Mountain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {categoryCounts.landscape}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dioramas explorables</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-[#D6C8FA]/20">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Juguetes Interactivos</span>
            <Box className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {categoryCounts.object}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Máquinas sonoras hápticas</p>
        </div>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-[#D6C8FA]/20">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#533B87] text-white shadow-md'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            Todas ({categoryCounts.all})
          </button>
          <button
            onClick={() => setSelectedCategory('character')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'character'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personajes</span>
            <span>({categoryCounts.character})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('landscape')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'landscape'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Paisajes</span>
            <span>({categoryCounts.landscape})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('object')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'object'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Objetos</span>
            <span>({categoryCounts.object})</span>
          </button>
        </div>

        {/* Comparison toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131B30] p-1 rounded-xl border border-[#D6C8FA]/20 text-xs">
          <button
            onClick={() => setViewMode('compare')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'compare' ? 'bg-[#533B87] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Comparar Dibujo / 3D
          </button>
          <button
            onClick={() => setViewMode('rendered')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'rendered' ? 'bg-[#533B87] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Solo 3D Pixar
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-sm font-medium">Sincronizando creaciones en la nube...</p>
        </div>
      ) : filteredCreations.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
          <Palette className="w-12 h-12 text-pink-400 mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No hay creaciones en esta categoría</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Abre Z-Art Studio en la tablet del menor para comenzar a dibujar y transformar trazos en mundos 3D interactivos.
          </p>
          <a
            href={getCreativeStudioUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#533B87] text-white text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear primer dibujo</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((item) => {
            const isAvatar = item.category === 'character' || item.miniAppType === 'avatar';
            const isWorld = item.category === 'landscape' || item.miniAppType === 'world';
            const isToy = item.category === 'object' || item.miniAppType === 'toy';

            const avatarData = isAvatar ? (item.miniAppData as InteractiveAvatarData) : null;
            const worldData = isWorld ? (item.miniAppData as InteractiveWorldData) : null;
            const toyData = isToy ? (item.miniAppData as InteractiveToyData) : null;

            return (
              <div
                key={item.id}
                className="group rounded-3xl glass-panel border border-[#D6C8FA]/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-[#D6C8FA]/60 hover:-translate-y-1 bg-white/40 dark:bg-[#0E1528]/80"
              >
                {/* Visual Preview Header (Compare or Single) */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  {viewMode === 'compare' ? (
                    <div className="w-full h-full grid grid-cols-2 divide-x divide-white/20">
                      {/* Left: Original Drawing */}
                      <div className="relative h-full w-full bg-[#1A1230] flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={item.originalDrawingBase64}
                          alt="Boceto infantil"
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold text-slate-300 flex items-center gap-1">
                          <Palette className="w-2.5 h-2.5 text-lavender" />
                          <span>Boceto</span>
                        </span>
                      </div>
                      {/* Right: Pixar 3D Render */}
                      <div className="relative h-full w-full bg-slate-900 overflow-hidden">
                        <img
                          src={item.generatedImageUrl}
                          alt="Render Pixar 3D"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#EC4899]/85 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          3D Pixar
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={item.generatedImageUrl}
                        alt="Render Pixar 3D"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#EC4899]/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Render Pixar 3D
                      </span>
                    </div>
                  )}

                  {/* Category Pill Over Visual */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isAvatar && (
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        <span>Personaje</span>
                      </span>
                    )}
                    {isWorld && (
                      <span className="px-2.5 py-1 rounded-full bg-sky-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <Mountain className="w-2.5 h-2.5" />
                        <span>Paisaje</span>
                      </span>
                    )}
                    {isToy && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Objeto</span>
                      </span>
                    )}
                  </div>

                  {/* Time Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {/* Content & Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                      {item.title || item.analysis?.detectedSubject || 'Creación Artística'}
                    </h3>

                    {/* Detected Subject */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[10px] font-semibold flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span>{item.analysis?.detectedSubject || 'Creatividad Pura'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] font-mono font-medium">
                        98% IA Conf.
                      </span>
                    </div>

                    {/* Interactive Feature Badge / Status */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-[#D6C8FA]/20 space-y-1 text-xs">
                      {isAvatar && avatarData && (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-bold text-pink-500">
                            <span className="flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5" />
                              Avatar Parlante Activo
                            </span>
                            <span className="text-slate-400 font-normal">{avatarData.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                            "{item.analysis?.childQuestion || avatarData.mission}"
                          </p>
                        </>
                      )}

                      {isWorld && worldData && (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-bold text-sky-500">
                            <span className="flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5" />
                              Diorama 3D Activo
                            </span>
                            <span className="text-slate-400 font-normal">{worldData.worldName}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Ciclo {worldData.dayNightCycle} • {worldData.props.length} elementos mágicos
                          </p>
                        </>
                      )}

                      {isToy && toyData && (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5" />
                              Juguete Interactivo Activo
                            </span>
                            <span className="text-slate-400 font-normal">{toyData.toyName}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Mecánica: {toyData.mechanic} • Palanca háptica integrada
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#D6C8FA]/20 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setInspectingCreation(item)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#D6C8FA]/30 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>Detalles</span>
                    </button>

                    <a
                      href={getCreativeStudioUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#533B87] hover:bg-[#684BA8] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Abrir en Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Detail Inspector Modal */}
      {inspectingCreation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="max-w-3xl w-full rounded-3xl glass-panel border border-[#D6C8FA]/40 bg-slate-900 p-6 sm:p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
                  Ficha Técnica de Creación Infantil
                </span>
                <h3 className="text-xl font-black">{inspectingCreation.title || inspectingCreation.analysis?.detectedSubject}</h3>
              </div>
              <button
                onClick={() => setInspectingCreation(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Visual Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Boceto Original de Mateo:</span>
                <div className="aspect-square rounded-2xl bg-[#1A1230] p-4 flex items-center justify-center border border-white/10">
                  <img
                    src={inspectingCreation.originalDrawingBase64}
                    alt="Boceto original"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Render 3D Pixar Generado con Gemini 2.5:
                </span>
                <div className="aspect-square rounded-2xl overflow-hidden border border-pink-500/30 shadow-lg">
                  <img
                    src={inspectingCreation.generatedImageUrl}
                    alt="Render 3D"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* AI Prompt Rationale & Diagnostics */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <span className="font-bold text-slate-300">Prompt 3D Pixar Generado por Gemini 2.5 Flash:</span>
              <p className="font-mono text-[11px] text-slate-400 bg-black/40 p-3 rounded-xl leading-relaxed">
                {inspectingCreation.analysis?.enhancedPrompt || 'No prompt specified'}
              </p>
              {inspectingCreation.analysis?.speechFeedback && (
                <div className="pt-2">
                  <span className="font-bold text-slate-300">Feedback de Voz Generado:</span>
                  <p className="text-pink-300 italic pt-0.5">
                    "{inspectingCreation.analysis.speechFeedback}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectingCreation(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                Cerrar
              </button>
              <a
                href={getCreativeStudioUrl(inspectingCreation.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#533B87] to-[#EC4899] text-white text-xs font-bold flex items-center gap-2"
              >
                <span>Interactuar en Z-Art Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
