/**
 * Firebase App & Firestore Client for GCP quarz-group
 * Provides real-time synchronization, resilient offline fallback queue,
 * and cross-app event broadcasting for Zentry Commercial Demo Suite.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import type {
  SkinnerSessionRecord,
  IslandTelemetryEvent,
  DeviceLiveStatus,
  DocumentItem,
  SkinnerCommandEvent,
  SkinnerLeverEvent,
  SkinnerSessionReportRecord,
  CreativeCreationRecord,
} from './types.js';

// ============================================================================
// 1. FIREBASE CONFIGURATION (GCP quarz-group)
// ============================================================================

function getEnvVar(key: string, fallback: string): string {
  try {
    // Check import.meta.env in Vite context
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[key];
      if (val) return val;
    }
  } catch {
    // Ignore in non-Vite environments
  }

  try {
    // Check process.env in Node / test context
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key];
      if (val) return val;
    }
  } catch {
    // Ignore in browser environments
  }

  return fallback;
}

export const FIREBASE_CONFIG = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyD-DEMO-MOCK-QUARZ-GROUP-KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'quarz-group.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'quarz-group'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'quarz-group.appspot.com'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '772983419023'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:772983419023:web:9c12b7a8d54e1903fa3e41'),
};

// ============================================================================
// 2. RESILIENT LOCAL EVENT BUS & IN-MEMORY STORE (Cross-Tab & Fallback)
// ============================================================================

type Listener<T> = (data: T) => void;

class ResilientDataBus {
  private skinnerSessions: Map<string, SkinnerSessionRecord> = new Map();
  private islandTelemetry: IslandTelemetryEvent[] = [];
  private deviceStatuses: Map<string, DeviceLiveStatus> = new Map();
  private documents: Map<string, DocumentItem> = new Map();

  private sessionListeners: Set<Listener<SkinnerSessionRecord | null>> = new Set();
  private telemetryListeners: Set<Listener<IslandTelemetryEvent[]>> = new Set();
  private deviceListeners: Set<Listener<DeviceLiveStatus[]>> = new Set();
  private documentListeners: Set<Listener<DocumentItem[]>> = new Set();
  private isEmergencyLocked = false;
  private lockListeners: Set<Listener<boolean>> = new Set();
  private commandListeners: Set<Listener<SkinnerCommandEvent>> = new Set();
  private latestCommand: SkinnerCommandEvent | null = null;
  private leverEventListeners: Set<Listener<SkinnerLeverEvent>> = new Set();
  private latestLeverEvent: SkinnerLeverEvent | null = null;
  private skinnerReports: Map<string, SkinnerSessionReportRecord> = new Map();
  private reportListeners: Set<Listener<SkinnerSessionReportRecord | null>> = new Set();

  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zentry_emergency_lock');
        if (stored !== null) {
          this.isEmergencyLocked = stored === 'true';
        }
      } catch {
        // Safe fail
      }

      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('zentry_demo_sync_channel');
          this.broadcastChannel.onmessage = (event) => {
            this.handleBroadcastMessage(event.data);
          };
        } catch {
          this.broadcastChannel = null;
        }
      }

      // Storage event listener for cross-tab sync even without BroadcastChannel
      window.addEventListener('storage', (e) => {
        if (e.key === 'zentry_emergency_lock') {
          const locked = e.newValue === 'true';
          this.isEmergencyLocked = locked;
          this.notifyLockListeners(locked);
        }
        if (e.key === 'zentry_skinner_command' && e.newValue) {
          try {
            const cmd = JSON.parse(e.newValue);
            this.latestCommand = cmd;
            this.notifyCommandListeners(cmd);
          } catch {
            // Safe fail
          }
        }
        if (e.key === 'zentry_skinner_lever' && e.newValue) {
          try {
            const ev = JSON.parse(e.newValue);
            this.latestLeverEvent = ev;
            this.notifyLeverListeners(ev);
          } catch {
            // Safe fail
          }
        }
        if (e.key === 'zentry_skinner_report' && e.newValue) {
          try {
            const rep = JSON.parse(e.newValue);
            this.skinnerReports.set(rep.sessionId, rep);
            this.notifyReportListeners(rep);
          } catch {
            // Safe fail
          }
        }
      });

      // Cross-origin & Cross-port real-time SSE & HTTP synchronization
      this.initCrossPortSync();
    }
  }

  private initCrossPortSync() {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname || 'localhost';
    const candidatePorts = ['5175', '5173', '5174'];

    // 1. Initial State Fetch from Candidate Ports
    const fetchCurrentState = async () => {
      for (const port of candidatePorts) {
        try {
          const res = await fetch(`http://${hostname}:${port}/api/sync/lock`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.locked === 'boolean') {
              if (this.isEmergencyLocked !== data.locked) {
                this.isEmergencyLocked = data.locked;
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('zentry_emergency_lock', data.locked ? 'true' : 'false');
                }
                this.notifyLockListeners(data.locked);
              }
              break;
            }
          }
        } catch {
          // Continue to next port
        }
      }
    };

    fetchCurrentState();

    // 1b. Command State Fetch from Candidate Ports
    const fetchCurrentCommand = async () => {
      for (const port of candidatePorts) {
        try {
          const res = await fetch(`http://${hostname}:${port}/api/sync/skinner-command`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.command && (!this.latestCommand || data.command.timestamp > this.latestCommand.timestamp)) {
              this.latestCommand = data.command;
              this.notifyCommandListeners(data.command);
            }
            break;
          }
        } catch {
          // Continue to next port
        }
      }
    };

    fetchCurrentCommand();

    // 2. Real-time Push via Server-Sent Events (SSE)
    const connectSSE = (idx = 0) => {
      if (idx >= candidatePorts.length) {
        // If all candidate ports failed, retry in 3 seconds
        setTimeout(() => connectSSE(0), 3000);
        return;
      }

      const port = candidatePorts[idx];
      const sseUrl = `http://${hostname}:${port}/api/sync/events`;

      try {
        const es = new EventSource(sseUrl);
        es.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg && typeof msg.locked === 'boolean') {
              if (this.isEmergencyLocked !== msg.locked) {
                this.isEmergencyLocked = msg.locked;
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('zentry_emergency_lock', msg.locked ? 'true' : 'false');
                }
                this.notifyLockListeners(msg.locked);
              }
            }
            if (msg && msg.type === 'COMMAND' && msg.command) {
              if (!this.latestCommand || msg.command.timestamp > this.latestCommand.timestamp) {
                this.latestCommand = msg.command;
                this.notifyCommandListeners(msg.command);
              }
            }
          } catch {
            // Ignore parse errors
          }
        };

        es.onerror = () => {
          es.close();
          setTimeout(() => connectSSE(idx + 1), 2000);
        };
      } catch {
        connectSSE(idx + 1);
      }
    };

    connectSSE(0);

    // 3. Heartbeat polling every 1200ms to guarantee zero dropped events across ports
    setInterval(fetchCurrentState, 1200);
    setInterval(fetchCurrentCommand, 1200);
  }

  private handleBroadcastMessage(msg: { type: string; payload: any }) {
    if (!msg || !msg.type) return;
    switch (msg.type) {
      case 'SKINNER_COMMAND':
        this.latestCommand = msg.payload;
        this.notifyCommandListeners(msg.payload);
        break;
      case 'EMERGENCY_LOCK_CHANGE':
        this.isEmergencyLocked = Boolean(msg.payload.locked);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('zentry_emergency_lock', this.isEmergencyLocked ? 'true' : 'false');
          } catch {
            // Safe fail
          }
        }
        this.notifyLockListeners(this.isEmergencyLocked);
        break;
      case 'SKINNER_UPDATE':
        this.skinnerSessions.set(msg.payload.sessionId, msg.payload);
        this.notifySessionListeners(msg.payload);
        break;
      case 'SKINNER_LEVER':
        this.latestLeverEvent = msg.payload;
        this.notifyLeverListeners(msg.payload);
        break;
      case 'SKINNER_REPORT':
        this.skinnerReports.set(msg.payload.sessionId, msg.payload);
        this.notifyReportListeners(msg.payload);
        break;
      case 'ISLAND_TELEMETRY':
        this.islandTelemetry = [msg.payload, ...this.islandTelemetry.slice(0, 99)];
        this.notifyTelemetryListeners();
        break;
      case 'DEVICE_HEARTBEAT':
        this.deviceStatuses.set(msg.payload.deviceId, msg.payload);
        this.notifyDeviceListeners();
        break;
      case 'DOCUMENT_UPDATE':
        this.documents.set(msg.payload.id, msg.payload);
        this.notifyDocumentListeners();
        break;
      case 'DOCUMENT_DELETE':
        this.documents.delete(msg.payload.id);
        this.notifyDocumentListeners();
        break;
    }
  }

  public setEmergencyLock(locked: boolean) {
    this.isEmergencyLocked = locked;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('zentry_emergency_lock', locked ? 'true' : 'false');
      } catch {
        // Safe fail
      }
    }
    this.postBroadcast('EMERGENCY_LOCK_CHANGE', { locked });
    this.notifyLockListeners(locked);

    // Broadcast across all candidate ports (5175, 5173, 5174) to reach all other running Vite servers immediately
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      const candidatePorts = ['5175', '5173', '5174'];
      candidatePorts.forEach((port) => {
        fetch(`http://${hostname}:${port}/api/sync/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locked }),
        }).catch(() => {});
      });
    }
  }

  public getEmergencyLock(): boolean {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('zentry_emergency_lock');
        if (stored !== null) return stored === 'true';
      } catch {
        // Safe fail
      }
    }
    return this.isEmergencyLocked;
  }

  public onEmergencyLockChange(listener: Listener<boolean>): () => void {
    this.lockListeners.add(listener);
    listener(this.getEmergencyLock());
    return () => this.lockListeners.delete(listener);
  }

  private notifyLockListeners(locked: boolean) {
    this.lockListeners.forEach((l) => {
      try {
        l(locked);
      } catch (err) {
        console.error('Error in lock listener:', err);
      }
    });
  }

  private postBroadcast(type: string, payload: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, payload });
      } catch {
        // Safe fail
      }
    }
  }

  // Skinner Sessions
  public setSkinnerSession(session: SkinnerSessionRecord) {
    this.skinnerSessions.set(session.sessionId, session);
    this.notifySessionListeners(session);
    this.postBroadcast('SKINNER_UPDATE', session);
  }

  public getLatestSkinnerSession(): SkinnerSessionRecord | null {
    if (this.skinnerSessions.size === 0) return null;
    let latest: SkinnerSessionRecord | null = null;
    for (const session of this.skinnerSessions.values()) {
      if (!latest || session.lastUpdated > latest.lastUpdated) {
        latest = session;
      }
    }
    return latest;
  }

  public subscribeSkinnerSession(
    sessionId: string | null,
    callback: Listener<SkinnerSessionRecord | null>
  ): () => void {
    const wrapped: Listener<SkinnerSessionRecord | null> = (record) => {
      if (!sessionId || (record && record.sessionId === sessionId)) {
        callback(record);
      }
    };
    this.sessionListeners.add(wrapped);

    // Initial emission
    if (sessionId) {
      callback(this.skinnerSessions.get(sessionId) || null);
    } else {
      callback(this.getLatestSkinnerSession());
    }

    return () => {
      this.sessionListeners.delete(wrapped);
    };
  }

  private notifySessionListeners(record: SkinnerSessionRecord) {
    this.sessionListeners.forEach((listener) => {
      try {
        listener(record);
      } catch (err) {
        console.warn('[ResilientDataBus] Listener error:', err);
      }
    });
  }

  // Skinner Commands
  public sendSkinnerCommand(command: SkinnerCommandEvent) {
    this.latestCommand = command;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('zentry_skinner_command', JSON.stringify(command));
      } catch {
        // Safe fail
      }
    }
    this.postBroadcast('SKINNER_COMMAND', command);
    this.notifyCommandListeners(command);

    // Broadcast across all candidate ports (5175, 5173, 5174) to reach running Vite dev servers
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      const candidatePorts = ['5175', '5173', '5174'];
      candidatePorts.forEach((port) => {
        fetch(`http://${hostname}:${port}/api/sync/skinner-command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command }),
        }).catch(() => {});
      });
    }
  }

  public getLatestSkinnerCommand(): SkinnerCommandEvent | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('zentry_skinner_command');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!this.latestCommand || parsed.timestamp > this.latestCommand.timestamp) {
            this.latestCommand = parsed;
          }
        }
      } catch {
        // Safe fail
      }
    }
    return this.latestCommand;
  }

  public subscribeSkinnerCommands(callback: Listener<SkinnerCommandEvent>): () => void {
    this.commandListeners.add(callback);
    return () => {
      this.commandListeners.delete(callback);
    };
  }

  private notifyCommandListeners(command: SkinnerCommandEvent) {
    this.commandListeners.forEach((listener) => {
      try {
        listener(command);
      } catch (err) {
        console.warn('[ResilientDataBus] Command listener error:', err);
      }
    });
  }

  // Skinner Lever Events
  public publishLeverEvent(event: SkinnerLeverEvent) {
    this.latestLeverEvent = event;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('zentry_skinner_lever', JSON.stringify(event));
      } catch {
        // Safe fail
      }
    }
    this.postBroadcast('SKINNER_LEVER', event);
    this.notifyLeverListeners(event);
  }

  public getLatestLeverEvent(): SkinnerLeverEvent | null {
    return this.latestLeverEvent;
  }

  public subscribeLeverEvents(callback: Listener<SkinnerLeverEvent>): () => void {
    this.leverEventListeners.add(callback);
    return () => {
      this.leverEventListeners.delete(callback);
    };
  }

  private notifyLeverListeners(event: SkinnerLeverEvent) {
    this.leverEventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.warn('[ResilientDataBus] Lever listener error:', err);
      }
    });
  }

  // Skinner Session Reports
  public setSessionReport(report: SkinnerSessionReportRecord) {
    this.skinnerReports.set(report.sessionId, report);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('zentry_skinner_report', JSON.stringify(report));
      } catch {
        // Safe fail
      }
    }
    this.postBroadcast('SKINNER_REPORT', report);
    this.notifyReportListeners(report);
  }

  public getLatestSessionReport(): SkinnerSessionReportRecord | null {
    if (this.skinnerReports.size === 0) return null;
    const reports = Array.from(this.skinnerReports.values());
    reports.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
    return reports[0] || null;
  }

  public subscribeSessionReport(
    sessionId: string | null,
    callback: Listener<SkinnerSessionReportRecord | null>
  ): () => void {
    const wrapped: Listener<SkinnerSessionReportRecord | null> = (report) => {
      if (!sessionId || (report && report.sessionId === sessionId)) {
        callback(report);
      }
    };
    this.reportListeners.add(wrapped);

    if (sessionId) {
      callback(this.skinnerReports.get(sessionId) || null);
    } else {
      callback(this.getLatestSessionReport());
    }

    return () => {
      this.reportListeners.delete(wrapped);
    };
  }

  private notifyReportListeners(report: SkinnerSessionReportRecord) {
    this.reportListeners.forEach((listener) => {
      try {
        listener(report);
      } catch (err) {
        console.warn('[ResilientDataBus] Report listener error:', err);
      }
    });
  }

  // Island Telemetry
  public addIslandTelemetry(event: IslandTelemetryEvent) {
    this.islandTelemetry = [event, ...this.islandTelemetry.slice(0, 99)];
    this.notifyTelemetryListeners();
    this.postBroadcast('ISLAND_TELEMETRY', event);
  }

  public subscribeIslandTelemetry(
    callback: Listener<IslandTelemetryEvent[]>,
    limitCount: number = 30
  ): () => void {
    const handler = () => {
      callback(this.islandTelemetry.slice(0, limitCount));
    };
    this.telemetryListeners.add(handler);
    handler(); // Initial emission
    return () => {
      this.telemetryListeners.delete(handler);
    };
  }

  private notifyTelemetryListeners() {
    this.telemetryListeners.forEach((listener) => {
      try {
        listener(this.islandTelemetry);
      } catch (err) {
        console.warn('[ResilientDataBus] Telemetry listener error:', err);
      }
    });
  }

  // Device Status
  public setDeviceStatus(status: DeviceLiveStatus) {
    this.deviceStatuses.set(status.deviceId, status);
    this.notifyDeviceListeners();
    this.postBroadcast('DEVICE_HEARTBEAT', status);
  }

  public subscribeDeviceStatus(callback: Listener<DeviceLiveStatus[]>): () => void {
    const handler = () => {
      callback(Array.from(this.deviceStatuses.values()));
    };
    this.deviceListeners.add(handler);
    handler(); // Initial emission
    return () => {
      this.deviceListeners.delete(handler);
    };
  }

  private notifyDeviceListeners() {
    const list = Array.from(this.deviceStatuses.values());
    this.deviceListeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.warn('[ResilientDataBus] Device listener error:', err);
      }
    });
  }

  // Documents
  public setDocument(docItem: DocumentItem) {
    this.documents.set(docItem.id, docItem);
    this.notifyDocumentListeners();
    this.postBroadcast('DOCUMENT_UPDATE', docItem);
  }

  public removeDocument(docId: string) {
    this.documents.delete(docId);
    this.notifyDocumentListeners();
    this.postBroadcast('DOCUMENT_DELETE', { id: docId });
  }

  public subscribeDocuments(callback: Listener<DocumentItem[]>): () => void {
    const handler = () => {
      callback(Array.from(this.documents.values()));
    };
    this.documentListeners.add(handler);
    handler();
    return () => {
      this.documentListeners.delete(handler);
    };
  }

  private notifyDocumentListeners() {
    const list = Array.from(this.documents.values());
    this.documentListeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.warn('[ResilientDataBus] Document listener error:', err);
      }
    });
  }
}

export const localDataBus = new ResilientDataBus();

// ============================================================================
// 3. FIREBASE INITIALIZATION & CLIENT WRAPPERS
// ============================================================================

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let isFirebaseOnline = false;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    appInstance = getApp();
    return appInstance;
  }

  try {
    appInstance = initializeApp(FIREBASE_CONFIG);
    return appInstance;
  } catch (err) {
    console.warn('[Firebase] Initialization falling back to mock mode:', err);
    appInstance = initializeApp(FIREBASE_CONFIG, 'zentry-fallback-app');
    return appInstance;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  try {
    const app = getFirebaseApp();
    firestoreInstance = getFirestore(app);
    isFirebaseOnline = true;
    return firestoreInstance;
  } catch (err) {
    console.warn('[Firestore] Firestore instance unavailable, using local data bus:', err);
    firestoreInstance = null;
    isFirebaseOnline = false;
    return null;
  }
}

export function checkIsFirebaseOnline(): boolean {
  return isFirebaseOnline;
}

// ============================================================================
// 4. HIGH-LEVEL RESILIENT DATA OPERATIONS
// ============================================================================

/**
 * Publishes/updates a Skinner box session record.
 * Writes to Firestore and broadcasts via local bus.
 */
