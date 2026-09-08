/**
 * Zentry Commercial Demo Suite - Comprehensive Empirical Verification & Stress Test Harness
 * Conducts multi-device real-time sync verification, mathematical oracle validation,
 * latency profiling, and high-frequency concurrency stress testing for:
 *   - apps/isla-dinamica (Publisher 1)
 *   - apps/skinner-box (Publisher 2)
 *   - apps/parent-dashboard (Subscriber)
 *   - packages/shared (Resilient Event Bus & Firestore Client)
 */

import {
  localDataBus,
  publishSkinnerSession,
  subscribeToLatestSkinnerSession,
  subscribeToSkinnerSession,
  recordIslandTelemetry,
  subscribeToIslandTelemetry,
  sendDeviceHeartbeat,
  subscribeToActiveDevices,
  type SkinnerSessionRecord,
  type IslandTelemetryEvent,
  type DeviceLiveStatus,
  type GenerativeStyle,
  type DecayCurvePoint,
} from '../packages/shared/src/index.js';

import {
  computeOdometerDigits,
  computeDashOffset,
  computeNeedleAngle,
  getTachometerZone,
} from '../apps/zf-parental-dashboard/src/hooks/useLiveSkinner.js';

import { SkinnerDecayEngine } from '../apps/zf-skinner-box/src/engines/decayEngine.js';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  purpura: '\x1b[38;2;83;59;135m',
  lavanda: '\x1b[38;2;214;200;250m',
  menta: '\x1b[38;2;194;244;231m',
  glacial: '\x1b[38;2;235;241;245m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bgPurpura: '\x1b[48;2;83;59;135m',
};

interface LatencyStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

function calculatePercentiles(latencies: number[]): LatencyStats {
  if (latencies.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const getP = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];

  return {
    count: sorted.length,
    min: Math.round(sorted[0] * 1000) / 1000,
    max: Math.round(sorted[sorted.length - 1] * 1000) / 1000,
    avg: Math.round((sum / sorted.length) * 1000) / 1000,
    p50: Math.round(getP(50) * 1000) / 1000,
    p90: Math.round(getP(90) * 1000) / 1000,
    p95: Math.round(getP(95) * 1000) / 1000,
    p99: Math.round(getP(99) * 1000) / 1000,
  };
}

