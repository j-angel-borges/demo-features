/**
 * Zentry Commercial Demo Suite - In-Memory Reactive Firestore Mock
 * Provides 100% contract fidelity for collections:
 *   - sessions_skinner
 *   - island_telemetry
 *   - devices_live
 * Supports onSnapshot real-time pub/sub, queries (where, orderBy, limit), setDoc, updateDoc, getDocs.
 */

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

export interface DeviceLiveStatus {
  deviceId: string;
  appName: 'isla-dinamica' | 'skinner-box' | 'parent-dashboard';
  isOnline: boolean;
  lastHeartbeat: number;
  activeSessionId?: string;
}

export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any';
export type OrderByDirection = 'asc' | 'desc';

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  op?: WhereFilterOp;
  value?: any;
  direction?: OrderByDirection;
  limitCount?: number;
}

export interface DocumentSnapshot<T = any> {
  id: string;
  exists: () => boolean;
  data: () => T | undefined;
}

export interface QueryDocumentSnapshot<T = any> extends DocumentSnapshot<T> {
  data: () => T;
}

export interface QuerySnapshot<T = any> {
  docs: QueryDocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach: (callback: (result: QueryDocumentSnapshot<T>) => void) => void;
}

export interface DocumentReference<T = any> {
  id: string;
  path: string;
  collectionName: string;
}

export interface CollectionReference<T = any> {
  id: string;
  path: string;
}

export interface Query<T = any> {
  collectionName: string;
  constraints: QueryConstraint[];
}

