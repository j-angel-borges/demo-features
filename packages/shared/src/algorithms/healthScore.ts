import {
  SessionMetrics,
  HealthScoreResult,
  ParentalPrescription,
  DominantCategoryAffinity,
} from '../types/skinner.js';
import { CANONICAL_SCIENTIFIC_PAPERS } from '../constants/scientificPapers.js';

/**
 * Calculates the Consumption Health Index (I_sc) for a completed or ongoing session.
 *
 * Mathematical formulation:
 * I_sc = Phi [ 0.40 * (T_dwell_avg / 25.0) + 0.35 * (1 - N_skips / N_total) + 0.25 * (N_completed / N_total) ] * 100
 *
 * Grounded in:
 * - Christakis et al. (2018) PNAS
 * - Zhai et al. (2025) Neuropsychologia
 * - Xiao et al. (2026) Brain and Behavior
 */
export function calculateConsumptionHealth(metrics: SessionMetrics): HealthScoreResult {
  const n = metrics.dwellTimes.length;
  if (n === 0) {
    return {
      score: 100,
      colorCategory: 'GREEN',
      hexColor: '#10B981',
      averageDwellSeconds: 0,
      skipRate: 0,
      completionRate: 1,
    };
  }

  const avgDwell = metrics.dwellTimes.reduce((a, b) => a + b, 0) / n;
  const skips = metrics.dwellTimes.filter((t) => t < 6.0).length;
  const completed = metrics.completionRatios.filter((r) => r >= 0.80).length;

  const skipRate = skips / n;
  const completionRate = completed / n;
  const dwellRatio = Math.min(1.0, avgDwell / 25.0);

  const rawScore = (0.40 * dwellRatio + 0.35 * (1.0 - skipRate) + 0.25 * completionRate) * 100;
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  let colorCategory: 'RED' | 'AMBER' | 'GREEN' = 'RED';
  let hexColor = '#EF4444'; // Red-500

  if (score >= 70) {
    colorCategory = 'GREEN';
    hexColor = '#10B981'; // Emerald-500 Zentry
  } else if (score >= 40) {
    colorCategory = 'AMBER';
    hexColor = '#F59E0B'; // Amber-500
  }

  return {
    score,
    colorCategory,
    hexColor,
    averageDwellSeconds: Number(avgDwell.toFixed(1)),
    skipRate: Number(skipRate.toFixed(2)),
    completionRate: Number(completionRate.toFixed(2)),
  };
}

/**
 * Interpolates an RGB color in a smooth continuous gradient across the spectrum:
 * 0 pts   -> #EF4444 (Critical Red: rgb(239, 68, 68))
 * 50 pts  -> #F59E0B (Intermediate Amber: rgb(245, 158, 11))
 * 100 pts -> #10B981 (Emerald Green: rgb(16, 185, 129))
 */