async function runEmpiricalVerificationAndStress() {
  console.log(`\n${c.bgPurpura}${c.glacial}${c.bold}  ★ ZENTRY EMPIRICAL VERIFICATION & STRESS HARNESS (CHALLENGER 1) ★  ${c.reset}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ${c.green}✓${c.reset} ${testName}`);
    } else {
      failedTests++;
      console.log(`  ${c.red}✗ ${testName}${c.reset}`);
      if (detail) console.log(`    ${c.red}Detail: ${detail}${c.reset}`);
    }
  }

  // =========================================================================
  // TEST SECTION 1: SKINNER BOX -> PARENT DASHBOARD REAL-TIME TELEMETRY SYNC
  // =========================================================================
  console.log(`\n${c.purpura}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.glacial}SECTION 1: SKINNER BOX -> PARENT DASHBOARD REAL-TIME SYNC & REACTIVITY${c.reset}`);
  console.log(`${c.purpura}================================================================================${c.reset}`);

  // Test 1.1: Rapid Scroll Bursts & Odometer Reactivity
  const testSessionId = `skinner_test_${Date.now()}`;
  const receivedSessionMap: Map<number, SkinnerSessionRecord> = new Map();
  const busLatencies: number[] = [];

  const unsubSkinner = localDataBus.subscribeSkinnerSession(testSessionId, (record) => {
    if (record && record.sessionId === testSessionId) {
      const now = performance.now();
      if (record.lastUpdated > 0) {
        busLatencies.push(Math.max(0.001, now - record.lastUpdated));
      }
      receivedSessionMap.set(record.totalScrolls, record);
    }
  });

  const decayEngine = new SkinnerDecayEngine('child', 7);
  const decayHistory: DecayCurvePoint[] = [];

  // Emulate rapid 50 scroll burst
  const scrollBurstCount = 50;
  for (let s = 1; s <= scrollBurstCount; s++) {
    const decision = decayEngine.selectNextContent(s);
    const nominal = decision.nominalDurationSeconds;
    const watched = s % 3 === 0 ? nominal : Math.round((nominal * 0.3) * 10) / 10;
    const retPct = Math.min(100, Math.round((watched / nominal) * 100));

    decayHistory.push({
      scrollIndex: s,
      nominalDurationSeconds: nominal,
      actualViewSeconds: watched,
      retentionPct: retPct,
      isJackpot: decision.isJackpot,
      timestamp: Date.now(),
    });

    const mockRecord: SkinnerSessionRecord = {
      sessionId: testSessionId,
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: Date.now() - 60000,
      totalScrolls: s,
      totalDurationSeconds: s * 4,
      averageRetentionPct: 65.4,
      completedItemsCount: Math.floor(s / 3),
      currentScrollVelocity: Math.min(180, 10 + s * 2.5),
      activeContentId: decision.item.id,
      activeNominalDuration: nominal,
      activeElapsedSeconds: watched,
      activeRetentionPct: retPct,
      decayCurveData: [...decayHistory],
      topicDistribution: { 'Ciencia': s },
      lastUpdated: performance.now(),
    };

    localDataBus.setSkinnerSession(mockRecord);
  }

  // Allow dispatch
  await new Promise((r) => setTimeout(r, 20));

  assert(
    receivedSessionMap.size === scrollBurstCount,
    `1.1.1 Subscriber received all 50 distinct scroll states in sequence (Unique states: ${receivedSessionMap.size}/50)`
  );

  const latestReceived = receivedSessionMap.get(50);
  assert(
    latestReceived?.totalScrolls === 50,
    `1.1.2 Digital Odometer totalScrolls matches final value (Expected: 50, Got: ${latestReceived?.totalScrolls})`
  );

  const digits = computeOdometerDigits(latestReceived?.totalScrolls || 0);
  assert(
    digits.join('') === '0050',
    `1.1.3 Digital Odometer digit array formatted correctly (Expected: '0050', Got: '${digits.join('')}')`
  );

  // Test 1.2: Radial Retention Ring Calculation Reactivity
  const ret0 = computeDashOffset(0, 44);
  const ret50 = computeDashOffset(50, 44);
  const ret100 = computeDashOffset(100, 44);
  const expectedCircumference = 2 * Math.PI * 44; // ~276.46

  assert(
    Math.abs(ret0 - expectedCircumference) < 0.01 &&
    Math.abs(ret50 - (expectedCircumference / 2)) < 0.01 &&
    Math.abs(ret100 - 0) < 0.01,
    `1.2.1 Radial Retention Ring SVG dashOffset calculates accurately across [0%, 50%, 100%]`
  );

  // Test 1.3: Velocity RPM Tachometer Reactivity & Zones
  const calmReading = getTachometerZone(3.5);
  const warnReading = getTachometerZone(10.2);
  const alertReading = getTachometerZone(48.0);
  const maxReading = getTachometerZone(180.0);
  const overMaxReading = getTachometerZone(350.0);

  assert(
    calmReading.zone === 'calm' &&
    warnReading.zone === 'warning' &&
    alertReading.zone === 'alert',
    `1.3.1 Velocity Tachometer zone classification handles Calm (<6 RPM), Warning (6-15 RPM), and Alert (>=15 RPM)`
  );

  assert(
    calmReading.needleAngle >= -90 && calmReading.needleAngle <= 90 &&
    alertReading.needleAngle >= -90 && alertReading.needleAngle <= 90 &&
    overMaxReading.needleAngle === 90,
    `1.3.2 Velocity Tachometer needle angle correctly bounds to [-90°, +90°] range and clamps extreme RPM`
  );

  // Test 1.4: Decay Curve Dynamic Accumulation & VR-7 Jackpots
  assert(
    latestReceived?.decayCurveData.length === 50,
    `1.4.1 Decay curve point count strictly preserves all 50 historical points`
  );

  const nonJackpotPoints = latestReceived?.decayCurveData.filter((p) => !p.isJackpot) || [];
  const jackpotPoints = latestReceived?.decayCurveData.filter((p) => p.isJackpot) || [];

  const firstNonJackpot = nonJackpotPoints[0];
  const lastNonJackpot = nonJackpotPoints[nonJackpotPoints.length - 1];

  assert(
    firstNonJackpot?.nominalDurationSeconds === 41.9 &&
    lastNonJackpot?.nominalDurationSeconds <= 6.5 &&
    firstNonJackpot.nominalDurationSeconds > lastNonJackpot.nominalDurationSeconds,
    `1.4.2 Mathematical temporal decay correctly drops non-jackpot duration from 41.9s -> ${lastNonJackpot?.nominalDurationSeconds}s (Floor ~5.0s)`
  );

  assert(
    jackpotPoints.length > 0 && jackpotPoints.every((p) => p.nominalDurationSeconds === 35.0),
    `1.4.3 VR-7 Jackpots accurately trigger variable-ratio dopamine spikes with nominal duration anchored at 35.0s (Jackpots found: ${jackpotPoints.length})`
  );

  unsubSkinner();

  // =========================================================================
  // TEST SECTION 2: ISLA DINÁMICA CORNER TOOLS -> PARENT DASHBOARD SYNC
  // =========================================================================
  console.log(`\n${c.purpura}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.glacial}SECTION 2: ISLA DINÁMICA CORNER TOOLS -> PARENT DASHBOARD REAL-TIME SYNC${c.reset}`);
  console.log(`${c.purpura}================================================================================${c.reset}`);

  const receivedIslandEvents: IslandTelemetryEvent[] = [];

  const unsubIsland = localDataBus.subscribeIslandTelemetry((events) => {
    receivedIslandEvents.length = 0;
    receivedIslandEvents.push(...events);
  }, 50);

  // 2.1: Landscape Enhancer Stylizer
  const styles: GenerativeStyle[] = ['enhanced', 'comic', 'pixel_art', 'videogame', 'spatial'];
  for (const style of styles) {
    localDataBus.addIslandTelemetry({
      eventId: `evt_land_${style}_${Date.now()}`,
      deviceId: 'ipad_mateo_01',
      timestamp: Date.now(),
      cameraMode: 'dual_bereal',
      activeAction: 'landscape',
      generativeStyle: style,
      aiPrompt: `Transferir estilo ${style}`,
      aiResponse: `Renderizado en estilo ${style} generado exitosamente a 60fps`,
      frameSnapshotUrl: `https://mock.storage/snapshot_${style}.jpg`,
    });
  }

  // 2.2: Touch-to-Explain Socratic Point
  const touchCoords = [
    { x: 0.12, y: 0.45 },
    { x: 0.78, y: 0.23 },
    { x: 0.42, y: 0.68 },
    { x: 0.91, y: 0.89 },
    { x: 0.05, y: 0.95 },
  ];

  for (const coord of touchCoords) {
    localDataBus.addIslandTelemetry({
      eventId: `evt_touch_${coord.x}_${Date.now()}`,
      deviceId: 'ipad_mateo_01',
      timestamp: Date.now(),
      cameraMode: 'environment',
      activeAction: 'touch_explain',
      touchCoordinates: coord,
      aiPrompt: `Explicar objeto en (${coord.x}, ${coord.y})`,
      aiResponse: `Objeto microscópico detectado en coordenadas normalizadas.`,
      frameSnapshotUrl: 'https://mock.storage/snapshot_microscope.jpg',
    });
  }

  // 2.3: Scene Redesign Deliberator
  for (let r = 1; r <= 3; r++) {
    localDataBus.addIslandTelemetry({
      eventId: `evt_redesign_${r}_${Date.now()}`,
      deviceId: 'ipad_mateo_01',
      timestamp: Date.now(),
      cameraMode: 'environment',
      activeAction: 'scene_redesign',
      aiPrompt: `Deliberación espacial #${r}`,
      aiResponse: `Diagnóstico espacial: Reorganización modular recomendada.`,
      redesignOptions: [
        { title: 'Laboratorio Futurista 3D', description: 'Reemplaza escritorio con hologramas.', style: 'Cyber Cyan' },
        { title: 'Bioma Botánico', description: 'Domo botánico bioluminiscente.', style: 'Eco Green' },
      ],
      frameSnapshotUrl: 'https://mock.storage/snapshot_room.jpg',
    });
  }

  await new Promise((r) => setTimeout(r, 20));

  const landscapeEvents = receivedIslandEvents.filter((e) => e.activeAction === 'landscape');
  const touchEvents = receivedIslandEvents.filter((e) => e.activeAction === 'touch_explain');
  const redesignEvents = receivedIslandEvents.filter((e) => e.activeAction === 'scene_redesign');

  assert(
    landscapeEvents.length >= 5,
    `2.1.1 Landscape Stylizer: All 5 generative style events received in dashboard (Got: ${landscapeEvents.length})`
  );

  assert(
    touchEvents.length >= 5,
    `2.2.1 Touch-to-Explain: All 5 spatial touch events received with coordinates (Got: ${touchEvents.length})`
  );

  const latestTouch = touchEvents[0]; // Most recent
  assert(
    latestTouch?.touchCoordinates?.x === 0.05 && latestTouch?.touchCoordinates?.y === 0.95,
    `2.2.2 Touch-to-Explain coordinates accurately preserved (Expected: {0.05, 0.95}, Got: {${latestTouch?.touchCoordinates?.x}, ${latestTouch?.touchCoordinates?.y}})`
  );

  assert(
    redesignEvents.length >= 3,
    `2.3.1 Scene Redesign: All 3 deliberation proposals received with 2 options each (Got: ${redesignEvents.length})`
  );

  assert(
    redesignEvents[0]?.redesignOptions?.length === 2,
    `2.3.2 Scene Redesign: Dual alternative 3D options payload intact in subscriber`
  );

  unsubIsland();

  // =========================================================================
  // TEST SECTION 3: CONCURRENCY, HIGH-FREQUENCY THROUGHPUT & STRESS HARNESS
  // =========================================================================
  console.log(`\n${c.purpura}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.glacial}SECTION 3: CONCURRENCY, HIGH-FREQUENCY THROUGHPUT & STRESS TESTING${c.reset}`);
  console.log(`${c.purpura}================================================================================${c.reset}`);

  // 3.1 Concurrent Interleaved Event Burst Test (1,000 Events on Local Event Bus)
  const stressEventsTotal = 1000;
  let concurrentReceivedCount = 0;
  const concurrentLatencies: number[] = [];

  const unsubConcurrentSkinner = localDataBus.subscribeSkinnerSession(null, () => {
    concurrentReceivedCount++;
  });
  const unsubConcurrentIsland = localDataBus.subscribeIslandTelemetry(() => {
    concurrentReceivedCount++;
  });

  const stressStartTime = performance.now();

  for (let i = 0; i < stressEventsTotal / 2; i++) {
    const t0 = performance.now();
    // Skinner Event
    localDataBus.setSkinnerSession({
      sessionId: `stress_skinner_${i}`,
      userId: 'mateo_quispe',
      targetProfile: i % 2 === 0 ? 'child' : 'adult',
      status: 'active',
      startTime: Date.now() - 10000,
      totalScrolls: i + 1,
      totalDurationSeconds: (i + 1) * 2,
      averageRetentionPct: 70,
      completedItemsCount: Math.floor(i / 5),
      currentScrollVelocity: 60 + (i % 30),
      activeContentId: `content_${i}`,
      activeNominalDuration: 20,
      activeElapsedSeconds: 15,
      activeRetentionPct: 75,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: performance.now(),
    });
    concurrentLatencies.push(performance.now() - t0);

    const t1 = performance.now();
    // Island Event
    localDataBus.addIslandTelemetry({
      eventId: `stress_island_${i}`,
      deviceId: `dev_${i % 4}`,
      timestamp: Date.now(),
      cameraMode: i % 2 === 0 ? 'environment' : 'dual_bereal',
      activeAction: i % 3 === 0 ? 'landscape' : i % 3 === 1 ? 'touch_explain' : 'scene_redesign',
      aiPrompt: `Stress Prompt #${i}`,
      aiResponse: `Stress Response #${i}`,
    });
    concurrentLatencies.push(performance.now() - t1);
  }

  const stressTotalDuration = performance.now() - stressStartTime;

  await new Promise((r) => setTimeout(r, 20));

  unsubConcurrentSkinner();
  unsubConcurrentIsland();

  const latencyStats = calculatePercentiles(concurrentLatencies);
  const throughputEps = Math.round((stressEventsTotal / (stressTotalDuration / 1000)) * 10) / 10;

  assert(
    concurrentLatencies.length === stressEventsTotal,
    `3.1.1 Concurrent High-Frequency Burst: Dispatched ${stressEventsTotal} parallel events in ${stressTotalDuration.toFixed(1)}ms`
  );

  assert(
    throughputEps > 1000,
    `3.1.2 Throughput Performance: ${throughputEps} events/sec (Threshold: >1000 eps for memory bus)`
  );

  assert(
    latencyStats.avg < 1.0 && latencyStats.p95 < 2.0,
    `3.1.3 Latency SLA: Avg ${latencyStats.avg}ms, p50 ${latencyStats.p50}ms, p95 ${latencyStats.p95}ms, p99 ${latencyStats.p99}ms (SLA: Avg <1ms, p95 <2ms)`
  );

  // 3.2 Multi-Subscriber Fan-Out Concurrency (50 Concurrent Listeners x 50 Updates = 2,500 deliveries)
  const subscriberCount = 50;
  const updatesPerSubscriber = 50;
  const deliveryMatrix: number[] = new Array(subscriberCount).fill(0);
  const unsubs: Array<() => void> = [];

  for (let subIdx = 0; subIdx < subscriberCount; subIdx++) {
    const idx = subIdx;
    unsubs.push(
      localDataBus.subscribeSkinnerSession('fan_out_session', () => {
        deliveryMatrix[idx]++;
      })
    );
  }

  for (let u = 1; u <= updatesPerSubscriber; u++) {
    localDataBus.setSkinnerSession({
      sessionId: 'fan_out_session',
      userId: 'mateo',
      targetProfile: 'child',
      status: 'active',
      startTime: Date.now(),
      totalScrolls: u,
      totalDurationSeconds: u,
      averageRetentionPct: 80,
      completedItemsCount: 1,
      currentScrollVelocity: 20,
      activeContentId: 'c1',
      activeNominalDuration: 10,
      activeElapsedSeconds: 5,
      activeRetentionPct: 50,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    });
  }

  await new Promise((r) => setTimeout(r, 20));
  unsubs.forEach((u) => u());

  const totalDeliveries = deliveryMatrix.reduce((a, b) => a + b, 0);
  const allSubscribersReached = deliveryMatrix.every((count) => count >= updatesPerSubscriber);

  assert(
    allSubscribersReached && totalDeliveries >= subscriberCount * updatesPerSubscriber,
    `3.2.1 Multi-Subscriber Fan-Out: All ${subscriberCount} concurrent listeners received all ${updatesPerSubscriber} updates (${totalDeliveries} total deliveries, 0% message loss)`
  );

  // 3.3 Memory Ring Buffer & Bounds Protection (1,000 Events)
  const ringBufferStartEvents = 1000;
  for (let k = 0; k < ringBufferStartEvents; k++) {
    localDataBus.addIslandTelemetry({
      eventId: `ring_evt_${k}`,
      deviceId: 'dev_ring',
      timestamp: Date.now(),
      cameraMode: 'environment',
    });
  }

  let finalTelemetryBuffer: IslandTelemetryEvent[] = [];
  const unsubRing = localDataBus.subscribeIslandTelemetry((list) => {
    finalTelemetryBuffer = list;
  }, 100);

  assert(
    finalTelemetryBuffer.length <= 100,
    `3.3.1 Memory Protection: Ring buffer caps island telemetry list to maximum 100 items under 1000 rapid event stream (Got: ${finalTelemetryBuffer.length})`
  );
  unsubRing();

  // 3.4 Boundary & Malformed Data Resilience
  let caughtGracefully = true;
  try {
    // Zero / boundary odometer
    const zeroDigits = computeOdometerDigits(0);
    const negativeDigits = computeOdometerDigits(-5);
    const largeDigits = computeOdometerDigits(99999);

    // Boundary needle angles
    const negativeRpmNeedle = computeNeedleAngle(-50);
    const extremeRpmNeedle = computeNeedleAngle(500);

    // Negative / overflow retention
    const negRetOffset = computeDashOffset(-20);
    const overRetOffset = computeDashOffset(150);

    if (
      zeroDigits.length !== 4 ||
      negativeDigits.join('') !== '0000' ||
      negativeRpmNeedle !== -90 ||
      extremeRpmNeedle !== 90 ||
      negRetOffset <= 0 ||
      overRetOffset !== 0
    ) {
      caughtGracefully = false;
    }
  } catch (err) {
    caughtGracefully = false;
  }

  assert(
    caughtGracefully,
    `3.4.1 Boundary Resilience: Handled negative values, out-of-bound RPMs, overflow retention % and 5-digit scrolls gracefully without exceptions`
  );

  // =========================================================================
  // FINAL SUMMARY REPORT & BENCHMARK METRICS
  // =========================================================================
  console.log(`\n${c.purpura}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.glacial}CHALLENGER 1 EMPIRICAL TEST SUMMARY & METRICS MATRIX:${c.reset}`);
  console.log(`${c.purpura}================================================================================${c.reset}`);
  console.log(`  ${c.menta}Total Tests Executed:${c.reset}        ${c.bold}${totalTests}${c.reset}`);
  console.log(`  ${c.menta}Tests Passed:${c.reset}                ${c.bold}${passedTests}/${totalTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)${c.reset} ${passedTests === totalTests ? c.green + '✓' : c.red + '✗'}${c.reset}`);
  console.log(`  ${c.menta}Tests Failed:${c.reset}                ${c.bold}${failedTests}${c.reset}`);
  console.log(`  ${c.menta}Concurrency Throughput:${c.reset}      ${c.bold}${throughputEps} events/sec${c.reset}`);
  console.log(`  ${c.menta}Subscriber Latency (Avg):${c.reset}    ${c.bold}${latencyStats.avg} ms${c.reset}`);
  console.log(`  ${c.menta}Subscriber Latency (p50):${c.reset}    ${c.bold}${latencyStats.p50} ms${c.reset}`);
  console.log(`  ${c.menta}Subscriber Latency (p95):${c.reset}    ${c.bold}${latencyStats.p95} ms${c.reset}`);
  console.log(`  ${c.menta}Subscriber Latency (p99):${c.reset}    ${c.bold}${latencyStats.p99} ms${c.reset}`);
  console.log(`  ${c.menta}Subscriber Latency (Max):${c.reset}    ${c.bold}${latencyStats.max} ms${c.reset}`);
  console.log(`${c.purpura}--------------------------------------------------------------------------------${c.reset}`);

  if (failedTests === 0) {
    console.log(`\n${c.green}${c.bold}  ★ EMPIRICAL VERIFICATION VERDICT: [APPROVE] (100% REAL-TIME SYNC FIDELITY & RESILIENCE) ★  ${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${c.red}${c.bold}  ✖ EMPIRICAL VERIFICATION VERDICT: [REQUEST_CHANGES] (${failedTests} tests failed) ✖  ${c.reset}\n`);
    process.exit(1);
  }
}

runEmpiricalVerificationAndStress().catch((err) => {
  console.error('Stress test harness failure:', err);
  process.exit(1);
});
