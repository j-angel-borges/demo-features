---
document_id: ZENTRY-SCI-04
title: Especificación Técnica de Algoritmos, Esquemas de Datos y Motor de Prescripción
vector: VEC-04
version: 1.0.0
generated_at: 2026-09-06T12:30:00Z
target_components:
  - packages/shared/src/types/skinner.ts
  - packages/shared/src/algorithms/healthScore.ts
  - packages/shared/src/constants/scientificPapers.ts
  - apps/parent-dashboard/src/components/skinner/SlotMachineView.tsx
  - apps/parent-dashboard/src/components/skinner/SessionReportView.tsx
---

# Especificación Técnica de Algoritmos, Esquemas de Datos y Motor de Prescripción

## 1. Resumen Ejecutivo
Este documento constituye la **guía de implementación directa para agentes de código**. Contiene las estructuras de tipos en TypeScript, esquemas de Firestore, máquinas de estado de interfaz (FSM), algoritmos de interpolación cromática y fixtures de prueba requeridos para materializar el **Factor WOW** en `apps/skinner-box` y `apps/parent-dashboard`.

---

## 2. Definición de Tipos en TypeScript (`packages/shared/src/types/skinner.ts`)

```typescript
/**
 * Catálogo canónico de papers científicos indexados en Zentry
 */
export interface ScientificCitation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi: string;
  pmid?: string;
  keyFinding: string;
  evidenceStrength: 'META_ANALYSIS' | 'LONGITUDINAL' | 'FMRI_STUDY' | 'PEER_REVIEWED';
}

/**
 * Evento de telemetría de palanca en tiempo real (PWA Skinner -> Parent Dashboard)
 */
export interface SkinnerLeverEvent {
  sessionId: string;
  eventId: string;
  timestamp: number; // Unix epoch ms
  type: 'LEVER_PULL' | 'JACKPOT_HIT' | 'DWELL_ALERT' | 'NORMAL_ADVANCE';
  dwellTimeSeconds: number;
  scrollVelocityRpm: number;
  leverForceRatio: number; // 0.0 (arriba) a 1.0 (palanca abajo total)
  isVariableRatioJackpot: boolean;
  activeVideoCategory: 'animals' | 'gaming' | 'science' | 'art' | 'sports' | 'general';
}

/**
 * Tarjeta de prescripción parental con respaldo científico
 */
export interface ParentalPrescription {
  id: string;
  category: string;
  title: string;
  offlineAction: string;
  ecologicalSetting: 'NATURE' | 'PHYSICAL_ACTIVITY' | 'MAKER_LAB' | 'CREATIVE_STUDIO';
  estimatedDurationMinutes: number;
  rationale: string;
  citation: ScientificCitation;
}

/**
 * Reporte consolidado de sesión almacenado en /sessions_skinner/{sessionId}
 */
export interface SkinnerSessionReportRecord {
  sessionId: string;
  childId: string;
  startedAt: number;
  endedAt: number;
  totalDurationSeconds: number;
  totalVideosCount: number;
  rapidSkipsCount: number;
  completedVideosCount: number;
  healthScore: number; // 0 a 100
  healthColorCategory: 'RED' | 'AMBER' | 'GREEN';
  healthHexColor: string;
  dominantCategories: Array<{
    category: string;
    dwellSeconds: number;
    affinityPercent: number;
  }>;
  prescriptions: ParentalPrescription[];
}
```

---

## 3. Algoritmo de Interpolación Cromática Continua (Rojo a Verde)

La barra de salud en `SessionReportView.tsx` no salta bruscamente entre bloques discretos; interpola un gradiente suave en el espacio RGB para generar un efecto visual fluido de alta gama:

```typescript
/**
 * Interpola un color hexadecimal en gradiente continuo:
 * 0 pts  -> #EF4444 (Rojo Crítico)
 * 50 pts -> #F59E0B (Ámbar Intermedio)
 * 100 pts -> #10B981 (Verde Esmeralda Zentry)
 */
export function getContinuousHealthColor(score: number): string {
  const clamped = Math.min(100, Math.max(0, score));

  // Rango 0 - 50: Rojo (#EF4444) a Ámbar (#F59E0B)
  if (clamped <= 50) {
    const t = clamped / 50.0;
    const r = Math.round(239 + (245 - 239) * t);
    const g = Math.round(68 + (158 - 68) * t);
    const b = Math.round(68 + (11 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Rango 50 - 100: Ámbar (#F59E0B) a Verde (#10B981)
  const t = (clamped - 50.0) / 50.0;
  const r = Math.round(245 + (16 - 245) * t);
  const g = Math.round(158 + (185 - 158) * t);
  const b = Math.round(11 + (129 - 11) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
```

---

## 4. Máquina de Estados Finitos (FSM) de la Vista Tragamonedas

```
      [ESTADO: IDLE]
            │
            ▼  (Recibe evento LEVER_PULL vía Firestore)
    [LEVER_DROPPING]  <── Resorte baja palanca (Spring transition 120ms)
            │
            ▼
    [REELS_SPINNING]  <── Rodillos SVG giran con desenfoque de movimiento
            │
      ┌─────┴─────────────────────────┐
      ▼ (Dwell < 6s o VR-7)           ▼ (Dwell >= 6s)
[JACKPOT_EXPLOSION]            [NORMAL_STOP]
- 7-7-7 o Joyas                - Libros / Enfoque
- Sonido Monedas / Campana     - Desaceleración suave
- Confeti Púrpura Zentry              │
      │                               │
      └──────────────┬────────────────┘
                     ▼
             [RESTABILIZING] (300ms)
                     │
                     ▼
               [ESTADO: IDLE]
```

