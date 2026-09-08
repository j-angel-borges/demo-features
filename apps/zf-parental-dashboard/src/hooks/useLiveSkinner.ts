import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  SkinnerSessionRecord,
  DecayCurvePoint,
  SkinnerLeverEvent,
  SkinnerSessionReportRecord,
} from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore';
import type { TachometerReading } from '../types';

export function computeOdometerDigits(count: number): string[] {
  const padded = Math.max(0, count).toString().padStart(4, '0');
  return padded.split('');
}

export function computeDashOffset(retentionPct: number, radius = 40): number {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, retentionPct));
  return circumference - (clamped / 100) * circumference;
}

export function computeNeedleAngle(rpm: number, maxRpm = 180): number {
  const clamped = Math.min(Math.max(rpm, 0), maxRpm);
  // Map 0 -> -90 deg, maxRpm -> +90 deg
  return -90 + (clamped / maxRpm) * 180;
}

export function getTachometerZone(rpm: number): TachometerReading {
  const needleAngle = computeNeedleAngle(rpm);
  if (rpm >= 15) {
    return {
      rpm,
      zone: 'alert',
      needleAngle,
      statusText: 'ALERTA DOPAMINA (Consumo Acelerado Compulsivo)',
    };
  }
  if (rpm >= 6) {
    return {
      rpm,
      zone: 'warning',
      needleAngle,
      statusText: 'BÚSQUEDA DE ESTÍMULO (Acelerando Scroll)',
    };
  }
  return {
    rpm,
    zone: 'calm',
    needleAngle,
    statusText: 'CONSUMO CALMO & REFLEXIVO',
  };
}

export const INITIAL_SKINNER_MOCK: SkinnerSessionRecord = {
  sessionId: 'session_skinner_live_01',
  userId: 'mateo_quispe_01',
  targetProfile: 'child',
  status: 'active',
  startTime: Date.now() - 240000,
  totalScrolls: 42,
  totalDurationSeconds: 240,
  averageRetentionPct: 68.4,
  completedItemsCount: 6,
  currentScrollVelocity: 14.8,
  activeContentId: 'content_micro_07',
  activeNominalDuration: 12,
  activeElapsedSeconds: 8,
  activeRetentionPct: 66.7,
  decayCurveData: [
    { scrollIndex: 0, nominalDurationSeconds: 45, actualViewSeconds: 42, retentionPct: 93.3, isJackpot: false, timestamp: Date.now() - 240000 },
    { scrollIndex: 5, nominalDurationSeconds: 35, actualViewSeconds: 30, retentionPct: 85.7, isJackpot: false, timestamp: Date.now() - 200000 },
    { scrollIndex: 12, nominalDurationSeconds: 25, actualViewSeconds: 18, retentionPct: 72.0, isJackpot: false, timestamp: Date.now() - 160000 },
    { scrollIndex: 18, nominalDurationSeconds: 15, actualViewSeconds: 6, retentionPct: 40.0, isJackpot: false, timestamp: Date.now() - 120000 },
    { scrollIndex: 25, nominalDurationSeconds: 38, actualViewSeconds: 36, retentionPct: 94.7, isJackpot: true, timestamp: Date.now() - 80000 },
    { scrollIndex: 32, nominalDurationSeconds: 10, actualViewSeconds: 4, retentionPct: 40.0, isJackpot: false, timestamp: Date.now() - 50000 },
    { scrollIndex: 42, nominalDurationSeconds: 12, actualViewSeconds: 8, retentionPct: 66.7, isJackpot: false, timestamp: Date.now() - 10000 },
  ],
  topicDistribution: {
    'Ciencia & Espacio': 38,
    'Curiosidades Rápidas': 28,
    'Experimentos Químicos': 18,
    'Gaming Shorts': 16,
  },
  lastUpdated: Date.now(),
};

