# Project: Zentry Commercial Demo Suite (3 Interconnected Micro-PWAs)

## Architecture
The project is organized as a clean, performant TypeScript monorepo containing 3 independent micro-PWAs and a shared packages layer, configured for multi-site deployment to Firebase Hosting under the GCP `quarz-group` project.

```
demo-features/
├── apps/
│   ├── isla-dinamica/       # Micro-PWA 1: Dynamic Island Multimodal Vision & Voice (zentry-island-demo.web.app)
│   ├── skinner-box/         # Micro-PWA 2: Operant Conditioning Variable-Ratio Simulator (zentry-skinner-demo.web.app)
│   └── parent-dashboard/    # Micro-PWA 3: Parent Observer Live Cockpit & Feature Hub (zentry-parent-demo.web.app)
├── packages/
│   └── shared/              # Shared Types, Zentry DNA Design Tokens, Firebase Config & Mock Utilities
├── tests/                   # 5-Tier E2E & Adversarial Hardening Test Suite (252 passing tests)
├── firebase.json            # Multi-site hosting targets, Firestore rules, and rewrites
├── firestore.rules          # Security rules for collections: sessions_skinner, island_telemetry, devices_live, documents
└── package.json             # Root workspace orchestration
```

### Global Data Flow & Real-Time Sync
- **Isla Dinámica** captures live camera streams, streams frames to Gemini 2.5 Flash (GCP `quarz-group` with `<800ms` low-latency, `thinkingBudget: 0`), speaks in Spanish via speech synthesis, and publishes telemetry events to Firestore `island_telemetry` and `devices_live`.
- **Skinner Box** simulates operant conditioning habituation loops with mathematical temporal decay ($45\text{s} \to 5\text{s}$ with VR-7 variable-ratio jackpots), tracks scroll odometer, retention %, velocity RPM, and writes live updates to Firestore `sessions_skinner`.
- **Dashboard Parental** maintains the child profile and document vault while subscribing in real-time (`onSnapshot`) to `sessions_skinner` and `island_telemetry`, visualizing live telemetry without page reloads.

---

