/**
 * Camera Stream & Dual BeReal Manager for Isla Dinámica
 * Handles environment (rear), user (front selfie), and dual BeReal mode
 * with robust hardware fallback for all devices (laptop webcams and mobile phones).
 */

import type { CameraMode } from '@zentry/shared';

export interface CameraStreamState {
  mode: CameraMode;
  mainStream: MediaStream | null;
  pipStream: MediaStream | null;
  pipSnapshotBase64: string | null;
  isDualFallbackActive: boolean;
  isStreaming: boolean;
  error: string | null;
  activeFacing: 'environment' | 'user';
}

export class CameraStreamService {
  private mainStream: MediaStream | null = null;
  private pipStream: MediaStream | null = null;
  private currentMode: CameraMode = 'environment';
  private isDualFallback = false;

  public getIsFallbackActive(): boolean {
    return this.isDualFallback;
  }

  /**
   * Initializes real camera stream for the given mode.
   */
  public async setCameraMode(mode: CameraMode): Promise<CameraStreamState> {
    this.stopAllStreams();
    this.currentMode = mode;

    try {
      if (mode === 'environment') {
        this.mainStream = await this.requestStream({ facingMode: { ideal: 'environment' } });
        this.isDualFallback = false;
        return {
          mode: 'environment',
          mainStream: this.mainStream,
          pipStream: null,
          pipSnapshotBase64: null,
          isDualFallbackActive: false,
          isStreaming: true,
          error: null,
          activeFacing: 'environment',
        };
      }

      if (mode === 'user') {
        this.mainStream = await this.requestStream({ facingMode: { ideal: 'user' } });
        this.isDualFallback = false;
        return {
          mode: 'user',
          mainStream: this.mainStream,
          pipStream: null,
          pipSnapshotBase64: null,
          isDualFallbackActive: false,
          isStreaming: true,
          error: null,
          activeFacing: 'user',
        };
      }

      if (mode === 'dual_bereal') {
        // Attempt dual concurrent hardware streams
        try {
          this.mainStream = await this.requestStream({
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          });

          this.pipStream = await this.requestStream({
            facingMode: { ideal: 'user' },
            width: { ideal: 640 },
            height: { ideal: 480 },
          });

          this.isDualFallback = false;
          return {
            mode: 'dual_bereal',
            mainStream: this.mainStream,
            pipStream: this.pipStream,
            pipSnapshotBase64: null,
            isDualFallbackActive: false,
            isStreaming: true,
            error: null,
            activeFacing: 'environment',
          };
        } catch {
          // Hardware doesn't support 2 simultaneous open streams (common on desktop/Android)
          this.isDualFallback = true;
          this.mainStream = await this.requestStream({
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          });

          return {
            mode: 'dual_bereal',
            mainStream: this.mainStream,
            pipStream: null,
            pipSnapshotBase64: null,
            isDualFallbackActive: true,
            isStreaming: true,
            error: null,
            activeFacing: 'environment',
          };
        }
      }

      throw new Error(`Modo desconocido: ${mode}`);
    } catch (err: any) {
      console.warn('[Camera] Failed to initialize hardware camera:', err);
      return {
        mode,
        mainStream: null,
        pipStream: null,
        pipSnapshotBase64: null,
        isDualFallbackActive: false,
        isStreaming: false,
        error: err?.message || 'Cámara no disponible o permiso denegado',
        activeFacing: mode === 'user' ? 'user' : 'environment',
      };
    }
  }

  /**
   * Safe getUserMedia with automatic multi-tier fallback:
   * Tier 1: Try specific constraints (e.g. facingMode 'environment')
   * Tier 2: Fallback to { video: true } (grabs any webcam/camera attached to the device)
   */
  private async requestStream(constraints: MediaTrackConstraints): Promise<MediaStream> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: false,
        });
      } catch (tier1Err) {
        console.warn('[Camera] Specific constraints failed, attempting generic video:true fallback', tier1Err);
        // Fallback to basic generic video constraint so any laptop webcam or smartphone camera immediately connects
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
    }
    throw new Error('navigator.mediaDevices.getUserMedia no soportado en este navegador');
  }

  /**
   * Clamps draggable PiP coordinates within container boundaries.
   */
  public static clampPipCoordinates(
    x: number,
    y: number,
    containerW = 360,
    containerH = 480,
    pipW = 90,
    pipH = 120
  ): { x: number; y: number } {
    const minX = 12;
    const maxX = containerW - pipW - 12;
    const minY = 12;
    const maxY = containerH - pipH - 12;
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }

  /**
   * Normalizes client touch coordinates to [0, 1] relative to viewport element.
   */
  public static normalizeTouchCoordinates(
    clientX: number,
    clientY: number,
    rect: { left: number; top: number; width: number; height: number }
  ): { x: number; y: number } {
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, Math.round(x * 1000) / 1000)),
      y: Math.max(0, Math.min(1, Math.round(y * 1000) / 1000)),
    };
  }

  /**
   * Captures high-res JPEG base64 frame from active video element.
   */
  public captureFrameBase64(videoElement?: HTMLVideoElement | null): string {
    if (videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (this.currentMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.88);
      }
    }
    return '';
  }

  /**
   * Stops all active camera tracks cleanly.
   */
  public stopAllStreams(): void {
    if (this.mainStream) {
      this.mainStream.getTracks().forEach((t) => t.stop());
      this.mainStream = null;
    }
    if (this.pipStream) {
      this.pipStream.getTracks().forEach((t) => t.stop());
      this.pipStream = null;
    }
  }
}

export const cameraStreamService = new CameraStreamService();
export const cameraService = cameraStreamService;