export async function publishSkinnerSession(session: SkinnerSessionRecord): Promise<void> {
  // Always update local memory bus immediately for instant UI feedback
  localDataBus.setSkinnerSession(session);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const sessionRef = doc(db, 'sessions_skinner', session.sessionId);
    await setDoc(sessionRef, session, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving skinner session to cloud (offline fallback active):', err);
  }
}

/**
 * Subscribes to a specific Skinner box session in real-time.
 */
export function subscribeToSkinnerSession(
  sessionId: string,
  callback: (session: SkinnerSessionRecord | null) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeSkinnerSession(sessionId, callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    const sessionRef = doc(db, 'sessions_skinner', sessionId);
    const unsubscribeCloud = onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SkinnerSessionRecord;
          localDataBus.setSkinnerSession(data);
          callback(data);
        }
      },
      (error) => {
        console.warn('[Firestore] Skinner session listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe failed, using local bus:', err);
    return unsubscribeLocal;
  }
}

/**
 * Subscribes to the latest Skinner box session in real-time.
 */
export function subscribeToLatestSkinnerSession(
  callback: (session: SkinnerSessionRecord | null) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeSkinnerSession(null, callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    const q = query(
      collection(db, 'sessions_skinner'),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );

    const unsubscribeCloud = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          const data = latestDoc.data() as SkinnerSessionRecord;
          localDataBus.setSkinnerSession(data);
          callback(data);
        } else {
          callback(localDataBus.getLatestSkinnerSession());
        }
      },
      (error) => {
        console.warn('[Firestore] Latest skinner session listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe latest skinner failed, using local bus:', err);
    return unsubscribeLocal;
  }
}

