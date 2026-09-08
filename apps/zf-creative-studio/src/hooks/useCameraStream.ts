import { useState, useEffect, useRef, useCallback } from 'react';
import type { CameraMode } from '@zentry/shared';
import { cameraService, type CameraStreamState } from '../services/cameraStreamService';
import { islandTelemetryService } from '../services/islandTelemetryService';

export function useCameraStream() {
  const [streamState, setStreamState] = useState<CameraStreamState>({
    mode: 'environment',
    mainStream: null,
    pipStream: null,
    pipSnapshotBase64: null,
    isDualFallbackActive: false,
    isStreaming: false,
    error: null,
    activeFacing: 'environment',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  const switchCameraMode = useCallback(async (mode: CameraMode) => {
    const newState = await cameraService.setCameraMode(mode);
    setStreamState(newState);

    if (videoRef.current && newState.mainStream) {
      videoRef.current.srcObject = newState.mainStream;
      videoRef.current.play().catch(() => {});
    }

    if (pipVideoRef.current && newState.pipStream) {
      pipVideoRef.current.srcObject = newState.pipStream;
      pipVideoRef.current.play().catch(() => {});
    }

    // Telemetry log for camera switch
    islandTelemetryService.logEvent({
      cameraMode: mode,
    });
  }, []);

  const captureActiveFrame = useCallback(() => {
    return cameraService.captureFrameBase64(videoRef.current);
  }, []);

  useEffect(() => {
    // Initial camera load
    switchCameraMode('environment');

    return () => {
      cameraService.stopAllStreams();
    };
  }, [switchCameraMode]);

  return {
    streamState,
    videoRef,
    pipVideoRef,
    switchCameraMode,
    captureActiveFrame,
  };
}
