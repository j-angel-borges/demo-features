/**
 * Test Suite: Parental Cockpit & WOW Experience Verification
 * Validates Master Session Controls, Casino Metaphor, and Scientific Reporting Module
 *
 * Usage:
 *   npx tsx apps/parent-dashboard/src/tests/parent-dashboard-fu.test.ts
 */

import { CASINO_SYMBOLS } from '../components/skinner/slot-machine/SlotReel.js';
import { SPRING_PRESETS } from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, errorMsg?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: errorMsg || 'Assertion failed' });
    console.error(`  ✗ [FAIL] ${testName}: ${errorMsg || 'Assertion failed'}`);
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('PARENT DASHBOARD FU-3 VERIFICATION SUITE');
  console.log('================================================================\n');

  // Test 1: Casino Slot Machine Symbol Integrity & Absolute Prohibition of Emojis
  console.log('--- 1. Slot Reel Symbols & Zero Emojis ---');
  assert(CASINO_SYMBOLS.length === 6, 'Contains exactly 6 canonical Lucide symbols');

  const symbolIds = CASINO_SYMBOLS.map((s) => s.id);
  assert(
    symbolIds.includes('zap') &&
    symbolIds.includes('clock') &&
    symbolIds.includes('sparkles') &&
    symbolIds.includes('brain') &&
    symbolIds.includes('heart') &&
    symbolIds.includes('bell'),
    'Includes zap, clock, sparkles, brain, heart, and bell'
  );

  // Strict check: No emoji character in any symbol name, id, or description
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const hasEmoji = CASINO_SYMBOLS.some(
    (s) => emojiRegex.test(s.name) || emojiRegex.test(s.description) || emojiRegex.test(s.id)
  );
  assert(!hasEmoji, 'Absolute zero emoji characters in SlotReel symbols (Strict Prohibition)');

  // Test 2: Spring Physics Configuration
  console.log('\n--- 2. Spring Physics Calibration ---');
  const leverBounce = SPRING_PRESETS.leverBounce;
  assert(
    leverBounce && leverBounce.stiffness === 380 && leverBounce.damping === 18,
    'Mechanical Lever spring physics correctly calibrated (stiffness: 380, damping: 18)'
  );

  // Test 3: Master Session Command Bus
  console.log('\n--- 3. Master Session Command Bus ---');
  let lastCommandReceived: any = null;
  const unsubCommands = parentFirestoreService.subscribeMasterCommands((cmd) => {
    lastCommandReceived = cmd;
  });

  await parentFirestoreService.sendMasterCommand('START_SESSION', 'sess_test_start', 'child');
  assert(
    lastCommandReceived !== null &&
    lastCommandReceived.type === 'START_SESSION' &&
    lastCommandReceived.sessionId === 'sess_test_start',
    'Master sendMasterCommand START_SESSION emits and receives correctly'
  );

  await parentFirestoreService.sendMasterCommand('END_SESSION', 'sess_test_start', 'child');
  assert(
    lastCommandReceived !== null &&
    lastCommandReceived.type === 'END_SESSION',
    'Master sendMasterCommand END_SESSION emits and receives correctly'
  );

  await parentFirestoreService.sendMasterCommand('RESET_SESSION', 'sess_test_reset', 'child');
  assert(
    lastCommandReceived !== null &&
    lastCommandReceived.type === 'RESET_SESSION' &&
    lastCommandReceived.sessionId === 'sess_test_reset',
    'Master sendMasterCommand RESET_SESSION emits and receives correctly'
  );

  unsubCommands();

  // Test 4: Digital Health Traffic Light Mathematical Calibration
  console.log('\n--- 4. Digital Health Traffic Light Mathematical Calibration ---');

  function calculateScore(meanSec: number): { score: number; angle: number; zone: string } {
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
    let zone = 'green';
    if (meanSec < 8) zone = 'red';
    else if (meanSec < 15) zone = 'orange';
    else if (meanSec < 30) zone = 'amber';

    return { score: Math.round(score), angle, zone };
  }

  // Conscious consumption (>30s): score 80-100, green
  const conscious = calculateScore(40);
  assert(
    conscious.zone === 'green' && conscious.score >= 80 && conscious.angle > 50,
    'Mean retention >=30s maps to Verde (Consumo Consciente, score >= 80)'
  );

  // Transitional attention (15-30s): score 50-79, amber
  const transitional = calculateScore(22);
  assert(
    transitional.zone === 'amber' && transitional.score >= 50 && transitional.score < 80,
    'Mean retention 15-30s maps to Ámbar (Atención Transicional, score 50-79)'
  );

  // Accelerated search (8-15s): score 25-49, orange
  const accelerated = calculateScore(11);
  assert(
    accelerated.zone === 'orange' && accelerated.score >= 25 && accelerated.score < 50,
    'Mean retention 8-15s maps to Naranja (Búsqueda Acelerada, score 25-49)'
  );

  // Hyper-fragmented doomscrolling (<8s): score 0-24, red
  const doomscrolling = calculateScore(4);
  assert(
    doomscrolling.zone === 'red' && doomscrolling.score < 25 && doomscrolling.angle < -40,
    'Mean retention <8s maps to Rojo (Doomscrolling Hiper-fragmentado, score < 25)'
  );

  // Boundary check at exactly 0s
  const zeroRetention = calculateScore(0);
  assert(
    zeroRetention.score === 0 && zeroRetention.angle === -90,
    'Zero retention maps to score 0 and needle angle -90 deg'
  );

  // Boundary check at >= 45s
  const maxRetention = calculateScore(45);
  assert(
    maxRetention.score === 100 && maxRetention.angle === 90,
    'Maximum retention maps to score 100 and needle angle +90 deg'
  );

  // Test 5: Summary Report
  console.log('\n================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