---

## 5. Banco Canónico de Papers Científicos (`packages/shared/src/constants/scientificPapers.ts`)

```typescript
import { ScientificCitation } from '../types/skinner';

export const CANONICAL_SCIENTIFIC_PAPERS: Record<string, ScientificCitation> = {
  SCHULTZ_2024_PNAS: {
    id: 'SCHULTZ_2024_PNAS',
    authors: 'Schultz, W.',
    year: 2024,
    title: 'A dopamine mechanism for reward maximization',
    journal: 'Proc Natl Acad Sci U S A',
    doi: 'https://doi.org/10.1073/pnas.2316658121',
    pmid: '38717856',
    keyFinding: 'Demuestra el mecanismo neurobiológico de cálculo de recompensa y descargas fásicas de dopamina ante estímulos variables.',
    evidenceStrength: 'PEER_REVIEWED'
  },
  CHRISTAKIS_2018_PNAS: {
    id: 'CHRISTAKIS_2018_PNAS',
    authors: 'Christakis, D. A., Ramirez, J. S. B., & Ferguson, S. M.',
    year: 2018,
    title: 'How early media exposure may affect cognitive function: A review of results from observations in humans and experiments in mice',
    journal: 'Proc Natl Acad Sci U S A',
    doi: 'https://doi.org/10.1073/pnas.1711548115',
    pmid: '30275319',
    keyFinding: 'Comprueba que la velocidad excesiva de cambio en pantallas reduce la capacidad de atención sostenida y control inhibitorio.',
    evidenceStrength: 'LONGITUDINAL'
  },
  ZHAI_2025_NEUROPSYCH: {
    id: 'ZHAI_2025_NEUROPSYCH',
    authors: 'Zhai, G., Feng, Y., & Ling, X.',
    year: 2025,
    title: 'The sacrifice of alerting in active short video users: Evidence from executive control and default mode network functional connectivity',
    journal: 'Neuropsychologia',
    doi: 'https://doi.org/10.1016/j.neuropsychologia.2025.109291',
    pmid: '41047096',
    keyFinding: 'Evidencia fMRI de deterioro en la red de alerta y alteración en conectividad prefrontal por consumo de video corto.',
    evidenceStrength: 'FMRI_STUDY'
  },
  FOWLER_2026_ABCD: {
    id: 'FOWLER_2026_ABCD',
    authors: 'Fowler, C. H., Luby, J. L., & Bastain, T. M.',
    year: 2026,
    title: 'Green space is associated with better directed attention and higher crystallized intelligence in middle childhood: Evidence from the ABCD study',
    journal: 'Environ Int',
    doi: 'https://doi.org/10.1016/j.envint.2026.110502',
    pmid: '42691636',
    keyFinding: 'Macro-estudio ABCD demostrando que los espacios verdes restauran la atención dirigida e incrementan la inteligencia cristalizada en niños.',
    evidenceStrength: 'LONGITUDINAL'
  },
  KAPLAN_1995_ART: {
    id: 'KAPLAN_1995_ART',
    authors: 'Kaplan, S.',
    year: 1995,
    title: 'The restorative benefits of nature: Toward an integrative framework',
    journal: 'Journal of Environmental Psychology',
    doi: 'https://doi.org/10.1016/0272-4944(95)90001-2',
    keyFinding: 'Fundamentación de la Atención Involuntaria Suave (Soft Fascination) para revertir la fatiga cognitiva prefrontal.',
    evidenceStrength: 'PEER_REVIEWED'
  }
};
```

---

## 6. Fixture de Pruebas Unitarias (Vitest / Jest)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateConsumptionHealth } from '../algorithms/healthScore';
import { getContinuousHealthColor } from './colorUtils';

describe('Zentry Science Metrics Suite', () => {
  it('debe clasificar como ROJO una sesión impulsiva de doomscrolling', () => {
    const result = calculateConsumptionHealth({
      totalSessionSeconds: 300,
      totalVideosWatched: 20,
      dwellTimes: [3, 4, 2, 5, 3, 4, 2, 4, 3, 5, 2, 3, 4, 3, 5, 2, 4, 3, 2, 3], // Todos < 6s
      completionRatios: [0.1, 0.1, 0.05, 0.15, 0.1, 0.08, 0.1, 0.1, 0.1, 0.05, 0.1, 0.1, 0.05, 0.1, 0.1, 0.05, 0.1, 0.1, 0.05, 0.1]
    });

    expect(result.score).toBeLessThan(40);
    expect(result.colorCategory).toBe('RED');
    expect(result.skipRate).toBe(1.0);
  });

  it('debe clasificar como VERDE una sesión con visualización reflexiva sostenida', () => {
    const result = calculateConsumptionHealth({
      totalSessionSeconds: 300,
      totalVideosWatched: 7,
      dwellTimes: [38, 40, 42, 39, 45, 41, 40],
      completionRatios: [0.95, 1.0, 0.90, 1.0, 0.95, 1.0, 0.98]
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.colorCategory).toBe('GREEN');
    expect(result.skipRate).toBe(0.0);
  });

  it('debe generar gradiente RGB válido sin desbordamiento numérico', () => {
    expect(getContinuousHealthColor(0)).toBe('rgb(239, 68, 68)');
    expect(getContinuousHealthColor(100)).toBe('rgb(16, 185, 129)');
  });
});
```
