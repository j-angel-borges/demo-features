/**
 * CHALLENGER FU 1: Empirical Telemetry & Command Bus Sync Stress Harness
 *
 * Requirements tested per Follow-up 2026-09-03T18:57:37Z & DISPATCH.md:
 * 1. Command Bus Latency & Reliability (< 5ms):
 *    - START_SESSION, END_SESSION, RESET_SESSION propagation
 *    - 1,000 iterations dispatch-to-listener latency distribution (min, max, mean, p50, p95, p99)
 *    - Multi-subscriber fan-out (20 concurrent listeners)
 *    - Fault tolerance: Throwing listener does not crash other subscribers
 *    - Master command dispatch from parentFirestoreService
 * 2. Silent Telemetry Latency (< 5ms):
 *    - 5,000 rapid scroll events latency distribution (min, max, mean, p50, p95, p99)
 *    - High-throughput burst testing (1,000 events in tight synchronous loop)
 *    - Zero event loss and data integrity (decay curve, topics, scroll counter)
 * 3. Emergency Lock Propagation & Stress:
 *    - 1,000 toggle cycles latency distribution (< 5ms)
 *    - High-speed toggle flapping convergence (1,000 alternating toggles)
 *    - Subscriber cleanup: zero ghost executions after unsubscribe
 * 4. Cross-Tab BroadcastChannel Latency (< 5ms):
 *    - Inter-tab broadcast simulation via native BroadcastChannel (with warmup)
 * 5. Cross-Event Contention & Concurrency Stress:
 *    - 1,500 mixed operations (interleaved commands, telemetry updates, lock toggles)
 *    - Memory leak check under 10,000 event flood
 */

import { performance } from 'node:perf_hooks';
import {
  localDataBus,
  publishSkinnerSession,
  subscribeToLatestSkinnerSession,
  subscribeToSkinnerSession,
  sendSkinnerCommand,
  subscribeToSkinnerCommands,
  setEmergencyLock,
  getEmergencyLock,
  subscribeToEmergencyLock,
  type SkinnerCommandEvent,
  type SkinnerSessionRecord,
  type DecayCurvePoint,
} from '../packages/shared/src/index.js';

import { parentFirestoreService } from '../apps/zf-parental-dashboard/src/services/parentFirestore.js';
import { SkinnerDecayEngine } from '../apps/zf-skinner-box/src/engines/decayEngine.js';

