/**
 * Skinner Box Experience & Contract Verification Suite
 * Tests Deliverables 1-6 for Requirement R1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendSkinnerCommand,
  subscribeToSkinnerCommands,
  publishSkinnerSession,
  localDataBus,
  type SkinnerCommandEvent,
  type SkinnerSessionRecord,
} from '@zentry/shared';
import { SkinnerDecayEngine } from '../src/engines/decayEngine.js';
import { ADULT_CATALOG } from '../src/data/adultCatalog.js';
import { CHILD_CATALOG } from '../src/data/childCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('SKINNER BOX SUITE: VERIFYING REQUIREMENTS R1 (1-6)');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Child UI Cleansing in SessionHeader.tsx
  // --------------------------------------------------------------------------
  console.log('TEST GROUP 1: Child UI Cleansing in SessionHeader.tsx');
  const sessionHeaderContent = fs.readFileSync(
    path.join(appRoot, 'src/components/SessionHeader.tsx'),
    'utf-8'
  );
  assert(
    !sessionHeaderContent.includes('onStartSession'),
    'SessionHeader does not accept or reference onStartSession'
  );
  assert(
    !sessionHeaderContent.includes('onEndSession'),
    'SessionHeader does not accept or reference onEndSession'
  );
  assert(
    !sessionHeaderContent.includes('velocityRpm: number'),
    'SessionHeader does not expose velocityRpm in props'
  );
  assert(
    !sessionHeaderContent.includes('Iniciar Sesión (Demo)'),
    'SessionHeader does not have session start button'
  );
  assert(
    !sessionHeaderContent.includes('Detener Sesión (Demo)'),
    'SessionHeader does not have session stop button'
  );
  assert(
    sessionHeaderContent.includes('Siguiendo') && sessionHeaderContent.includes('Para ti'),
    'SessionHeader preserves native Siguiendo | Para ti tabs'
  );
  assert(
    sessionHeaderContent.includes('Kids') && sessionHeaderContent.includes('Mix'),
    'SessionHeader preserves discreet Kids / Mix selector'
  );

  // --------------------------------------------------------------------------
  // TEST 2: Child UI Cleansing in App.tsx
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 2: Child UI Cleansing in App.tsx');
  const appContent = fs.readFileSync(path.join(appRoot, 'src/App.tsx'), 'utf-8');
  assert(
    !appContent.includes('SessionSummaryModal'),
    'App.tsx has completely eliminated SessionSummaryModal import and rendering'
  );
  assert(
    !appContent.includes('KeyS'),
    'App.tsx has completely removed KeyS session toggle shortcut'
  );
  assert(
    appContent.includes('subscribeToEmergencyLock'),
    'App.tsx preserves remote safety emergency lock subscription'
  );
  assert(
    appContent.includes('Feed de Videos Pausado'),
    'App.tsx preserves immediate safety lock overlay'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Child UI Cleansing in TikTokEngagementOverlay.tsx
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 3: Child UI Cleansing in TikTokEngagementOverlay.tsx');
  const overlayContent = fs.readFileSync(
    path.join(appRoot, 'src/components/TikTokEngagementOverlay.tsx'),
    'utf-8'
  );
  assert(
    !overlayContent.includes('⭐ ¡Jackpot Exclusivo Desbloqueado!'),
    'TikTokEngagementOverlay does not render intrusive Jackpot banner'
  );
  assert(
    overlayContent.includes('Volume2') && overlayContent.includes('VolumeX'),
    'TikTokEngagementOverlay contains fluid audio mute/unmute toggle'
  );
  assert(
    overlayContent.includes('rotate: isMuted ? 0 : 360'),
    'TikTokEngagementOverlay includes spinning vinyl animation'
  );

  // --------------------------------------------------------------------------
  // TEST 4: Video Catalog Asset Reconciliation
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 4: Video Catalog Asset Reconciliation');
  const publicVideosDir = path.join(appRoot, 'public/videos');

  assert(CHILD_CATALOG.length >= 10, `Child catalog contains ${CHILD_CATALOG.length} items`);
  assert(ADULT_CATALOG.length >= 10, `Adult catalog contains ${ADULT_CATALOG.length} items`);

  for (const item of CHILD_CATALOG) {
    if (item.videoUrl) {
      const filename = path.basename(item.videoUrl);
      const filePath = path.join(publicVideosDir, filename);
      const exists = fs.existsSync(filePath);
      assert(exists, `Child video asset exists on disk: ${filename}`);
      const stats = fs.statSync(filePath);
      assert(stats.size > 500_000, `Child video ${filename} has valid size (${stats.size} bytes)`);
    }
    if (item.posterUrl) {
      const filename = path.basename(item.posterUrl);
      const filePath = path.join(publicVideosDir, filename);
      const exists = fs.existsSync(filePath);
      assert(exists, `Child poster asset exists on disk: ${filename}`);
    }
  }

  for (const item of ADULT_CATALOG) {
    if (item.videoUrl) {
      const filename = path.basename(item.videoUrl);
      const filePath = path.join(publicVideosDir, filename);
      const exists = fs.existsSync(filePath);
      assert(exists, `Adult video asset exists on disk: ${filename}`);
      const stats = fs.statSync(filePath);
      assert(stats.size > 500_000, `Adult video ${filename} has valid size (${stats.size} bytes)`);
    }
    if (item.posterUrl) {
      const filename = path.basename(item.posterUrl);
      const filePath = path.join(publicVideosDir, filename);
      const exists = fs.existsSync(filePath);
      assert(exists, `Adult poster asset exists on disk: ${filename}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 5: Command Bus Integration (Parent Dashboard -> Skinner Box)
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 5: Command Bus Integration');
  const receivedCommands: SkinnerCommandEvent[] = [];
  const unsubscribeCommands = subscribeToSkinnerCommands((cmd) => {
    receivedCommands.push(cmd);
  });

  const testSessionId = `test_sess_${Date.now()}`;
  await sendSkinnerCommand({
    type: 'START_SESSION',
    sessionId: testSessionId,
    timestamp: Date.now(),
  });

  await sendSkinnerCommand({
    type: 'RESET_SESSION',
    sessionId: testSessionId,
    timestamp: Date.now(),
  });

  await sendSkinnerCommand({
    type: 'END_SESSION',
    sessionId: testSessionId,
    timestamp: Date.now(),
  });

  unsubscribeCommands();

  assert(
    receivedCommands.some((c) => c.type === 'START_SESSION'),
    'START_SESSION command received via Command Bus'
  );
  assert(
    receivedCommands.some((c) => c.type === 'RESET_SESSION'),
    'RESET_SESSION command received via Command Bus'
  );
  assert(
    receivedCommands.some((c) => c.type === 'END_SESSION'),
    'END_SESSION command received via Command Bus'
  );

  // --------------------------------------------------------------------------
  // TEST 6: Silent Telemetry Latency (< 5ms)
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 6: Silent Behavioral Telemetry Latency (< 5ms)');
  const record: SkinnerSessionRecord = {
    sessionId: `lat_test_${Date.now()}`,
    userId: 'mateo_quispe',
    targetProfile: 'child',
    status: 'active',
    startTime: Date.now(),
    totalScrolls: 4,
    totalDurationSeconds: 42,
    averageRetentionPct: 78.5,
    completedItemsCount: 2,
    currentScrollVelocity: 14.2,
    activeContentId: 'ch_long_01',
    activeNominalDuration: 30.0,
    activeElapsedSeconds: 18.4,
    activeRetentionPct: 61,
    decayCurveData: [],
    topicDistribution: { 'Biología Marina': 2, 'Cosmos': 2 },
    lastUpdated: Date.now(),
  };

  // Telemetry is emitted fire-and-forget in <5ms to localDataBus and background synced
  const startT = performance.now();
  publishSkinnerSession(record).catch(() => {});
  const latencyMs = performance.now() - startT;

  console.log(`  Telemetry dispatch latency: ${latencyMs.toFixed(3)} ms`);
  assert(latencyMs < 5.0, `Telemetry dispatch executes in < 5ms (actual: ${latencyMs.toFixed(3)} ms)`);

  // Verify bus holds latest record
  const currentBus = localDataBus.getLatestSkinnerSession();
  assert(
    currentBus?.sessionId === record.sessionId,
    'localDataBus holds genuine published session state'
  );

  // --------------------------------------------------------------------------
  // TEST 7: Decay Engine Content Progression
  // --------------------------------------------------------------------------
  console.log('\nTEST GROUP 7: Decay Engine Progression');
  const engine = new SkinnerDecayEngine('child', 7);
  const d0 = engine.selectNextContent(0);
  assert(d0.nominalDurationSeconds >= 30, `Scroll 0 duration is long-form (≥30s): ${d0.nominalDurationSeconds}s`);
  assert(d0.dopamineState === 'baseline', `Scroll 0 state is baseline: ${d0.dopamineState}`);

  const d5 = engine.selectNextContent(5);
  assert(
    d5.dopamineState === 'accelerated' || d5.dopamineState === 'jackpot',
    `Scroll 5 dopamine state is accelerated or jackpot: ${d5.dopamineState}`
  );
  assert(
    engine.getDopamineState(5, false) === 'accelerated',
    'Scroll 5 baseline dopamine state is accelerated'
  );
  assert(
    engine.getDopamineState(15, false) === 'hyper_fragmented',
    'Scroll 15 baseline dopamine state is hyper_fragmented'
  );

  const nonJackpotDuration = engine.calculateNominalDuration(15, false);
  assert(nonJackpotDuration < 20, `Non-jackpot scroll 15 decayed below 20s: ${nonJackpotDuration}s`);

  const floorDuration = engine.calculateNominalDuration(50, false);
  assert(floorDuration <= 6, `High-frequency scroll 50 reaches temporal floor: ${floorDuration}s`);

  console.log('\n======================================================');
  console.log(`SUMMARY: All ${passedTests}/${totalTests} tests PASSED (100%) ✓`);
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
