import { useState, useEffect, useMemo } from 'react';
import type { DocumentItem, DocumentCategory } from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore';
import type { VaultCategory } from '../types';

export const SEEDED_VAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_escuela_01',
    title: 'Libreta Escolar 2026 - 5to Primaria',
    category: 'educacion',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/libreta_escolar_2026.pdf',
    fileType: 'application/pdf',
    sizeBytes: 1048576, // 1.0 MB
    uploadDate: Date.now() - 86400000 * 5,
    status: 'verified',
    tags: ['Colegio San Agustín', 'Notas', 'Bimestre 1', 'Matemáticas A+'],
    summary: 'Boletín oficial de calificaciones 2026. Desempeño sobresaliente en Ciencias y Matemáticas.',
  },
  {
    id: 'doc_salud_01',
    title: 'Cartilla de Vacunación & Inmunización',
    category: 'salud',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/cartilla_vacunacion.pdf',
    fileType: 'application/pdf',
    sizeBytes: 524288, // 512 KB
    uploadDate: Date.now() - 86400000 * 12,
    status: 'verified',
    tags: ['MINSA', 'Vacunas', 'Refuerzo COVID-19', 'Tétanos'],
    summary: 'Registro nacional de vacunación pediátrica. Esquema completo actualizado.',
  },
  {
    id: 'doc_identidad_01',
    title: 'DNI Menor de Edad - Mateo Zegarra',
    category: 'identidad',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/dni_mateo_zegarra.pdf',
    fileType: 'image/jpeg',
    sizeBytes: 2097152, // 2.0 MB
    uploadDate: Date.now() - 86400000 * 45,
    status: 'verified',
    tags: ['RENIEC', 'Documento Identidad', 'Vigente hasta 2029'],
    summary: 'Documento Nacional de Identidad amarillo emitido por RENIEC. Código único de verificación verificado.',
  },
  {
    id: 'doc_legal_01',
    title: 'Consentimiento Clínico & Seguro Escolar',
    category: 'legal',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/consentimiento_clinico.pdf',
    fileType: 'application/pdf',
    sizeBytes: 786432, // 768 KB
    uploadDate: Date.now() - 86400000 * 20,
    status: 'verified',
    tags: ['Seguro Pacífico', 'Autorización Médica', 'Firmado'],
    summary: 'Autorización legal para intervenciones médicas de emergencia y cobertura contra accidentes.',
  },
  {
    id: 'doc_salud_02',
    title: 'Certificado Médico Oftalmológico 2026',
    category: 'salud',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/oftalmologia_mateo.pdf',
    fileType: 'application/pdf',
    sizeBytes: 314572, // 307 KB
    uploadDate: Date.now() - 86400000 * 2,
    status: 'verified',
    tags: ['Clínica San Borja', 'Agudeza Visual', 'Filtro Luz Azul'],
    summary: 'Evaluación anual de visión. Agudeza visual 20/20. Recomendación de descanso visual por exposición a pantallas.',
  },
  {
    id: 'doc_escuela_02',
    title: 'Constancia de Matrícula & Ficha Integral',
    category: 'educacion',
    fileUrl: 'https://storage.googleapis.com/quarz-group-vault/matricula_san_agustin.pdf',
    fileType: 'application/pdf',
    sizeBytes: 655360, // 640 KB
    uploadDate: Date.now() - 86400000 * 60,
    status: 'verified',
    tags: ['SIAGIE', 'Matrícula 2026', 'Primaria'],
    summary: 'Ficha oficial de matrícula registrada en el sistema del Ministerio de Educación.',
  }
];

export function useDocumentVault() {
  const [documents, setDocuments] = useState<DocumentItem[]>(SEEDED_VAULT_DOCUMENTS);
  const [activeCategory, setActiveCategory] = useState<VaultCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  useEffect(() => {
    // Seed initial docs to shared storage
    SEEDED_VAULT_DOCUMENTS.forEach((doc) => {
      parentFirestoreService.saveVaultDocument(doc);
    });

    const unsubscribe = parentFirestoreService.subscribeVaultDocuments((docList) => {
      if (docList && docList.length > 0) {
        setDocuments(docList);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Category mapping helper
  const matchesCategory = (doc: DocumentItem, cat: VaultCategory): boolean => {
    if (cat === 'all') return true;
    if (cat === 'legal') return doc.category === 'legal';
    if (cat === 'medical') return doc.category === 'salud';
    if (cat === 'school') return doc.category === 'educacion';
    if (cat === 'identity') return doc.category === 'identidad';
    return doc.category === cat;
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = matchesCategory(doc, activeCategory);
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      const matchSummary = doc.summary ? doc.summary.toLowerCase().includes(q) : false;

      return matchTitle || matchTags || matchSummary;
    });
  }, [documents, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: documents.length,
      legal: documents.filter((d) => d.category === 'legal').length,
      medical: documents.filter((d) => d.category === 'salud').length,
      school: documents.filter((d) => d.category === 'educacion').length,
      identity: documents.filter((d) => d.category === 'identidad').length,
    };
  }, [documents]);

  const handleUpload = async (newDoc: Omit<DocumentItem, 'id' | 'uploadDate' | 'status'>) => {
    const item: DocumentItem = {
      ...newDoc,
      id: `doc_${Date.now()}`,
      uploadDate: Date.now(),
      status: 'verified',
    };
    await parentFirestoreService.saveVaultDocument(item);
    setDocuments((prev) => [item, ...prev]);
    setIsUploadOpen(false);
  };

  const handleDelete = async (docId: string) => {
    await parentFirestoreService.deleteVaultDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedDoc,
    setSelectedDoc,
    isUploadOpen,
    setIsUploadOpen,
    categoryCounts,
    handleUpload,
    handleDelete,
  };
}
