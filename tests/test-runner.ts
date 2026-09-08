/**
 * Zentry Commercial Demo Suite - Unified E2E Test Runner CLI
 * Executes Tier 1, Tier 2, Tier 3, and Tier 4 test suites with colored terminal reporting.
 *
 * Usage:
 *   npx tsx tests/test-runner.ts
 */

import { runAllSuites } from './fixtures/testHelper.js';

// Import all 6 test suites into registry
import './e2e/tier1-features.spec.js';
import './e2e/tier2-boundaries.spec.js';
import './e2e/tier3-combinations.spec.js';
import './e2e/tier4-scenarios.spec.js';
import './e2e/tier5-adversarial-hardening.spec.js';
import './e2e/tier6-followup.spec.js';
import './e2e/tier7-factor-wow-science.spec.js';
import './e2e/tier8-creative-wow.spec.js';

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  purpura: '\x1b[38;2;83;59;135m',
  lavanda: '\x1b[38;2;214;200;250m',
  menta: '\x1b[38;2;194;244;231m',
  glacial: '\x1b[38;2;235;241;245m',
  slate: '\x1b[38;2;74;81;96m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgPurpura: '\x1b[48;2;83;59;135m',
};

async function main() {
  console.log(`\n${colors.bgPurpura}${colors.white}${colors.bold}  ZENTRY COMMERCIAL DEMO SUITE — E2E TEST RUNNER  ${colors.reset}\n`);
  console.log(`${colors.lavanda}Target GCP Project: ${colors.menta}${colors.bold}quarz-group${colors.reset}`);
  console.log(`${colors.lavanda}Test Methodology:   ${colors.glacial}7-Tier Progressive Verification & Science Hardening (Opaque-Box)${colors.reset}`);
  console.log(`${colors.lavanda}Features Scope:     ${colors.glacial}F01–F19, Follow-up Acceptance (R1–R4) & Factor WOW Scientific (V1–V4)${colors.reset}\n`);

  const startTime = Date.now();
  const report = await runAllSuites();
  const totalElapsed = Date.now() - startTime;

  console.log(`${colors.bold}${colors.purpura}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.glacial}EXECUTION DETAILS BY TEST SUITE:${colors.reset}`);
  console.log(`${colors.bold}${colors.purpura}================================================================================${colors.reset}\n`);

  for (const suite of report.suites) {
    const passedInSuite = suite.tests.filter(t => t.status === 'passed').length;
    const failedInSuite = suite.tests.filter(t => t.status === 'failed').length;
    const suiteStatusColor = failedInSuite === 0 ? colors.green : colors.red;
    const icon = failedInSuite === 0 ? '✓' : '✗';

    console.log(`${suiteStatusColor}${colors.bold}  ${icon} ${suite.name}${colors.reset} ${colors.dim}(${passedInSuite}/${suite.tests.length} passed)${colors.reset}`);

    // Print failed tests if any
    for (const t of suite.tests) {
      if (t.status === 'failed') {
        console.log(`    ${colors.red}✗ ${t.name}${colors.reset}`);
        if (t.error) {
          console.log(`      ${colors.red}${colors.dim}${t.error}${colors.reset}`);
        }
      }
    }
  }

  console.log(`\n${colors.bold}${colors.purpura}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.glacial}TEST TIER SUMMARY MATRIX:${colors.reset}`);
  console.log(`${colors.bold}${colors.purpura}================================================================================${colors.reset}`);

  // Tier 1 Summary
  const tier1Suites = report.suites.filter(s => s.name.includes('Tier 1'));
  const tier1Tests = tier1Suites.flatMap(s => s.tests);
  const tier1Passed = tier1Tests.filter(t => t.status === 'passed').length;

  // Tier 2 Summary
  const tier2Suites = report.suites.filter(s => s.name.includes('Tier 2'));
  const tier2Tests = tier2Suites.flatMap(s => s.tests);
  const tier2Passed = tier2Tests.filter(t => t.status === 'passed').length;

  // Tier 3 Summary
  const tier3Suites = report.suites.filter(s => s.name.includes('Tier 3'));
  const tier3Tests = tier3Suites.flatMap(s => s.tests);
  const tier3Passed = tier3Tests.filter(t => t.status === 'passed').length;

  // Tier 4 Summary
  const tier4Suites = report.suites.filter(s => s.name.includes('Tier 4'));
  const tier4Tests = tier4Suites.flatMap(s => s.tests);
  const tier4Passed = tier4Tests.filter(t => t.status === 'passed').length;

  // Tier 5 Summary
  const tier5Suites = report.suites.filter(s => s.name.includes('Tier 5'));
  const tier5Tests = tier5Suites.flatMap(s => s.tests);
  const tier5Passed = tier5Tests.filter(t => t.status === 'passed').length;

  // Tier 6 Summary
  const tier6Suites = report.suites.filter(s => s.name.includes('Tier 6'));
  const tier6Tests = tier6Suites.flatMap(s => s.tests);
  const tier6Passed = tier6Tests.filter(t => t.status === 'passed').length;

  // Tier 7 Summary (Factor WOW & Science Contracts)
  const tier7Suites = report.suites.filter(s => s.name.includes('Tier 7'));
  const tier7Tests = tier7Suites.flatMap(s => s.tests);
  const tier7Passed = tier7Tests.filter(t => t.status === 'passed').length;

  // Tier 8 Summary (Creative WOW Studio & Mini-Apps)
  const tier8Suites = report.suites.filter(s => s.name.includes('Tier 8'));
  const tier8Tests = tier8Suites.flatMap(s => s.tests);
  const tier8Passed = tier8Tests.filter(t => t.status === 'passed').length;

  console.log(`  ${colors.menta}Tier 1 (Feature Isolation F01-F19):${colors.reset}      ${colors.bold}${tier1Passed}/${tier1Tests.length}${colors.reset} passed ${tier1Passed === tier1Tests.length && tier1Tests.length >= 95 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 2 (Boundary & Corner Cases):${colors.reset}        ${colors.bold}${tier2Passed}/${tier2Tests.length}${colors.reset} passed ${tier2Passed === tier2Tests.length && tier2Tests.length >= 95 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 3 (Pairwise Cross-Feature):${colors.reset}         ${colors.bold}${tier3Passed}/${tier3Tests.length}${colors.reset} passed ${tier3Passed === tier3Tests.length && tier3Tests.length >= 20 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 4 (Real-World Scenarios):${colors.reset}           ${colors.bold}${tier4Passed}/${tier4Tests.length}${colors.reset} passed ${tier4Passed === tier4Tests.length && tier4Tests.length >= 10 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 5 (Adversarial Coverage Hardening):${colors.reset} ${colors.bold}${tier5Passed}/${tier5Tests.length}${colors.reset} passed ${tier5Passed === tier5Tests.length && tier5Tests.length >= 30 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 6 (Commercial Follow-up R1-R4):${colors.reset}     ${colors.bold}${tier6Passed}/${tier6Tests.length}${colors.reset} passed ${tier6Passed === tier6Tests.length && tier6Tests.length >= 30 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 7 (Factor WOW Scientific V1-V4):${colors.reset}    ${colors.bold}${tier7Passed}/${tier7Tests.length}${colors.reset} passed ${tier7Passed === tier7Tests.length && tier7Tests.length >= 16 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`  ${colors.menta}Tier 8 (Creative WOW Studio & Apps):${colors.reset}     ${colors.bold}${tier8Passed}/${tier8Tests.length}${colors.reset} passed ${tier8Passed === tier8Tests.length && tier8Tests.length >= 10 ? colors.green + '✓' : colors.yellow + '!'}${colors.reset}`);
  console.log(`${colors.purpura}--------------------------------------------------------------------------------${colors.reset}`);
  console.log(`  ${colors.bold}${colors.glacial}TOTAL VERIFIED TEST CASES:${colors.reset}               ${colors.bold}${report.passed}/${report.total}${colors.reset} passed in ${colors.cyan}${totalElapsed}ms${colors.reset}`);

  if (report.failed === 0 && report.total >= 310) {
    console.log(`\n${colors.green}${colors.bold}  ★ ALL TEST TIERS (1-8) PASSED WITH 100% SUCCESS RATE (HARNESS INTEGRITY CONFIRMED) ★  ${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}  ✖ SOME TESTS FAILED OR COVERAGE THRESHOLD NOT MET (Failed: ${report.failed}, Total: ${report.total}) ✖  ${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Fatal test runner error:${colors.reset}`, err);
  process.exit(1);
});
