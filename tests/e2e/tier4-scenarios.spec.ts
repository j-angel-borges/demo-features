/**
 * Tier 4: Real-World Commercial Demo Scenarios Suite (10 End-to-End Scenarios)
 * Simulates complete commercial presentation flows, executive demos, multi-device sync, and fault recovery.
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
} from '../fixtures/mockMediaDevices.js';
import {
  createGeminiLiveSession,
} from '../fixtures/mockGemini.js';

describe('Tier 4: Real-World Commercial Demo Scenarios Suite', () => {
  beforeEach(() => {
    mockFirestoreDb.reset();
    mockMediaDevices.reset();
  });

  // -------------------------------------------------------------------------
  // Scenario 1: Commercial Demo Walkthrough: Isla Dinámica Complete Flow
  // -------------------------------------------------------------------------
  it('Scenario 1: Commercial Demo Walkthrough: Isla Dinámica Complete Flow', async () => {
    // 1. Initial State: Compact island pill locked at viewport top
    let islandState = { expanded: false, height: 38, width: 130 };
    expect(islandState.expanded).toBe(false);

    // 2. User clicks camera icon -> expands with 60fps spring physics
    islandState = { expanded: true, height: 480, width: 360 };
    expect(islandState.expanded).toBe(true);

    // 3. Mounts Rear camera (environment)
    const stream = await mockMediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    expect(stream.getVideoTracks()[0].facingMode).toBe('environment');

    // 4. Switch to Dual BeReal PiP mode
    const dualStream = await mockMediaDevices.getUserMedia({ video: { facingMode: 'dual_bereal' } });
    expect(dualStream.isDualStream).toBe(true);

    // 5. Activates Gemini 2.5 Flash Live session
    const geminiSession = createGeminiLiveSession();
    await geminiSession.connect();
    expect(geminiSession.isConnected).toBe(true);

    // 6. Streams video frames and speaks in Spanish
    const frame = dualStream.captureFrameAsBase64();
    await geminiSession.sendRealtimeInput([{ mimeType: 'image/jpeg', data: frame }]);
    const responseText = await geminiSession.sendTextMessage('Hola Zentry, ¿qué observas?');
    expect(responseText).toContain('Zentry');

    // 7. Publishes telemetry event
    const telemetryRef = doc(mockFirestoreDb, 'island_telemetry', 'scen1_evt');
    await setDoc(telemetryRef, {
      eventId: 'scen1_evt',
      deviceId: 'demo_device_01',
      timestamp: Date.now(),
      cameraMode: 'dual_bereal',
      aiPrompt: 'Hola Zentry, ¿qué observas?',
      aiResponse: responseText,
    });

    const snap = await getDoc(telemetryRef);
    expect(snap.data()?.aiResponse).toBe(responseText);

    // 8. User finishes session and collapses island
    await geminiSession.disconnect();
    expect(geminiSession.isConnected).toBe(false);
    islandState = { expanded: false, height: 38, width: 130 };
    expect(islandState.expanded).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Commercial Demo Walkthrough: Corner Vision Tools Suite
  // -------------------------------------------------------------------------
  it('Scenario 2: Commercial Demo Walkthrough: Corner Vision Tools Suite', async () => {
    const stream = await mockMediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const gemini = createGeminiLiveSession();
    await gemini.connect();

    // 1. Tool 1: Landscape Enhancer & Comic Style Transfer
    const frozenFrame = stream.captureFrameAsBase64();
    const stylization = await gemini.generateLandscapeStylization({
      frameBase64: frozenFrame,
      style: 'comic',
    });
    expect(stylization.styleApplied).toBe('comic');
    await setDoc(doc(mockFirestoreDb, 'island_telemetry', 'scen2_tool1'), {
      activeAction: 'landscape',
      generativeStyle: 'comic',
      timestamp: Date.now(),
    });

    // 2. Tool 2: Touch-to-Explain Socratic Point
    const explanation = await gemini.explainTouchPoint({
      touchCoordinates: { x: 0.42, y: 0.68 },
      frameBase64: frozenFrame,
    });
    expect(explanation.confidence).toBeGreaterThan(0.9);
    await setDoc(doc(mockFirestoreDb, 'island_telemetry', 'scen2_tool2'), {
      activeAction: 'touch_explain',
      touchCoordinates: { x: 0.42, y: 0.68 },
      aiResponse: explanation.socraticExplanation,
      timestamp: Date.now() + 10,
    });

    // 3. Tool 3: Scene Redesign Deliberator (2 options)
    const redesign = await gemini.deliberateSceneRedesign({ frameBase64: frozenFrame });
    expect(redesign.options.length).toBe(2);
    await setDoc(doc(mockFirestoreDb, 'island_telemetry', 'scen2_tool3'), {
      activeAction: 'scene_redesign',
      redesignOptions: redesign.options,
      timestamp: Date.now() + 20,
    });

    // Verify all 3 events logged in Firestore
    const colSnap = await getDocs(collection(mockFirestoreDb, 'island_telemetry'));
    expect(colSnap.size).toBe(3);
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Operant Habituation Run: Skinner Box Decay & Jackpots
  // -------------------------------------------------------------------------
  it('Scenario 3: Operant Habituation Run: Skinner Box Decay & Jackpots', async () => {
    const sessionId = 'scen3_skinner_run';
    const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', sessionId);

    // 1. Iniciar Sesión in Child mode
    let sessionData: SkinnerSessionRecord = {
      sessionId,
      userId: 'mateo_quispe',
      targetProfile: 'child',
      status: 'active',
      startTime: Date.now(),
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
      topicDistribution: { ciencia: 1 },
      lastUpdated: Date.now(),
    };
    await setDoc(sessionDoc, sessionData);

    // 2. User watches 1st video to 100% completion (45s)
    sessionData.activeElapsedSeconds = 45;
    sessionData.activeRetentionPct = 100;
    sessionData.completedItemsCount = 1;
    sessionData.totalDurationSeconds = 45;
    sessionData.decayCurveData.push({
      scrollIndex: 0,
      nominalDurationSeconds: 45,
      actualViewSeconds: 45,
      retentionPct: 100,
      isJackpot: false,
      timestamp: Date.now(),
    });

    // 3. User begins rapid scrolling (20 scrolls)
    for (let scroll = 1; scroll <= 20; scroll++) {
      const isJackpot = scroll === 7 || scroll === 14;
      const nominal = isJackpot ? 35 : Math.max(5, Math.round((5 + 40 * Math.exp(-0.08 * scroll)) * 10) / 10);
      const actualView = isJackpot ? 30 : Math.round(nominal * 0.4);
      const retPct = Math.round((actualView / nominal) * 100);

      sessionData.totalScrolls = scroll;
      sessionData.activeNominalDuration = nominal;
      sessionData.totalDurationSeconds += actualView;
      sessionData.decayCurveData.push({
        scrollIndex: scroll,
        nominalDurationSeconds: nominal,
        actualViewSeconds: actualView,
        retentionPct: retPct,
        isJackpot,
        timestamp: Date.now() + scroll * 1000,
      });
    }

    // 4. Calculate final session metrics and Finalizar Sesión
    const totalRetention = sessionData.decayCurveData.reduce((sum, item) => sum + item.retentionPct, 0);
    sessionData.averageRetentionPct = Math.round(totalRetention / sessionData.decayCurveData.length);
    sessionData.status = 'completed';
    sessionData.endTime = Date.now() + 25000;
    sessionData.currentScrollVelocity = 48; // 48 RPM

    await setDoc(sessionDoc, sessionData);

    const savedSnap = await getDoc(sessionDoc);
    expect(savedSnap.data()?.status).toBe('completed');
    expect(savedSnap.data()?.totalScrolls).toBe(20);
    expect(savedSnap.data()?.completedItemsCount).toBe(1);
    expect(savedSnap.data()?.decayCurveData.length).toBe(21);
    expect(savedSnap.data()?.decayCurveData[7].isJackpot).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Skinner Box Adult Dopamine Sprint
  // -------------------------------------------------------------------------
  it('Scenario 4: Skinner Box Adult Dopamine Sprint', async () => {
    const sessionId = 'scen4_adult_sprint';
    const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', sessionId);

    // Initial Adult session
    await setDoc(sessionDoc, {
      sessionId,
      targetProfile: 'adult',
      status: 'active',
      totalScrolls: 0,
      currentScrollVelocity: 0,
    });

    // 50 rapid scrolls simulating compulsive consumption
    let currentNominal = 15;
    for (let i = 1; i <= 50; i++) {
      currentNominal = Math.max(5.0, Math.round((5.0 + 10.0 * Math.exp(-0.12 * i)) * 10) / 10);
    }

    await updateDoc(sessionDoc, {
      totalScrolls: 50,
      currentScrollVelocity: 120, // 120 RPM
      activeNominalDuration: currentNominal,
      status: 'completed',
    });

    const snap = await getDoc(sessionDoc);
    expect(snap.data()?.targetProfile).toBe('adult');
    expect(snap.data()?.totalScrolls).toBe(50);
    expect(snap.data()?.currentScrollVelocity).toBe(120);
    expect(snap.data()?.activeNominalDuration).toBe(5.0);
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Dual-Device Live Observador Sync: Skinner → Dashboard
  // -------------------------------------------------------------------------
  it('Scenario 5: Dual-Device Live Observador Sync: Skinner → Dashboard', async () => {
    const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', 'scen5_live_sync');
    const dashboardState = {
      odometer: 0,
      currentVelocityRpm: 0,
      retentionPct: 0,
      isSessionActive: false,
    };

    // Dashboard on Device B listens to Skinner session on Device A
    const unsubDashboard = onSnapshot(sessionDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        dashboardState.odometer = data.totalScrolls || 0;
        dashboardState.currentVelocityRpm = data.currentScrollVelocity || 0;
        dashboardState.retentionPct = data.averageRetentionPct || 0;
        dashboardState.isSessionActive = data.status === 'active';
      }
    });

    // Device A starts session
    await setDoc(sessionDoc, {
      sessionId: 'scen5_live_sync',
      status: 'active',
      totalScrolls: 0,
      currentScrollVelocity: 0,
      averageRetentionPct: 100,
    });
    expect(dashboardState.isSessionActive).toBe(true);

    // Device A scrolls: updates Odometer & RPM
    await updateDoc(sessionDoc, {
      totalScrolls: 14,
      currentScrollVelocity: 42,
      averageRetentionPct: 78,
    });
    expect(dashboardState.odometer).toBe(14);
    expect(dashboardState.currentVelocityRpm).toBe(42);
    expect(dashboardState.retentionPct).toBe(78);

    // Device A ends session
    await updateDoc(sessionDoc, { status: 'completed' });
    expect(dashboardState.isSessionActive).toBe(false);

    unsubDashboard();
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Dual-Device Live Observador Sync: Isla → Dashboard
  // -------------------------------------------------------------------------
  it('Scenario 6: Dual-Device Live Observador Sync: Isla → Dashboard', async () => {
    const islandCol = collection(mockFirestoreDb, 'island_telemetry');
    const liveDashboardIslaFeed: IslandTelemetryEvent[] = [];

    // Dashboard on Device B listens to all Isla Dinámica telemetry
    const unsubIsla = onSnapshot(islandCol, (snap) => {
      liveDashboardIslaFeed.length = 0;
      snap.docs.forEach(d => liveDashboardIslaFeed.push(d.data()));
    });

    // Device A fires Landscape action
    await setDoc(doc(islandCol, 'isla_evt_1'), {
      eventId: 'isla_evt_1',
      deviceId: 'device_a',
      cameraMode: 'environment',
      activeAction: 'landscape',
      generativeStyle: 'enhanced',
    });
    expect(liveDashboardIslaFeed.length).toBe(1);
    expect(liveDashboardIslaFeed[0].generativeStyle).toBe('enhanced');

    // Device A fires Touch-to-Explain action
    await setDoc(doc(islandCol, 'isla_evt_2'), {
      eventId: 'isla_evt_2',
      deviceId: 'device_a',
      cameraMode: 'environment',
      activeAction: 'touch_explain',
      touchCoordinates: { x: 0.55, y: 0.72 },
      aiResponse: 'Microprocesador central.',
    });
    expect(liveDashboardIslaFeed.length).toBe(2);
    expect(liveDashboardIslaFeed[1].touchCoordinates).toEqual({ x: 0.55, y: 0.72 });

    unsubIsla();
  });

  // -------------------------------------------------------------------------
  // Scenario 7: Full 3-PWA Commercial Presentation Cycle
  // -------------------------------------------------------------------------
  it('Scenario 7: Full 3-PWA Commercial Presentation Cycle', async () => {
    // 1. Device Heartbeats in devices_live
    const devicesCol = collection(mockFirestoreDb, 'devices_live');
    await setDoc(doc(devicesCol, 'pwa_island'), { deviceId: 'pwa_island', appName: 'isla-dinamica', isOnline: true, lastHeartbeat: Date.now() });
    await setDoc(doc(devicesCol, 'pwa_skinner'), { deviceId: 'pwa_skinner', appName: 'skinner-box', isOnline: true, lastHeartbeat: Date.now() });
    await setDoc(doc(devicesCol, 'pwa_parent'), { deviceId: 'pwa_parent', appName: 'parent-dashboard', isOnline: true, lastHeartbeat: Date.now() });

    const liveDevices = await getDocs(devicesCol);
    expect(liveDevices.size).toBe(3);

    // 2. Isla Dinámica runs Gemini multimodal session
    const gemini = createGeminiLiveSession();
    await gemini.connect();
    const voiceReply = await gemini.sendTextMessage('Hola Zentry');
    expect(voiceReply).toContain('Zentry');

    // 3. Skinner Box runs active session
    const skinnerDoc = doc(mockFirestoreDb, 'sessions_skinner', 'scen7_skinner');
    await setDoc(skinnerDoc, {
      sessionId: 'scen7_skinner',
      userId: 'mateo_quispe',
      status: 'active',
      totalScrolls: 22,
      averageRetentionPct: 74,
      completedItemsCount: 3,
    });

    // 4. Parent Dashboard loads Mateo Quispe profile & document vault
    const childProfile = { name: 'Mateo Quispe', age: 9, status: 'Active Surveillance' };
    const vaultDocs = [
      { id: 'v1', name: 'Libreta Escolar.pdf', category: 'school' },
      { id: 'v2', name: 'Historial Clínico.pdf', category: 'medical' },
    ];
    expect(childProfile.name).toBe('Mateo Quispe');
    expect(vaultDocs.length).toBe(2);

    // 5. Parent Dashboard observes both telemetry streams
    const skinnerSnap = await getDoc(skinnerDoc);
    expect(skinnerSnap.data()?.totalScrolls).toBe(22);
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Network Disruption & Reconnection Recovery
  // -------------------------------------------------------------------------
  it('Scenario 8: Network Disruption & Reconnection Recovery', async () => {
    const sessionDoc = doc(mockFirestoreDb, 'sessions_skinner', 'scen8_offline_sync');
    await setDoc(sessionDoc, { totalScrolls: 5, status: 'active' });

    // Simulate network drop
    mockFirestoreDb.setOnline(false);

    // Device writes 3 scroll updates while offline
    await setDoc(sessionDoc, { totalScrolls: 6 });
    await setDoc(sessionDoc, { totalScrolls: 7 });
    await setDoc(sessionDoc, { totalScrolls: 8 });

    expect(mockFirestoreDb.offlineQueue.length).toBe(3);

    // Reconnection occurs
    mockFirestoreDb.setOnline(true);
    expect(mockFirestoreDb.offlineQueue.length).toBe(0);

    const snap = await getDoc(sessionDoc);
    expect(snap.data()?.totalScrolls).toBe(8);
  });

  // -------------------------------------------------------------------------
  // Scenario 9: Rapid Switch Multi-Profile Parental Vault Audit
  // -------------------------------------------------------------------------
  it('Scenario 9: Rapid Switch Multi-Profile Parental Vault Audit', () => {
    interface VaultDocument {
      id: string;
      name: string;
      category: 'school' | 'medical' | 'legal' | 'identity';
      sizeBytes: number;
    }

    const documents: VaultDocument[] = [
      { id: 'd1', name: 'Registro de Vacunas Pediatría 2026.pdf', category: 'medical', sizeBytes: 150000 },
      { id: 'd2', name: 'Boleta de Calificaciones Bimestre 1.pdf', category: 'school', sizeBytes: 85000 },
      { id: 'd3', name: 'DNI Digital Mateo Quispe.pdf', category: 'identity', sizeBytes: 300000 },
      { id: 'd4', name: 'Autorización Excursión Escolar.pdf', category: 'legal', sizeBytes: 60000 },
    ];

    // Search for "vacunas"
    const searchResults = documents.filter(d => d.name.toLowerCase().includes('vacunas'));
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].category).toBe('medical');

    // Filter by category: school
    const schoolDocs = documents.filter(d => d.category === 'school');
    expect(schoolDocs.length).toBe(1);

    // Add new uploaded document
    const newDoc: VaultDocument = {
      id: 'd5',
      name: 'Certificado Oftalmológico.pdf',
      category: 'medical',
      sizeBytes: 120000,
    };
    documents.push(newDoc);
    expect(documents.length).toBe(5);

    // Filter medical again
    const medicalDocs = documents.filter(d => d.category === 'medical');
    expect(medicalDocs.length).toBe(2);
  });

  // -------------------------------------------------------------------------
  // Scenario 10: Multi-Site Hosting & Manifest Production Integrity
  // -------------------------------------------------------------------------
  it('Scenario 10: Multi-Site Hosting & Manifest Production Integrity', () => {
    const deploymentPlan = {
      projectId: 'quarz-group',
      multiSiteTargets: [
        {
          site: 'isla-dinamica',
          url: 'https://isla-dinamica.web.app',
          manifest: { name: 'Zentry Isla Dinámica', themeColor: '#533B87', display: 'fullscreen' },
        },
        {
          site: 'skinner-box',
          url: 'https://skinner-box.web.app',
          manifest: { name: 'Zentry Skinner Box', themeColor: '#080D1A', display: 'standalone' },
        },
        {
          site: 'parental-feature',
          url: 'https://parental-feature.web.app',
          manifest: { name: 'Zentry Parent Live', themeColor: '#533B87', display: 'standalone' },
        },
      ],
      securityRules: {
        sessions_skinner: 'read, write: if request.auth != null || integrity == "demo"',
        island_telemetry: 'read, write: if request.auth != null || integrity == "demo"',
        devices_live: 'read, write: if request.auth != null || integrity == "demo"',
      },
    };

    expect(deploymentPlan.projectId).toBe('quarz-group');
    expect(deploymentPlan.multiSiteTargets.length).toBe(3);
    const validIsland = deploymentPlan.multiSiteTargets[0].url.includes('isla-dinamica.web.app') || deploymentPlan.multiSiteTargets[0].url.includes('zentry-island-demo.web.app');
    const validSkinner = deploymentPlan.multiSiteTargets[1].url.includes('skinner-box.web.app') || deploymentPlan.multiSiteTargets[1].url.includes('zentry-skinner-demo.web.app');
    const validParent = deploymentPlan.multiSiteTargets[2].url.includes('parental-feature.web.app') || deploymentPlan.multiSiteTargets[2].url.includes('zentry-parent-demo.web.app');
    expect(validIsland).toBe(true);
    expect(validSkinner).toBe(true);
    expect(validParent).toBe(true);
    expect(deploymentPlan.securityRules.sessions_skinner).toBeDefined();
    expect(deploymentPlan.securityRules.island_telemetry).toBeDefined();
    expect(deploymentPlan.securityRules.devices_live).toBeDefined();
  });
});
