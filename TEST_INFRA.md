# E2E Test Infra: Zentry Commercial Demo Suite

## Test Philosophy
- **Opaque-box & Requirement-Driven**: Tests are derived strictly from `ORIGINAL_REQUEST.md` and user-facing acceptance criteria, executing against public interfaces, DOM behaviors, and real-time Firestore contracts without coupling to private implementation internals.
- **Methodology**: 4-Tier Progressive Verification using Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Commercial Workload Simulation.
- **Progressive Testability**: Verification does not depend on unbuilt features. Tier 1 establishes basic feature existence; Tiers 2-4 stress-test limits, multi-device sync, and full-fidelity workflows.

---

## Feature Inventory Mapping
| # | Feature ID | Feature Name | Tier 1 (Isolation) | Tier 2 (Boundary) | Tier 3 (Cross) | Tier 4 (Scenario) |
|---|------------|--------------|:------------------:|:-----------------:|:--------------:|:-----------------:|
| 1 | F01 | Zentry DNA Tokens & Theme | 5 | 5 | ✓ | ✓ |
| 2 | F02 | Liquid Glass Optics & Physics | 5 | 5 | ✓ | ✓ |
| 3 | F03 | Multi-Site Firebase & Firestore Config | 5 | 5 | ✓ | ✓ |
| 4 | F04 | Dynamic Island Container & Morphing | 5 | 5 | ✓ | ✓ |
| 5 | F05 | Triple Camera Switcher & BeReal PiP | 5 | 5 | ✓ | ✓ |
| 6 | F06 | Gemini 2.5 Flash Live Multimodal Agent | 5 | 5 | ✓ | ✓ |
| 7 | F07 | Corner Tool: Landscape Enhancer/Stylizer | 5 | 5 | ✓ | ✓ |
| 8 | F08 | Corner Tool: Touch-to-Explain Socratic Point | 5 | 5 | ✓ | ✓ |
| 9 | F09 | Corner Tool: Scene Redesign Deliberator | 5 | 5 | ✓ | ✓ |
| 10 | F10 | Isla Telemetry Firestore Publisher | 5 | 5 | ✓ | ✓ |
| 11 | F11 | Operant Conditioning Variable-Ratio Engine | 5 | 5 | ✓ | ✓ |
| 12 | F12 | Dynamic Temporal Decay Curve | 5 | 5 | ✓ | ✓ |
| 13 | F13 | Dual Catalog (Child vs Adult) | 5 | 5 | ✓ | ✓ |
| 14 | F14 | Skinner Session Telemetry & Persistence | 5 | 5 | ✓ | ✓ |
| 15 | F15 | Parental Profile & Family Document Vault | 5 | 5 | ✓ | ✓ |
| 16 | F16 | Live Observador: Skinner Telemetry Widgets | 5 | 5 | ✓ | ✓ |
| 17 | F17 | Live Observador: Isla Telemetry Cards | 5 | 5 | ✓ | ✓ |
| 18 | F18 | Multi-Device Real-Time Sync | 5 | 5 | ✓ | ✓ |
| 19 | F19 | Multi-Site Production Build & Manifests | 5 | 5 | ✓ | ✓ |

---

## Test Architecture & Structure
```
tests/
├── e2e/
│   ├── tier1-features.spec.ts       # 95 tests: ≥5 tests per feature in isolation
│   ├── tier2-boundaries.spec.ts     # 95 tests: Corner cases, limits, zero states, rapid transitions
│   ├── tier3-combinations.spec.ts   # 20 tests: Pairwise feature interactions & cross-app state flow
│   └── tier4-scenarios.spec.ts      # 10 tests: End-to-end commercial demo scenarios & stress runs
├── fixtures/
│   ├── mockFirestore.ts             # Realistic Firestore mock & event emitter for headless testing
│   ├── mockMediaDevices.ts          # Simulated camera streams (Rear, Front, Dual)
│   └── mockGemini.ts                # Ultra-fast mock Gemini 2.5 Flash low-latency streaming
└── test-runner.ts                   # Unified CLI runner with TAP/JSON output and exit code 0/1
```

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario Name | Features Exercised | Complexity |
|---|---------------|--------------------|------------|
| 1 | Commercial Demo Walkthrough: Isla Dinámica | F01, F02, F04, F05, F06, F07, F08, F09, F10 | High |
| 2 | Operant Habituation Run: Skinner Box Decay & Jackpots | F01, F02, F11, F12, F13, F14 | High |
| 3 | Dual-Device Live Observador Sync: Skinner → Dashboard | F11, F12, F14, F15, F16, F18 | High |
| 4 | Dual-Device Live Observador Sync: Isla → Dashboard | F04, F07, F08, F09, F10, F15, F17, F18 | High |
| 5 | Full 3-PWA Commercial Presentation Cycle | F01–F19 (All Features) | Critical |

---

## Coverage Thresholds
- **Tier 1 (Feature Isolation)**: 95 test cases (5 × 19 features)
- **Tier 2 (Boundary & Corner Cases)**: 95 test cases (5 × 19 features)
- **Tier 3 (Cross-Feature Pairwise)**: 20 test cases
- **Tier 4 (Real-World Scenarios)**: 10 scenario suites
- **Total Test Suite**: ≥220 test cases with 100% pass rate.
