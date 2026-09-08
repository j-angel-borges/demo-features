import { saveVibeSession, VibeSessionRecord } from '@zentry/shared';

/**
 * VibeTelemetryService: Publicador silencioso a Firestore `sessions_vibe`.
 * Permite al Parent Dashboard observar el bienestar sensorial y motriz del niño en tiempo real.
 */
export class VibeTelemetryService {
  private sessionId: string;
  private childId: string = 'Mateo Quispe';
  private startTime: number;
  private syncTimer: any = null;

  private record: VibeSessionRecord;

  constructor() {
    this.sessionId = 'vibe_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    this.startTime = Date.now();

    this.record = {
      sessionId: this.sessionId,
      childId: this.childId,
      appName: 'vibe-coding',
      targetCohort: '2-5',
      deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'smartphone' : 'tablet',
      status: 'active',
      startTime: this.startTime,
      lastUpdated: this.startTime,
      totalEntitiesCreated: 0,
      rapidTapBurstCount: 0,
      multiPointerCount: 0,
      palmContactCount: 0,
      acousticClimate: {
        rmsDb: 42,
        spectralFlatness: 0.22,
        isCalm: true,
        sampleCount: 1,
        lastUpdated: this.startTime,
      },
      explorationScore: 10,
      activeFolderCategories: ['characters', 'scenes', 'sounds'],
    };
  }

  public recordEntityCreated(): void {
    this.record.totalEntitiesCreated++;
    this.calculateScore();
    this.scheduleDebouncedSync();
  }

  public recordRapidTap(): void {
    this.record.rapidTapBurstCount++;
    this.calculateScore();
    this.scheduleDebouncedSync();
  }

  public recordMultiPointer(): void {
    this.record.multiPointerCount++;
    this.calculateScore();
    this.scheduleDebouncedSync();
  }

  public recordPalmContact(): void {
    this.record.palmContactCount++;
    this.calculateScore();
    this.scheduleDebouncedSync();
  }

  public updateAcousticMetrics(rmsDb: number, spectralFlatness: number, isCalm: boolean): void {
    this.record.acousticClimate = {
      rmsDb,
      spectralFlatness,
      isCalm,
      sampleCount: this.record.acousticClimate.sampleCount + 1,
      lastUpdated: Date.now(),
    };
    this.scheduleDebouncedSync();
  }

  private calculateScore(): void {
    // Puntuación de exploración pedagógica basada en diversidad motriz (0 - 100%)
    const entityPoints = Math.min(40, this.record.totalEntitiesCreated * 8);
    const multiTouchPoints = Math.min(30, this.record.multiPointerCount * 5);
    const motorVarietyPoints = Math.min(30, (this.record.rapidTapBurstCount + this.record.palmContactCount) * 4);
    this.record.explorationScore = Math.min(100, Math.max(10, entityPoints + multiTouchPoints + motorVarietyPoints));
    this.record.lastUpdated = Date.now();
  }

  private scheduleDebouncedSync(): void {
    if (this.syncTimer) return;
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      this.flushToFirestore();
    }, 3000); // Sincronización cada 3 segundos en background
  }

  public async flushToFirestore(): Promise<void> {
    try {
      this.record.lastUpdated = Date.now();
      await saveVibeSession({ ...this.record });
    } catch (err) {
      // Manejo silencioso: en modo offline no interrumpe el juego del niño
    }
  }

  public getSessionRecord(): VibeSessionRecord {
    return this.record;
  }
}

export const vibeTelemetry = new VibeTelemetryService();