## Feature Inventory
| # | Feature ID | Name | Description | Assigned Milestone | Status |
|---|------------|------|-------------|-------------------|--------|
| 1 | F01 | Zentry DNA Tokens & Theme | Canonical palette (Púrpura #533B87, Lavanda #D6C8FA, Menta #C2F4E7, Glacial #EBF1F5, Slate #4A5160, Dark #080D1A) and Tailwind v4 setup. | M1 | DONE |
| 2 | F02 | Liquid Glass Physics & Optics | Optical lens styling (`backdrop-filter: blur(28px)`), specular borders, and spring physics transitions. | M1 | DONE |
| 3 | F03 | Multi-Site Firebase & Firestore Config | `firebase.json` multi-target setup (`zentry-island-demo`, `zentry-skinner-demo`, `zentry-parent-demo`) and Firestore client. | M1 | DONE |
| 4 | F04 | Dynamic Island Container & Morphing | Mobile/tablet locked container with fluid 60fps expand/collapse spring bounce physics triggered by camera icon. | M2 | DONE |
| 5 | F05 | Triple Camera Switcher & BeReal PiP | Conmutation between Rear (environment), Front (user), and Dual BeReal PiP (with rapid-snap Canvas Compositor fallback). | M2 | DONE |
| 6 | F06 | Gemini 2.5 Flash Live Multimodal Agent | Sub-800ms low-latency voice/vision session (no thinking mode), periodic frame capture, and synthesized Spanish voice output. | M2 | DONE |
| 7 | F07 | Corner Tool: Landscape Enhancer/Stylizer | Frame capture with generative enhancement or Comic, Pixel Art, 3D Videogame, Spatial style transfer. | M2 | DONE |
| 8 | F08 | Corner Tool: Touch-to-Explain Socratic Point | Frame freeze with interactive spatial tap coordinates for grounded AI object recognition and concise explanation. | M2 | DONE |
| 9 | F09 | Corner Tool: Scene Redesign Deliberator | Scene recognition with 2 actionable transformation options (Architectural vs Futuristic 3D Cyber). | M2 | DONE |
| 10 | F10 | Isla Telemetry Firestore Publisher | Real-time logging of tool invocations, AI queries, and device state to `island_telemetry`. | M2 | DONE |
| 11 | F11 | Operant Conditioning Variable-Ratio Engine | Scroll event lever-press simulation with dopamine habituation feedback and haptic/audio pulse. | M3 | DONE |
| 12 | F12 | Dynamic Temporal Decay Curve | Progressive duration drop ($45\text{s} \to 5\text{s}$) based on scroll count with intermittent VR-7 jackpot rewards. | M3 | DONE |
| 13 | F13 | Dual Catalog (Child vs Adult) | Curated educational to hyper-fragmented content matrix for Child and Adult modes with 60fps procedural Canvas animations. | M3 | DONE |
| 14 | F14 | Skinner Session Telemetry & Persistence | Session start/end controls, retention % calculation, 100% completion counter, velocity RPM, and Firestore writing to `sessions_skinner`. | M3 | DONE |
| 15 | F15 | Parental Profile & Family Document Vault | Child profile card (`Mateo Quispe`) and 4-category searchable family document vault based on `zentry-parent-dashboard`. | M4 | DONE |
| 16 | F16 | Live Observador: Skinner Telemetry Widgets | Real-time reactive widgets: Digital Odometer, Radial Retention Ring, Velocity Tachometer RPM, and Animated Decay Chart. | M4 | DONE |
| 17 | F17 | Live Observador: Isla Telemetry Cards | Real-time tool usage breakdown, spatial touch point coordinates viewer, generative transformation cards, and live log. | M4 | DONE |
| 18 | F18 | Multi-Device Real-Time Sync | Firestore `onSnapshot` subscriptions providing instant reactive UI updates across separate devices/tabs. | M4 | DONE |
| 19 | F19 | Multi-Site Production Build & Manifests | Production bundles, PWA manifests, icons, and deployment ready for Firebase Hosting `.web.app`. | M5 | DONE |
| 20 | F20 | Opaque-Box E2E Testing Suite (Tiers 1-4) | Comprehensive 4-tier test harness validating all 19 features independently. | E2E-Track | DONE |
| 21 | F21 | Adversarial Coverage Hardening (Tier 5) | White-box stress testing, chaos telemetry injection, camera permission edge cases, and network drop recovery. | M5/Audit | DONE |

---

## Milestones
| # | Name | Scope | Dependencies | Status | Write Ownership | Key Outputs |
|---|------|-------|-------------|--------|-----------------|-------------|
| M1 | Core Foundation & Multi-Site Config | Workspace monorepo, `packages/shared` (types, tokens, firebase config), `firebase.json`, `firestore.rules`, root scripts. | none | DONE | `packages/shared/*`, `firebase.json`, `firestore.rules`, `package.json` | Clean build `npm run build:shared` |
| M2 | Micro-PWA 1: Isla Dinámica Multimodal | `apps/isla-dinamica`: Dynamic island container, camera switcher, BeReal PiP, Gemini 2.5 Flash multimodal stream, 3 corner action tools, Firestore publisher. | M1 | DONE | `apps/isla-dinamica/*` | Clean build `npm run build` |
| M3 | Micro-PWA 2: Skinner Box Simulator | `apps/skinner-box`: Operant VR engine, temporal decay curve, Child/Adult catalog, procedural canvas animations, session lifecycle, Firestore publisher. | M1 | DONE | `apps/skinner-box/*` | Clean build `npm run build:skinner` |
| M4 | Micro-PWA 3: Dashboard Parental Observador | `apps/parent-dashboard`: Child profile card, Document vault, Real-time Skinner widgets (Odometer, Gauge, RPM, Chart), Real-time Isla widgets, `onSnapshot` listeners. | M1, M2, M3 | DONE | `apps/parent-dashboard/*` | Clean build `npx vite build` |
| M5 | Multi-Site Build, Hosting & Final Polish | Unified build verification, PWA manifests, deployment target verification, E2E test pass (252/252 tests), adversarial hardening (Tier 5), and Forensic Integrity Audit (CLEAN). | M2, M3, M4, E2E-Track | DONE | Monorepo integration | 100% Verified Production Suite |

---

## Interface Contracts

### 1. Firestore Collection: `sessions_skinner`
```typescript
export interface SkinnerSessionRecord {
  sessionId: string;
  userId: string;
  targetProfile: 'child' | 'adult';
  status: 'active' | 'completed';
  startTime: number;
  endTime?: number;
  totalScrolls: number;
  totalDurationSeconds: number;
  averageRetentionPct: number;
  completedItemsCount: number;
  currentScrollVelocity: number; // scrolls per minute
  activeContentId: string;
  activeNominalDuration: number;
  activeElapsedSeconds: number;
  activeRetentionPct: number;
  decayCurveData: Array<{
    scrollIndex: number;
    nominalDurationSeconds: number;
    actualViewSeconds: number;
    retentionPct: number;
    isJackpot: boolean;
    timestamp: number;
  }>;
  topicDistribution: Record<string, number>;
  lastUpdated: number;
}
```

### 2. Firestore Collection: `island_telemetry`
```typescript
export interface IslandTelemetryEvent {
  eventId: string;
  deviceId: string;
  timestamp: number;
  cameraMode: 'environment' | 'user' | 'dual_bereal';
  activeAction?: 'landscape' | 'touch_explain' | 'scene_redesign';
  touchCoordinates?: { x: number; y: number };
  aiPrompt?: string;
  aiResponse?: string;
  generativeStyle?: 'enhanced' | 'comic' | 'pixel_art' | 'videogame' | 'spatial';
  redesignOptions?: Array<{ title: string; description: string; style: string }>;
  frameSnapshotUrl?: string; // base64 or storage url
}
```

### 3. Firestore Collection: `devices_live`
```typescript
export interface DeviceLiveStatus {
  deviceId: string;
  appName: 'isla-dinamica' | 'skinner-box' | 'parent-dashboard';
  isOnline: boolean;
  lastHeartbeat: number;
  activeSessionId?: string;
}
```
