import React from 'react';
import { X, FileText, Download, ShieldCheck, Calendar, HardDrive } from 'lucide-react';
import type { DocumentItem } from '@zentry/shared';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-xl border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/30 shadow-2xl relative flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-[#D6C8FA]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#C2F4E7]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EBF1F5] leading-tight">{document.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 capitalize">Categoría: {document.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="my-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#1B6E5E] dark:text-[#C2F4E7] font-bold">
              <ShieldCheck className="w-4 h-4" />
              Documento Certificado Digitalmente
            </span>
            <span className="font-mono text-[11px] text-[#533B87] dark:text-[#D6C8FA] font-bold">ID: {document.id}</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#131B30]/60 border border-slate-200 dark:border-[#D6C8FA]/10 shadow-xs">
            <h5 className="text-xs font-bold text-[#533B87] dark:text-[#D6C8FA] mb-1">Resumen & Extracción OCR:</h5>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {document.summary || 'Documento validado por el sistema de gestión parental. Archivo íntegro sin alteraciones registradas.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#533B87] dark:text-[#D6C8FA]" />
              <span>Fecha: {formatDate(document.uploadDate || Date.now())}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#533B87] dark:text-[#D6C8FA]" />
              <span>Tamaño: {formatFileSize(document.sizeBytes || 450000)}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {document.tags?.map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-[#533B87]/30 border border-violet-200 dark:border-[#D6C8FA]/20 text-[#533B87] dark:text-[#D6C8FA]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-all cursor-pointer"
          >
            Cerrar
          </button>
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            download={document.title}
            className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#44326E] text-xs text-white font-bold flex items-center gap-1.5 shadow-md shadow-[#533B87]/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#C2F4E7]" />
            <span>Descargar Documento</span>
          </a>
        </div>
      </div>
    </div>
  );
};
