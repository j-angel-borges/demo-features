/**
 * Core type contracts for Skinner Box operant conditioning telemetry,
 * casino slot machine real-time synchronization, consumption health algorithms,
 * and academic citations vault.
 *
 * Grounded in:
 * - DOC_TECNICO_MEJORAS_FACTOR_WOW.md
 * - science-refs/00_INDEX_CATALOG.json
 * - science-refs/04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md
 */

/**
 * Canonical peer-reviewed paper citation record
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
 * Real-time lever telemetry event (PWA Skinner Box -> Parent Dashboard)
 */
export interface SkinnerLeverEvent {
  sessionId: string;
  eventId: string;
  timestamp: number; // Unix epoch ms
  type: 'LEVER_PULL' | 'JACKPOT_HIT' | 'DWELL_ALERT' | 'NORMAL_ADVANCE';
  dwellTimeSeconds: number;
  scrollVelocityRpm: number;
  leverForceRatio: number; // 0.0 (up) to 1.0 (full pull)
  isVariableRatioJackpot: boolean;
  activeVideoCategory: 'animals' | 'gaming' | 'science' | 'art' | 'sports' | 'general' | string;
}

/**
 * Compatible alias matching DOC_TECNICO_MEJORAS_FACTOR_WOW.md Section 6.1
 */
export interface SkinnerLiveAction {
  sessionId: string;
  timestamp: number;
  action: 'LEVER_PULL' | 'JACKPOT_HIT' | 'DWELL_ALERT' | 'NORMAL_ADVANCE';
  videoDurationTarget: number; // e.g. 40s -> 5s
  actualDwellSeconds: number;
  scrollVelocityRpm: number;
  leverForceRatio: number; // 0.0 to 1.0 for spring physics
  isVariableRatioReward: boolean;
  activeVideoCategory?: string;
}

/**
 * Parental offline recommendation grounded in empirical literature
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
 * Dominant category interest affinity item
 */
export interface DominantCategoryAffinity {
  category: string;
  dwellSeconds: number;
  affinityPercent: number;
  interestAffinityPercent?: number;
}

/**
 * Consolidated session report persisted in /sessions_skinner/{sessionId}
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
  healthScore: number; // 0 to 100
  healthColorCategory: 'RED' | 'AMBER' | 'GREEN';
  healthHexColor: string;
  dominantCategories: DominantCategoryAffinity[];
  prescriptions: ParentalPrescription[];
}

/**
 * Extended compatible alias for Section 6.1 specification
 */
export interface SkinnerSessionReport {
  sessionId: string;
  childId: string;
  startTime: number;
  endTime: number;
  totalDurationSeconds: number;
  totalVideosCount: number;
  rapidSkipsCount: number;
  completedVideosCount: number;
  healthScore: number;
  healthColorCategory: 'RED' | 'AMBER' | 'GREEN';
  dominantCategories: Array<{
    category: string;
    dwellSeconds: number;
    interestAffinityPercent: number;
  }>;
  prescriptions: Array<{
    title: string;
    offlineAction: string;
    rationale: string;
    scientificCitation: {
      authors: string;
      year: number;
      paperTitle: string;
      journal: string;
      doiOrReference: string;
    };
  }>;
}

/**
 * Variable-Ratio slot machine feedback
 */
export interface LeverPullFeedback {
  isJackpot: boolean;
  dopaminePulseLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_JACKPOT';
  soundFx: 'click' | 'lever_drop' | 'wheel_spin' | 'jackpot_alarm';
  reelIcons: [string, string, string];
}

/**
 * Raw session metrics input for health scoring
 */
export interface SessionMetrics {
  totalSessionSeconds: number;
  totalVideosWatched: number;
  dwellTimes: number[]; // in seconds
  completionRatios: number[]; // 0.0 to 1.0
}

/**
 * Result of Consumption Health Index evaluation
 */
export interface HealthScoreResult {
  score: number; // 0 - 100
  colorCategory: 'RED' | 'AMBER' | 'GREEN';
  hexColor: string;
  averageDwellSeconds: number;
  skipRate: number; // 0.0 - 1.0
  completionRate: number; // 0.0 - 1.0
}