/**
 * Records an Island telemetry event.
 */
export async function recordIslandTelemetry(event: IslandTelemetryEvent): Promise<void> {
  localDataBus.addIslandTelemetry(event);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const eventRef = doc(db, 'island_telemetry', event.eventId);
    await setDoc(eventRef, event);
  } catch (err) {
    console.warn('[Firestore] Error saving island telemetry to cloud:', err);
  }
}

/**
 * Subscribes to recent Island telemetry events in real-time.
 */
export function subscribeToIslandTelemetry(
  callback: (events: IslandTelemetryEvent[]) => void,
  limitCount: number = 30
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeIslandTelemetry(callback, limitCount);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    const q = query(
      collection(db, 'island_telemetry'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribeCloud = onSnapshot(
      q,
      (querySnapshot) => {
        const events: IslandTelemetryEvent[] = [];
        querySnapshot.forEach((d) => {
          events.push(d.data() as IslandTelemetryEvent);
        });
        if (events.length > 0) {
          callback(events);
        }
      },
      (error) => {
        console.warn('[Firestore] Island telemetry listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe telemetry failed:', err);
    return unsubscribeLocal;
  }
}

/**
 * Updates device heartbeat / live status.
 */
export async function sendDeviceHeartbeat(status: DeviceLiveStatus): Promise<void> {
  localDataBus.setDeviceStatus(status);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const deviceRef = doc(db, 'devices_live', status.deviceId);
    await setDoc(deviceRef, status, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error updating device heartbeat:', err);
  }
}

/**
 * Subscribes to live connected devices.
 */
export function subscribeToActiveDevices(
  callback: (devices: DeviceLiveStatus[]) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeDeviceStatus(callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    const q = query(collection(db, 'devices_live'), orderBy('lastHeartbeat', 'desc'), limit(20));

    const unsubscribeCloud = onSnapshot(
      q,
      (querySnapshot) => {
        const devices: DeviceLiveStatus[] = [];
        querySnapshot.forEach((d) => {
          devices.push(d.data() as DeviceLiveStatus);
        });
        if (devices.length > 0) {
          callback(devices);
        }
      },
      (error) => {
        console.warn('[Firestore] Device live listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe devices failed:', err);
    return unsubscribeLocal;
  }
}

/**
 * Saves or updates a document in the Parental Vault.
 */
export async function saveDocument(item: DocumentItem): Promise<void> {
  localDataBus.setDocument(item);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'documents', item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving document to cloud:', err);
  }
}

/**
 * Deletes a document from the Parental Vault.
 */
export async function deleteDocument(docId: string): Promise<void> {
  localDataBus.removeDocument(docId);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'documents', docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error deleting document from cloud:', err);
  }
}

/**
 * Subscribes to Parental Vault documents.
 */
export function subscribeToDocuments(callback: (docs: DocumentItem[]) => void): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeDocuments(callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    const q = query(collection(db, 'documents'), orderBy('uploadDate', 'desc'));

    const unsubscribeCloud = onSnapshot(
      q,
      (querySnapshot) => {
        const docsList: DocumentItem[] = [];
        querySnapshot.forEach((d) => {
          docsList.push(d.data() as DocumentItem);
        });
        if (docsList.length > 0) {
          callback(docsList);
        }
      },
      (error) => {
        console.warn('[Firestore] Documents listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe documents failed:', err);
    return unsubscribeLocal;
  }
}

/**
 * Sets emergency lock state across all apps.
 */
export function setEmergencyLock(locked: boolean): void {
  localDataBus.setEmergencyLock(locked);
}

/**
 * Gets current emergency lock state.
 */
export function getEmergencyLock(): boolean {
  return localDataBus.getEmergencyLock();
}

/**
 * Subscribes to emergency lock changes across all apps.
 */
export function subscribeToEmergencyLock(callback: (locked: boolean) => void): Unsubscribe {
  return localDataBus.onEmergencyLockChange(callback);
}

/**
 * Sends a Skinner box control command (START_SESSION, END_SESSION, RESET_SESSION).
 * Broadcasts to localDataBus, HTTP cross-port endpoints, and Firestore.
 */
export async function sendSkinnerCommand(command: SkinnerCommandEvent): Promise<void> {
  localDataBus.sendSkinnerCommand(command);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const docId = command.commandId || `cmd_${command.timestamp}_${Math.random().toString(36).substring(2, 6)}`;
    const cmdRef = doc(db, 'command_bus_skinner', docId);
    await setDoc(cmdRef, command, { merge: true });

    // Canonical latest doc in command_bus_skinner for real-time subscription
    const latestRef = doc(db, 'command_bus_skinner', 'latest');
    await setDoc(latestRef, command, { merge: true });

    // Also write to skinner_control/master_command for cross-spec compatibility
    const masterRef = doc(db, 'skinner_control', 'master_command');
    await setDoc(masterRef, command, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error broadcasting skinner command to cloud:', err);
  }
}

/**
 * Subscribes to Skinner box control commands in real-time.
 * Receives commands from BroadcastChannel, HTTP sync, and Firestore.
 */
export function subscribeToSkinnerCommands(
  callback: (command: SkinnerCommandEvent) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeSkinnerCommands(callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    let lastSeenTimestamp = 0;
    const latestRef = doc(db, 'command_bus_skinner', 'latest');
    const unsubscribeCloud = onSnapshot(
      latestRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cmd = docSnap.data() as SkinnerCommandEvent;
          if (cmd && cmd.timestamp && cmd.timestamp > lastSeenTimestamp) {
            lastSeenTimestamp = cmd.timestamp;
            localDataBus.sendSkinnerCommand(cmd);
            callback(cmd);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Skinner command listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe skinner command failed:', err);
    return unsubscribeLocal;
  }
}

/**
 * Publishes a real-time Skinner box lever event.
 * Writes to Firestore and broadcasts via local bus.
 */
export async function publishSkinnerLeverEvent(event: SkinnerLeverEvent): Promise<void> {
  localDataBus.publishLeverEvent(event);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const eventRef = doc(db, 'skinner_lever_events', event.eventId);
    await setDoc(eventRef, event);

    const latestRef = doc(db, 'skinner_lever_events', 'latest');
    await setDoc(latestRef, event, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving skinner lever event:', err);
  }
}

/**
 * Gets the latest Skinner box lever event from memory.
 */
export function getLatestSkinnerLeverEvent(): SkinnerLeverEvent | null {
  return localDataBus.getLatestLeverEvent();
}

/**
 * Subscribes to real-time Skinner box lever events.
 */
export function subscribeToSkinnerLeverEvents(
  callback: (event: SkinnerLeverEvent) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeLeverEvents(callback);

  const db = getFirestoreDb();
  if (!db) {
    return unsubscribeLocal;
  }

  try {
    let lastSeenTimestamp = 0;
    const latestRef = doc(db, 'skinner_lever_events', 'latest');
    const unsubscribeCloud = onSnapshot(
      latestRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const event = docSnap.data() as SkinnerLeverEvent;
          if (event && event.timestamp && event.timestamp > lastSeenTimestamp) {
            lastSeenTimestamp = event.timestamp;
            localDataBus.publishLeverEvent(event);
            callback(event);
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Skinner lever event listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    console.warn('[Firestore] Subscribe skinner lever failed, using local bus:', err);
    return unsubscribeLocal;
  }
}

/**
 * Saves a completed Skinner box session report.
 */
export async function saveSkinnerSessionReport(report: SkinnerSessionReportRecord): Promise<void> {
  localDataBus.setSessionReport(report);

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const reportRef = doc(db, 'sessions_skinner_reports', report.sessionId);
    await setDoc(reportRef, report, { merge: true });

    // Also persist inside sessions_skinner document for single-document inspection
    const sessionRef = doc(db, 'sessions_skinner', report.sessionId);
    await setDoc(sessionRef, { sessionReport: report }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving session report:', err);
  }
}

/**
 * Subscribes to a Skinner session report in real-time.
 */
export function subscribeToSkinnerSessionReports(
  sessionId: string,
  callback: (report: SkinnerSessionReportRecord | null) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeSessionReport(sessionId, callback);

  const db = getFirestoreDb();
  if (!db) return unsubscribeLocal;

  try {
    const reportRef = doc(db, 'sessions_skinner_reports', sessionId);
    const unsubscribeCloud = onSnapshot(
      reportRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const rep = docSnap.data() as SkinnerSessionReportRecord;
          localDataBus.setSessionReport(rep);
          callback(rep);
        }
      },
      (error) => {
        console.warn('[Firestore] Report listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    return unsubscribeLocal;
  }
}

/**
 * Subscribes to the latest Skinner session report.
 */
export function subscribeToLatestSkinnerSessionReport(
  callback: (report: SkinnerSessionReportRecord | null) => void
): Unsubscribe {
  const unsubscribeLocal = localDataBus.subscribeSessionReport(null, callback);

  const db = getFirestoreDb();
  if (!db) return unsubscribeLocal;

  try {
    const q = query(
      collection(db, 'sessions_skinner_reports'),
      orderBy('endedAt', 'desc'),
      limit(1)
    );

    const unsubscribeCloud = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const rep = docSnap.data() as SkinnerSessionReportRecord;
          localDataBus.setSessionReport(rep);
          callback(rep);
        } else {
          callback(localDataBus.getLatestSessionReport());
        }
      },
      (error) => {
        console.warn('[Firestore] Latest report listener disconnected:', error);
      }
    );

    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  } catch (err) {
    return unsubscribeLocal;
  }
}

/**
 * Saves a creative creation (Z-Art WOW Studio) to local storage and Firestore.
 */
export async function saveCreativeCreation(creation: CreativeCreationRecord): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('zentry_creative_creations');
      const list: CreativeCreationRecord[] = raw ? JSON.parse(raw) : [];
      const updated = [creation, ...list.filter((item) => item.id !== creation.id)].slice(0, 30);
      localStorage.setItem('zentry_creative_creations', JSON.stringify(updated));
    } catch {}
  }

  const db = getFirestoreDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'creative_creations', creation.id);
    await setDoc(docRef, creation, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving creative creation to cloud:', err);
  }
}

/**
 * Subscribes to real-time creative creations from Firestore.
 */
export function subscribeToCreativeCreations(
  callback: (creations: CreativeCreationRecord[]) => void,
  maxItems: number = 20
): Unsubscribe {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('zentry_creative_creations');
      if (raw) {
        const localList: CreativeCreationRecord[] = JSON.parse(raw);
        if (localList.length > 0) callback(localList);
      }
    } catch {}
  }

  const db = getFirestoreDb();
  if (!db) return () => {};

  try {
    const q = query(
      collection(db, 'creative_creations'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribeCloud = onSnapshot(
      q,
      (snapshot) => {
        const list: CreativeCreationRecord[] = [];
        snapshot.forEach((d) => list.push(d.data() as CreativeCreationRecord));
        if (list.length > 0) {
          callback(list);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('zentry_creative_creations', JSON.stringify(list));
            } catch {}
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Creative creations listener disconnected:', error);
      }
    );

    return unsubscribeCloud;
  } catch (err) {
    return () => {};
  }
}



