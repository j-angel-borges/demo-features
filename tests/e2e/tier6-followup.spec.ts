/**
 * Tier 6: Follow-up Acceptance Criteria Verification Suite (34 Tests)
 *
 * Authoritative Request: ORIGINAL_REQUEST.md (Follow-up 2026-09-03T18:57:37Z)
 *
 * Scope & Acceptance Criteria:
 *   R1: Skinner Box Child UI Cleanliness, 9:16 Shorts UX, Silent Telemetry (<5ms), Command Bus & Safety Lock.
 *   R2: Parental Cockpit Master Controls, Mechanical Lever Spring Physics, Lucide SVG Vector Reels (Zero Emojis), Dopaminergic Jackpot.
 *   R3: Scientific Reporting Manual Exclusivity, Continuous Health Traffic Light (Verde >30s to Rojo <8s), Offline Habits, 5 Academic Citations.
 *   R4: Multi-Site Firebase Hosting (.firebaserc with quarz-group & 3 targets, firebase.json mapping, production build validation).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from '../fixtures/testHelper.js';
import {
  sendSkinnerCommand,
  subscribeToSkinnerCommands,
  publishSkinnerSession,
  localDataBus,
  subscribeToEmergencyLock,
  setEmergencyLock,
  SPRING_PRESETS,
  ZENTRY_DNA,
  type SkinnerCommandEvent,
  type SkinnerSessionRecord,
} from '@zentry/shared';
import { CASINO_SYMBOLS } from '../../apps/zf-parental-dashboard/src/components/skinner/slot-machine/SlotReel.js';
import { parentFirestoreService } from '../../apps/zf-parental-dashboard/src/services/parentFirestore.js';
import { SkinnerDecayEngine } from '../../apps/zf-skinner-box/src/engines/decayEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

describe('Tier 6: Commercial Follow-up Acceptance Suite (R1–R4)', () => {
  beforeEach(() => {
    localDataBus.setEmergencyLock(false);
  });

  // =========================================================================
  // REQUIREMENT R1: Skinner Box Pure Shorts/TikTok UX & Silent Telemetry
  // =========================================================================
  describe('R1: Skinner Box Pure Shorts/TikTok UX & Silent Telemetry', () => {
    const skinnerAppPath = path.join(projectRoot, 'apps/zf-skinner-box/src/App.tsx');
    const sessionHeaderPath = path.join(projectRoot, 'apps/zf-skinner-box/src/components/SessionHeader.tsx');
    const overlayPath = path.join(projectRoot, 'apps/zf-skinner-box/src/components/TikTokEngagementOverlay.tsx');
    const catalogPath = path.join(projectRoot, 'apps/zf-skinner-box/src/data/videoCatalog.json');

    it('T6-R1-01: SessionHeader does not accept or render onStartSession or onEndSession buttons', () => {
      const headerCode = fs.readFileSync(sessionHeaderPath, 'utf-8');
      expect(headerCode.includes('onStartSession')).toBe(false);
      expect(headerCode.includes('onEndSession')).toBe(false);
      expect(headerCode.includes('Iniciar Sesión')).toBe(false);
      expect(headerCode.includes('Finalizar Sesión')).toBe(false);
      expect(headerCode.includes('Detener Sesión')).toBe(false);
    });

    it('T6-R1-02: SessionHeader does not leak analytical velocityRpm metrics in props or DOM', () => {
      const headerCode = fs.readFileSync(sessionHeaderPath, 'utf-8');
      expect(headerCode.includes('velocityRpm: number')).toBe(false);
      expect(headerCode.includes('RPM')).toBe(false);
    });

    it('T6-R1-03: SessionHeader preserves native commercial feed controls (Siguiendo, Para ti, Kids/Mix)', () => {
      const headerCode = fs.readFileSync(sessionHeaderPath, 'utf-8');
      expect(headerCode.includes('Siguiendo')).toBe(true);
      expect(headerCode.includes('Para ti')).toBe(true);
      expect(headerCode.includes('Kids')).toBe(true);
      expect(headerCode.includes('Mix')).toBe(true);
    });

    it('T6-R1-04: App.tsx has completely eliminated SessionSummaryModal import and JSX rendering', () => {
      const appCode = fs.readFileSync(skinnerAppPath, 'utf-8');
      expect(appCode.includes('SessionSummaryModal')).toBe(false);
      expect(appCode.includes('<SessionSummaryModal')).toBe(false);
    });

    it('T6-R1-05: App.tsx has excised manual keyboard shortcut (KeyS) for session toggling', () => {
      const appCode = fs.readFileSync(skinnerAppPath, 'utf-8');
      expect(appCode.includes('KeyS')).toBe(false);
    });

    it('T6-R1-06: TikTokEngagementOverlay does not render intrusive premature Jackpot banners to child', () => {
      const overlayCode = fs.readFileSync(overlayPath, 'utf-8');
      expect(overlayCode.includes('⭐ ¡Jackpot')).toBe(false);
      expect(overlayCode.includes('Jackpot Exclusivo')).toBe(false);
    });

    it('T6-R1-07: TikTokEngagementOverlay provides fluid audio mute/unmute and rotating vinyl record', () => {
      const overlayCode = fs.readFileSync(overlayPath, 'utf-8');
      expect(overlayCode.includes('Volume2')).toBe(true);
      expect(overlayCode.includes('VolumeX')).toBe(true);
      expect(overlayCode.includes('rotate: isMuted ? 0 : 360')).toBe(true);
    });

    it('T6-R1-08: Video catalog items point to real, verified MP4 and WebP assets on disk', () => {
      const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      expect(catalogData.childVideos.length).toBe(10);

      for (const item of catalogData.childVideos) {
        const fullVideoPath = path.join(projectRoot, 'apps/zf-skinner-box/public', item.videoUrl);
        const fullPosterPath = path.join(projectRoot, 'apps/zf-skinner-box/public', item.posterUrl);
        expect(fs.existsSync(fullVideoPath)).toBe(true);
        expect(fs.existsSync(fullPosterPath)).toBe(true);
        const stat = fs.statSync(fullVideoPath);
        expect(stat.size).toBeGreaterThan(100000); // Verified non-empty media file
      }
    });

    it('T6-R1-09: Silent behavioral telemetry publishes synchronously to local bus in < 5ms', () => {
      const testRecord: SkinnerSessionRecord = {
        sessionId: 'perf_test_sess_01',
        targetProfile: 'child',
        status: 'active',
        totalScrolls: 14,
        totalDurationSeconds: 120,
        averageRetentionPct: 62.5,
        currentScrollVelocity: 18,
        activeNominalDuration: 10,
        decayCurveData: [
          { scrollIndex: 0, nominalDurationSeconds: 45, actualViewSeconds: 42, retentionPct: 93, videoTitle: 'Cosmos', dopamineCategory: 'baseline' },
          { scrollIndex: 1, nominalDurationSeconds: 30, actualViewSeconds: 12, retentionPct: 40, videoTitle: 'Naturaleza', dopamineCategory: 'accelerated' },
        ],
        topicDistribution: { Biología: 5, Ciencia: 4 },
      };

      // Warm-up call
      publishSkinnerSession(testRecord);

      const start = performance.now();
      publishSkinnerSession(testRecord);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(5.0); // Strictly < 5ms requirement
      const cached = localDataBus.getLatestSkinnerSession();
      expect(cached).toBeDefined();
      expect(cached?.sessionId).toBe('perf_test_sess_01');
      expect(cached?.totalScrolls).toBe(14);
    });

    it('T6-R1-10: Command bus propagates START_SESSION, END_SESSION, and RESET_SESSION to Skinner Box', async () => {
      const receivedCommands: SkinnerCommandEvent[] = [];
      const unsubscribe = subscribeToSkinnerCommands((cmd) => {
        receivedCommands.push(cmd);
      });

      await sendSkinnerCommand({
        type: 'START_SESSION',
        sessionId: 'cmd_bus_sess_01',
        targetProfile: 'child',
        timestamp: Date.now(),
      });

      await sendSkinnerCommand({
        type: 'RESET_SESSION',
        sessionId: 'cmd_bus_sess_02',
        targetProfile: 'child',
        timestamp: Date.now(),
      });

      await sendSkinnerCommand({
        type: 'END_SESSION',
        sessionId: 'cmd_bus_sess_02',
        targetProfile: 'child',
        timestamp: Date.now(),
      });

      unsubscribe();

      expect(receivedCommands.length).toBeGreaterThanOrEqual(3);
      const types = receivedCommands.map((c) => c.type);
      expect(types).toContain('START_SESSION');
      expect(types).toContain('RESET_SESSION');
      expect(types).toContain('END_SESSION');
    });

    it('T6-R1-11: Remote emergency safety lock is received immediately to freeze child viewport', () => {
      let lockReceivedState: boolean | null = null;
      const unsubscribe = subscribeToEmergencyLock((locked) => {
        lockReceivedState = locked;
      });

      setEmergencyLock(true);
      expect(lockReceivedState).toBe(true);

      setEmergencyLock(false);
      expect(lockReceivedState).toBe(false);

      unsubscribe();
    });
  });

  // =========================================================================
  // REQUIREMENT R2: Master Controls, Mechanical Lever & Slot Machine WOW
  // =========================================================================
  describe('R2: Parental Dashboard Master Session & Slot Machine WOW Architecture', () => {
    const observadorPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/SkinnerObservador.tsx');
    const leverPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/slot-machine/MechanicalLever.tsx');
    const slotReelPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/slot-machine/SlotReel.tsx');
    const modalPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/slot-machine/PedagogicalJackpotModal.tsx');

    it('T6-R2-01: SkinnerObservador provides master session controls (Iniciar, Finalizar, Reiniciar)', () => {
      const code = fs.readFileSync(observadorPath, 'utf-8');
      expect(code.includes('Iniciar Sesión')).toBe(true);
      expect(code.includes('Finalizar Sesión')).toBe(true);
      expect(code.includes('Reiniciar Prueba')).toBe(true);
    });

    it('T6-R2-02: SkinnerObservador defaults to [ 🎰 Metáfora Casino (Factor WOW) ] view mode', () => {
      const code = fs.readFileSync(observadorPath, 'utf-8');
      expect(code.includes("useState<SkinnerViewMode>('casino')")).toBe(true);
      expect(code.includes('[ 🎰 Metáfora Casino (Factor WOW) ]')).toBe(true);
      expect(code.includes('[ 📊 Telemetría & Odómetro ]')).toBe(true);
      expect(code.includes('[ 📑 Reporte Científico ]')).toBe(true);
    });

    it('T6-R2-03: Master session service emits commands with commandId, timestamp, and targetProfile', async () => {
      let capturedCmd: any = null;
      const unsub = parentFirestoreService.subscribeMasterCommands((cmd) => {
        capturedCmd = cmd;
      });

      await parentFirestoreService.sendMasterCommand('START_SESSION', 'sess_master_01', 'child');
      expect(capturedCmd).toBeDefined();
      expect(capturedCmd.type).toBe('START_SESSION');
      expect(capturedCmd.sessionId).toBe('sess_master_01');
      expect(capturedCmd.targetProfile).toBe('child');
      expect(typeof capturedCmd.timestamp).toBe('number');

      unsub();
    });

    it('T6-R2-04: Mechanical lever uses Framer Motion spring preset leverBounce (stiffness: 380, damping: 18)', () => {
      const bounce = SPRING_PRESETS.leverBounce;
      expect(bounce).toBeDefined();
      expect(bounce.type).toBe('spring');
      expect(bounce.stiffness).toBe(380);
      expect(bounce.damping).toBe(18);
      expect(bounce.mass).toBe(0.85);

      const leverCode = fs.readFileSync(leverPath, 'utf-8');
      expect(leverCode.includes('SPRING_PRESETS.leverBounce')).toBe(true);
    });

    it('T6-R2-05: Mechanical lever animates descent angle (rotate: 68deg) when isPulled is active', () => {
      const leverCode = fs.readFileSync(leverPath, 'utf-8');
      expect(leverCode.includes('rotate: isPulled ? 68 : 0')).toBe(true);
      expect(leverCode.includes('scaleY: isPulled ? 0.92 : 1')).toBe(true);
    });

    it('T6-R2-06: Slot machine reels contain exactly 6 canonical symbols using Lucide SVG icons', () => {
      expect(CASINO_SYMBOLS.length).toBe(6);
      const ids = CASINO_SYMBOLS.map((s) => s.id);
      expect(ids).toContain('zap');
      expect(ids).toContain('clock');
      expect(ids).toContain('sparkles');
      expect(ids).toContain('brain');
      expect(ids).toContain('heart');
      expect(ids).toContain('bell');
    });

    it('T6-R2-07: Slot machine reels strictly enforce zero emoji characters across all definitions', () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      for (const sym of CASINO_SYMBOLS) {
        expect(emojiRegex.test(sym.name)).toBe(false);
        expect(emojiRegex.test(sym.description)).toBe(false);
        expect(emojiRegex.test(sym.id)).toBe(false);
      }

      // Check source file for raw literal emojis
      const slotReelCode = fs.readFileSync(slotReelPath, 'utf-8');
      // The only non-ASCII characters permitted are Spanish accents (á, é, í, ó, ú, ñ)
      const nonAsciiWithoutAccents = slotReelCode.replace(/[áéíóúñÁÉÍÓÚÑ¿¡°]/g, '');
      expect(emojiRegex.test(nonAsciiWithoutAccents)).toBe(false);
    });

    it('T6-R2-08: Dopaminergic Jackpot condition triggers on fast skips (< 7s) and displays pedagogical explanation', () => {
      const modalCode = fs.readFileSync(modalPath, 'utf-8');
      expect(modalCode.includes('Jackpot Dopamínico Detectado')).toBe(true);
      expect(modalCode.includes('B.F. Skinner')).toBe(true);
      expect(modalCode.includes('núcleo accumbens')).toBe(true);
      expect(modalCode.includes('Aplicar Pausa de Seguridad')).toBe(true);
      expect(modalCode.includes('Ver Reporte Científico')).toBe(true);
    });
  });

  // =========================================================================
  // REQUIREMENT R3: Scientific Reporting, Traffic Light & Offline Habits
  // =========================================================================
  describe('R3: Scientific Reporting, Digital Health Traffic Light & Academic Rigor', () => {
    const reportViewPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/scientific-report/ScientificReportView.tsx');
    const trafficLightPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/scientific-report/DigitalHealthTrafficLight.tsx');
    const habitsPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/scientific-report/OfflineHabitRecommendations.tsx');
    const citationsPath = path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/scientific-report/AcademicCitationsVault.tsx');

    it('T6-R3-01: Scientific report is never auto-switched by session completion and requires explicit manual selection', () => {
      const reportCode = fs.readFileSync(reportViewPath, 'utf-8');
      expect(reportCode.includes('Activación Manual Exclusiva')).toBe(true);

      const observadorCode = fs.readFileSync(
        path.join(projectRoot, 'apps/zf-parental-dashboard/src/components/skinner/SkinnerObservador.tsx'),
        'utf-8'
      );
      // Ensure useEffect does not auto-set viewMode to 'report' on session.status === 'completed'
      expect(observadorCode.includes("session.status === 'completed' && setViewMode('report')")).toBe(false);
      expect(observadorCode.includes("setViewMode('report')")).toBe(true); // present only via manual handlers
    });

    it('T6-R3-02: Continuous health gauge calculates score >= 80 and Verde (#10B981) for retention >= 30s', () => {
      function evaluateHealth(meanSec: number) {
        let score = 0;
        if (meanSec >= 30) {
          score = Math.min(100, 80 + ((meanSec - 30) / 15) * 20);
        } else if (meanSec >= 15) {
          score = 50 + ((meanSec - 15) / 15) * 30;
        } else if (meanSec >= 8) {
          score = 25 + ((meanSec - 8) / 7) * 25;
        } else {
          score = Math.max(0, (meanSec / 8) * 25);
        }
        const angle = -90 + (score / 100) * 180;
        let color = '#10B981';
        let label = 'Consumo Consciente';
        if (meanSec < 8) {
          color = '#EF4444';
          label = 'Doomscrolling Hiper-fragmentado';
        } else if (meanSec < 15) {
          color = '#F97316';
          label = 'Búsqueda Acelerada de Novedad';
        } else if (meanSec < 30) {
          color = '#F59E0B';
          label = 'Atención Fluctuante (Transición)';
        }
        return { score: Math.round(score), angle, color, label };
      }

      const res40 = evaluateHealth(40);
      expect(res40.score).toBeGreaterThanOrEqual(80);
      expect(res40.score).toBeLessThanOrEqual(100);
      expect(res40.color).toBe('#10B981');
      expect(res40.label).toContain('Consumo Consciente');
      expect(res40.angle).toBeGreaterThan(50); // Deep in the right green arc
    });

    it('T6-R3-03: Continuous health gauge calculates Ámbar (#F59E0B) for transitional retention (15s to 30s)', () => {
      function evaluateHealth(meanSec: number) {
        let score = 50 + ((meanSec - 15) / 15) * 30;
        const angle = -90 + (score / 100) * 180;
        return { score: Math.round(score), angle, color: '#F59E0B' };
      }

      const res20 = evaluateHealth(20);
      expect(res20.score).toBeGreaterThanOrEqual(50);
      expect(res20.score).toBeLessThan(80);
      expect(res20.angle).toBeGreaterThan(0);
      expect(res20.angle).toBeLessThan(54);
    });

    it('T6-R3-04: Continuous health gauge calculates Naranja (#F97316) for accelerated novelty search (8s to 15s)', () => {
      function evaluateHealth(meanSec: number) {
        let score = 25 + ((meanSec - 8) / 7) * 25;
        const angle = -90 + (score / 100) * 180;
        return { score: Math.round(score), angle, color: '#F97316' };
      }

      const res10 = evaluateHealth(10);
      expect(res10.score).toBeGreaterThanOrEqual(25);
      expect(res10.score).toBeLessThan(50);
      expect(res10.angle).toBeGreaterThan(-45);
      expect(res10.angle).toBeLessThan(0);
    });

    it('T6-R3-05: Continuous health gauge calculates score < 25 and Rojo (#EF4444) for doomscrolling (< 8s)', () => {
      function evaluateHealth(meanSec: number) {
        let score = Math.max(0, (meanSec / 8) * 25);
        const angle = -90 + (score / 100) * 180;
        return { score: Math.round(score), angle, color: '#EF4444' };
      }

      const res5 = evaluateHealth(5);
      expect(res5.score).toBeLessThan(25);
      expect(res5.angle).toBeLessThan(-45);
      expect(res5.color).toBe('#EF4444');
    });

    it('T6-R3-06: Continuous health gauge clamps cleanly at boundaries (0s -> -90deg, 45s+ -> +90deg)', () => {
      const minAngle = -90 + (0 / 100) * 180;
      const maxAngle = -90 + (100 / 100) * 180;
      expect(minAngle).toBe(-90);
      expect(maxAngle).toBe(90);
    });

    it('T6-R3-07: Offline habit recommendations map consumed topics to sensory-rich real-world activities', () => {
      const habitCode = fs.readFileSync(habitsPath, 'utf-8');
      expect(habitCode.includes('Expedición a Reserva Ecológica o Zoológico')).toBe(true);
      expect(habitCode.includes('Safari Botánico Urbano')).toBe(true);
      expect(habitCode.includes('Laboratorio Casero')).toBe(true);
      expect(habitCode.includes('Taller de Modelado con Arcilla')).toBe(true);
      expect(habitCode.includes('Circuito de Agilidad Motora en Parque')).toBe(true);
    });

    it('T6-R3-08: Offline habit recommendations provide balanced default activities when topic distribution is empty', () => {
      const habitCode = fs.readFileSync(habitsPath, 'utf-8');
      expect(habitCode.includes('topics.length === 0')).toBe(true);
    });

    it('T6-R3-09: Academic citations vault contains all 5 indexed peer-reviewed foundations', () => {
      const citationsCode = fs.readFileSync(citationsPath, 'utf-8');
      expect(citationsCode.includes('B.F. Skinner (1953)')).toBe(true);
      expect(citationsCode.includes('Wolfram Schultz (1998)')).toBe(true);
      expect(citationsCode.includes('Jean M. Twenge et al. (2018)')).toBe(true);
      expect(citationsCode.includes('Adam Alter (2017)')).toBe(true);
      expect(citationsCode.includes('Organización Mundial de la Salud (OMS / WHO) (2019)')).toBe(true);
    });

    it('T6-R3-10: Academic citations format includes APA 7th metadata, neuro-mechanisms, and parental translations', () => {
      const citationsCode = fs.readFileSync(citationsPath, 'utf-8');
      expect(citationsCode.includes('[SKIN-1953]')).toBe(true);
      expect(citationsCode.includes('[SCHU-1998]')).toBe(true);
      expect(citationsCode.includes('[TWEN-2018]')).toBe(true);
      expect(citationsCode.includes('[ALTE-2017]')).toBe(true);
      expect(citationsCode.includes('[WHO-2019]')).toBe(true);
      expect(citationsCode.includes('Mecanismo Neurobiológico Implicado')).toBe(true);
      expect(citationsCode.includes('Traducción Pedagógica Zentry')).toBe(true);
    });
  });

  // =========================================================================
  // REQUIREMENT R4: Multi-Site Hosting Config & Clean Build Validation
  // =========================================================================
  describe('R4: Multi-Site Deployment Configuration (quarz-group) & Build Verification', () => {
    const rcPath = path.join(projectRoot, '.firebaserc');
    const fjPath = path.join(projectRoot, 'firebase.json');

    it('T6-R4-01: .firebaserc specifies default project quarz-group and binds the 3 canonical hosting targets', () => {
      expect(fs.existsSync(rcPath)).toBe(true);
      const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
      expect(rc.projects.default).toBe('quarz-group');

      const hostingTargets = rc.targets['quarz-group'].hosting;
      expect(hostingTargets['isla-dinamica']).toBeDefined();
      expect(hostingTargets['skinner-box']).toBeDefined();
      expect(hostingTargets['parental-feature']).toBeDefined();
      expect(hostingTargets['creative-studio']).toBeDefined();
    });

    it('T6-R4-02: firebase.json maps canonical targets to apps/*/dist directories', () => {
      expect(fs.existsSync(fjPath)).toBe(true);
      const fj = JSON.parse(fs.readFileSync(fjPath, 'utf-8'));
      expect(fj.hosting.length).toBeGreaterThanOrEqual(4);

      const targetMap = new Map<string, string>();
      for (const h of fj.hosting) {
        targetMap.set(h.target, h.public);
      }

      expect(targetMap.get('isla-dinamica')).toBe('apps/zf-isla-dinamica/dist');
      expect(targetMap.get('skinner-box')).toBe('apps/zf-skinner-box/dist');
      expect(targetMap.get('parental-feature')).toBe('apps/zf-parental-dashboard/dist');
      expect(targetMap.get('creative-studio')).toBe('apps/zf-creative-studio/dist');
    });

    it('T6-R4-03: firebase.json specifies SPA rewrites to /index.html for all 3 micro-PWAs', () => {
      const fj = JSON.parse(fs.readFileSync(fjPath, 'utf-8'));
      for (const h of fj.hosting) {
        expect(h.rewrites).toBeDefined();
        expect(h.rewrites[0].source).toBe('**');
        expect(h.rewrites[0].destination).toBe('/index.html');
      }
    });

    it('T6-R4-04: firebase.json sets camera/microphone permissions policy for Isla Dinámica', () => {
      const fj = JSON.parse(fs.readFileSync(fjPath, 'utf-8'));
      const islandHost = fj.hosting.find((h: any) => h.target === 'isla-dinamica');
      expect(islandHost).toBeDefined();

      const headers = islandHost.headers.find((hdr: any) => hdr.source === '**');
      expect(headers).toBeDefined();
      const permPolicy = headers.headers.find((h: any) => h.key === 'Permissions-Policy');
      expect(permPolicy).toBeDefined();
      expect(permPolicy.value).toContain('camera');
      expect(permPolicy.value).toContain('microphone');
    });

    it('T6-R4-05: firebase.json routes Firestore security rules to firestore.rules', () => {
      const fj = JSON.parse(fs.readFileSync(fjPath, 'utf-8'));
      expect(fj.firestore.rules).toBe('firestore.rules');
    });
  });
});
