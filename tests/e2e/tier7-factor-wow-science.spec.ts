/**
 * Tier 7: Factor WOW, Science Metrics & Algorithmic Contracts Test Suite
 *
 * Authoritative References:
 * - DOC_TECNICO_MEJORAS_FACTOR_WOW.md
 * - science-refs/00_INDEX_CATALOG.json
 * - science-refs/01_OPERANT_CONDITIONING_SLOT_MACHINE_NEUROBIOLOGY.md
 * - science-refs/02_ATTENTION_DECAY_AND_COGNITIVE_FRAGMENTATION.md
 * - science-refs/03_ATTENTION_RESTORATION_THEORY_AND_OFFLINE_INTERVENTIONS.md
 * - science-refs/04_ALGORITHMIC_SCORING_AND_RECOMMENDATION_ENGINE_SPEC.md
 */

import { describe, it, expect, beforeEach } from '../fixtures/testHelper.js';
import {
  calculateConsumptionHealth,
  getContinuousHealthColor,
  generatePrescriptions,
  evaluateSlotMachineEvent,
  calculateDecayTarget,
  calculateLeverForceRatio,
  CANONICAL_SCIENTIFIC_PAPERS,
  publishSkinnerLeverEvent,
  subscribeToSkinnerLeverEvents,
  saveSkinnerSessionReport,
  subscribeToLatestSkinnerSessionReport,
  localDataBus,
  type SkinnerLeverEvent,
  type SkinnerSessionReportRecord,
} from '@zentry/shared';

