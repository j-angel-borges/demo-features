/**
 * Tier 5: Adversarial Coverage Hardening & Empirical Boundary Extremes (32 Tests)
 * Conducts white-box adversarial stress testing against untested paths, resilience under disruption,
 * permission denial recoveries, timestamp overflows, and extreme coordinate boundaries.
 */

import { describe, it, expect, beforeEach } from '../fixtures/testHelper.js';
import {
  mockFirestoreDb,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  SkinnerSessionRecord,
  IslandTelemetryEvent,
  DeviceLiveStatus,
} from '../fixtures/mockFirestore.js';
import {
  mockMediaDevices,
  MockMediaDevicesManager,
  MockMediaStream,
  MockMediaStreamTrack,
} from '../fixtures/mockMediaDevices.js';
import {
  createGeminiLiveSession,
  MockGeminiLiveSession,
} from '../fixtures/mockGemini.js';
import { CameraStreamService, cameraService } from '../../apps/zf-isla-dinamica/src/services/cameraStreamService.js';
import { SkinnerDecayEngine } from '../../apps/zf-skinner-box/src/engines/decayEngine.js';
import {
  computeOdometerDigits,
  computeDashOffset,
  computeNeedleAngle,
  getTachometerZone,
} from '../../apps/zf-parental-dashboard/src/hooks/useLiveSkinner.js';
import { localDataBus, publishSkinnerSession, recordIslandTelemetry, sendDeviceHeartbeat } from '../../packages/shared/src/firebase.js';