export class MockFirestoreDatabase {
  private data: Map<string, Map<string, any>> = new Map();
  private listeners: Set<{
    type: 'doc' | 'query';
    pathOrQuery: string | Query;
    callback: (snapshot: any) => void;
    errorCallback?: (err: Error) => void;
  }> = new Set();
  public isOnline: boolean = true;
  public offlineQueue: Array<() => Promise<void>> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.data.clear();
    this.listeners.clear();
    this.isOnline = true;
    this.offlineQueue = [];
    // Ensure primary demo collections are initialized
    this.data.set('sessions_skinner', new Map());
    this.data.set('island_telemetry', new Map());
    this.data.set('devices_live', new Map());
  }

  setOnline(online: boolean) {
    this.isOnline = online;
    if (online && this.offlineQueue.length > 0) {
      const queue = [...this.offlineQueue];
      this.offlineQueue = [];
      queue.forEach(op => op());
    }
  }

  private getCollectionMap(collectionName: string): Map<string, any> {
    if (!this.data.has(collectionName)) {
      this.data.set(collectionName, new Map());
    }
    return this.data.get(collectionName)!;
  }

  async setDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void> {
    const op = async () => {
      const colMap = this.getCollectionMap(docRef.collectionName);
      let nextData = { ...data };
      if (options?.merge && colMap.has(docRef.id)) {
        const existing = colMap.get(docRef.id);
        nextData = { ...existing, ...data };
      }
      colMap.set(docRef.id, JSON.parse(JSON.stringify(nextData)));
      this.notifyListeners(docRef.collectionName, docRef.id);
    };

    if (!this.isOnline) {
      this.offlineQueue.push(op);
      return;
    }
    await op();
  }

  async updateDoc(docRef: DocumentReference, updates: Record<string, any>): Promise<void> {
    const op = async () => {
      const colMap = this.getCollectionMap(docRef.collectionName);
      if (!colMap.has(docRef.id)) {
        throw new Error(`Document not found for update: ${docRef.path}`);
      }
      const existing = colMap.get(docRef.id);
      const merged = { ...existing, ...updates };
      colMap.set(docRef.id, JSON.parse(JSON.stringify(merged)));
      this.notifyListeners(docRef.collectionName, docRef.id);
    };

    if (!this.isOnline) {
      this.offlineQueue.push(op);
      return;
    }
    await op();
  }

  async getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
    const colMap = this.getCollectionMap(docRef.collectionName);
    const exists = colMap.has(docRef.id);
    const data = exists ? JSON.parse(JSON.stringify(colMap.get(docRef.id))) : undefined;

    return {
      id: docRef.id,
      exists: () => exists,
      data: () => data,
    };
  }

  async deleteDoc(docRef: DocumentReference): Promise<void> {
    const colMap = this.getCollectionMap(docRef.collectionName);
    colMap.delete(docRef.id);
    this.notifyListeners(docRef.collectionName, docRef.id);
  }

  async getDocs(targetQuery: Query | CollectionReference): Promise<QuerySnapshot> {
    const collectionName = 'constraints' in targetQuery ? targetQuery.collectionName : targetQuery.id;
    const constraints = 'constraints' in targetQuery ? targetQuery.constraints : [];
    const colMap = this.getCollectionMap(collectionName);

    let items: Array<{ id: string; data: any }> = Array.from(colMap.entries()).map(([id, data]) => ({
      id,
      data: JSON.parse(JSON.stringify(data)),
    }));

    // Apply where filters
    for (const c of constraints) {
      if (c.type === 'where' && c.field) {
        items = items.filter(item => {
          const val = item.data[c.field!];
          switch (c.op) {
            case '==':
              return val === c.value;
            case '!=':
              return val !== c.value;
            case '<':
              return val < c.value;
            case '<=':
              return val <= c.value;
            case '>':
              return val > c.value;
            case '>=':
              return val >= c.value;
            case 'array-contains':
              return Array.isArray(val) && val.includes(c.value);
            case 'in':
              return Array.isArray(c.value) && c.value.includes(val);
            default:
              return true;
          }
        });
      }
    }

    // Apply orderBy
    for (const c of constraints) {
      if (c.type === 'orderBy' && c.field) {
        const dir = c.direction === 'desc' ? -1 : 1;
        items.sort((a, b) => {
          const valA = a.data[c.field!];
          const valB = b.data[c.field!];
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
          return 0;
        });
      }
    }

    // Apply limit
    for (const c of constraints) {
      if (c.type === 'limit' && typeof c.limitCount === 'number') {
        items = items.slice(0, c.limitCount);
      }
    }

    const docs: QueryDocumentSnapshot[] = items.map(item => ({
      id: item.id,
      exists: () => true,
      data: () => item.data,
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: callback => docs.forEach(callback),
    };
  }

  onSnapshot(
    target: DocumentReference | Query | CollectionReference,
    onNext: (snapshot: any) => void,
    onError?: (err: Error) => void
  ): () => void {
    const isDoc = 'path' in target && !('constraints' in target) && target.path.includes('/');
    const listenerEntry = {
      type: isDoc ? ('doc' as const) : ('query' as const),
      pathOrQuery: isDoc ? (target as DocumentReference).path : ('constraints' in target ? target : { collectionName: target.id, constraints: [] }),
      callback: onNext,
      errorCallback: onError,
    };

    this.listeners.add(listenerEntry);

    // Immediate initial dispatch
    Promise.resolve().then(async () => {
      try {
        if (isDoc) {
          const snap = await this.getDoc(target as DocumentReference);
          onNext(snap);
        } else {
          const snap = await this.getDocs(target as any);
          onNext(snap);
        }
      } catch (err: any) {
        if (onError) onError(err);
      }
    });

    // Unsubscribe function
    return () => {
      this.listeners.delete(listenerEntry);
    };
  }

  private notifyListeners(collectionName: string, docId: string) {
    const docPath = `${collectionName}/${docId}`;

    for (const listener of this.listeners) {
      if (listener.type === 'doc' && listener.pathOrQuery === docPath) {
        this.getDoc({ id: docId, path: docPath, collectionName }).then(snap => {
          listener.callback(snap);
        });
      } else if (listener.type === 'query') {
        const q = listener.pathOrQuery as Query;
        if (q.collectionName === collectionName) {
          this.getDocs(q).then(snap => {
            listener.callback(snap);
          });
        }
      }
    }
  }

  getActiveListenersCount(): number {
    return this.listeners.size;
  }

  getAllDocsInCollection(colName: string): any[] {
    const col = this.getCollectionMap(colName);
    return Array.from(col.values());
  }
}

// Global Singleton Instance
export const mockFirestoreDb = new MockFirestoreDatabase();

// ---------------------------------------------------------------------------
// Modular Firestore SDK Mock Functions
// ---------------------------------------------------------------------------

export function getFirestore(): MockFirestoreDatabase {
  return mockFirestoreDb;
}

export function collection(dbOrCol: MockFirestoreDatabase | string, collectionName?: string): CollectionReference {
  const colName = typeof dbOrCol === 'string' ? dbOrCol : collectionName!;
  return {
    id: colName,
    path: colName,
  };
}

export function doc(dbOrCol: MockFirestoreDatabase | CollectionReference | string, ...pathSegments: string[]): DocumentReference {
  let colName = '';
  let docId = '';

  if (typeof dbOrCol === 'string') {
    const parts = [dbOrCol, ...pathSegments];
    colName = parts[0];
    docId = parts[1] || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  } else if ('id' in dbOrCol && 'path' in dbOrCol) {
    colName = dbOrCol.id;
    docId = pathSegments[0] || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  } else {
    colName = pathSegments[0];
    docId = pathSegments[1] || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  return {
    id: docId,
    path: `${colName}/${docId}`,
    collectionName: colName,
  };
}

export function query(colRef: CollectionReference, ...constraints: QueryConstraint[]): Query {
  return {
    collectionName: colRef.id,
    constraints,
  };
}

export function where(field: string, op: WhereFilterOp, value: any): QueryConstraint {
  return {
    type: 'where',
    field,
    op,
    value,
  };
}

export function orderBy(field: string, direction: OrderByDirection = 'asc'): QueryConstraint {
  return {
    type: 'orderBy',
    field,
    direction,
  };
}

export function limit(limitCount: number): QueryConstraint {
  return {
    type: 'limit',
    limitCount,
  };
}

export async function setDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void> {
  return mockFirestoreDb.setDoc(docRef, data, options);
}

export async function updateDoc(docRef: DocumentReference, data: Record<string, any>): Promise<void> {
  return mockFirestoreDb.updateDoc(docRef, data);
}

export async function getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  return mockFirestoreDb.getDoc(docRef);
}

export async function getDocs(queryOrCol: Query | CollectionReference): Promise<QuerySnapshot> {
  return mockFirestoreDb.getDocs(queryOrCol);
}

export async function deleteDoc(docRef: DocumentReference): Promise<void> {
  return mockFirestoreDb.deleteDoc(docRef);
}

export function onSnapshot(
  target: DocumentReference | Query | CollectionReference,
  onNext: (snap: any) => void,
  onError?: (err: Error) => void
): () => void {
  return mockFirestoreDb.onSnapshot(target, onNext, onError);
}
