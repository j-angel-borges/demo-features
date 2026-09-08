/**
 * Island Telemetry & Device Live Heartbeat Service
 * Publishes events to Firestore collections `island_telemetry` and `devices_live`
 * via @zentry/shared.
 */

import {
  recordIslandTelemetry,
  sendDeviceHeartbeat,
  type IslandTelemetryEvent,
  type DeviceLiveStatus,
  type CameraMode,
  type IslandActionType,
  type GenerativeStyle,
  type RedesignOption,
} from '@zentry/shared';

class IslandTelemetryService {
  private deviceId: string;
  private heartbeatInterval: any = null;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.startHeartbeat();
  }

  private getOrCreateDeviceId(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('zentry_island_device_id');
      if (stored) return stored;
      const newId = `island_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('zentry_island_device_id', newId);
      return newId;
    }
    return `island_ephemeral_${Date.now()}`;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    const emit = () => {
      const status: DeviceLiveStatus = {
        deviceId: this.deviceId,
        appName: 'isla-dinamica',
        isOnline: true,
        lastHeartbeat: Date.now(),
      };
      sendDeviceHeartbeat(status).catch((err) => {
        console.warn('[Telemetry] Heartbeat emit failed:', err);
      });
    };

    emit();
    this.heartbeatInterval = setInterval(emit, 10000);
  }

  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Records a general Island telemetry event.
   */
  public async logEvent(params: {
    cameraMode?: CameraMode;
    activeAction?: IslandActionType;
    touchCoordinates?: { x: number; y: number };
    aiPrompt?: string;
    aiResponse?: string;
    generativeStyle?: GenerativeStyle;
    redesignOptions?: RedesignOption[];
    frameSnapshotUrl?: string;
    circadianPhase?: string;
    circadianHour?: number;
    actionPayload?: Record<string, any>;
  }): Promise<void> {
    const event: IslandTelemetryEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deviceId: this.deviceId,
      timestamp: Date.now(),
      cameraMode: params.cameraMode || 'environment',
      activeAction: params.activeAction,
      touchCoordinates: params.touchCoordinates,
      aiPrompt: params.aiPrompt,
      aiResponse: params.aiResponse,
      generativeStyle: params.generativeStyle,
      redesignOptions: params.redesignOptions,
      frameSnapshotUrl: params.frameSnapshotUrl,
      circadianPhase: params.circadianPhase,
      circadianHour: params.circadianHour,
      actionPayload: params.actionPayload,
    };

    try {
      await recordIslandTelemetry(event);
      console.log(`[Telemetry:Island] Recorded event ${event.eventId} (${event.activeAction || 'stream'})`);
    } catch (err) {
      console.warn('[Telemetry] Error recording event:', err);
    }
  }

  /**
   * Records an agentic copilot action (voice command, quick chip, theme, ART break, circadian query).
   */
  public async logAgenticAction(
    action: IslandActionType,
    prompt: string,
    response: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      cameraMode: 'environment',
      activeAction: action,
      aiPrompt: prompt,
      aiResponse: response,
      actionPayload: metadata,
    });
  }

  /**
   * Records a circadian phase change or biological query event.
   */
  public async logCircadianEvent(
    phase: string,
    hour: number,
    description: string
  ): Promise<void> {
    await this.logEvent({
      cameraMode: 'environment',
      activeAction: 'circadian_phase_change',
      circadianPhase: phase,
      circadianHour: hour,
      aiResponse: description,
    });
  }
}

export const islandTelemetryService = new IslandTelemetryService();
