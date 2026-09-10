import React, { useState } from 'react';
import {
  FolderLock,
  Folder,
  Search,
  Plus,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Eye,
  Calendar,
  Building2,
  LayoutGrid,
  List,
  HeartPulse,
  GraduationCap,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import type { DocumentItem } from '@zentry/shared';
import type { VaultCategory } from '../types';

interface DocumentVaultProps {
  documents: DocumentItem[];
  allDocuments: DocumentItem[];
  activeCategory: VaultCategory;
  onCategoryChange: (category: VaultCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDoc: (doc: DocumentItem) => void;
  onOpenUpload: () => void;
  onDeleteDoc: (docId: string) => void;
  categoryCounts: Record<VaultCategory, number>;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onSelectDoc,
  onOpenUpload,
  onDeleteDoc,
  categoryCounts,
}) => {
  // Selector de vista: 'grid' (bloque / tarjetas) o 'detail' (lista tipo explorador)
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  // Sistema de Carpetas y Temas Intuitivo sin scroll horizontal
  const folderCategories: Array<{
    id: VaultCategory;
    label: string;
    description: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
  }> = [
    {
      id: 'all',
      label: 'Todas las Carpetas',
      description: 'Expediente integral',
      count: categoryCounts.all || 0,
      icon: FolderLock,
      accentColor: '#533B87',
      badgeBg: 'bg-violet-100 dark:bg-[#533B87]/30',
      badgeText: 'text-[#533B87] dark:text-[#D6C8FA]'
    },
    {
      id: 'identity',
      label: 'Identidad & Legal',
      description: 'DNI, partidas y firmas',
      count: (categoryCounts.identity || 0) + (categoryCounts.legal || 0),
      icon: ShieldCheck,
      accentColor: '#3B82F6',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/20',
      badgeText: 'text-blue-700 dark:text-blue-300'
    },
    {
      id: 'medical',
      label: 'Salud & Citas',
      description: 'Vacunas y revisiones',
      count: categoryCounts.medical || 0,
      icon: HeartPulse,
      accentColor: '#10B981',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-700 dark:text-emerald-300'
    },
    {
      id: 'school',
      label: 'Escuela & Notas',
      description: 'Boletines y matrículas',
      count: categoryCounts.school || 0,
      icon: GraduationCap,
      accentColor: '#F59E0B',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/20',
      badgeText: 'text-amber-700 dark:text-amber-300'
    },
  ];

  const currentFolder = folderCategories.find((f) => f.id === activeCategory) || folderCategories[0];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Extracción limpia de la fuente emisora sin símbolo '#'
  const getDocSource = (doc: DocumentItem): string => {
    if (doc.tags && doc.tags.length > 0) {
      const clean = doc.tags[0].replace(/^[#\s]+/, '').trim();
      if (clean) return clean;
    }
    if (doc.category === 'salud') return 'Sector Salud / Clínica';
    if (doc.category === 'educacion') return 'Institución Educativa';
    if (doc.category === 'identidad') return 'RENIEC / Registro Civil';
    if (doc.category === 'legal') return 'Notaría / Legal';
    return 'Entidad Certificada';
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-[#D6C8FA]/25 shadow-xl flex flex-col gap-4 h-full overflow-hidden">
      {/* Pinned Top Container: Header, Folders, Breadcrumbs & Search */}
      <div className="shrink-0 flex flex-col gap-4">
        {/* 1. Header Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-[#533B87]/40 border border-[#D6C8FA]/60 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA] shadow-xs">
              <FolderLock className="w-5 h-5 text-[#533B87] dark:text-[#C2F4E7]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#EBF1F5] flex items-center gap-2">
                Bóveda Documental Familiar
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFCF8] dark:bg-[#C2F4E7]/15 text-[#1B6E5E] dark:text-[#C2F4E7] border border-[#C2F4E7]">
                  Bóveda Encriptada
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#D6C8FA]/80">
                Explorador inteligente de expedientes escolares, salud e identidad familiar
              </p>
            </div>
          </div>

          {/* Botón de Subir Documento */}
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#44326E] text-xs text-white font-bold flex items-center gap-2 shadow-md shadow-[#533B87]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C2F4E7]" />
            <span>Subir Documento</span>
          </button>
        </div>

      {/* 2. Sistema de Carpetas y Temas Intuitivo (Grid 2x2 en móvil, 4 cols en desktop - SIN DESLIZAR) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7]" />
            Carpetas de Expediente
          </span>
          {activeCategory !== 'all' && (
            <button
              onClick={() => onCategoryChange('all')}
              className="text-[11px] text-[#533B87] dark:text-[#D6C8FA] hover:underline font-semibold cursor-pointer"
            >
              Ver todas las carpetas
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {folderCategories.map((folder) => {
            const isSelected = activeCategory === folder.id;
            const Icon = folder.icon;

            return (
              <button
                key={folder.id}
                onClick={() => onCategoryChange(folder.id)}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#533B87] to-[#3C2867] text-white border-[#533B87] shadow-lg shadow-[#533B87]/20 ring-2 ring-[#C2F4E7]/50'
                    : 'bg-white/85 dark:bg-[#080D1A]/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#D6C8FA]/15 hover:border-[#533B87]/40 dark:hover:border-[#D6C8FA]/40 hover:bg-violet-50/50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-white/20 text-[#C2F4E7]'
                        : folder.badgeBg + ' ' + folder.badgeText
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {folder.count} {folder.count === 1 ? 'archivo' : 'archivos'}
                  </span>
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-bold truncate leading-tight">
                    {folder.label}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {folder.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Barra de Herramientas del Explorador (Breadcrumb + Búsqueda + Selector de Vista) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
        {/* Breadcrumb de Navegación */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <FolderOpen className="w-3.5 h-3.5 text-[#533B87] dark:text-[#C2F4E7]" />
            Bóveda
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-[#EBF1F5] bg-violet-50 dark:bg-white/10 px-2 py-0.5 rounded-md">
            {currentFolder.label}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">
            ({documents.length} {documents.length === 1 ? 'elemento' : 'elementos'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Campo de Búsqueda */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por título o fuente..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 focus:border-[#533B87] dark:focus:border-[#C2F4E7] outline-none transition-all shadow-xs"
            />
          </div>

          {/* Toggle de Vistas: Bloque (Cuadrícula) vs Detalle (Lista / Tabla tipo Explorador) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista en Bloque (Tarjetas)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Bloque</span>
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'detail'
                  ? 'bg-white dark:bg-[#533B87] text-[#533B87] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista Detalle (Tabla / Lista Explorador)"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Detalle</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* 4. Lista o Bloques de Documentos (Área con Scroll Interno - El resto permanece fijado) */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain min-h-0 pr-1 space-y-3 scrollbar-thin">
        {documents.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-[#EBF1F5]/60 space-y-2 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <FileText className="w-10 h-10 text-slate-300 dark:text-[#D6C8FA]/30" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No hay documentos en esta carpeta</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intenta con otra búsqueda o sube un nuevo archivo al expediente</p>
          </div>
        ) : viewMode === 'grid' ? (
        /* ========================================================================= */
        /* VISTA EN BLOQUE (TARJETAS): Solo título, fuente sin '#' y fecha con botones */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {documents.map((doc) => {
            const source = getDocSource(doc);
            return (
              <div
                key={doc.id}
                className="glass-card rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/15 hover:border-[#533B87]/50 dark:hover:border-[#D6C8FA]/35 transition-all duration-200 flex flex-col justify-between group relative shadow-xs"
              >
                <div>
                  {/* Card Header con icono y botones de acción */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA] shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-4.5 h-4.5 text-[#533B87] dark:text-[#C2F4E7]" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectDoc(doc)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-[#533B87] dark:hover:text-white transition-colors cursor-pointer"
                        title="Vista Previa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-[#533B87] dark:hover:text-white transition-colors cursor-pointer"
                        title="Descargar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        title="Eliminar de la Bóveda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título: SOLO TÍTULO (sin descripción ni peso) */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#EBF1F5] line-clamp-2 mb-2 group-hover:text-[#533B87] dark:group-hover:text-[#C2F4E7] transition-colors leading-snug">
                    {doc.title}
                  </h4>

                  {/* Fuente: SIN '#' */}
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#533B87] dark:text-[#D6C8FA] bg-violet-50 dark:bg-[#533B87]/30 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-[#D6C8FA]/20">
                      <Building2 className="w-3 h-3 text-[#533B87] dark:text-[#C2F4E7]" />
                      {source}
                    </span>
                  </div>
                </div>

                {/* Footer: SOLO FECHA Y BOTÓN VER FICHA (sin peso ni descripción) */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#533B87] dark:text-[#D6C8FA]" />
                    {formatDate(doc.uploadDate)}
                  </span>

                  <button
                    onClick={() => onSelectDoc(doc)}
                    className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-[#533B87]/30 dark:hover:bg-[#533B87]/60 text-[#533B87] dark:text-[#D6C8FA] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Ficha</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* VISTA DETALLE (TABLA / LISTA TIPO EXPLORADOR DE WINDOWS): Captura 080841  */
        /* ========================================================================= */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#D6C8FA]/15 bg-white/70 dark:bg-[#080D1A]/60 backdrop-blur-md shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-white/5">
                <th className="py-2.5 px-4">Nombre</th>
                <th className="py-2.5 px-4">Fuente</th>
                <th className="py-2.5 px-4">Fecha de subida</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {documents.map((doc) => {
                const source = getDocSource(doc);
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-violet-50/60 dark:hover:bg-[#533B87]/20 transition-colors group cursor-pointer"
                    onClick={() => onSelectDoc(doc)}
                  >
                    {/* Columna Nombre */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-[#533B87]/40 text-[#533B87] dark:text-[#C2F4E7] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-[#EBF1F5] truncate max-w-[200px] sm:max-w-xs md:max-w-md group-hover:text-[#533B87] dark:group-hover:text-[#C2F4E7] transition-colors">
                          {doc.title}
                        </span>
                      </div>
                    </td>

                    {/* Columna Fuente (sin '#') */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#533B87] dark:text-[#D6C8FA] bg-violet-50 dark:bg-[#533B87]/30 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-[#D6C8FA]/20">
                        <Building2 className="w-3 h-3 text-[#533B87] dark:text-[#C2F4E7]" />
                        {source}
                      </span>
                    </td>

                    {/* Columna Fecha */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(doc.uploadDate)}
                      </span>
                    </td>

                    {/* Columna Acciones con botones */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectDoc(doc)}
                          className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-[#533B87]/30 dark:hover:bg-[#533B87]/60 text-[#533B87] dark:text-[#D6C8FA] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Ver Ficha"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ver Ficha</span>
                        </button>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-[#533B87] dark:hover:text-white transition-colors cursor-pointer"
                          title="Descargar"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};