export function getContinuousHealthColor(score: number): string {
  const clamped = Math.min(100, Math.max(0, score));

  // Range 0 - 50: Red (#EF4444) to Amber (#F59E0B)
  if (clamped <= 50) {
    const t = clamped / 50.0;
    const r = Math.round(239 + (245 - 239) * t);
    const g = Math.round(68 + (158 - 68) * t);
    const b = Math.round(68 + (11 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Range 50 - 100: Amber (#F59E0B) to Green (#10B981)
  const t = (clamped - 50.0) / 50.0;
  const r = Math.round(245 + (16 - 245) * t);
  const g = Math.round(158 + (185 - 158) * t);
  const b = Math.round(11 + (129 - 11) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Generates tailored real-world offline prescriptions backed by peer-reviewed citations
 * based on the child's dominant video interests and the session health score.
 */
export function generatePrescriptions(
  dominantCategories: DominantCategoryAffinity[],
  healthScore: number
): ParentalPrescription[] {
  const prescriptions: ParentalPrescription[] = [];
  const normalizedCats = (dominantCategories || []).map((c) => (c.category || '').toLowerCase());

  const hasCat = (keywords: string[]) =>
    normalizedCats.some((c) => keywords.some((k) => c.includes(k)));

  // 1. Nature / Animals prescription (Attention Restoration Theory)
  if (hasCat(['animal', 'fauna', 'biolog', 'selva', 'oceano', 'naturaleza', 'nature', 'ocean', 'wildlife']) || normalizedCats.length === 0) {
    prescriptions.push({
      id: 'pres_nat_art_01',
      category: 'nature',
      title: 'Expedición a Reserva Natural o Santuario de Fauna',
      offlineAction:
        'Desconexión digital guiada y visita de campo a zoológico interactivo, acuario o reserva botánica.',
      ecologicalSetting: 'NATURE',
      estimatedDurationMinutes: 120,
      rationale:
        'Attention Restoration Theory (ART): la interacción con entornos vivos y animales activa la fascinación suave (soft fascination), restableciendo los mecanismos atencionales prefrontales fatigados por pantallas.',
      citation: CANONICAL_SCIENTIFIC_PAPERS.KAPLAN_1995_ART,
    });
  }

  // 2. Gaming / High Velocity -> Motor Coordination (Xiao 2026 / Small 2020)
  if (hasCat(['gaming', 'juego', 'deporte', 'velocidad', 'accion', 'shorts', 'game', 'sport', 'speed', 'action']) || normalizedCats.length === 0) {
    prescriptions.push({
      id: 'pres_motor_act_01',
      category: 'sports',
      title: 'Deportes de Coordinación Oculomanual y Agilidad Motora',
      offlineAction:
        'Circuito de escalada deportiva (bouldering), tenis de mesa o carrera de obstáculos en parque.',
      ecologicalSetting: 'PHYSICAL_ACTIVITY',
      estimatedDurationMinutes: 90,
      rationale:
        'Canaliza la demanda de velocidad e hiper-reactividad sustituyendo circuitos de recompensa artificial por dopamina endógena ligada a metas propioceptivas físicas.',
      citation: CANONICAL_SCIENTIFIC_PAPERS.XIAO_2026_BRAIN_BEHAV,
    });
  }

  // 3. Science / Experiments -> Empirical Discovery (Zimmerman 2002 / Fowler 2026)
  if (hasCat(['ciencia', 'espacio', 'quimic', 'fisic', 'robot', 'experimento', 'science', 'space', 'chem', 'physic', 'experiment', 'stem', 'tech']) || normalizedCats.length === 0) {
    prescriptions.push({
      id: 'pres_sci_lab_01',
      category: 'science',
      title: 'Laboratorio Práctico de Ciencias y Experimentos Caseros',
      offlineAction:
        'Taller de experimentos de química/física casera o visita guiada a museo de ciencia interactiva.',
      ecologicalSetting: 'MAKER_LAB',
      estimatedDurationMinutes: 60,
      rationale:
        'Canaliza la curiosidad pasiva estimulada por clips hacia la agencia activa, la manipulación táctil deliberada y el aprendizaje autorregulado.',
      citation: CANONICAL_SCIENTIFIC_PAPERS.ZIMMERMAN_2002,
    });
  }

  // 4. Art / Creativity -> Deep Focus Flow State (Christakis 2019 / Fowler 2026)
  if (hasCat(['arte', 'dibujo', 'pintura', 'creatividad', 'musica', 'arcilla', 'art', 'draw', 'paint', 'creativ', 'music', 'craft']) || prescriptions.length < 3) {
    prescriptions.push({
      id: 'pres_art_craft_01',
      category: 'art',
      title: 'Taller de Expresión Plástica y Modelado Físico',
      offlineAction:
        'Sesión de pintura en caballete al aire libre, modelado con arcilla o redacción de bitácora ilustrada sin dispositivos.',
      ecologicalSetting: 'CREATIVE_STUDIO',
      estimatedDurationMinutes: 75,
      rationale:
        'Fomenta el estado de concentración sostenida (flow state) y la autorregulación ejecutiva profunda mediante creación manual tridimensional.',
      citation: CANONICAL_SCIENTIFIC_PAPERS.CHRISTAKIS_2019,
    });
  }

  // If critical consumption score (< 40), ensure nature restoration is prioritized as the first item
  if (healthScore < 40 && prescriptions.length > 1 && prescriptions[0].category !== 'nature') {
    const natIndex = prescriptions.findIndex((p) => p.category === 'nature');
    if (natIndex > 0) {
      const [natItem] = prescriptions.splice(natIndex, 1);
      prescriptions.unshift(natItem);
    }
  }

  return prescriptions;
}
