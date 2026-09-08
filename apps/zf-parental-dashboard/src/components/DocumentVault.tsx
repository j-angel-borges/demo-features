import React from 'react';
import {
  FolderLock,
  Search,
  Plus,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
  Tag,
  Sparkles,
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
  const categories: Array<{ id: VaultCategory; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: categoryCounts.all },
    { id: 'identity', label: 'Identidad & Legal', count: categoryCounts.identity + categoryCounts.legal },
    { id: 'medical', label: 'Salud & Citas', count: categoryCounts.medical },
    { id: 'school', label: 'Escuela & Notas', count: categoryCounts.school },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-[#D6C8FA]/20 flex flex-col justify-between">
      {/* Vault Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-[#533B87]/40 border border-[#D6C8FA]/60 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#D6C8FA]">
            <FolderLock className="w-5 h-5 text-[#533B87] dark:text-[#C2F4E7]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#EBF1F5] flex items-center gap-2">
              Bóveda Documental Familiar
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFCF8] dark:bg-[#C2F4E7]/15 text-[#1B6E5E] dark:text-[#C2F4E7] border border-[#C2F4E7]">
                Bóveda Encriptada
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#D6C8FA]/80">
              Expedientes escolares, cartillas de salud y documentos legales en la nube
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#44326E] text-xs text-white font-semibold flex items-center gap-2 shadow-md shadow-[#533B87]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C2F4E7]" />
          <span>Subir Documento</span>
        </button>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-5">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#533B87] border border-[#533B87] text-white shadow-md'
                  : 'bg-white/80 dark:bg-[#080D1A]/60 border border-slate-200 dark:border-[#D6C8FA]/15 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-white/10 hover:text-[#533B87] dark:hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-white/30 text-white' : 'bg-slate-100 dark:bg-white/10 text-[#533B87] dark:text-[#D6C8FA]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título o tag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#080D1A]/80 border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#533B87] dark:focus:border-[#C2F4E7] outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-[#EBF1F5]/60 space-y-2">
          <FileText className="w-10 h-10 text-slate-300 dark:text-[#D6C8FA]/30" />
          <p className="text-sm font-medium">No se encontraron documentos en esta categoría</p>
          <p className="text-xs text-slate-400 dark:text-[#D6C8FA]/60">Intenta con otra búsqueda o sube un nuevo archivo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-2xl p-4 border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/15 hover:border-[#533B87]/50 dark:hover:border-[#D6C8FA]/35 transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA] shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
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

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#EBF1F5] line-clamp-1 mb-1 group-hover:text-[#533B87] dark:group-hover:text-[#C2F4E7] transition-colors">
                  {doc.title}
                </h4>

                {/* Summary */}
                {doc.summary && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {doc.summary}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {doc.tags?.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-[#533B87]/30 border border-violet-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata & Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#533B87] dark:text-[#D6C8FA]" />
                    {formatDate(doc.uploadDate)}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(doc.sizeBytes)}</span>
                </div>

                <button
                  onClick={() => onSelectDoc(doc)}
                  className="px-2 py-0.5 rounded-md bg-violet-50 hover:bg-violet-100 dark:bg-[#533B87]/30 dark:hover:bg-[#533B87]/60 text-[#533B87] dark:text-[#D6C8FA] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver Ficha</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
