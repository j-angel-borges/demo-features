import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  CatalogMode,
  SessionStatus,
  SkinnerVideoItem,
  DecayCurvePoint,
  SkinnerSessionRecord,
  DopamineState,
} from '../types/skinner.types.js';
import { SkinnerDecayEngine } from '../engines/decayEngine.js';
import { hapticEngine } from '../engines/hapticEngine.js';
import { useScrollVelocity } from './useScrollVelocity.js';
import {
  publishSkinnerSession,
  subscribeToSkinnerCommands,
  publishSkinnerLeverEvent,
  saveSkinnerSessionReport,
  calculateConsumptionHealth,
  generatePrescriptions,
  calculateLeverForceRatio,
  type SkinnerCommandEvent,
  type SkinnerLeverEvent,
  type SkinnerSessionReportRecord,
} from '@zentry/shared';

export function useSkinnerSession(initialMode: CatalogMode = 'child') {
  const [mode, setMode] = useState<CatalogMode>(initialMode);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [sessionId, setSessionId] = useState<string>('');
  const [userId] = useState<string>('mateo_quispe');

  // Video State
  const decayEngineRef = useRef<SkinnerDecayEngine>(new SkinnerDecayEngine(initialMode, 7));
  const [currentItem, setCurrentItem] = useState<SkinnerVideoItem>(() => {
    return decayEngineRef.current.selectNextContent(0).item;
  });
  const [dopamineState, setDopamineState] = useState<DopamineState>('baseline');
  const [showDopamineFlash, setShowDopamineFlash] = useState<boolean>(false);
  const [showJackpotBanner, setShowJackpotBanner] = useState<boolean>(false);

  // Metrics State
  const [totalScrolls, setTotalScrolls] = useState<number>(0);
  const [completedItemsCount, setCompletedItemsCount] = useState<number>(0);
  const [decayCurveData, setDecayCurveData] = useState<DecayCurvePoint[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>({});
  const [averageRetentionPct, setAverageRetentionPct] = useState<number>(0);

  // Active Video Playback State
  const [activeElapsedSeconds, setActiveElapsedSeconds] = useState<number>(0);
  const [activeRetentionPct, setActiveRetentionPct] = useState<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const totalSessionSecondsRef = useRef<number>(0);

  // Velocity
  const { velocityRpm, registerScroll, resetVelocity } = useScrollVelocity();

  // Firestore sync throttling ref
  const lastCloudSyncRef = useRef<number>(0);

  // Sync mode changes to decay engine
  useEffect(() => {
    decayEngineRef.current.setMode(mode);
    if (sessionStatus === 'idle') {
      const initial = decayEngineRef.current.selectNextContent(0);
      setCurrentItem(initial.item);
      setDopamineState(initial.dopamineState);
    }
  }, [mode, sessionStatus]);

  // Auto-start active session on mount
  useEffect(() => {
    if (sessionStatus === 'idle') {
      startSession();
    }
  }, []);

  // Active Video Playback Timer
  useEffect(() => {
    if (sessionStatus !== 'active') return;

    const interval = setInterval(() => {
      setActiveElapsedSeconds((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        const nominal = currentItem.nominalDurationSeconds || 45;
        const retPct = Math.min(100, Math.round((next / nominal) * 100));
        setActiveRetentionPct(retPct);
        return next;
      });

      totalSessionSecondsRef.current += 0.1;

      // Periodic cloud sync every 1.5s
      const now = Date.now();
      if (now - lastCloudSyncRef.current >= 1500) {
        lastCloudSyncRef.current = now;
        syncToCloud(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sessionStatus, currentItem]);

  // Helper to compile full session record
  const buildSessionRecord = useCallback(
    (status: 'active' | 'completed'): SkinnerSessionRecord => {
      const now = Date.now();
      const currentElapsed = activeElapsedSeconds;
      const currentNominal = currentItem.nominalDurationSeconds || 45;
      const currentRet = Math.min(100, Math.round((currentElapsed / currentNominal) * 100));

      return {
        sessionId: sessionId || `skinner_ses_${now}`,
        userId,
        targetProfile: mode,
        status,
        startTime: sessionStartTimeRef.current || now,
        endTime: status === 'completed' ? now : undefined,
        totalScrolls,
        totalDurationSeconds: Math.round(totalSessionSecondsRef.current),
        averageRetentionPct,
        completedItemsCount,
        currentScrollVelocity: velocityRpm,
        activeContentId: currentItem.id,
        activeNominalDuration: currentNominal,
        activeElapsedSeconds: currentElapsed,
        activeRetentionPct: currentRet,
        decayCurveData,
        topicDistribution,
        lastUpdated: now,
      };
    },
    [
      sessionId,
      userId,
      mode,
      totalScrolls,
      averageRetentionPct,
      completedItemsCount,
      velocityRpm,
      currentItem,
      activeElapsedSeconds,
      decayCurveData,
      topicDistribution,
    ]
  );

  const syncToCloud = useCallback(
    (force: boolean = false) => {
      if (sessionStatus !== 'active' && !force) return;
      const record = buildSessionRecord(sessionStatus === 'active' ? 'active' : 'completed');
      publishSkinnerSession(record).catch(() => {});
    },
    [sessionStatus, buildSessionRecord]
  );

  // Start Session Action
  const startSession = useCallback(() => {
    const newSessionId = `skinner_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSessionId(newSessionId);
    setSessionStatus('active');
    setTotalScrolls(0);
    setCompletedItemsCount(0);
    setDecayCurveData([]);
    setTopicDistribution({});
    setAverageRetentionPct(0);
    setActiveElapsedSeconds(0);
    setActiveRetentionPct(0);
    resetVelocity();

    sessionStartTimeRef.current = Date.now();
    totalSessionSecondsRef.current = 0;
    decayEngineRef.current.reset();

    const decision = decayEngineRef.current.selectNextContent(0);
    setCurrentItem(decision.item);
    setDopamineState(decision.dopamineState);

    const initialRecord: SkinnerSessionRecord = {
      sessionId: newSessionId,
      userId,
      targetProfile: mode,
      status: 'active',
      startTime: sessionStartTimeRef.current,
      totalScrolls: 0,
      totalDurationSeconds: 0,
      averageRetentionPct: 0,
      completedItemsCount: 0,
      currentScrollVelocity: 0,
      activeContentId: decision.item.id,
      activeNominalDuration: decision.item.nominalDurationSeconds,
      activeElapsedSeconds: 0,
      activeRetentionPct: 0,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    };

    publishSkinnerSession(initialRecord).catch(() => {});
  }, [userId, mode, resetVelocity]);

  // End Session Action
  const endSession = useCallback(() => {
    setSessionStatus('completed');
    const finalRecord = buildSessionRecord('completed');
    publishSkinnerSession(finalRecord).catch(() => {});

    // Compute and publish complete Scientific Session Report (Factor WOW #2)
    const dwellTimes = decayCurveData.map((p) => p.actualViewSeconds);
    const completionRatios = decayCurveData.map((p) => (p.retentionPct || 0) / 100);
    const healthResult = calculateConsumptionHealth({
      totalSessionSeconds: Math.round(totalSessionSecondsRef.current),
      totalVideosWatched: Math.max(1, decayCurveData.length),
      dwellTimes: dwellTimes.length > 0 ? dwellTimes : [activeElapsedSeconds],
      completionRatios: completionRatios.length > 0 ? completionRatios : [activeRetentionPct / 100],
    });

    const dominantCategories = Object.entries(topicDistribution).map(([category, count]) => ({
      category,
      dwellSeconds: count * 20,
      affinityPercent: Math.round((count / Math.max(1, totalScrolls)) * 100),
      interestAffinityPercent: Math.round((count / Math.max(1, totalScrolls)) * 100),
    }));

    const prescriptions = generatePrescriptions(dominantCategories, healthResult.score);

    const report: SkinnerSessionReportRecord = {
      sessionId: finalRecord.sessionId,
      childId: finalRecord.userId,
      startedAt: finalRecord.startTime,
      endedAt: finalRecord.endTime || Date.now(),
      totalDurationSeconds: finalRecord.totalDurationSeconds,
      totalVideosCount: finalRecord.totalScrolls,
      rapidSkipsCount: decayCurveData.filter((p) => p.actualViewSeconds < 6.0).length,
      completedVideosCount: finalRecord.completedItemsCount,
      healthScore: healthResult.score,
      healthColorCategory: healthResult.colorCategory,
      healthHexColor: healthResult.hexColor,
      dominantCategories,
      prescriptions,
    };

    saveSkinnerSessionReport(report).catch(() => {});
  }, [
    buildSessionRecord,
    decayCurveData,
    activeElapsedSeconds,
    activeRetentionPct,
    topicDistribution,
    totalScrolls,
  ]);

  // Reset Session Action (remote or local reset to clean baseline)
  const resetSession = useCallback(() => {
    startSession();
  }, [startSession]);

  // Remote Command Bus Integration (Parent Dashboard -> Skinner Box)
  useEffect(() => {
    const unsubscribe = subscribeToSkinnerCommands((cmd: SkinnerCommandEvent) => {
      const type = ((cmd.type as unknown as string) || (cmd as any).action) as string;
      if (type === 'START_SESSION' || type === 'start') {
        startSession();
      } else if (type === 'END_SESSION' || type === 'stop') {
        endSession();
      } else if (type === 'RESET_SESSION' || type === 'reset') {
        resetSession();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [startSession, endSession, resetSession]);

  // Operant Scroll Action (Lever Press)
  const triggerScroll = useCallback(() => {
    // If not active, auto-start session
    if (sessionStatus === 'idle') {
      startSession();
      return;
    }

    const currentScrollCount = totalScrolls + 1;
    setTotalScrolls(currentScrollCount);

    // Compute retention on previous item
    const watchedSeconds = activeElapsedSeconds;
    const nominalSeconds = currentItem.nominalDurationSeconds || 45;
    const retentionPct = Math.min(100, Math.round((watchedSeconds / nominalSeconds) * 100));

    // Update completed count if 100%
    let newCompletedCount = completedItemsCount;
    if (retentionPct >= 100) {
      newCompletedCount++;
      setCompletedItemsCount(newCompletedCount);
    }

    // Update topic distribution
    const newTopicDist = { ...topicDistribution };
    newTopicDist[currentItem.topic] = (newTopicDist[currentItem.topic] || 0) + 1;
    setTopicDistribution(newTopicDist);

    // Update decay curve history
    const newPoint: DecayCurvePoint = {
      scrollIndex: totalScrolls,
      nominalDurationSeconds: nominalSeconds,
      actualViewSeconds: watchedSeconds,
      retentionPct,
      isJackpot: !!currentItem.isJackpot,
      timestamp: Date.now(),
    };
    const newCurve = [...decayCurveData, newPoint];
    setDecayCurveData(newCurve);

    // Calculate rolling average retention
    const totalRetSum = newCurve.reduce((acc, p) => acc + p.retentionPct, 0);
    const avgRet = Math.round((totalRetSum / newCurve.length) * 10) / 10;
    setAverageRetentionPct(avgRet);

    // Register velocity
    const currentRpm = registerScroll();

    // Select Next Content via Decay Engine
    const decision = decayEngineRef.current.selectNextContent(currentScrollCount);
    setCurrentItem(decision.item);
    setDopamineState(decision.dopamineState);

    // Audio & Haptic Feedback
    if (decision.isJackpot) {
      hapticEngine.playJackpotChime();
      setShowJackpotBanner(true);
      setTimeout(() => setShowJackpotBanner(false), 4500);
    } else {
      hapticEngine.playLeverClick();
      setShowDopamineFlash(true);
      setTimeout(() => setShowDopamineFlash(false), 600);
    }

    // Reset active video elapsed seconds
    setActiveElapsedSeconds(0);
    setActiveRetentionPct(0);

    // Sync immediately to Firestore & Local Data Bus
    const updatedRecord: SkinnerSessionRecord = {
      sessionId: sessionId || `skinner_ses_${Date.now()}`,
      userId,
      targetProfile: mode,
      status: 'active',
      startTime: sessionStartTimeRef.current,
      totalScrolls: currentScrollCount,
      totalDurationSeconds: Math.round(totalSessionSecondsRef.current),
      averageRetentionPct: avgRet,
      completedItemsCount: newCompletedCount,
      currentScrollVelocity: currentRpm,
      activeContentId: decision.item.id,
      activeNominalDuration: decision.item.nominalDurationSeconds,
      activeElapsedSeconds: 0,
      activeRetentionPct: 0,
      decayCurveData: newCurve,
      topicDistribution: newTopicDist,
      lastUpdated: Date.now(),
    };

    publishSkinnerSession(updatedRecord).catch(() => {});

    // Real-time Lever Telemetry Event (DOC_TECNICO_MEJORAS_FACTOR_WOW.md Section 3.2 & Section 6.1)
    const isRapidSkip = watchedSeconds < 6.0;
    const isVR7 = currentScrollCount > 0 && currentScrollCount % 7 === 0;
    const isJackpotHit = decision.isJackpot || isRapidSkip || isVR7;
    const leverForceRatio = calculateLeverForceRatio(currentRpm, watchedSeconds);

    let normalizedCategory: 'animals' | 'gaming' | 'science' | 'art' | 'sports' | 'general' = 'general';
    const topicLower = (currentItem.topic || '').toLowerCase();
    if (topicLower.includes('bio') || topicLower.includes('animal') || topicLower.includes('naturaleza')) {
      normalizedCategory = 'animals';
    } else if (topicLower.includes('game') || topicLower.includes('gaming')) {
      normalizedCategory = 'gaming';
    } else if (topicLower.includes('cienc') || topicLower.includes('espacio') || topicLower.includes('quimic')) {
      normalizedCategory = 'science';
    } else if (topicLower.includes('arte') || topicLower.includes('dibujo') || topicLower.includes('creat')) {
      normalizedCategory = 'art';
    } else if (topicLower.includes('deport') || topicLower.includes('accion')) {
      normalizedCategory = 'sports';
    }

    const leverEvent: SkinnerLeverEvent = {
      sessionId: sessionId || `skinner_ses_${Date.now()}`,
      eventId: `lever_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type: isJackpotHit ? 'JACKPOT_HIT' : isRapidSkip ? 'DWELL_ALERT' : 'LEVER_PULL',
      dwellTimeSeconds: Number(watchedSeconds.toFixed(1)),
      scrollVelocityRpm: currentRpm,
      leverForceRatio,
      isVariableRatioJackpot: isJackpotHit,
      activeVideoCategory: normalizedCategory,
    };

    publishSkinnerLeverEvent(leverEvent).catch(() => {});
  }, [
    sessionStatus,
    startSession,
    totalScrolls,
    activeElapsedSeconds,
    currentItem,
    completedItemsCount,
    topicDistribution,
    decayCurveData,
    registerScroll,
    sessionId,
    userId,
    mode,
  ]);

  const toggleMode = useCallback(
    (newMode: CatalogMode) => {
      if (mode === newMode) return;
      setMode(newMode);
      decayEngineRef.current.setMode(newMode);
      const nextDecision = decayEngineRef.current.selectNextContent(totalScrolls);
      setCurrentItem(nextDecision.item);
      setDopamineState(nextDecision.dopamineState);
      setActiveElapsedSeconds(0);
      setActiveRetentionPct(0);
    },
    [mode, totalScrolls]
  );

  return {
    mode,
    setMode: toggleMode,
    sessionStatus,
    sessionId,
    currentItem,
    dopamineState,
    showDopamineFlash,
    showJackpotBanner,
    totalScrolls,
    completedItemsCount,
    averageRetentionPct,
    velocityRpm,
    activeElapsedSeconds,
    activeRetentionPct,
    decayCurveData,
    topicDistribution,
    startSession,
    endSession,
    resetSession,
    triggerScroll,
  };
}