export function useLiveSkinner() {
  const [session, setSession] = useState<SkinnerSessionRecord>(INITIAL_SKINNER_MOCK);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());
  const prevScrollsRef = useRef<number>(session.totalScrolls);
  const [hasNewScroll, setHasNewScroll] = useState<boolean>(false);
  const [isJackpotActive, setIsJackpotActive] = useState<boolean>(false);
  const [jackpotDetails, setJackpotDetails] = useState<{
    elapsed: number;
    nominal: number;
    velocity: number;
    reason: string;
  } | null>(null);

  const [latestLeverEvent, setLatestLeverEvent] = useState<SkinnerLeverEvent | null>(null);
  const [latestReport, setLatestReport] = useState<SkinnerSessionReportRecord | null>(null);

  useEffect(() => {
    // Initial emission or mock seed
    parentFirestoreService.publishSkinnerUpdate(INITIAL_SKINNER_MOCK);

    const unsubscribe = parentFirestoreService.subscribeLatestSkinner((record) => {
      if (record) {
        setSession(record);
        setLastEventTime(Date.now());
        setIsLive(true);

        if (record.totalScrolls !== prevScrollsRef.current) {
          setHasNewScroll(true);
          prevScrollsRef.current = record.totalScrolls;
          setTimeout(() => setHasNewScroll(false), 600);

          // Check Dopaminergic Jackpot Trigger (< 7s view + rapid skip OR VR-7)
          const lastPoint =
            record.decayCurveData && record.decayCurveData.length > 0
              ? record.decayCurveData[record.decayCurveData.length - 1]
              : null;

          const isRapidSkip = lastPoint
            ? lastPoint.actualViewSeconds < 7
            : (record.activeElapsedSeconds || 0) < 7 && (record.currentScrollVelocity || 0) >= 8;
          const isVR7 = record.totalScrolls > 0 && record.totalScrolls % 7 === 0;

          if (isRapidSkip || isVR7 || (lastPoint && lastPoint.isJackpot)) {
            setIsJackpotActive(true);
            setJackpotDetails({
              elapsed: lastPoint ? lastPoint.actualViewSeconds : (record.activeElapsedSeconds || 4),
              nominal: lastPoint ? lastPoint.nominalDurationSeconds : (record.activeNominalDuration || 45),
              velocity: record.currentScrollVelocity || 15.2,
              reason: isRapidSkip
                ? 'Salto Compulsivo (< 7s de retencion)'
                : 'Refuerzo de Razon Variable (VR-7 Skinner)',
            });
          }
        }
      }
    });

    const unsubLever = parentFirestoreService.subscribeLeverEvents((leverEvent) => {
      if (leverEvent) {
        setLatestLeverEvent(leverEvent);
        setHasNewScroll(true);
        setTimeout(() => setHasNewScroll(false), 600);

        if (leverEvent.type === 'JACKPOT_HIT' || leverEvent.dwellTimeSeconds < 6.0 || leverEvent.isVariableRatioJackpot) {
          setIsJackpotActive(true);
          setJackpotDetails({
            elapsed: leverEvent.dwellTimeSeconds,
            nominal: 40,
            velocity: leverEvent.scrollVelocityRpm,
            reason: leverEvent.dwellTimeSeconds < 6.0
              ? 'Salto Compulsivo (< 6s de retención)'
              : 'Refuerzo de Razón Variable (VR-7 Skinner)',
          });
        }
      }
    });

    const unsubReport = parentFirestoreService.subscribeLatestReport((rep) => {
      if (rep) {
        setLatestReport(rep);
      }
    });

    return () => {
      unsubscribe();
      unsubLever();
      unsubReport();
    };
  }, []);

  // Master Session Control Actions
  const startMasterSession = async (targetProfile: 'child' | 'adult' = 'child') => {
    const newSessionId = `skinner_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const freshSession: SkinnerSessionRecord = {
      sessionId: newSessionId,
      userId: 'mateo_quispe_01',
      targetProfile,
      status: 'active',
      startTime: Date.now(),
      totalScrolls: 0,
      totalDurationSeconds: 0,
      averageRetentionPct: 0,
      completedItemsCount: 0,
      currentScrollVelocity: 0,
      activeContentId: 'content_01',
      activeNominalDuration: 45,
      activeElapsedSeconds: 0,
      activeRetentionPct: 0,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    };
    setIsJackpotActive(false);
    setJackpotDetails(null);
    prevScrollsRef.current = 0;
    setSession(freshSession);
    await parentFirestoreService.publishSkinnerUpdate(freshSession);
    await parentFirestoreService.sendMasterCommand('START_SESSION', newSessionId, targetProfile);
  };

  const endMasterSession = async () => {
    const completedSession: SkinnerSessionRecord = {
      ...session,
      status: 'completed',
      endTime: Date.now(),
      lastUpdated: Date.now(),
    };
    setSession(completedSession);
    await parentFirestoreService.publishSkinnerUpdate(completedSession);
    await parentFirestoreService.sendMasterCommand('END_SESSION', session.sessionId, session.targetProfile);
  };

  const resetMasterSession = async (targetProfile: 'child' | 'adult' = 'child') => {
    const newSessionId = `skinner_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const resetRecord: SkinnerSessionRecord = {
      sessionId: newSessionId,
      userId: 'mateo_quispe_01',
      targetProfile,
      status: 'active',
      startTime: Date.now(),
      totalScrolls: 0,
      totalDurationSeconds: 0,
      averageRetentionPct: 0,
      completedItemsCount: 0,
      currentScrollVelocity: 0,
      activeContentId: 'content_01',
      activeNominalDuration: 45,
      activeElapsedSeconds: 0,
      activeRetentionPct: 0,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    };
    setIsJackpotActive(false);
    setJackpotDetails(null);
    prevScrollsRef.current = 0;
    setSession(resetRecord);
    await parentFirestoreService.publishSkinnerUpdate(resetRecord);
    await parentFirestoreService.sendMasterCommand('RESET_SESSION', newSessionId, targetProfile);
  };

  const dismissJackpot = () => {
    setIsJackpotActive(false);
  };

  const simulateScroll = () => {
    const updatedScrolls = session.totalScrolls + 1;
    const viewSec = Math.floor(Math.random() * 8) + 3; // 3 - 10s
    const nominalSec = Math.max(5, 45 - Math.min(35, Math.floor(updatedScrolls * 0.8)));
    const retPct = Math.min(100, Math.round((viewSec / nominalSec) * 100));

    const newPoint: DecayCurvePoint = {
      scrollIndex: updatedScrolls,
      nominalDurationSeconds: nominalSec,
      actualViewSeconds: viewSec,
      retentionPct: retPct,
      isJackpot: viewSec < 7 || updatedScrolls % 7 === 0,
      timestamp: Date.now(),
    };

    const updatedSession: SkinnerSessionRecord = {
      ...session,
      totalScrolls: updatedScrolls,
      totalDurationSeconds: session.totalDurationSeconds + viewSec,
      averageRetentionPct: Math.round(((session.averageRetentionPct * session.totalScrolls + retPct) / updatedScrolls) * 10) / 10,
      currentScrollVelocity: Math.min(60, Math.round((session.currentScrollVelocity + Math.random() * 3) * 10) / 10),
      activeElapsedSeconds: viewSec,
      activeNominalDuration: nominalSec,
      activeRetentionPct: retPct,
      decayCurveData: [...(session.decayCurveData || []), newPoint].slice(-15),
      lastUpdated: Date.now(),
    };

    setSession(updatedSession);
    parentFirestoreService.publishSkinnerUpdate(updatedSession);
  };

  // Tachometer analysis
  const tachometer = useMemo(() => {
    return getTachometerZone(session.currentScrollVelocity || 0);
  }, [session.currentScrollVelocity]);

  // Active Retention breakdown
  const activeRetention = useMemo(() => {
    const elapsed = session.activeElapsedSeconds || 0;
    const nominal = session.activeNominalDuration || 1;
    const pct = Math.min(100, Math.round((elapsed / nominal) * 100));
    const offset = computeDashOffset(pct, 44);

    let color = '#C2F4E7'; // menta
    let label = 'Optimo (Completado)';
    if (pct < 40) {
      color = '#F87171'; // coral
      label = 'Salto Rapido (Dopaminico)';
    } else if (pct < 80) {
      color = '#FBBF24'; // amber
      label = 'Parcial (Visualizando)';
    }

    return {
      pct,
      offset,
      color,
      label,
      elapsed,
      nominal,
    };
  }, [session.activeElapsedSeconds, session.activeNominalDuration]);

  // Milestone check (e.g. VR-25, VR-50, VR-100)
  const activeMilestone = useMemo(() => {
    const s = session.totalScrolls;
    if (s > 0 && s % 50 === 0) return `VR-50 Milestone (x${s / 50})`;
    if (s > 0 && s % 25 === 0) return `VR-25 Trigger`;
    if (s > 0 && s % 7 === 0) return `VR-7 Variable Ratio Refuerzo`;
    return null;
  }, [session.totalScrolls]);

  return {
    session,
    isLive,
    lastEventTime,
    hasNewScroll,
    tachometer,
    activeRetention,
    activeMilestone,
    digits: computeOdometerDigits(session.totalScrolls),
    isJackpotActive,
    jackpotDetails,
    latestLeverEvent,
    latestReport,
    dismissJackpot,
    startMasterSession,
    endMasterSession,
    resetMasterSession,
    simulateScroll,
  };
}