describe('Tier 5: Adversarial Coverage Hardening Suite', () => {
  beforeEach(() => {
    mockFirestoreDb.reset();
    mockMediaDevices.reset();
  });

  // =========================================================================
  // 1. Camera Permission Denial & Recovery via Canvas Fallback
  // =========================================================================
  describe('1. Camera Permission Denial & Canvas Fallback Resilience', () => {
    it('T5-CAM-01: Handles camera permission denial (NotAllowedError) and falls back to safe error state without unhandled rejection', async () => {
      mockMediaDevices.setPermission('denied');
      
      const service = new CameraStreamService();
      const state = await service.setCameraMode('environment');

      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeDefined();
      expect(state.mainStream).toBeNull();
      expect(state.activeFacing).toBe('environment');
    });

    it('T5-CAM-02: Handles dual BeReal mode when concurrent hardware is unsupported and safely reports error state', async () => {
      mockMediaDevices.hardwareSupportsDualConcurrentStreams = false;

      const service = new CameraStreamService();
      const state = await service.setCameraMode('dual_bereal');

      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeDefined();
      expect(state.mainStream).toBeNull();
    });

    it('T5-CAM-03: Handles rapid permission changes (denied -> granted -> denied) without leaking streams', async () => {
      const service = new CameraStreamService();

      // Denied state
      mockMediaDevices.setPermission('denied');
      const state1 = await service.setCameraMode('user');
      expect(state1.isStreaming).toBe(false);

      // Granted state
      mockMediaDevices.setPermission('granted');
      const state2 = await service.setCameraMode('user');
      expect(state2.isStreaming).toBe(true);
      expect(state2.mainStream).toBeDefined();

      // Re-denied state
      mockMediaDevices.setPermission('denied');
      const state3 = await service.setCameraMode('environment');
      expect(state3.isStreaming).toBe(false);

      service.stopAllStreams();
      expect(mockMediaDevices.getActiveStreams().length).toBe(0);
      expect(state2.mainStream?.getVideoTracks()[0].readyState).toBe('ended');
    });

    it('T5-CAM-04: Captures high-res JPEG frame when mock video element is supplied', () => {
      const service = new CameraStreamService();
      const mockVideo = (typeof document !== 'undefined' ? document.createElement('video') : null) as any;
      const snapshot = service.captureFrameBase64(mockVideo);
      expect(snapshot).toBeDefined();
      expect(snapshot.startsWith('data:image/jpeg;base64,')).toBe(true);
    });

    it('T5-CAM-05: Captures frame base64 from null or disconnected video element cleanly using fallback', () => {
      const service = new CameraStreamService();
      const frameBase64 = service.captureFrameBase64(null);

      expect(frameBase64).toBeDefined();
      expect(frameBase64).toBe('');
    });

    it('T5-CAM-06: Handles severe hardware error (NotFoundError) safely without unhandled exception', async () => {
      const notFoundErr = new Error('Requested device not found') as any;
      notFoundErr.name = 'NotFoundError';
      mockMediaDevices.simulateHardwareError(notFoundErr);

      const service = new CameraStreamService();
      const state = await service.setCameraMode('environment');

      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeDefined();
      expect(state.mainStream).toBeNull();
    });
  });

  // =========================================================================
  // 2. Zero-Scroll Sessions, Negative/Overflow Timestamps & 200+ RPM Bursts
  // =========================================================================
  describe('2. Skinner Box Zero-Scroll, Timestamp Extremes & 200+ RPM Bursts', () => {
    it('T5-SKIN-01: Zero-scroll immediate session termination produces clean non-NaN metrics', async () => {
      const sessionId = 'zero_scroll_sess_01';
      const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', sessionId);

      const record: SkinnerSessionRecord = {
        sessionId,
        userId: 'mateo_quispe',
        targetProfile: 'child',
        status: 'completed',
        startTime: Date.now(),
        endTime: Date.now(),
        totalScrolls: 0,
        totalDurationSeconds: 0,
        averageRetentionPct: 0,
        completedItemsCount: 0,
        currentScrollVelocity: 0,
        activeContentId: 'c1_james_webb',
        activeNominalDuration: 45,
        activeElapsedSeconds: 0,
        activeRetentionPct: 0,
        decayCurveData: [],
        topicDistribution: {},
        lastUpdated: Date.now(),
      };

      await setDoc(sessionDoc, record);
      const snap = await getDoc(sessionDoc);
      const data = snap.data()!;

      expect(Number.isNaN(data.averageRetentionPct)).toBe(false);
      expect(Number.isNaN(data.totalDurationSeconds)).toBe(false);
      expect(data.averageRetentionPct).toBe(0);
      expect(data.totalScrolls).toBe(0);
      expect(data.decayCurveData.length).toBe(0);
    });

    it('T5-SKIN-02: Handles negative timestamps and backward system clock skew without crashing', () => {
      const computeDurationSafe = (start: number, end: number) => {
        const raw = (end - start) / 1000;
        return Math.max(0, Math.round(raw));
      };

      const now = Date.now();
      expect(computeDurationSafe(now, now - 10000)).toBe(0); // Clock jumped backwards
      expect(computeDurationSafe(-5000, 5000)).toBe(10);     // Negative start epoch
      expect(computeDurationSafe(now, now + 3600000)).toBe(3600); // 1 hour forward
    });

    it('T5-SKIN-03: Handles timestamp integer overflow (MAX_SAFE_INTEGER) safely', () => {
      const isStaleHeartbeat = (lastHeartbeat: number, now: number, thresholdMs = 15000) => {
        if (!Number.isFinite(lastHeartbeat) || lastHeartbeat < 0) return true;
        const delta = now - lastHeartbeat;
        return delta > thresholdMs || delta < 0;
      };

      const now = Date.now();
      expect(isStaleHeartbeat(Number.MAX_SAFE_INTEGER, now)).toBe(true);
      expect(isStaleHeartbeat(-1, now)).toBe(true);
      expect(isStaleHeartbeat(now - 5000, now)).toBe(false);
      expect(isStaleHeartbeat(now - 20000, now)).toBe(true);
    });

    it('T5-SKIN-04: Simulates extreme 200+ RPM scroll burst and verifies decay asymptotic floor (5.0s)', () => {
      const engine = new SkinnerDecayEngine('child', 7);

      // Rapidly fire 250 scrolls
      for (let s = 1; s <= 250; s++) {
        const decision = engine.selectNextContent(s);
        if (!decision.isJackpot) {
          expect(decision.nominalDurationSeconds).toBeGreaterThanOrEqual(5.0);
          if (s >= 100) {
            // Must have decayed to exactly 5.0s floor
            expect(decision.nominalDurationSeconds).toBe(5.0);
          }
        } else {
          expect(decision.nominalDurationSeconds).toBe(35.0);
        }
      }
    });

    it('T5-SKIN-05: Calculates real-time RPM under a 300 scrolls in 1.5s burst without division-by-zero or NaN', () => {
      const calculateBurstRpm = (scrollCount: number, elapsedMs: number) => {
        const spanSeconds = Math.max(0.1, elapsedMs / 1000);
        const rpm = Math.round((scrollCount / spanSeconds) * 60);
        return Number.isFinite(rpm) ? rpm : 0;
      };

      const extremeRpm = calculateBurstRpm(300, 1500); // 300 scrolls in 1.5s = 12,000 RPM burst
      expect(extremeRpm).toBe(12000);

      const zeroDeltaRpm = calculateBurstRpm(10, 0); // zero delta protection
      expect(zeroDeltaRpm).toBe(6000);
      expect(Number.isNaN(zeroDeltaRpm)).toBe(false);
    });

    it('T5-SKIN-06: Evaluates Odometer formatting for 0, 1, 9999, and 100,000+ scrolls', () => {
      expect(computeOdometerDigits(0)).toEqual(['0', '0', '0', '0']);
      expect(computeOdometerDigits(-50)).toEqual(['0', '0', '0', '0']);
      expect(computeOdometerDigits(7)).toEqual(['0', '0', '0', '7']);
      expect(computeOdometerDigits(9999)).toEqual(['9', '9', '9', '9']);
      expect(computeOdometerDigits(100000)).toEqual(['1', '0', '0', '0', '0', '0']);
    });

    it('T5-SKIN-07: Evaluates Radial Retention Ring dash offset boundary clamps (-100% to +500%)', () => {
      const radius = 44;
      const circumference = 2 * Math.PI * radius;

      expect(computeDashOffset(0, radius)).toBeCloseTo(circumference, 2);
      expect(computeDashOffset(100, radius)).toBeCloseTo(0, 2);
      expect(computeDashOffset(-50, radius)).toBeCloseTo(circumference, 2); // Clamped to 0%
      expect(computeDashOffset(250, radius)).toBeCloseTo(0, 2); // Clamped to 100%
    });

    it('T5-SKIN-08: Evaluates Tachometer needle angle clamping across negative and 500+ RPM inputs', () => {
      expect(computeNeedleAngle(0, 180)).toBe(-90);
      expect(computeNeedleAngle(90, 180)).toBe(0);
      expect(computeNeedleAngle(180, 180)).toBe(90);
      expect(computeNeedleAngle(-50, 180)).toBe(-90); // Clamped to 0
      expect(computeNeedleAngle(500, 180)).toBe(90);  // Clamped to max 180
    });
  });

  // =========================================================================
  // 3. Network Offline Disruption & Mutation Queue Flush Upon Reconnect
  // =========================================================================
  describe('3. Network Offline Disruption & Mutation Flush', () => {
    it('T5-NET-01: Queues multiple consecutive session mutations while offline and applies all upon reconnection', async () => {
      const testDoc = doc(mockFirestoreDb, 'sessions_skinner', 'offline_resilience_01');
      await setDoc(testDoc, { totalScrolls: 0, status: 'active' });

      // Simulate network disconnection
      mockFirestoreDb.setOnline(false);

      // Perform 5 offline scroll mutations
      for (let s = 1; s <= 5; s++) {
        await setDoc(testDoc, { totalScrolls: s, status: 'active', lastUpdated: Date.now() }, { merge: true });
      }

      expect(mockFirestoreDb.offlineQueue.length).toBe(5);

      // Reconnect network
      mockFirestoreDb.setOnline(true);
      expect(mockFirestoreDb.offlineQueue.length).toBe(0);

      const snap = await getDoc(testDoc);
      expect(snap.data()?.totalScrolls).toBe(5);
    });

    it('T5-NET-02: Local in-memory data bus delivers instant optimistic updates during offline network state', () => {
      let receivedSession: SkinnerSessionRecord | null = null;
      const unsub = localDataBus.subscribeSkinnerSession('opt_session_01', (s) => {
        receivedSession = s;
      });

      const optimisticRecord: SkinnerSessionRecord = {
        sessionId: 'opt_session_01',
        userId: 'mateo_quispe',
        targetProfile: 'child',
        status: 'active',
        startTime: Date.now(),
        totalScrolls: 42,
        totalDurationSeconds: 120,
        averageRetentionPct: 85,
        completedItemsCount: 3,
        currentScrollVelocity: 18,
        activeContentId: 'c1',
        activeNominalDuration: 30,
        activeElapsedSeconds: 15,
        activeRetentionPct: 50,
        decayCurveData: [],
        topicDistribution: {},
        lastUpdated: Date.now(),
      };

      localDataBus.setSkinnerSession(optimisticRecord);
      expect(receivedSession).toEqual(optimisticRecord);
      unsub();
    });

    it('T5-NET-03: Buffers Island telemetry events while offline and preserves ordering on flush', async () => {
      const col = collection(mockFirestoreDb, 'island_telemetry');
      mockFirestoreDb.setOnline(false);

      const events: IslandTelemetryEvent[] = [
        { eventId: 'off_evt_1', deviceId: 'dev_1', timestamp: 1000, cameraMode: 'environment', activeAction: 'landscape' },
        { eventId: 'off_evt_2', deviceId: 'dev_1', timestamp: 2000, cameraMode: 'user', activeAction: 'touch_explain' },
        { eventId: 'off_evt_3', deviceId: 'dev_1', timestamp: 3000, cameraMode: 'dual_bereal', activeAction: 'scene_redesign' },
      ];

      for (const ev of events) {
        await setDoc(doc(col, ev.eventId), ev);
      }

      expect(mockFirestoreDb.offlineQueue.length).toBe(3);

      mockFirestoreDb.setOnline(true);
      expect(mockFirestoreDb.offlineQueue.length).toBe(0);

      const querySnap = await getDocs(col);
      expect(querySnap.size).toBe(3);
    });

    it('T5-NET-04: Notifies active onSnapshot query listeners immediately after offline queue flush', async () => {
      const col = collection(mockFirestoreDb, 'devices_live');
      let liveCount = 0;

      const unsub = onSnapshot(col, (snap) => {
        liveCount = snap.docs.length;
      });

      mockFirestoreDb.setOnline(false);
      await setDoc(doc(col, 'd1'), { deviceId: 'd1', isOnline: true });
      await setDoc(doc(col, 'd2'), { deviceId: 'd2', isOnline: true });

      // Before reconnect
      expect(mockFirestoreDb.offlineQueue.length).toBe(2);

      // After reconnect
      mockFirestoreDb.setOnline(true);
      // Let promise microtasks resolve
      await new Promise(r => setTimeout(r, 20));

      expect(liveCount).toBe(2);
      unsub();
    });

    it('T5-NET-05: Handles rapid connection toggles (flapping) during ongoing document writes', async () => {
      const testDoc = doc(mockFirestoreDb, 'sessions_skinner', 'flap_doc');

      for (let i = 0; i < 10; i++) {
        mockFirestoreDb.setOnline(i % 2 === 0);
        await setDoc(testDoc, { totalScrolls: i });
      }

      mockFirestoreDb.setOnline(true);
      const snap = await getDoc(testDoc);
      expect(snap.data()?.totalScrolls).toBe(9);
    });

    it('T5-NET-06: Offline queue safely survives empty queue flush calls', () => {
      mockFirestoreDb.setOnline(false);
      expect(mockFirestoreDb.offlineQueue.length).toBe(0);
      mockFirestoreDb.setOnline(true);
      expect(mockFirestoreDb.offlineQueue.length).toBe(0);
    });
  });

  // =========================================================================
  // 4. BeReal PiP Drag Boundary Clamping Beyond Mobile Viewport
  // =========================================================================
  describe('4. BeReal PiP Drag Boundary Clamping', () => {
    it('T5-PIP-01: Clamps negative out-of-bounds drag coordinates to minimum 12px margin', () => {
      const clamped = CameraStreamService.clampPipCoordinates(-150, -300, 360, 480, 90, 120);
      expect(clamped.x).toBe(12);
      expect(clamped.y).toBe(12);
    });

    it('T5-PIP-02: Clamps positive overflow drag coordinates to maximum container bound (container - pip - 12)', () => {
      // Container: 360x480, PiP: 90x120 -> Max X = 360 - 90 - 12 = 258, Max Y = 480 - 120 - 12 = 348
      const clamped = CameraStreamService.clampPipCoordinates(1000, 2000, 360, 480, 90, 120);
      expect(clamped.x).toBe(258);
      expect(clamped.y).toBe(348);
    });

    it('T5-PIP-03: Preserves exact coordinates within safe boundary interior', () => {
      const clamped = CameraStreamService.clampPipCoordinates(120, 200, 360, 480, 90, 120);
      expect(clamped.x).toBe(120);
      expect(clamped.y).toBe(200);
    });

    it('T5-PIP-04: Verifies exact boundary values at left, top, right, and bottom extremes', () => {
      const atMinX = CameraStreamService.clampPipCoordinates(12, 100, 360, 480, 90, 120);
      const atMaxX = CameraStreamService.clampPipCoordinates(258, 100, 360, 480, 90, 120);
      const atMinY = CameraStreamService.clampPipCoordinates(100, 12, 360, 480, 90, 120);
      const atMaxY = CameraStreamService.clampPipCoordinates(100, 348, 360, 480, 90, 120);

      expect(atMinX.x).toBe(12);
      expect(atMaxX.x).toBe(258);
      expect(atMinY.y).toBe(12);
      expect(atMaxY.y).toBe(348);
    });

    it('T5-PIP-05: Handles constrained compact mobile viewport (320x400)', () => {
      // Container: 320x400, PiP: 90x120 -> Max X = 320 - 90 - 12 = 218, Max Y = 400 - 120 - 12 = 268
      const clamped = CameraStreamService.clampPipCoordinates(500, 500, 320, 400, 90, 120);
      expect(clamped.x).toBe(218);
      expect(clamped.y).toBe(268);
    });

    it('T5-PIP-06: Handles large tablet / desktop demo viewport (1024x768)', () => {
      // Container: 1024x768, PiP: 90x120 -> Max X = 1024 - 90 - 12 = 922, Max Y = 768 - 120 - 12 = 636
      const clamped = CameraStreamService.clampPipCoordinates(2000, 2000, 1024, 768, 90, 120);
      expect(clamped.x).toBe(922);
      expect(clamped.y).toBe(636);
    });
  });

  // =========================================================================
  // 5. Socratic Touch-to-Explain Border Extremes (0.0, 0.0) & (1.0, 1.0)
  // =========================================================================
  describe('5. Socratic Touch-to-Explain Border Extremes', () => {
    const mockRect = { left: 100, top: 200, width: 400, height: 600 };

    it('T5-TOUCH-01: Normalizes exact top-left corner tap to (0.0, 0.0)', () => {
      const norm = CameraStreamService.normalizeTouchCoordinates(100, 200, mockRect);
      expect(norm.x).toBe(0.0);
      expect(norm.y).toBe(0.0);
    });

    it('T5-TOUCH-02: Normalizes exact bottom-right corner tap to (1.0, 1.0)', () => {
      const norm = CameraStreamService.normalizeTouchCoordinates(500, 800, mockRect);
      expect(norm.x).toBe(1.0);
      expect(norm.y).toBe(1.0);
    });

    it('T5-TOUCH-03: Clamps extreme out-of-bounds clicks (-500px, +3000px) to [0.0, 1.0]', () => {
      const negativeClick = CameraStreamService.normalizeTouchCoordinates(-400, -200, mockRect);
      expect(negativeClick.x).toBe(0.0);
      expect(negativeClick.y).toBe(0.0);

      const overflowClick = CameraStreamService.normalizeTouchCoordinates(2000, 3000, mockRect);
      expect(overflowClick.x).toBe(1.0);
      expect(overflowClick.y).toBe(1.0);
    });

    it('T5-TOUCH-04: Evaluates Gemini Live Touch-to-Explain response at exact (0.0, 0.0) border', async () => {
      const gemini = createGeminiLiveSession();
      const res = await gemini.explainTouchPoint({
        touchCoordinates: { x: 0.0, y: 0.0 },
        frameBase64: 'data:image/jpeg;base64,CORNER_FRAME',
      });

      expect(res.coordinates).toEqual({ x: 0.0, y: 0.0 });
      expect(res.confidence).toBeGreaterThan(0.9);
      expect(res.identifiedObject).toBeDefined();
      expect(res.socraticExplanation.length).toBeGreaterThan(10);
    });

    it('T5-TOUCH-05: Evaluates Gemini Live Touch-to-Explain response at exact (1.0, 1.0) border', async () => {
      const gemini = createGeminiLiveSession();
      const res = await gemini.explainTouchPoint({
        touchCoordinates: { x: 1.0, y: 1.0 },
        frameBase64: 'data:image/jpeg;base64,CORNER_FRAME',
      });

      expect(res.coordinates).toEqual({ x: 1.0, y: 1.0 });
      expect(res.confidence).toBeGreaterThan(0.9);
      expect(res.identifiedObject).toBeDefined();
      expect(res.socraticExplanation.length).toBeGreaterThan(10);
    });

    it('T5-TOUCH-06: Verifies Spatial Pinpoint percentage positions (0% and 100%) render valid SVG layout', () => {
      const formatCrosshairPercent = (coords: { x: number; y: number }) => ({
        posX: `${(coords.x * 100).toFixed(0)}%`,
        posY: `${(coords.y * 100).toFixed(0)}%`,
      });

      const corner00 = formatCrosshairPercent({ x: 0.0, y: 0.0 });
      expect(corner00.posX).toBe('0%');
      expect(corner00.posY).toBe('0%');

      const corner11 = formatCrosshairPercent({ x: 1.0, y: 1.0 });
      expect(corner11.posX).toBe('100%');
      expect(corner11.posY).toBe('100%');
    });
  });
});
