import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import type { DocumentItem, DocumentCategory } from '@zentry/shared';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newDoc: Omit<DocumentItem, 'id' | 'uploadDate' | 'status'>) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('educacion');
  const [tagsStr, setTagsStr] = useState('');
  const [summary, setSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      onUpload({
        title: title.trim(),
        category,
        fileUrl: `https://storage.googleapis.com/quarz-group-vault/${encodeURIComponent(title.trim().toLowerCase())}.pdf`,
        fileType: 'application/pdf',
        sizeBytes: Math.floor(Math.random() * 800000) + 200000,
        tags: tags.length > 0 ? tags : ['Colegio San Agustín', 'Documento Familiar'],
        summary: summary.trim() || 'Documento indexado y verificado en la bóveda parental.',
      });

      setIsUploading(false);
      setTitle('');
      setTagsStr('');
      setSummary('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-lg border border-[#D6C8FA]/40 dark:border-[#D6C8FA]/30 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#D6C8FA]/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-[#533B87]/40 border border-violet-200 dark:border-[#D6C8FA]/30 text-[#533B87] dark:text-[#C2F4E7]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#EBF1F5]">Subir Documento a la Bóveda</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Carga segura con cifrado de extremo a extremo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-4">
          <div className="border-2 border-dashed border-[#D6C8FA] dark:border-[#D6C8FA]/30 hover:border-[#533B87] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#080D1A]/50 transition-colors cursor-pointer group">
            <UploadCloud className="w-8 h-8 text-[#533B87] dark:text-[#D6C8FA] group-hover:scale-110 transition-transform mb-1" />
            <p className="text-xs font-bold text-slate-900 dark:text-[#EBF1F5]">
              Arrastra archivos aquí o <span className="text-[#533B87] dark:text-[#C2F4E7] underline">explora tu dispositivo</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Soporta PDF, JPG, PNG, DOCX (Máx. 25MB)</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-800 dark:text-slate-200 font-bold">Título del Documento *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Libreta Bimestre 2 - San Agustín.pdf"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#533B87] outline-none shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-800 dark:text-slate-200 font-bold">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] focus:border-[#533B87] outline-none shadow-xs"
            >
              <option value="educacion">Escuela & Notas (Educación)</option>
              <option value="salud">Salud & Citas Médicas</option>
              <option value="identidad">Identidad (DNI, Pasaporte)</option>
              <option value="legal">Legal & Autorizaciones</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-800 dark:text-slate-200 font-bold">Etiquetas / Tags (separadas por coma)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Colegio, Primaria, Calificaciones 2026"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#533B87] outline-none shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-800 dark:text-slate-200 font-bold">Descripción o Notas Adicionales</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Breve nota sobre el documento..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-900 dark:text-[#EBF1F5] placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#533B87] outline-none resize-none shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#D6C8FA]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#D6C8FA]/20 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#44326E] text-xs text-white font-bold flex items-center gap-2 shadow-md shadow-[#533B87]/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#C2F4E7]" />
              <span>{isUploading ? 'Guardando...' : 'Guardar en Bóveda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