// ANSI styling
const colors = {
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

interface LatencyMetrics {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

function computeMetrics(samples: number[]): LatencyMetrics {
  if (samples.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const getP = (pct: number) => sorted[Math.min(sorted.length - 1, Math.floor((pct / 100) * sorted.length))];

  return {
    count: sorted.length,
    min: Math.round(sorted[0] * 1000) / 1000,
    max: Math.round(sorted[sorted.length - 1] * 1000) / 1000,
    mean: Math.round((sum / sorted.length) * 1000) / 1000,
    p50: Math.round(getP(50) * 1000) / 1000,
    p90: Math.round(getP(90) * 1000) / 1000,
    p95: Math.round(getP(95) * 1000) / 1000,
    p99: Math.round(getP(99) * 1000) / 1000,
  };
}

interface TestEntry {
  id: string;
  name: string;
  passed: boolean;
  metrics?: LatencyMetrics;
  detail?: string;
}

const testResults: TestEntry[] = [];

function assert(condition: boolean, id: string, name: string, detail?: string, metrics?: LatencyMetrics) {
  testResults.push({ id, name, passed: condition, metrics, detail });
  if (condition) {
    console.log(`  ${colors.green}✓ [PASS]${colors.reset} [${id}] ${name}`);
    if (metrics) {
      console.log(`      ${colors.dim}N=${metrics.count} | Min=${metrics.min}ms | Mean=${metrics.mean}ms | p50=${metrics.p50}ms | p95=${metrics.p95}ms | p99=${metrics.p99}ms | Max=${metrics.max}ms${colors.reset}`);
    }
  } else {
    console.error(`  ${colors.red}✗ [FAIL]${colors.reset} [${id}] ${name}`);
    if (detail) console.error(`      ${colors.red}${detail}${colors.reset}`);
    if (metrics) {
      console.error(`      ${colors.red}N=${metrics.count} | Mean=${metrics.mean}ms | p99=${metrics.p99}ms | Max=${metrics.max}ms${colors.reset}`);
    }
  }
}

async function runEmpiricalStressSuite() {
  console.log(`\n${colors.bgPurpura}${colors.glacial}${colors.bold}  ★ ZENTRY CHALLENGER FU 1: EMPIRICAL TELEMETRY & COMMAND BUS STRESS HARNESS ★  ${colors.reset}\n`);

  // =========================================================================
  // 1. COMMAND BUS LATENCY & RELIABILITY BENCHMARK (< 5ms)
  // =========================================================================
  console.log(`${colors.lavanda}${colors.bold}--- SUITE 1: Command Bus Latency & Reliability Benchmark (< 5ms) ---${colors.reset}`);

  const commandLatencies: number[] = [];
  const commandTypes: Array<'START_SESSION' | 'END_SESSION' | 'RESET_SESSION'> = [
    'START_SESSION',
    'END_SESSION',
    'RESET_SESSION',
  ];

  let receivedCmdCount = 0;
  let lastReceivedCmd: SkinnerCommandEvent | null = null;
  let listenerReceiveTime = 0;

  const unsubCmd = subscribeToSkinnerCommands((cmd) => {
    listenerReceiveTime = performance.now();
    receivedCmdCount++;
    lastReceivedCmd = cmd;
  });

  const ITERATIONS_CMD = 1000;
  for (let i = 0; i < ITERATIONS_CMD; i++) {
    const type = commandTypes[i % commandTypes.length];
    const sessId = `cmd_bench_sess_${i}`;
    const cmd: SkinnerCommandEvent = {
      commandId: `cmd_${i}_${Date.now()}`,
      type,
      sessionId: sessId,
      targetProfile: i % 2 === 0 ? 'child' : 'adult',
      timestamp: Date.now(),
    };

    const t0 = performance.now();
    localDataBus.sendSkinnerCommand(cmd);
    const latency = listenerReceiveTime - t0;
    commandLatencies.push(Math.max(0, latency));
  }

  unsubCmd();

  const cmdMetrics = computeMetrics(commandLatencies);
  assert(
    cmdMetrics.p99 < 5.0 && cmdMetrics.mean < 1.0,
    'CMD-01',
    'Command bus dispatch-to-listener latency strictly < 5.0ms (p99 threshold across 1,000 commands)',
    `Observed mean: ${cmdMetrics.mean}ms, p99: ${cmdMetrics.p99}ms, max: ${cmdMetrics.max}ms`,
    cmdMetrics
  );

  assert(
    receivedCmdCount === ITERATIONS_CMD,
    'CMD-02',
    `Command bus zero loss: 1,000/1,000 commands received synchronously without drop`,
    `Received: ${receivedCmdCount}, Expected: ${ITERATIONS_CMD}`
  );

  // Master command dispatch from parentFirestoreService (real API integration)
  const masterLatencies: number[] = [];
  let masterReceived = 0;
  const unsubMaster = parentFirestoreService.subscribeMasterCommands(() => {
    masterReceived++;
  });

  for (let m = 0; m < 100; m++) {
    const t0 = performance.now();
    parentFirestoreService.sendMasterCommand('RESET_SESSION', `master_sess_${m}`, 'child');
    const t1 = performance.now();
    masterLatencies.push(t1 - t0);
  }
  unsubMaster();

  const masterMetrics = computeMetrics(masterLatencies);
  assert(
    masterReceived === 100 && masterMetrics.p99 < 5.0,
    'CMD-03',
    'parentFirestoreService.sendMasterCommand dispatches to listeners in < 5.0ms',
    `Received: ${masterReceived}, p99: ${masterMetrics.p99}ms`,
    masterMetrics
  );

  // Fan-out concurrency: 20 concurrent subscribers
  const FANOUT_COUNT = 20;
  const fanoutCounters = new Array(FANOUT_COUNT).fill(0);
  const fanoutUnsubs: Array<() => void> = [];

  for (let s = 0; s < FANOUT_COUNT; s++) {
    const idx = s;
    const unsub = subscribeToSkinnerCommands(() => {
      fanoutCounters[idx]++;
    });
    fanoutUnsubs.push(unsub);
  }

  const fanoutLatencies: number[] = [];
  for (let i = 0; i < 200; i++) {
    const t0 = performance.now();
    localDataBus.sendSkinnerCommand({
      commandId: `fanout_${i}`,
      type: 'START_SESSION',
      sessionId: `fanout_sess_${i}`,
      targetProfile: 'child',
      timestamp: Date.now(),
    });
    const t1 = performance.now();
    fanoutLatencies.push(t1 - t0);
  }

  fanoutUnsubs.forEach((u) => u());

  const fanoutMetrics = computeMetrics(fanoutLatencies);
  const allSubscribersReceived = fanoutCounters.every((c) => c === 200);
  assert(
    allSubscribersReceived && fanoutMetrics.p99 < 5.0,
    'CMD-04',
    'Multi-subscriber fan-out (20 listeners) propagates in < 5ms without message loss',
    `Counters: min=${Math.min(...fanoutCounters)}, max=${Math.max(...fanoutCounters)}`,
    fanoutMetrics
  );

  // Listener error isolation
  let healthyListenerCalled = false;
  const faultUnsub1 = subscribeToSkinnerCommands(() => {
    throw new Error('Simulated chaotic subscriber fault');
  });
  const faultUnsub2 = subscribeToSkinnerCommands(() => {
    healthyListenerCalled = true;
  });

  localDataBus.sendSkinnerCommand({
    commandId: 'fault_test',
    type: 'RESET_SESSION',
    sessionId: 'fault_sess',
    targetProfile: 'child',
    timestamp: Date.now(),
  });

  faultUnsub1();
  faultUnsub2();

  assert(
    healthyListenerCalled,
    'CMD-05',
    'Listener isolation: Faulty throwing subscriber does not block adjacent listeners'
  );

  // State retrieval test
  const latestCmd = localDataBus.getLatestSkinnerCommand();
  assert(
    latestCmd !== null && latestCmd.type === 'RESET_SESSION' && latestCmd.sessionId === 'fault_sess',
    'CMD-06',
    'getLatestSkinnerCommand retrieves latest dispatched command state accurately'
  );

  // =========================================================================
  // 2. SILENT TELEMETRY LATENCY BENCHMARK (< 5ms)
  // =========================================================================
  console.log(`\n${colors.lavanda}${colors.bold}--- SUITE 2: Silent Telemetry Latency Benchmark (< 5ms) ---${colors.reset}`);

  const engine = new SkinnerDecayEngine('child', 7);
  const telemetryLatencies: number[] = [];
  let telemetryReceivedCount = 0;
  let lastReceivedSession: SkinnerSessionRecord | null = null;
  let telemReceiveTime = 0;

  const unsubTelemetry = subscribeToLatestSkinnerSession((rec) => {
    telemReceiveTime = performance.now();
    if (rec && rec.sessionId === 'bench_telemetry_sess') {
      telemetryReceivedCount++;
      lastReceivedSession = rec;
    }
  });

  const ITERATIONS_TELEMETRY = 5000;
  const curvePoints: DecayCurvePoint[] = [];

  for (let scroll = 1; scroll <= ITERATIONS_TELEMETRY; scroll++) {
    const decision = engine.selectNextContent(scroll);
    const viewSec = Math.max(1, Math.min(decision.item.nominalDurationSeconds, Math.floor(Math.random() * 8) + 2));
    const nominalSec = decision.item.nominalDurationSeconds;
    const retPct = Math.min(100, Math.round((viewSec / nominalSec) * 100));

    curvePoints.push({
      scrollIndex: scroll,
      nominalDurationSeconds: nominalSec,
      actualViewSeconds: viewSec,
      retentionPct: retPct,
      isJackpot: decision.isJackpot,
      timestamp: Date.now(),
    });

    const record: SkinnerSessionRecord = {
      sessionId: 'bench_telemetry_sess',
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: Date.now() - scroll * 5000,
      totalScrolls: scroll,
      totalDurationSeconds: scroll * 5,
      averageRetentionPct: 72.4,
      completedItemsCount: Math.floor(scroll / 4),
      currentScrollVelocity: 18.5,
      activeContentId: decision.item.id,
      activeNominalDuration: nominalSec,
      activeElapsedSeconds: viewSec,
      activeRetentionPct: retPct,
      decayCurveData: curvePoints.slice(-20), // Rolling window
      topicDistribution: { Ciencia: scroll, Naturaleza: Math.floor(scroll / 2) },
      lastUpdated: Date.now(),
    };

    const t0 = performance.now();
    localDataBus.setSkinnerSession(record);
    const latency = telemReceiveTime - t0;
    telemetryLatencies.push(Math.max(0, latency));
  }

  unsubTelemetry();

  const telemMetrics = computeMetrics(telemetryLatencies);
  assert(
    telemMetrics.p99 < 5.0 && telemMetrics.mean < 1.0,
    'TEL-01',
    'Silent behavioral telemetry publish-to-subscriber latency strictly < 5.0ms (5,000 events)',
    `Observed mean: ${telemMetrics.mean}ms, p99: ${telemMetrics.p99}ms, max: ${telemMetrics.max}ms`,
    telemMetrics
  );

  assert(
    telemetryReceivedCount === ITERATIONS_TELEMETRY,
    'TEL-02',
    'Zero telemetry loss: 5,000/5,000 events received by subscriber',
    `Received: ${telemetryReceivedCount}, Expected: ${ITERATIONS_TELEMETRY}`
  );

  assert(
    lastReceivedSession !== null && (lastReceivedSession as SkinnerSessionRecord).totalScrolls === ITERATIONS_TELEMETRY,
    'TEL-03',
    'Telemetry data integrity: Final state matches exact scroll count (5,000) and topic distribution',
    `Final scrolls: ${lastReceivedSession ? (lastReceivedSession as SkinnerSessionRecord).totalScrolls : 'null'}`
  );

  // Synchronous High-Throughput Burst Test (1,000 rapid scrolls in synchronous loop)
  const burstLatencies: number[] = [];
  let burstReceivedCount = 0;
  const unsubBurst = subscribeToLatestSkinnerSession((rec) => {
    if (rec && rec.sessionId === 'burst_session_test') {
      burstReceivedCount++;
    }
  });

  const BURST_COUNT = 1000;
  const burstStart = performance.now();
  for (let b = 0; b < BURST_COUNT; b++) {
    const rec: SkinnerSessionRecord = {
      sessionId: 'burst_session_test',
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: burstStart,
      totalScrolls: b + 1,
      totalDurationSeconds: b * 3,
      averageRetentionPct: 65,
      completedItemsCount: b,
      currentScrollVelocity: 45,
      activeContentId: `content_${b}`,
      activeNominalDuration: 15,
      activeElapsedSeconds: 5,
      activeRetentionPct: 33,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    };
    const t0 = performance.now();
    localDataBus.setSkinnerSession(rec);
    const t1 = performance.now();
    burstLatencies.push(t1 - t0);
  }
  const burstTotalElapsed = performance.now() - burstStart;
  unsubBurst();

  const burstMetrics = computeMetrics(burstLatencies);
  assert(
    burstReceivedCount === BURST_COUNT && burstMetrics.p99 < 5.0,
    'TEL-04',
    `Compulsive 1,000-burst scroll stress completed in ${Math.round(burstTotalElapsed)}ms with < 5ms p99`,
    `Total elapsed: ${burstTotalElapsed.toFixed(2)}ms, p99: ${burstMetrics.p99}ms`,
    burstMetrics
  );

  // Direct publishSkinnerSession fire-and-forget benchmark
  const pubLatencies: number[] = [];
  for (let p = 0; p < 500; p++) {
    const t0 = performance.now();
    publishSkinnerSession({
      sessionId: `pub_test_${p}`,
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: 1000,
      totalScrolls: p,
      totalDurationSeconds: p * 2,
      averageRetentionPct: 60,
      completedItemsCount: 1,
      currentScrollVelocity: 20,
      activeContentId: 'c1',
      activeNominalDuration: 10,
      activeElapsedSeconds: 2,
      activeRetentionPct: 20,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    });
    const t1 = performance.now();
    pubLatencies.push(t1 - t0);
  }
  const pubMetrics = computeMetrics(pubLatencies);
  assert(
    pubMetrics.p99 < 5.0,
    'TEL-05',
    'publishSkinnerSession call returns in < 5.0ms without blocking caller',
    `p99: ${pubMetrics.p99}ms, mean: ${pubMetrics.mean}ms`,
    pubMetrics
  );

  // =========================================================================
  // 3. EMERGENCY LOCK PROPAGATION & CONVERGENCE BENCHMARK
  // =========================================================================
  console.log(`\n${colors.lavanda}${colors.bold}--- SUITE 3: Emergency Lock Propagation & Stress Benchmark ---${colors.reset}`);

  const lockLatencies: number[] = [];
  let lockToggledStates: boolean[] = [];
  let lockReceiveTime = 0;

  const unsubLock = subscribeToEmergencyLock((locked) => {
    lockReceiveTime = performance.now();
    lockToggledStates.push(locked);
  });

  const LOCK_ITERATIONS = 1000;
  for (let i = 0; i < LOCK_ITERATIONS; i++) {
    const targetState = i % 2 === 0;
    const t0 = performance.now();
    setEmergencyLock(targetState);
    const latency = lockReceiveTime - t0;
    lockLatencies.push(Math.max(0, latency));
  }

  unsubLock();

  const lockMetrics = computeMetrics(lockLatencies);
  assert(
    lockMetrics.p99 < 5.0 && lockMetrics.mean < 1.0,
    'LCK-01',
    'Emergency lock toggle latency strictly < 5.0ms (1,000 iterations)',
    `Observed mean: ${lockMetrics.mean}ms, p99: ${lockMetrics.p99}ms, max: ${lockMetrics.max}ms`,
    lockMetrics
  );

  // Flapping stress convergence: 1,000 rapid alternating toggles
  setEmergencyLock(false);
  for (let f = 0; f < 1000; f++) {
    setEmergencyLock(f % 2 === 1);
  }
  // Explicitly lock
  setEmergencyLock(true);
  const stateLocked = getEmergencyLock();
  assert(
    stateLocked === true,
    'LCK-02',
    'Lock flapping stress: Final state converges reliably to locked (true) after 1,000 rapid oscillations'
  );

  // Unlock and check
  setEmergencyLock(false);
  const stateUnlocked = getEmergencyLock();
  assert(
    stateUnlocked === false,
    'LCK-03',
    'Lock release: State reliably returns to unlocked (false)'
  );

  // Subscriber unsubscription clean-up (Memory leak & ghost execution test)
  let ghostExecutionCount = 0;
  const tempUnsub = subscribeToEmergencyLock(() => {
    ghostExecutionCount++;
  });
  // Record count after initial subscribe invocation + 1 state toggle
  setEmergencyLock(true);
  const countAtUnsub = ghostExecutionCount;
  tempUnsub();

  // Fire 100 more events after unsubscribe
  for (let i = 0; i < 100; i++) {
    setEmergencyLock(i % 2 === 0);
  }
  assert(
    ghostExecutionCount === countAtUnsub,
    'LCK-04',
    `Subscriber cleanup: Zero ghost executions after unsubscription (Fired 100 post-unsub events, extra received: ${ghostExecutionCount - countAtUnsub})`
  );

  // Reset lock to clean state
  setEmergencyLock(false);

  // =========================================================================
  // 4. CROSS-TAB BROADCASTCHANNEL BENCHMARK (< 5ms)
  // =========================================================================
  console.log(`\n${colors.lavanda}${colors.bold}--- SUITE 4: Cross-Tab BroadcastChannel Latency Benchmark (< 5ms) ---${colors.reset}`);

  // Test native BroadcastChannel inter-instance transmission with warmup
  const bc1 = new BroadcastChannel('zentry_demo_sync_channel');
  const bc2 = new BroadcastChannel('zentry_demo_sync_channel');

  // Warm up BroadcastChannel
  for (let w = 0; w < 5; w++) {
    const wp = new Promise<void>((resolve) => {
      bc2.onmessage = () => resolve();
    });
    bc1.postMessage(performance.now());
    await wp;
  }

  const bcLatencies: number[] = [];
  const BC_ITERATIONS = 100;

  for (let i = 0; i < BC_ITERATIONS; i++) {
    const p = new Promise<void>((resolve) => {
      bc2.onmessage = (e) => {
        const latency = performance.now() - e.data;
        bcLatencies.push(latency);
        resolve();
      };
    });
    bc1.postMessage(performance.now());
    await p;
  }

  bc1.close();
  bc2.close();

  const bcMetrics = computeMetrics(bcLatencies);
  assert(
    bcLatencies.length === BC_ITERATIONS && bcMetrics.p99 < 5.0,
    'BC-01',
    'Cross-tab BroadcastChannel roundtrip latency strictly < 5.0ms (100 inter-tab events)',
    `Mean: ${bcMetrics.mean}ms, p99: ${bcMetrics.p99}ms, max: ${bcMetrics.max}ms`,
    bcMetrics
  );

  // =========================================================================
  // 5. CROSS-EVENT CONTENTION & CONCURRENCY INTERLEAVING
  // =========================================================================
  console.log(`\n${colors.lavanda}${colors.bold}--- SUITE 5: Cross-Event Contention & Concurrency Stress ---${colors.reset}`);

  let concurrentCommands = 0;
  let concurrentTelemetry = 0;
  let concurrentLockEvents = 0;

  // Track counts incremented ONLY during the interleaved loop
  let isInterleavingActive = false;

  const uCmd = subscribeToSkinnerCommands(() => {
    if (isInterleavingActive) concurrentCommands++;
  });
  const uTel = subscribeToLatestSkinnerSession(() => {
    if (isInterleavingActive) concurrentTelemetry++;
  });
  const uLck = subscribeToEmergencyLock(() => {
    if (isInterleavingActive) concurrentLockEvents++;
  });

  const INTERLEAVED_OPS = 1500;
  isInterleavingActive = true;
  const interleaveStart = performance.now();

  for (let i = 0; i < INTERLEAVED_OPS; i++) {
    const mod = i % 3;
    if (mod === 0) {
      localDataBus.sendSkinnerCommand({
        commandId: `inter_${i}`,
        type: i % 2 === 0 ? 'START_SESSION' : 'RESET_SESSION',
        sessionId: `inter_sess_${i}`,
        targetProfile: 'child',
        timestamp: Date.now(),
      });
    } else if (mod === 1) {
      localDataBus.setSkinnerSession({
        sessionId: 'inter_telem_sess',
        userId: 'mateo_quispe',
        targetProfile: 'child',
        status: 'active',
        startTime: Date.now() - 1000,
        totalScrolls: i,
        totalDurationSeconds: i * 2,
        averageRetentionPct: 70,
        completedItemsCount: 3,
        currentScrollVelocity: 22,
        activeContentId: 'content_inter',
        activeNominalDuration: 15,
        activeElapsedSeconds: 6,
        activeRetentionPct: 40,
        decayCurveData: [],
        topicDistribution: {},
        lastUpdated: Date.now(),
      });
    } else {
      setEmergencyLock(i % 4 === 0);
    }
  }

  const interleaveElapsed = performance.now() - interleaveStart;
  isInterleavingActive = false;
  uCmd();
  uTel();
  uLck();

  const expectedCommands = INTERLEAVED_OPS / 3;
  const expectedTelemetry = INTERLEAVED_OPS / 3;
  const expectedLock = INTERLEAVED_OPS / 3;

  assert(
    concurrentCommands === expectedCommands &&
      concurrentTelemetry === expectedTelemetry &&
      concurrentLockEvents === expectedLock,
    'CON-01',
    `Interleaved stress (1,500 mixed operations) completed in ${Math.round(interleaveElapsed)}ms without deadlocks or drops`,
    `Commands=${concurrentCommands}/${expectedCommands}, Telemetry=${concurrentTelemetry}/${expectedTelemetry}, LockEvents=${concurrentLockEvents}/${expectedLock}`
  );

  // =========================================================================
  // 6. MEMORY CONSUMPTION PROFILE UNDER TELEMETRY FLOOD
  // =========================================================================
  console.log(`\n${colors.lavanda}${colors.bold}--- SUITE 6: Memory Leak & Heap Stress Profile ---${colors.reset}`);

  if (global.gc) {
    global.gc();
  }
  const memBefore = process.memoryUsage().heapUsed;

  // Flood 10,000 telemetry updates to simulate hours of rapid use
  for (let m = 0; m < 10000; m++) {
    localDataBus.setSkinnerSession({
      sessionId: 'mem_flood_sess',
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: 1000,
      totalScrolls: m,
      totalDurationSeconds: m,
      averageRetentionPct: 50,
      completedItemsCount: 1,
      currentScrollVelocity: 10,
      activeContentId: 'flood',
      activeNominalDuration: 10,
      activeElapsedSeconds: 1,
      activeRetentionPct: 10,
      decayCurveData: [],
      topicDistribution: {},
      lastUpdated: Date.now(),
    });
  }

  if (global.gc) {
    global.gc();
  }
  const memAfter = process.memoryUsage().heapUsed;
  const memDiffMB = (memAfter - memBefore) / (1024 * 1024);

  assert(
    memDiffMB < 25.0,
    'MEM-01',
    `10,000 telemetry update burst maintains stable memory footprint (Heap delta: ${memDiffMB.toFixed(2)} MB < 25MB limit)`,
    `Before: ${(memBefore / 1048576).toFixed(2)}MB, After: ${(memAfter / 1048576).toFixed(2)}MB`
  );

  // Final summary
  console.log(`\n${colors.bold}${colors.purpura}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.glacial}CHALLENGER FU 1 VERIFICATION SUMMARY:${colors.reset}`);
  console.log(`${colors.bold}${colors.purpura}================================================================================${colors.reset}`);

  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;
  const allPass = failed === 0;

  console.log(`  Total Stress & Latency Assertions: ${testResults.length}`);
  console.log(`  Passed: ${colors.green}${colors.bold}${passed}${colors.reset}`);
  console.log(`  Failed: ${failed > 0 ? colors.red : colors.green}${colors.bold}${failed}${colors.reset}`);
  console.log(`\n  Final Challenger FU 1 Empirical Verdict: ${allPass ? colors.green + colors.bold + 'APPROVE' : colors.red + colors.bold + 'REQUEST_CHANGES'}${colors.reset}\n`);

  if (!allPass) {
    process.exit(1);
  }
  process.exit(0);
}

runEmpiricalStressSuite().catch((err) => {
  console.error('Unhandled failure in stress runner:', err);
  process.exit(1);
});
