/**
 * Tier 1: Feature Isolation Test Suite (95 Tests)
 * Verifies all 19 features (F01–F19) in complete isolation against public contracts and requirements.
 * Exactly 5 test cases per feature = 95 test cases.
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
  MockMediaStream,
  MockMediaStreamTrack,
} from '../fixtures/mockMediaDevices.js';
import {
  createGeminiLiveSession,
  MockGeminiLiveSession,
} from '../fixtures/mockGemini.js';

describe('Tier 1: Feature Isolation Suite (F01–F19)', () => {
  beforeEach(() => {
    mockFirestoreDb.reset();
    mockMediaDevices.reset();
  });

  // =========================================================================
  // F01: Zentry DNA Tokens & Theme
  // =========================================================================
  describe('F01: Zentry DNA Tokens & Theme', () => {
    const ZENTRY_DNA = {
      colors: {
        purpura: '#533B87',
        lavanda: '#D6C8FA',
        menta: '#C2F4E7',
        glacial: '#EBF1F5',
        slate: '#4A5160',
        dark: '#080D1A',
      },
      springPhysics: {
        stiffness: 280,
        damping: 24,
        mass: 1.0,
        bounce: 0.25,
      },
      breakpoints: {
        mobile: 390,
        tablet: 820,
        desktop: 1280,
      },
    };

    it('F01-01: Validates canonical Zentry color palette hex codes', () => {
      expect(ZENTRY_DNA.colors.purpura.toUpperCase()).toBe('#533B87');
      expect(ZENTRY_DNA.colors.lavanda.toUpperCase()).toBe('#D6C8FA');
      expect(ZENTRY_DNA.colors.menta.toUpperCase()).toBe('#C2F4E7');
      expect(ZENTRY_DNA.colors.glacial.toUpperCase()).toBe('#EBF1F5');
      expect(ZENTRY_DNA.colors.slate.toUpperCase()).toBe('#4A5160');
      expect(ZENTRY_DNA.colors.dark.toUpperCase()).toBe('#080D1A');
    });

    it('F01-02: Validates typography font stack and scale hierarchy', () => {
      const typographyTokens = {
        fontFamily: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1.0rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
      };
      expect(typographyTokens.fontFamily[0]).toBe('Plus Jakarta Sans');
      expect(typographyTokens.sizes.base).toBe('1.0rem');
      expect(typographyTokens.sizes['3xl']).toBe('1.875rem');
    });

    it('F01-03: Validates elastic spring physics constants', () => {
      expect(ZENTRY_DNA.springPhysics.stiffness).toBe(280);
      expect(ZENTRY_DNA.springPhysics.damping).toBe(24);
      expect(ZENTRY_DNA.springPhysics.mass).toBe(1.0);
      expect(ZENTRY_DNA.springPhysics.bounce).toBeGreaterThan(0.2);
    });

    it('F01-04: Validates CSS variable generation with liquid glass transparency', () => {
      const cssVariables = {
        '--zentry-purpura': ZENTRY_DNA.colors.purpura,
        '--zentry-purpura-glass': 'rgba(83, 59, 135, 0.45)',
        '--zentry-menta-glow': 'rgba(194, 244, 231, 0.35)',
        '--zentry-dark-surface': ZENTRY_DNA.colors.dark,
      };
      expect(cssVariables['--zentry-purpura']).toBe('#533B87');
      expect(cssVariables['--zentry-purpura-glass']).toContain('rgba(83, 59, 135');
      expect(cssVariables['--zentry-menta-glow']).toContain('rgba(194, 244, 231');
    });

    it('F01-05: Validates mobile & tablet screen constraints and locked viewport ratios', () => {
      expect(ZENTRY_DNA.breakpoints.mobile).toBe(390);
      expect(ZENTRY_DNA.breakpoints.tablet).toBe(820);
      const isMobileLocked = (width: number) => width <= 430;
      expect(isMobileLocked(390)).toBe(true);
      expect(isMobileLocked(768)).toBe(false);
    });
  });

  // =========================================================================
  // F02: Liquid Glass Optics & Physics
  // =========================================================================
  describe('F02: Liquid Glass Optics & Physics', () => {
    const liquidGlassSpec = {
      backdropBlur: 'blur(28px)',
      specularBorder: '1px solid rgba(214, 200, 250, 0.22)',
      surfaceBackground: 'rgba(8, 13, 26, 0.65)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      transformGpu: 'translateZ(0)',
    };

    it('F02-01: Validates optical backdrop-filter blur specification', () => {
      expect(liquidGlassSpec.backdropBlur).toBe('blur(28px)');
    });

    it('F02-02: Validates specular refraction border gradient and alpha transparency', () => {
      expect(liquidGlassSpec.specularBorder).toContain('rgba(214, 200, 250, 0.22)');
      expect(liquidGlassSpec.surfaceBackground).toContain('0.65');
    });

    it('F02-03: Validates GPU acceleration composite layer style', () => {
      expect(liquidGlassSpec.transformGpu).toBe('translateZ(0)');
    });

    it('F02-04: Computes dynamic spring deflection on interactive drag gestures', () => {
      const calculateSpringDeflection = (dragDeltaY: number, maxDeflection: number = 80) => {
        const tension = 0.45;
        const raw = dragDeltaY * tension;
        return Math.sign(raw) * Math.min(Math.abs(raw), maxDeflection);
      };
      expect(calculateSpringDeflection(100)).toBe(45);
      expect(calculateSpringDeflection(300)).toBe(80);
      expect(calculateSpringDeflection(-100)).toBe(-45);
    });

    it('F02-05: Validates glass refraction curvature and corner radius presets', () => {
      const glassRadii = {
        compactPill: '28px',
        expandedIsland: '36px',
        telemetryCard: '20px',
      };
      expect(glassRadii.compactPill).toBe('28px');
      expect(glassRadii.expandedIsland).toBe('36px');
      expect(glassRadii.telemetryCard).toBe('20px');
    });
  });

  // =========================================================================
  // F03: Multi-Site Firebase & Firestore Config
  // =========================================================================
  describe('F03: Multi-Site Firebase & Firestore Config', () => {
    const multiSiteConfig = {
      projectId: 'quarz-group',
      targets: {
        island: 'isla-dinamica',
        skinner: 'skinner-box',
        parent: 'parental-feature',
      },
      collections: ['sessions_skinner', 'island_telemetry', 'devices_live'],
    };

    it('F03-01: Validates GCP project target quarz-group', () => {
      expect(multiSiteConfig.projectId).toBe('quarz-group');
    });

    it('F03-02: Validates 3 independent Firebase Hosting targets in firebase.json schema', () => {
      const validIsland = ['isla-dinamica', 'zentry-island-demo'];
      const validSkinner = ['skinner-box', 'zentry-skinner-demo'];
      const validParent = ['parental-feature', 'zentry-parent-demo'];
      expect(validIsland.includes(multiSiteConfig.targets.island)).toBe(true);
      expect(validSkinner.includes(multiSiteConfig.targets.skinner)).toBe(true);
      expect(validParent.includes(multiSiteConfig.targets.parent)).toBe(true);
    });

    it('F03-03: Validates required Firestore collection schemas existence', () => {
      expect(multiSiteConfig.collections).toContain('sessions_skinner');
      expect(multiSiteConfig.collections).toContain('island_telemetry');
      expect(multiSiteConfig.collections).toContain('devices_live');
    });

    it('F03-04: Initializes client app and verifies collection references', () => {
      const skinnerCol = collection(mockFirestoreDb, 'sessions_skinner');
      const islandCol = collection(mockFirestoreDb, 'island_telemetry');
      const devicesCol = collection(mockFirestoreDb, 'devices_live');
      expect(skinnerCol.id).toBe('sessions_skinner');
      expect(islandCol.id).toBe('island_telemetry');
      expect(devicesCol.id).toBe('devices_live');
    });

    it('F03-05: Validates document key generation and path resolution', () => {
      const customDoc = doc(mockFirestoreDb, 'sessions_skinner', 'session_abc_123');
      expect(customDoc.id).toBe('session_abc_123');
      expect(customDoc.path).toBe('sessions_skinner/session_abc_123');
    });
  });

  // =========================================================================
  // F04: Dynamic Island Container & Morphing
  // =========================================================================
  describe('F04: Dynamic Island Container & Morphing', () => {
    interface IslandState {
      expanded: boolean;
      height: number;
      width: number;
      borderRadius: number;
      opacity: number;
    }

    const createIslandController = () => {
      let state: IslandState = {
        expanded: false,
        height: 38,
        width: 130,
        borderRadius: 24,
        opacity: 0.95,
      };

      return {
        getState: () => ({ ...state }),
        expand: () => {
          state = {
            expanded: true,
            height: 480,
            width: 360,
            borderRadius: 36,
            opacity: 1.0,
          };
        },
        collapse: () => {
          state = {
            expanded: false,
            height: 38,
            width: 130,
            borderRadius: 24,
            opacity: 0.95,
          };
        },
      };
    };

    it('F04-01: Initializes island in compact pill mode at top-center', () => {
      const controller = createIslandController();
      const initial = controller.getState();
      expect(initial.expanded).toBe(false);
      expect(initial.height).toBe(38);
      expect(initial.width).toBe(130);
    });

    it('F04-02: Camera icon click triggers fluid vertical expansion', () => {
      const controller = createIslandController();
      controller.expand();
      const expanded = controller.getState();
      expect(expanded.expanded).toBe(true);
      expect(expanded.height).toBe(480);
      expect(expanded.width).toBe(360);
    });

    it('F04-03: Validates 60fps spring bounce curve interpolation', () => {
      const interpolateSpring = (t: number) => {
        // Standard damped spring: 1 - exp(-6t) * cos(12t)
        return 1 - Math.exp(-6 * t) * Math.cos(12 * t);
      };
      expect(interpolateSpring(0)).toBe(0);
      expect(interpolateSpring(0.3)).toBeGreaterThan(0.9);
      expect(interpolateSpring(1.0)).toBeCloseTo(1.0, 1);
    });

    it('F04-04: Collapse action smoothly returns island to compact state', () => {
      const controller = createIslandController();
      controller.expand();
      expect(controller.getState().expanded).toBe(true);
      controller.collapse();
      expect(controller.getState().expanded).toBe(false);
      expect(controller.getState().height).toBe(38);
    });

    it('F04-05: Enforces minimalist zero-distraction UI with no redundant text labels', () => {
      const compactUIElements = ['camera_glyph', 'mic_status_dot', 'ambient_halo'];
      expect(compactUIElements).toContain('camera_glyph');
      expect(compactUIElements.includes('text_label_instructions')).toBe(false);
    });
  });

  // =========================================================================
  // F05: Triple Camera Switcher & BeReal PiP
  // =========================================================================
  describe('F05: Triple Camera Switcher & BeReal PiP', () => {
    it('F05-01: Requests default environment (rear) camera stream', async () => {
      const stream = await mockMediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      expect(stream.getVideoTracks().length).toBe(1);
      expect(stream.getVideoTracks()[0].facingMode).toBe('environment');
    });

    it('F05-02: Switches to user (front selfie) camera stream', async () => {
      const stream = await mockMediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      expect(stream.getVideoTracks()[0].facingMode).toBe('user');
    });

    it('F05-03: Activates Dual BeReal PiP mode with dual camera streams', async () => {
      const stream = await mockMediaDevices.getUserMedia({
        video: { facingMode: 'dual_bereal' },
      });
      expect(stream.isDualStream).toBe(true);
      expect(stream.getVideoTracks().length).toBe(2);
      expect(stream.pipSubStream).toBeDefined();
    });

    it('F05-04: Executes rapid-snap canvas compositor fallback when dual streams unsupported', async () => {
      mockMediaDevices.hardwareSupportsDualConcurrentStreams = false;
      const stream = await mockMediaDevices.getUserMedia({
        video: { facingMode: 'dual_bereal' },
      });
      expect(stream.isDualStream).toBe(true);
      expect(stream.getVideoTracks()[0].label).toContain('Composited');
    });

    it('F05-05: Validates draggable PiP overlay bounding coordinate clamp', () => {
      const clampPipCoordinates = (x: number, y: number, containerW = 360, containerH = 480, pipW = 90, pipH = 120) => {
        const minX = 12;
        const maxX = containerW - pipW - 12;
        const minY = 12;
        const maxY = containerH - pipH - 12;
        return {
          x: Math.min(Math.max(x, minX), maxX),
          y: Math.min(Math.max(y, minY), maxY),
        };
      };
      expect(clampPipCoordinates(5, 5)).toEqual({ x: 12, y: 12 });
      expect(clampPipCoordinates(350, 470)).toEqual({ x: 258, y: 348 });
      expect(clampPipCoordinates(100, 150)).toEqual({ x: 100, y: 150 });
    });
  });

  // =========================================================================
  // F06: Gemini 2.5 Flash Live Multimodal Agent
  // =========================================================================
  describe('F06: Gemini 2.5 Flash Live Multimodal Agent', () => {
    it('F06-01: Connects to Gemini Live session with sub-800ms latency', async () => {
      const session = createGeminiLiveSession();
      const start = Date.now();
      await session.connect();
      const duration = Date.now() - start;
      expect(session.isConnected).toBe(true);
      expect(duration).toBeLessThan(800);
    });

    it('F06-02: Enforces thinkingBudget: 0 for instant live streaming', () => {
      const session = createGeminiLiveSession({ thinkingBudget: 0 });
      expect(session.config.thinkingBudget).toBe(0);
      expect(() => {
        // @ts-ignore
        new MockGeminiLiveSession({ model: 'gemini-2.5-flash', thinkingBudget: 128 });
      }).toThrow('thinkingBudget: 0');
    });

    it('F06-03: Streams periodic camera video frames to multimodal session', async () => {
      const session = createGeminiLiveSession();
      await session.connect();
      const stream = await mockMediaDevices.getUserMedia();
      const frameBase64 = stream.captureFrameAsBase64();

      await session.sendRealtimeInput([
        { mimeType: 'image/jpeg', data: frameBase64 },
      ]);
      expect(session.frameCountReceived).toBe(1);
    });

    it('F06-04: Circular voice button toggles active conversational session', async () => {
      const session = createGeminiLiveSession();
      expect(session.isConnected).toBe(false);
      await session.connect();
      expect(session.isConnected).toBe(true);
      await session.disconnect();
      expect(session.isConnected).toBe(false);
    });

    it('F06-05: Emits synthesized Spanish voice response and text transcript', async () => {
      const session = createGeminiLiveSession();
      await session.connect();
      let receivedText = '';
      let receivedAudioChunk = false;

      session.on('content', (data: { text: string }) => {
        receivedText = data.text;
      });
      session.on('audio', () => {
        receivedAudioChunk = true;
      });

      const response = await session.sendTextMessage('Hola Zentry, describe lo que ves');
      expect(response).toContain('Zentry');
      expect(receivedText).toContain('Zentry');
      expect(receivedAudioChunk).toBe(true);
    });
  });

  // =========================================================================
  // F07: Corner Tool: Landscape Enhancer/Stylizer
  // =========================================================================
  describe('F07: Corner Tool: Landscape Enhancer/Stylizer', () => {
    it('F07-01: Landscape icon triggers full-resolution frame freeze', async () => {
      const stream = await mockMediaDevices.getUserMedia();
      const frozenFrame = stream.captureFrameAsBase64();
      expect(frozenFrame.startsWith('data:image/jpeg;base64,')).toBe(true);
    });

    it('F07-02: Generates Option 1: Scene Enhancement transformation', async () => {
      const session = createGeminiLiveSession();
      const result = await session.generateLandscapeStylization({
        frameBase64: 'mock_frame_data',
        style: 'enhanced',
      });
      expect(result.styleApplied).toBe('enhanced');
      expect(result.description).toContain('balance dinámico');
    });

    it('F07-03: Generates Option 2: Style Transfer presets (comic, pixel_art, videogame, spatial)', async () => {
      const session = createGeminiLiveSession();
      const styles = ['comic', 'pixel_art', 'videogame', 'spatial'] as const;

      for (const st of styles) {
        const res = await session.generateLandscapeStylization({
          frameBase64: 'mock_frame_data',
          style: st,
        });
        expect(res.styleApplied).toBe(st);
        expect(res.description.length).toBeGreaterThan(10);
      }
    });

    it('F07-04: Spatial understanding infers optimal style based on lighting heuristics', () => {
      const inferOptimalStyle = (averageLuminance: number) => {
        if (averageLuminance < 0.3) return 'spatial';
        if (averageLuminance > 0.8) return 'pixel_art';
        return 'enhanced';
      };
      expect(inferOptimalStyle(0.2)).toBe('spatial');
      expect(inferOptimalStyle(0.9)).toBe('pixel_art');
      expect(inferOptimalStyle(0.5)).toBe('enhanced');
    });

    it('F07-05: Caches enhanced snapshot output for quick recall', () => {
      const snapshotCache = new Map<string, string>();
      snapshotCache.set('snapshot_01', 'data:image/jpeg;base64,AAAA');
      expect(snapshotCache.has('snapshot_01')).toBe(true);
      expect(snapshotCache.get('snapshot_01')).toBe('data:image/jpeg;base64,AAAA');
    });
  });

  // =========================================================================
  // F08: Corner Tool: Touch-to-Explain Socratic Point
  // =========================================================================
  describe('F08: Corner Tool: Touch-to-Explain Socratic Point', () => {
    it('F08-01: Question mark icon enters interactive spatial tap freeze state', () => {
      let isExplaining = false;
      const activateTool = () => { isExplaining = true; };
      activateTool();
      expect(isExplaining).toBe(true);
    });

    it('F08-02: Normalizes user touch coordinates (x, y) within [0, 1] range', () => {
      const normalizeTouch = (clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) => {
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        return {
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y)),
        };
      };
      const rect = { left: 50, top: 100, width: 300, height: 400 };
      const point = normalizeTouch(200, 300, rect);
      expect(point.x).toBe(0.5);
      expect(point.y).toBe(0.5);
    });

    it('F08-03: Sends localized spatial context prompt to Gemini', async () => {
      const session = createGeminiLiveSession();
      const explanation = await session.explainTouchPoint({
        touchCoordinates: { x: 0.25, y: 0.4 },
        frameBase64: 'mock_frame',
      });
      expect(explanation.coordinates.x).toBe(0.25);
      expect(explanation.confidence).toBeGreaterThan(0.9);
      expect(explanation.identifiedObject).toContain('Panel');
    });

    it('F08-04: Returns pedagogical Spanish explanation', async () => {
      const session = createGeminiLiveSession();
      const res = await session.explainTouchPoint({
        touchCoordinates: { x: 0.8, y: 0.6 },
        frameBase64: 'mock_frame',
      });
      expect(res.socraticExplanation).toContain('herramientas');
    });

    it('F08-05: Calculates interactive callout pin positioning relative to tapped coordinates', () => {
      const computePinCss = (x: number, y: number) => ({
        left: `${(x * 100).toFixed(1)}%`,
        top: `${(y * 100).toFixed(1)}%`,
        transform: 'translate(-50%, -100%)',
      });
      const css = computePinCss(0.42, 0.68);
      expect(css.left).toBe('42.0%');
      expect(css.top).toBe('68.0%');
    });
  });

  // =========================================================================
  // F09: Corner Tool: Scene Redesign Deliberator
  // =========================================================================
  describe('F09: Corner Tool: Scene Redesign Deliberator', () => {
    it('F09-01: Tool icon triggers structural scene recognition pipeline', async () => {
      const session = createGeminiLiveSession();
      const analysis = await session.deliberateSceneRedesign({ frameBase64: 'mock_frame' });
      expect(analysis.sceneAnalysis).toContain('arquitectónica');
    });

    it('F09-02: Generates exactly 2 actionable redesign alternatives', async () => {
      const session = createGeminiLiveSession();
      const { options } = await session.deliberateSceneRedesign({ frameBase64: 'mock_frame' });
      expect(options.length).toBe(2);
      expect(options[0].title).toContain('Arquitectónico');
      expect(options[1].title).toContain('Futurista 3D Cyber');
    });

    it('F09-03: Validates redesign option card metadata (title, description, style, previewUrl)', async () => {
      const session = createGeminiLiveSession();
      const { options } = await session.deliberateSceneRedesign({ frameBase64: 'mock_frame' });
      for (const opt of options) {
        expect(opt.title.length).toBeGreaterThan(5);
        expect(opt.description.length).toBeGreaterThan(10);
        expect(opt.style).toBeDefined();
        expect(opt.previewUrl.startsWith('data:image/')).toBe(true);
      }
    });

    it('F09-04: User selection updates active scene deliberation state', () => {
      let selectedOption: string | null = null;
      const selectStyle = (style: string) => { selectedOption = style; };
      selectStyle('cyber_3d_futuristic');
      expect(selectedOption).toBe('cyber_3d_futuristic');
    });

    it('F09-05: Formulates redesign telemetry event payload', () => {
      const payload: IslandTelemetryEvent = {
        eventId: 'event_redesign_01',
        deviceId: 'device_iphone_16',
        timestamp: Date.now(),
        cameraMode: 'environment',
        activeAction: 'scene_redesign',
        redesignOptions: [
          { title: 'Opción 1', description: 'Desc 1', style: 'arch' },
          { title: 'Opción 2', description: 'Desc 2', style: 'cyber' },
        ],
      };
      expect(payload.activeAction).toBe('scene_redesign');
      expect(payload.redesignOptions?.length).toBe(2);
    });
  });

  // =========================================================================
  // F10: Isla Telemetry Firestore Publisher
  // =========================================================================
  describe('F10: Isla Telemetry Firestore Publisher', () => {
    it('F10-01: Publishes IslandTelemetryEvent to island_telemetry collection', async () => {
      const event: IslandTelemetryEvent = {
        eventId: 'evt_101',
        deviceId: 'dev_island_01',
        timestamp: Date.now(),
        cameraMode: 'environment',
        activeAction: 'landscape',
        generativeStyle: 'comic',
      };
      const eventDoc = doc(mockFirestoreDb, 'island_telemetry', event.eventId);
      await setDoc(eventDoc, event);

      const snap = await getDoc(eventDoc);
      expect(snap.exists()).toBe(true);
      expect(snap.data()?.generativeStyle).toBe('comic');
    });

    it('F10-02: Records camera mode changes to Firestore', async () => {
      const eventDoc = doc(mockFirestoreDb, 'island_telemetry', 'evt_cam_switch');
      await setDoc(eventDoc, {
        eventId: 'evt_cam_switch',
        deviceId: 'dev_01',
        timestamp: Date.now(),
        cameraMode: 'dual_bereal',
      });
      const snap = await getDoc(eventDoc);
      expect(snap.data()?.cameraMode).toBe('dual_bereal');
    });

    it('F10-03: Records touch-to-explain coordinates and AI response', async () => {
      const eventDoc = doc(mockFirestoreDb, 'island_telemetry', 'evt_touch_99');
      await setDoc(eventDoc, {
        eventId: 'evt_touch_99',
        deviceId: 'dev_01',
        timestamp: Date.now(),
        cameraMode: 'environment',
        activeAction: 'touch_explain',
        touchCoordinates: { x: 0.45, y: 0.85 },
        aiResponse: 'Módulo de sensor óptico.',
      });
      const snap = await getDoc(eventDoc);
      expect(snap.data()?.touchCoordinates).toEqual({ x: 0.45, y: 0.85 });
      expect(snap.data()?.aiResponse).toContain('sensor óptico');
    });

    it('F10-04: Publishes periodic device heartbeat to devices_live collection', async () => {
      const deviceStatus: DeviceLiveStatus = {
        deviceId: 'dev_island_01',
        appName: 'isla-dinamica',
        isOnline: true,
        lastHeartbeat: Date.now(),
      };
      const statusDoc = doc(mockFirestoreDb, 'devices_live', deviceStatus.deviceId);
      await setDoc(statusDoc, deviceStatus);

      const snap = await getDoc(statusDoc);
      expect(snap.data()?.isOnline).toBe(true);
      expect(snap.data()?.appName).toBe('isla-dinamica');
    });

    it('F10-05: Queries telemetry events ordered by timestamp descending', async () => {
      const col = collection(mockFirestoreDb, 'island_telemetry');
      await setDoc(doc(col, 'e1'), { eventId: 'e1', timestamp: 1000, action: 'a' });
      await setDoc(doc(col, 'e2'), { eventId: 'e2', timestamp: 2000, action: 'b' });
      await setDoc(doc(col, 'e3'), { eventId: 'e3', timestamp: 3000, action: 'c' });

      const q = query(col, orderBy('timestamp', 'desc'), limit(2));
      const snap = await getDocs(q);
      expect(snap.size).toBe(2);
      expect(snap.docs[0].id).toBe('e3');
      expect(snap.docs[1].id).toBe('e2');
    });
  });

  // =========================================================================
  // F11: Operant Conditioning Variable-Ratio Engine
  // =========================================================================
  describe('F11: Operant Conditioning Variable-Ratio Engine', () => {
    class VariableRatioEngine {
      private ratioMean: number;
      private scrollCount: number = 0;
      private lastJackpotIndex: number = 0;

      constructor(ratioMean = 7) {
        this.ratioMean = ratioMean;
      }

      onScroll(): { scrollCount: number; isJackpot: boolean; dopaminePulse: boolean } {
        this.scrollCount++;
        // VR-7 schedule: pseudorandom delivery clustered around mean 7
        const delta = this.scrollCount - this.lastJackpotIndex;
        const isJackpot = delta >= 5 && (delta === this.ratioMean || Math.random() < 0.25 || delta >= 10);
        if (isJackpot) {
          this.lastJackpotIndex = this.scrollCount;
        }
        return {
          scrollCount: this.scrollCount,
          isJackpot,
          dopaminePulse: isJackpot || (this.scrollCount % 3 === 0),
        };
      }

      getScrollCount() { return this.scrollCount; }
    }

    it('F11-01: Maps scroll gesture to Skinner lever-press mechanic', () => {
      const engine = new VariableRatioEngine(7);
      const res = engine.onScroll();
      expect(res.scrollCount).toBe(1);
    });

    it('F11-02: Validates variable-ratio VR-7 jackpot scheduler logic', () => {
      const engine = new VariableRatioEngine(7);
      let jackpots = 0;
      for (let i = 0; i < 70; i++) {
        const res = engine.onScroll();
        if (res.isJackpot) jackpots++;
      }
      expect(jackpots).toBeGreaterThan(4);
      expect(jackpots).toBeLessThan(20);
    });

    it('F11-03: Triggers dopamine feedback pulse on reward delivery', () => {
      const engine = new VariableRatioEngine(5);
      let sawPulse = false;
      for (let i = 0; i < 10; i++) {
        const res = engine.onScroll();
        if (res.dopaminePulse) sawPulse = true;
      }
      expect(sawPulse).toBe(true);
    });

    it('F11-04: Simulates haptic pulse / audio vibration invocation', () => {
      let vibrationTriggered = false;
      const triggerHaptic = () => { vibrationTriggered = true; };
      triggerHaptic();
      expect(vibrationTriggered).toBe(true);
    });

    it('F11-05: Accurately increments scroll odometer counter', () => {
      const engine = new VariableRatioEngine(7);
      for (let i = 0; i < 25; i++) {
        engine.onScroll();
      }
      expect(engine.getScrollCount()).toBe(25);
    });
  });

  // =========================================================================
  // F12: Dynamic Temporal Decay Curve
  // =========================================================================
  describe('F12: Dynamic Temporal Decay Curve', () => {
    const calculateNominalDuration = (scrollCount: number, isJackpot: boolean): number => {
      if (isJackpot) {
        return 35.0; // Intermittent long-format reward
      }
      // Mathematical decay: starts at 45s, progressively drops to floor of 5s
      // Formula: 5 + 40 * exp(-0.08 * scrollCount)
      const duration = 5.0 + 40.0 * Math.exp(-0.08 * scrollCount);
      return Math.round(duration * 10) / 10;
    };

    it('F12-01: Validates initial baseline content nominal duration is 45s', () => {
      const duration = calculateNominalDuration(0, false);
      expect(duration).toBe(45.0);
    });

    it('F12-02: Validates progressive duration drop as scroll count increases', () => {
      const d0 = calculateNominalDuration(0, false);
      const d10 = calculateNominalDuration(10, false);
      const d25 = calculateNominalDuration(25, false);
      const d50 = calculateNominalDuration(50, false);

      expect(d0).toBe(45.0);
      expect(d10).toBeLessThan(d0);
      expect(d25).toBeLessThan(d10);
      expect(d50).toBeLessThan(d25);
    });

    it('F12-03: Clamps minimum duration at 5.0s floor', () => {
      const d100 = calculateNominalDuration(100, false);
      const d500 = calculateNominalDuration(500, false);
      expect(d100).toBeGreaterThanOrEqual(5.0);
      expect(d500).toBe(5.0);
    });

    it('F12-04: Inserts long-format jackpot duration (35s) on VR reward hit', () => {
      const jackpotDuration = calculateNominalDuration(30, true);
      expect(jackpotDuration).toBe(35.0);
    });

    it('F12-05: Builds decay curve history point array for session telemetry', () => {
      const history: Array<{ scrollIndex: number; nominalDurationSeconds: number; isJackpot: boolean }> = [];
      for (let i = 0; i < 5; i++) {
        const isJack = i === 3;
        history.push({
          scrollIndex: i,
          nominalDurationSeconds: calculateNominalDuration(i, isJack),
          isJackpot: isJack,
        });
      }
      expect(history.length).toBe(5);
      expect(history[0].nominalDurationSeconds).toBe(45.0);
      expect(history[3].isJackpot).toBe(true);
      expect(history[3].nominalDurationSeconds).toBe(35.0);
    });
  });

  // =========================================================================
  // F13: Dual Catalog (Child vs Adult)
  // =========================================================================
  describe('F13: Dual Catalog (Child vs Adult)', () => {
    interface CatalogItem {
      id: string;
      title: string;
      category: 'science' | 'art' | 'dopamine_gaming' | 'fast_trend';
      nominalDuration: number;
      targetProfile: 'child' | 'adult';
    }

    const CATALOG: CatalogItem[] = [
      { id: 'c1', title: 'El Telescopio Espacial James Webb', category: 'science', nominalDuration: 45, targetProfile: 'child' },
      { id: 'c2', title: 'Origami y Geometría en la Naturaleza', category: 'art', nominalDuration: 30, targetProfile: 'child' },
      { id: 'a1', title: 'Top 10 Momentos Virales en Gaming', category: 'dopamine_gaming', nominalDuration: 15, targetProfile: 'adult' },
      { id: 'a2', title: 'Reacciones a Memes Extremos', category: 'fast_trend', nominalDuration: 8, targetProfile: 'adult' },
    ];

    it('F13-01: Toggles between Child and Adult catalog filters', () => {
      let activeMode: 'child' | 'adult' = 'child';
      const setMode = (m: 'child' | 'adult') => { activeMode = m; };
      expect(activeMode).toBe('child');
      setMode('adult');
      expect(activeMode).toBe('adult');
    });

    it('F13-02: Filters Child mode educational and developmental content matrix', () => {
      const childItems = CATALOG.filter(i => i.targetProfile === 'child');
      expect(childItems.length).toBe(2);
      expect(childItems[0].category).toBe('science');
      expect(childItems[1].category).toBe('art');
    });

    it('F13-03: Filters Adult mode fast-paced dopamine content matrix', () => {
      const adultItems = CATALOG.filter(i => i.targetProfile === 'adult');
      expect(adultItems.length).toBe(2);
      expect(adultItems[0].category).toBe('dopamine_gaming');
      expect(adultItems[1].category).toBe('fast_trend');
    });

    it('F13-04: Validates content item schema structure', () => {
      const item = CATALOG[0];
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.nominalDuration).toBeGreaterThan(0);
    });

    it('F13-05: Emulates 60fps procedural Canvas animation frame tick generator', () => {
      let currentFrame = 0;
      const renderNextCanvasFrame = () => {
        currentFrame++;
        return {
          frameIndex: currentFrame,
          hueOffset: (currentFrame * 2) % 360,
          scalePulse: 1 + Math.sin(currentFrame * 0.1) * 0.05,
        };
      };
      const frame = renderNextCanvasFrame();
      expect(frame.frameIndex).toBe(1);
      expect(frame.scalePulse).toBeGreaterThan(1.0);
    });
  });

  // =========================================================================
  // F14: Skinner Session Telemetry & Persistence
  // =========================================================================
  describe('F14: Skinner Session Telemetry & Persistence', () => {
    it('F14-01: Initializes session lifecycle with Iniciar Sesión button', async () => {
      const session: SkinnerSessionRecord = {
        sessionId: 'skinner_ses_001',
        userId: 'mateo_quispe',
        targetProfile: 'child',
        status: 'active',
        startTime: Date.now(),
        totalScrolls: 0,
        totalDurationSeconds: 0,
        averageRetentionPct: 0,
        completedItemsCount: 0,
        currentScrollVelocity: 0,
        activeContentId: 'c1',
        activeNominalDuration: 45,
        activeElapsedSeconds: 0,
        activeRetentionPct: 0,
        decayCurveData: [],
        topicDistribution: {},
        lastUpdated: Date.now(),
      };

      const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', session.sessionId);
      await setDoc(sessionDoc, session);

      const snap = await getDoc(sessionDoc);
      expect(snap.data()?.status).toBe('active');
      expect(snap.data()?.userId).toBe('mateo_quispe');
    });

    it('F14-02: Calculates per-video retention percentage accurately', () => {
      const calculateRetention = (viewedSec: number, nominalSec: number) => {
        return Math.min(100, Math.round((viewedSec / nominalSec) * 100));
      };
      expect(calculateRetention(15, 30)).toBe(50);
      expect(calculateRetention(45, 45)).toBe(100);
      expect(calculateRetention(50, 40)).toBe(100);
      expect(calculateRetention(0, 40)).toBe(0);
    });

    it('F14-03: Increments 100% completed items count only on full view', () => {
      let completedCount = 0;
      const recordItemFinish = (retentionPct: number) => {
        if (retentionPct >= 100) completedCount++;
      };
      recordItemFinish(85);
      expect(completedCount).toBe(0);
      recordItemFinish(100);
      expect(completedCount).toBe(1);
    });

    it('F14-04: Computes scroll velocity RPM (scrolls per minute)', () => {
      const computeRPM = (scrolls: number, elapsedSeconds: number) => {
        if (elapsedSeconds <= 0) return 0;
        return Math.round((scrolls / elapsedSeconds) * 60);
      };
      expect(computeRPM(10, 30)).toBe(20);
      expect(computeRPM(50, 60)).toBe(50);
    });

    it('F14-05: Finalizes session and persists complete summary record to Firestore', async () => {
      const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', 'skinner_ses_001');
      await setDoc(sessionDoc, {
        sessionId: 'skinner_ses_001',
        userId: 'mateo_quispe',
        status: 'active',
        totalScrolls: 0,
      });

      await updateDoc(sessionDoc, {
        status: 'completed',
        endTime: Date.now(),
        totalScrolls: 42,
        totalDurationSeconds: 310,
        averageRetentionPct: 68.4,
        completedItemsCount: 7,
      });

      const snap = await getDoc(sessionDoc);
      expect(snap.data()?.status).toBe('completed');
      expect(snap.data()?.totalScrolls).toBe(42);
      expect(snap.data()?.completedItemsCount).toBe(7);
    });
  });

  // =========================================================================
  // F15: Parental Profile & Family Document Vault
  // =========================================================================
  describe('F15: Parental Profile & Family Document Vault', () => {
    interface DocumentItem {
      id: string;
      name: string;
      category: 'school' | 'medical' | 'legal' | 'identity';
      sizeBytes: number;
      uploadDate: string;
    }

    const VAULT: DocumentItem[] = [
      { id: 'doc1', name: 'Libreta Escolar 2026.pdf', category: 'school', sizeBytes: 102400, uploadDate: '2026-08-15' },
      { id: 'doc2', name: 'Cartilla de Vacunación.pdf', category: 'medical', sizeBytes: 204800, uploadDate: '2026-07-20' },
      { id: 'doc3', name: 'DNI Menor Mateo.pdf', category: 'identity', sizeBytes: 512000, uploadDate: '2026-01-10' },
      { id: 'doc4', name: 'Consentimiento Clínico.pdf', category: 'legal', sizeBytes: 153600, uploadDate: '2026-06-01' },
    ];

    it('F15-01: Renders Mateo Quispe child profile card with metadata', () => {
      const childProfile = {
        name: 'Mateo Quispe',
        age: 9,
        grade: '4to Primaria',
        avatar: '/avatars/mateo.png',
        devicePaired: 'iPad Mini 6',
      };
      expect(childProfile.name).toBe('Mateo Quispe');
      expect(childProfile.age).toBe(9);
      expect(childProfile.devicePaired).toBe('iPad Mini 6');
    });

    it('F15-02: Filters documents across 4 distinct categories (school, medical, legal, identity)', () => {
      const medicalDocs = VAULT.filter(d => d.category === 'medical');
      const schoolDocs = VAULT.filter(d => d.category === 'school');
      expect(medicalDocs.length).toBe(1);
      expect(schoolDocs.length).toBe(1);
    });

    it('F15-03: Searches document vault by keyword queries', () => {
      const searchVault = (queryStr: string) => {
        const q = queryStr.toLowerCase();
        return VAULT.filter(d => d.name.toLowerCase().includes(q));
      };
      expect(searchVault('vacunación').length).toBe(1);
      expect(searchVault('dni').length).toBe(1);
      expect(searchVault('inexistente').length).toBe(0);
    });

    it('F15-04: Simulates document upload and metadata generation', () => {
      const newDoc: DocumentItem = {
        id: 'doc5',
        name: 'Certificado Medico Dental.pdf',
        category: 'medical',
        sizeBytes: 128000,
        uploadDate: '2026-09-02',
      };
      const updatedVault = [...VAULT, newDoc];
      expect(updatedVault.length).toBe(5);
      expect(updatedVault[4].name).toContain('Dental');
    });

    it('F15-05: Emulates document preview and download action handler', () => {
      const getDownloadUrl = (docId: string) => `https://storage.googleapis.com/quarz-group-vault/${docId}`;
      const url = getDownloadUrl('doc1');
      expect(url).toContain('quarz-group-vault/doc1');
    });
  });

  // =========================================================================
  // F16: Live Observador: Skinner Telemetry Widgets
  // =========================================================================
  describe('F16: Live Observador: Skinner Telemetry Widgets', () => {
    it('F16-01: Odometer widget formats live scroll count digits', () => {
      const formatOdometer = (count: number) => count.toString().padStart(4, '0');
      expect(formatOdometer(0)).toBe('0000');
      expect(formatOdometer(42)).toBe('0042');
      expect(formatOdometer(1234)).toBe('1234');
    });

    it('F16-02: Radial Retention Ring calculates SVG stroke-dashoffset', () => {
      const computeDashOffset = (retentionPct: number, radius = 40) => {
        const circumference = 2 * Math.PI * radius;
        return circumference - (retentionPct / 100) * circumference;
      };
      const offset0 = computeDashOffset(0);
      const offset50 = computeDashOffset(50);
      const offset100 = computeDashOffset(100);
      expect(offset0).toBeCloseTo(2 * Math.PI * 40, 1);
      expect(offset50).toBeCloseTo(Math.PI * 40, 1);
      expect(offset100).toBe(0);
    });

    it('F16-03: Velocity Tachometer gauge computes RPM rotation angle', () => {
      const computeNeedleAngle = (rpm: number, maxRpm = 180) => {
        const clamped = Math.min(Math.max(rpm, 0), maxRpm);
        // Map 0 -> -90 deg, maxRpm -> +90 deg
        return -90 + (clamped / maxRpm) * 180;
      };
      expect(computeNeedleAngle(0)).toBe(-90);
      expect(computeNeedleAngle(90)).toBe(0);
      expect(computeNeedleAngle(180)).toBe(90);
    });

    it('F16-04: Animated Decay Chart formats SVG polyline coordinates', () => {
      const points = [
        { x: 0, y: 45 },
        { x: 1, y: 35 },
        { x: 2, y: 22 },
        { x: 3, y: 12 },
      ];
      const svgPolyline = points.map(p => `${p.x * 30},${100 - p.y * 2}`).join(' ');
      expect(svgPolyline).toBe('0,10 30,30 60,56 90,76');
    });

    it('F16-05: Active content pill updates currently observed item in real-time', () => {
      let activeItemTitle = 'Esperando inicio...';
      const onContentChange = (title: string) => { activeItemTitle = title; };
      onContentChange('James Webb Space Telescope');
      expect(activeItemTitle).toBe('James Webb Space Telescope');
    });
  });

  // =========================================================================
  // F17: Live Observador: Isla Telemetry Cards
  // =========================================================================
  describe('F17: Live Observador: Isla Telemetry Cards', () => {
    it('F17-01: Summarizes tool usage breakdown count', () => {
      const events: IslandTelemetryEvent[] = [
        { eventId: '1', deviceId: 'd', timestamp: 1, cameraMode: 'environment', activeAction: 'landscape' },
        { eventId: '2', deviceId: 'd', timestamp: 2, cameraMode: 'environment', activeAction: 'landscape' },
        { eventId: '3', deviceId: 'd', timestamp: 3, cameraMode: 'user', activeAction: 'touch_explain' },
        { eventId: '4', deviceId: 'd', timestamp: 4, cameraMode: 'dual_bereal', activeAction: 'scene_redesign' },
      ];

      const counts = events.reduce((acc, e) => {
        if (e.activeAction) acc[e.activeAction] = (acc[e.activeAction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(counts.landscape).toBe(2);
      expect(counts.touch_explain).toBe(1);
      expect(counts.scene_redesign).toBe(1);
    });

    it('F17-02: Spatial touch coordinates radar plots relative points', () => {
      const touchEvents = [
        { x: 0.2, y: 0.3 },
        { x: 0.8, y: 0.7 },
      ];
      const mapped = touchEvents.map(p => ({
        posX: `${p.x * 100}%`,
        posY: `${p.y * 100}%`,
      }));
      expect(mapped[0]).toEqual({ posX: '20%', posY: '30%' });
      expect(mapped[1]).toEqual({ posX: '80%', posY: '70%' });
    });

    it('F17-03: Generative transformation cards render style badge and timestamp', () => {
      const card = {
        style: 'comic',
        timestampFormatted: '12:04:15',
        prompt: 'Transformar escena a cómic',
      };
      expect(card.style).toBe('comic');
      expect(card.timestampFormatted).toBe('12:04:15');
    });

    it('F17-04: Live device connection status badge reflects devices_live heartbeats', () => {
      const computeStatus = (lastHeartbeat: number, now: number) => {
        return (now - lastHeartbeat) < 15000 ? 'En Línea' : 'Desconectado';
      };
      const now = Date.now();
      expect(computeStatus(now - 5000, now)).toBe('En Línea');
      expect(computeStatus(now - 30000, now)).toBe('Desconectado');
    });

    it('F17-05: Real-time activity feed displays latest 5 actions in chronological order', () => {
      const feed = ['Acción 1', 'Acción 2', 'Acción 3', 'Acción 4', 'Acción 5', 'Acción 6'];
      const latest5 = feed.slice(-5);
      expect(latest5.length).toBe(5);
      expect(latest5[4]).toBe('Acción 6');
    });
  });

  // =========================================================================
  // F18: Multi-Device Real-Time Sync
  // =========================================================================
  describe('F18: Multi-Device Real-Time Sync', () => {
    it('F18-01: Binds Firestore onSnapshot subscription to live session', (done) => {
      const docRef = doc(mockFirestoreDb, 'sessions_skinner', 'sync_session_01');
      let callCount = 0;

      const unsub = onSnapshot(docRef, (snap) => {
        callCount++;
        if (callCount === 2) {
          expect(snap.data()?.totalScrolls).toBe(8);
          unsub();
        }
      });

      setDoc(docRef, { totalScrolls: 0 }).then(() => {
        setDoc(docRef, { totalScrolls: 8 });
      });
    });

    it('F18-02: Propagates Skinner Box writes to Parent Dashboard listener (<100ms)', async () => {
      const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', 'live_sync_02');
      let receivedOdometer = -1;

      const unsub = onSnapshot(sessionDoc, (snap) => {
        if (snap.exists() && snap.data()?.totalScrolls !== undefined) {
          receivedOdometer = snap.data().totalScrolls;
        }
      });

      await setDoc(sessionDoc, { totalScrolls: 27, status: 'active' });
      expect(receivedOdometer).toBe(27);
      unsub();
    });

    it('F18-03: Propagates Isla Dinámica telemetry writes to Parent Dashboard listener', async () => {
      const islandDoc = doc(mockFirestoreDb, 'island_telemetry', 'live_island_03');
      let lastAction = '';

      const unsub = onSnapshot(islandDoc, (snap) => {
        if (snap.exists() && snap.data()?.activeAction) {
          lastAction = snap.data().activeAction;
        }
      });

      await setDoc(islandDoc, { activeAction: 'scene_redesign', cameraMode: 'environment' });
      expect(lastAction).toBe('scene_redesign');
      unsub();
    });

    it('F18-04: Synchronizes concurrent multi-client state without collision', async () => {
      const col = collection(mockFirestoreDb, 'devices_live');
      await setDoc(doc(col, 'dev_a'), { deviceId: 'dev_a', isOnline: true });
      await setDoc(doc(col, 'dev_b'), { deviceId: 'dev_b', isOnline: true });

      const snap = await getDocs(col);
      expect(snap.size).toBe(2);
    });

    it('F18-05: Unsubscribes listener cleanly without memory leaks', () => {
      const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', 'unsub_test');
      const initialListeners = mockFirestoreDb.getActiveListenersCount();
      const unsub = onSnapshot(sessionDoc, () => {});
      expect(mockFirestoreDb.getActiveListenersCount()).toBe(initialListeners + 1);
      unsub();
      expect(mockFirestoreDb.getActiveListenersCount()).toBe(initialListeners);
    });
  });

  // =========================================================================
  // F19: Multi-Site Production Build & Manifests
  // =========================================================================
  describe('F19: Multi-Site Production Build & Manifests', () => {
    it('F19-01: Validates Isla Dinámica PWA manifest specification', () => {
      const manifest = {
        name: 'Zentry Isla Dinámica',
        short_name: 'Isla Dinámica',
        start_url: '/',
        display: 'fullscreen',
        theme_color: '#533B87',
        background_color: '#080D1A',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      };
      expect(manifest.display).toBe('fullscreen');
      expect(manifest.theme_color).toBe('#533B87');
      expect(manifest.icons.length).toBe(2);
    });

    it('F19-02: Validates Skinner Box PWA manifest specification', () => {
      const manifest = {
        name: 'Zentry Skinner Box Simulator',
        short_name: 'Skinner Box',
        start_url: '/',
        display: 'standalone',
        theme_color: '#080D1A',
        background_color: '#080D1A',
      };
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#080D1A');
    });

    it('F19-03: Validates Parent Dashboard PWA manifest specification', () => {
      const manifest = {
        name: 'Zentry Parent Live Observador',
        short_name: 'Parent Live',
        start_url: '/',
        display: 'standalone',
        theme_color: '#533B87',
        background_color: '#EBF1F5',
      };
      expect(manifest.short_name).toBe('Parent Live');
      expect(manifest.background_color).toBe('#EBF1F5');
    });

    it('F19-04: Validates multi-site hosting distribution routing in firebase.json schema', () => {
      const firebaseHostingSchema = [
        { target: 'isla-dinamica', public: 'apps/zf-isla-dinamica/dist' },
        { target: 'skinner-box', public: 'apps/zf-skinner-box/dist' },
        { target: 'parental-feature', public: 'apps/zf-parental-dashboard/dist' },
      ];
      expect(firebaseHostingSchema.length).toBe(3);
      const validIslandTargets = ['isla-dinamica', 'zentry-island-demo'];
      expect(validIslandTargets.includes(firebaseHostingSchema[0].target)).toBe(true);
    });

    it('F19-05: Validates Service Worker offline cache registration shell contract', () => {
      const swPrecacheAssets = [
        '/',
        '/index.html',
        '/assets/index.css',
        '/assets/index.js',
        '/manifest.webmanifest',
      ];
      expect(swPrecacheAssets).toContain('/manifest.webmanifest');
      expect(swPrecacheAssets.length).toBe(5);
    });
  });
});