describe('Tier 7: Factor WOW Scientific Contracts & Algorithms Suite', () => {
  // =========================================================================
  // VECTOR 1: Operant Conditioning & Slot Machine Metaphor
  // =========================================================================
  describe('VEC-01: Operant Conditioning & Variable-Ratio Mechanical Feedback', () => {
    it('T7-V1-01: Impulsive video skip (< 6.0s) triggers instant Critical Jackpot feedback', () => {
      const result = evaluateSlotMachineEvent(2, 3.5, 40.0);
      expect(result.isJackpot).toBe(true);
      expect(result.dopaminePulseLevel).toBe('CRITICAL_JACKPOT');
      expect(result.soundFx).toBe('jackpot_alarm');
      expect(result.reelIcons[0]).toBe('zap');
      expect(result.reelIcons[1]).toBe('zap');
      expect(result.reelIcons[2]).toBe('zap');
    });

    it('T7-V1-02: 7th consecutive scroll triggers Variable-Ratio VR-7 jackpot reward', () => {
      const result = evaluateSlotMachineEvent(7, 12.0, 40.0);
      expect(result.isJackpot).toBe(true);
      expect(result.dopaminePulseLevel).toBe('HIGH');
      expect(result.soundFx).toBe('wheel_spin');
      expect(result.reelIcons[0]).toBe('sparkles');
    });

    it('T7-V1-03: Mindful completion (>80% of target duration) returns calm reflective icons', () => {
      const origRandom = Math.random;
      Math.random = () => 0.99;
      try {
        const result = evaluateSlotMachineEvent(4, 35.0, 40.0);
        expect(result.isJackpot).toBe(false);
        expect(result.dopaminePulseLevel).toBe('LOW');
        expect(result.soundFx).toBe('lever_drop');
        expect(result.reelIcons).toContain('heart');
        expect(result.reelIcons).toContain('brain');
      } finally {
        Math.random = origRandom;
      }
    });

    it('T7-V1-04: Mechanical lever force ratio calculates smoothly with speed and jerk bonus', () => {
      const normalForce = calculateLeverForceRatio(25, 15.0);
      expect(normalForce).toBeGreaterThanOrEqual(0.15);
      expect(normalForce).toBeLessThanOrEqual(1.0);

      const jerkForce = calculateLeverForceRatio(60, 2.5); // Rapid skip
      expect(jerkForce).toBe(1.0); // Clamped at 1.0
    });

    it('T7-V1-05: Real-time SkinnerLeverEvent broadcasts synchronously to subscriber in < 5ms', () => {
      let received: SkinnerLeverEvent | null = null;
      const unsub = subscribeToSkinnerLeverEvents((ev) => {
        received = ev;
      });

      const testEvent: SkinnerLeverEvent = {
        sessionId: 'sess_wow_01',
        eventId: 'lever_test_01',
        timestamp: Date.now(),
        type: 'JACKPOT_HIT',
        dwellTimeSeconds: 4.2,
        scrollVelocityRpm: 18.5,
        leverForceRatio: 0.85,
        isVariableRatioJackpot: true,
        activeVideoCategory: 'animals',
      };

      const start = performance.now();
      publishSkinnerLeverEvent(testEvent);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(5.0);
      expect(received).toBeDefined();
      expect(received?.sessionId).toBe('sess_wow_01');
      expect(received?.type).toBe('JACKPOT_HIT');
      expect(received?.dwellTimeSeconds).toBe(4.2);
      expect(received?.activeVideoCategory).toBe('animals');

      unsub();
    });
  });

  // =========================================================================
  // VECTOR 2: Attention Decay & Cognitive Fragmentation
  // =========================================================================
  describe('VEC-02: Attention Decay Curve & Consumption Health Scoring', () => {
    it('T7-V2-01: Exponential decay target starts at 40s and decays asymptotically to 5s', () => {
      const t0 = calculateDecayTarget(0, 40, 5, 0.18);
      expect(t0).toBe(40.0);

      const t5 = calculateDecayTarget(5, 40, 5, 0.18);
      expect(t5).toBeLessThan(40.0);
      expect(t5).toBeGreaterThan(5.0);

      const t30 = calculateDecayTarget(30, 40, 5, 0.18);
      expect(t30).toBeLessThanOrEqual(5.5);
      expect(t30).toBeGreaterThanOrEqual(5.0);
    });

    it('T7-V2-02: Pure doomscrolling session is scored as RED (<40 pts) with 100% skip rate', () => {
      const result = calculateConsumptionHealth({
        totalSessionSeconds: 180,
        totalVideosWatched: 15,
        dwellTimes: [3, 2, 4, 5, 2, 3, 4, 3, 2, 4, 3, 2, 5, 3, 2], // All < 6s
        completionRatios: [0.1, 0.05, 0.12, 0.08, 0.05, 0.1, 0.05, 0.1, 0.05, 0.1, 0.05, 0.05, 0.1, 0.05, 0.05],
      });

      expect(result.score).toBeLessThan(40);
      expect(result.colorCategory).toBe('RED');
      expect(result.hexColor).toBe('#EF4444');
      expect(result.skipRate).toBe(1.0);
      expect(result.completionRate).toBe(0.0);
    });

    it('T7-V2-03: Deep mindful viewing session is scored as GREEN (>=70 pts) with 0% skip rate', () => {
      const result = calculateConsumptionHealth({
        totalSessionSeconds: 300,
        totalVideosWatched: 7,
        dwellTimes: [38, 42, 40, 39, 45, 41, 40],
        completionRatios: [0.95, 1.0, 0.92, 0.98, 1.0, 0.95, 0.99],
      });

      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.colorCategory).toBe('GREEN');
      expect(result.hexColor).toBe('#10B981');
      expect(result.skipRate).toBe(0.0);
      expect(result.completionRate).toBe(1.0);
    });

    it('T7-V2-04: Transitional exploratory viewing is scored as AMBER (40-69 pts)', () => {
      const result = calculateConsumptionHealth({
        totalSessionSeconds: 240,
        totalVideosWatched: 10,
        dwellTimes: [18, 12, 22, 14, 20, 8, 16, 25, 10, 15],
        completionRatios: [0.5, 0.3, 0.6, 0.4, 0.6, 0.2, 0.4, 0.8, 0.3, 0.4],
      });

      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(70);
      expect(result.colorCategory).toBe('AMBER');
      expect(result.hexColor).toBe('#F59E0B');
    });

    it('T7-V2-05: Empty or initial session returns 100 safe score without NaN or zero division', () => {
      const result = calculateConsumptionHealth({
        totalSessionSeconds: 0,
        totalVideosWatched: 0,
        dwellTimes: [],
        completionRatios: [],
      });

      expect(result.score).toBe(100);
      expect(result.colorCategory).toBe('GREEN');
      expect(Number.isNaN(result.score)).toBe(false);
      expect(result.averageDwellSeconds).toBe(0);
    });
  });

  // =========================================================================
  // VECTOR 3: Attention Restoration Theory (ART) & Prescriptions
  // =========================================================================
  describe('VEC-03: Attention Restoration Theory (ART) & Offline Prescriptions', () => {
    it('T7-V3-01: Generates nature restoration activity for animal and biodiversity interests', () => {
      const prescriptions = generatePrescriptions(
        [{ category: 'animals', dwellSeconds: 120, affinityPercent: 65 }],
        32
      );

      expect(prescriptions.length).toBeGreaterThanOrEqual(1);
      const nat = prescriptions.find((p) => p.category === 'nature');
      expect(nat).toBeDefined();
      expect(nat?.ecologicalSetting).toBe('NATURE');
      expect(nat?.citation.id).toBe('KAPLAN_1995_ART');
      expect(nat?.title).toContain('Reserva Natural');
    });

    it('T7-V3-02: Generates motor agility activity for gaming/speed interests', () => {
      const prescriptions = generatePrescriptions(
        [{ category: 'gaming', dwellSeconds: 150, affinityPercent: 70 }],
        28
      );

      const sport = prescriptions.find((p) => p.category === 'sports');
      expect(sport).toBeDefined();
      expect(sport?.ecologicalSetting).toBe('PHYSICAL_ACTIVITY');
      expect(sport?.citation.id).toBe('XIAO_2026_BRAIN_BEHAV');
    });

    it('T7-V3-03: Generates hands-on maker lab for science and experiment interests', () => {
      const prescriptions = generatePrescriptions(
        [{ category: 'science', dwellSeconds: 90, affinityPercent: 50 }],
        55
      );

      const sci = prescriptions.find((p) => p.category === 'science');
      expect(sci).toBeDefined();
      expect(sci?.ecologicalSetting).toBe('MAKER_LAB');
      expect(sci?.citation.id).toBe('ZIMMERMAN_2002');
    });

    it('T7-V3-04: Prioritizes nature restoration as first prescription during critical consumption (score < 40)', () => {
      const prescriptions = generatePrescriptions(
        [
          { category: 'gaming', dwellSeconds: 140, affinityPercent: 60 },
          { category: 'animals', dwellSeconds: 50, affinityPercent: 40 },
        ],
        25
      );

      expect(prescriptions.length).toBeGreaterThanOrEqual(2);
      expect(prescriptions[0].category).toBe('nature');
    });
  });

  // =========================================================================
  // VECTOR 4: Canonical Academic Citations & Continuous Color Gradient
  // =========================================================================
  describe('VEC-04: Canonical Academic Citations & Continuous Color Space', () => {
    it('T7-V4-01: Canonical catalog includes all indexed peer-reviewed foundations with valid metadata', () => {
      const requiredPaperIds = [
        'SCHULTZ_2024_PNAS',
        'CHRISTAKIS_2018_PNAS',
        'ZHAI_2025_NEUROPSYCH',
        'FOWLER_2026_ABCD',
        'KAPLAN_1995_ART',
        'SU_2021_NEUROIMAGE',
        'HE_2026_FRONTIERS',
        'XIAO_2026_BRAIN_BEHAV',
        'TAYLOR_2009_JAD',
        'SUDIMAC_2026_ENVRES',
      ];

      for (const id of requiredPaperIds) {
        const paper = CANONICAL_SCIENTIFIC_PAPERS[id];
        expect(paper).toBeDefined();
        expect(paper.id).toBe(id);
        expect(paper.authors.length).toBeGreaterThan(0);
        expect(paper.year).toBeGreaterThan(1950);
        expect(paper.doi).toContain('http');
        expect(paper.keyFinding.length).toBeGreaterThan(20);
      }
    });

    it('T7-V4-02: getContinuousHealthColor produces valid RGB gradient without clipping error', () => {
      expect(getContinuousHealthColor(0)).toBe('rgb(239, 68, 68)');
      expect(getContinuousHealthColor(50)).toBe('rgb(245, 158, 11)');
      expect(getContinuousHealthColor(100)).toBe('rgb(16, 185, 129)');

      // Out of range clamping
      expect(getContinuousHealthColor(-20)).toBe('rgb(239, 68, 68)');
      expect(getContinuousHealthColor(150)).toBe('rgb(16, 185, 129)');
    });

    it('T7-V4-03: Consolidated session report record is saved and read through local bus & Firestore mock', async () => {
      let capturedReport: SkinnerSessionReportRecord | null = null;
      const unsub = subscribeToLatestSkinnerSessionReport((report) => {
        capturedReport = report;
      });

      const testReport: SkinnerSessionReportRecord = {
        sessionId: 'sess_report_wow_01',
        childId: 'mateo_quispe_01',
        startedAt: Date.now() - 300000,
        endedAt: Date.now(),
        totalDurationSeconds: 300,
        totalVideosCount: 14,
        rapidSkipsCount: 2,
        completedVideosCount: 8,
        healthScore: 78,
        healthColorCategory: 'GREEN',
        healthHexColor: '#10B981',
        dominantCategories: [
          { category: 'Ciencia', dwellSeconds: 160, affinityPercent: 55 },
          { category: 'Naturaleza', dwellSeconds: 140, affinityPercent: 45 },
        ],
        prescriptions: generatePrescriptions(
          [{ category: 'Ciencia', dwellSeconds: 160, affinityPercent: 55 }],
          78
        ),
      };

      await saveSkinnerSessionReport(testReport);
      expect(capturedReport).toBeDefined();
      expect(capturedReport?.sessionId).toBe('sess_report_wow_01');
      expect(capturedReport?.healthScore).toBe(78);
      expect(capturedReport?.healthColorCategory).toBe('GREEN');
      expect(capturedReport?.prescriptions.length).toBeGreaterThan(0);

      unsub();
    });
  });
});
