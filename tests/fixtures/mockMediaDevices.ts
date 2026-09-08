/**
 * Zentry Commercial Demo Suite - Realistic MediaDevices & Camera Stream Mock
 * Emulates hardware camera devices for:
 *   - Environment (Rear Camera)
 *   - User (Front Camera)
 *   - Dual BeReal PiP Mode & Canvas Compositor Fallback
 * Provides complete stream lifecycle, permission states, and synthetic frame generation.
 */

export type CameraFacingMode = 'environment' | 'user' | 'dual_bereal';
export type CameraPermissionState = 'granted' | 'denied' | 'prompt';

export interface MockMediaTrackSettings {
  width: number;
  height: number;
  frameRate: number;
  facingMode: string;
  deviceId: string;
}

export class MockMediaStreamTrack {
  public id: string;
  public kind: 'video' | 'audio';
  public label: string;
  public enabled: boolean = true;
  public readyState: 'live' | 'ended' = 'live';
  public facingMode: string;
  private settings: MockMediaTrackSettings;
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor(kind: 'video' | 'audio', facingMode: string, label?: string) {
    this.id = `track_${kind}_${facingMode}_${Math.random().toString(36).substr(2, 6)}`;
    this.kind = kind;
    this.facingMode = facingMode;
    this.label = label || `Mock ${facingMode} ${kind} track`;
    this.settings = {
      width: 1920,
      height: 1080,
      frameRate: 60,
      facingMode,
      deviceId: `device_${facingMode}_01`,
    };
  }

  stop() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }

  getSettings(): MockMediaTrackSettings {
    return { ...this.settings };
  }

  getConstraints(): MediaTrackConstraints {
    return {
      facingMode: this.facingMode,
      width: { ideal: this.settings.width },
      height: { ideal: this.settings.height },
      frameRate: { ideal: this.settings.frameRate },
    };
  }

  async applyConstraints(constraints?: MediaTrackConstraints): Promise<void> {
    if (constraints?.facingMode) {
      const mode = typeof constraints.facingMode === 'string' ? constraints.facingMode : (constraints.facingMode as any).exact;
      if (mode) {
        this.facingMode = mode;
        this.settings.facingMode = mode;
      }
    }
  }

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      set.forEach(fn => fn(event));
    }
    return true;
  }
}

export class MockMediaStream {
  public id: string;
  public active: boolean = true;
  private tracks: MockMediaStreamTrack[] = [];
  public isDualStream: boolean = false;
  public pipSubStream?: MockMediaStream;

  constructor(tracks: MockMediaStreamTrack[] = []) {
    this.id = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.tracks = [...tracks];
  }

  getTracks(): MockMediaStreamTrack[] {
    return [...this.tracks];
  }

  getVideoTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === 'video');
  }

  getAudioTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === 'audio');
  }

  addTrack(track: MockMediaStreamTrack) {
    this.tracks.push(track);
  }

  removeTrack(track: MockMediaStreamTrack) {
    this.tracks = this.tracks.filter(t => t.id !== track.id);
  }

  getTrackById(trackId: string): MockMediaStreamTrack | undefined {
    return this.tracks.find(t => t.id === trackId);
  }

  stop() {
    this.active = false;
    this.tracks.forEach(t => t.stop());
    if (this.pipSubStream) {
      this.pipSubStream.stop();
    }
  }

  // Generates synthetic frame buffer (Base64 JPEG representation)
  captureFrameAsBase64(format: 'jpeg' | 'png' = 'jpeg'): string {
    const videoTrack = this.getVideoTracks()[0];
    const facing = videoTrack ? videoTrack.facingMode : 'environment';
    const timestamp = Date.now();
    // Deterministic mock image payload containing optical metadata
    const payload = JSON.stringify({
      facingMode: facing,
      timestamp,
      width: 1920,
      height: 1080,
      isDualPiP: this.isDualStream,
      opticPhysics: 'liquid_glass_refraction_v4',
    });
    return `data:image/${format};base64,${Buffer.from(payload).toString('base64')}`;
  }
}

export interface MockDeviceInfo {
  deviceId: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  label: string;
  groupId: string;
  facing?: 'environment' | 'user';
}

export class MockMediaDevicesManager {
  public permissionState: CameraPermissionState = 'granted';
  public errorToThrow: Error | null = null;
  public availableDevices: MockDeviceInfo[] = [
    { deviceId: 'cam_rear_01', kind: 'videoinput', label: 'Back Ultra Wide Camera (Environment)', groupId: 'group_cam_01', facing: 'environment' },
    { deviceId: 'cam_front_01', kind: 'videoinput', label: 'Front TrueDepth Camera (User)', groupId: 'group_cam_02', facing: 'user' },
    { deviceId: 'mic_main_01', kind: 'audioinput', label: 'Studio Multichannel Mic Array', groupId: 'group_audio_01' },
  ];
  public activeStreams: Set<MockMediaStream> = new Set();
  public hardwareSupportsDualConcurrentStreams: boolean = true;

  reset() {
    this.permissionState = 'granted';
    this.errorToThrow = null;
    this.activeStreams.forEach(s => s.stop());
    this.activeStreams.clear();
    this.hardwareSupportsDualConcurrentStreams = true;
  }

  setPermission(state: CameraPermissionState) {
    this.permissionState = state;
  }

  simulateHardwareError(err: Error | null) {
    this.errorToThrow = err;
  }

  async enumerateDevices(): Promise<MockDeviceInfo[]> {
    if (this.permissionState === 'denied') {
      return [];
    }
    return [...this.availableDevices];
  }

  async getUserMedia(constraints?: MediaStreamConstraints): Promise<MockMediaStream> {
    if (this.errorToThrow) {
      throw this.errorToThrow;
    }

    if (this.permissionState === 'denied') {
      const err = new Error('Permission denied by user') as any;
      err.name = 'NotAllowedError';
      throw err;
    }

    if (!this.hardwareSupportsDualConcurrentStreams && this.activeStreams.size >= 1) {
      const err = new Error('Concurrent camera hardware streams not supported on this device') as any;
      err.name = 'NotReadableError';
      throw err;
    }

    // Determine requested facing mode
    let facing: CameraFacingMode = 'environment';
    if (constraints?.video && typeof constraints.video === 'object') {
      const v = constraints.video as any;
      if (v.facingMode) {
        facing = typeof v.facingMode === 'string' ? (v.facingMode as CameraFacingMode) : (v.facingMode.exact || 'environment');
      }
    }

    if (facing === 'dual_bereal') {
      // Dual BeReal PiP Mode
      if (this.hardwareSupportsDualConcurrentStreams) {
        const rearTrack = new MockMediaStreamTrack('video', 'environment', 'Rear Main Stream');
        const frontTrack = new MockMediaStreamTrack('video', 'user', 'Front PiP Stream');
        const dualStream = new MockMediaStream([rearTrack, frontTrack]);
        dualStream.isDualStream = true;

        const pipStream = new MockMediaStream([frontTrack]);
        dualStream.pipSubStream = pipStream;

        this.activeStreams.add(dualStream);
        return dualStream;
      } else {
        // Fallback: Rapid-Snap Canvas Compositor Stream
        const compositeTrack = new MockMediaStreamTrack('video', 'environment', 'Composited Dual Stream');
        const dualStream = new MockMediaStream([compositeTrack]);
        dualStream.isDualStream = true;
        this.activeStreams.add(dualStream);
        return dualStream;
      }
    }

    const videoTrack = new MockMediaStreamTrack('video', facing);
    const audioTrack = constraints?.audio ? new MockMediaStreamTrack('audio', 'mic') : null;

    const stream = new MockMediaStream(audioTrack ? [videoTrack, audioTrack] : [videoTrack]);
    this.activeStreams.add(stream);
    return stream;
  }

  getActiveStreams(): MockMediaStream[] {
    return Array.from(this.activeStreams).filter(
      s => s.active && s.getVideoTracks().some(t => t.readyState === 'live')
    );
  }
}

// Global MediaDevices Singleton
export const mockMediaDevices = new MockMediaDevicesManager();

// Polyfill global MediaStream if needed
if (typeof (global as any).MediaStream === 'undefined') {
  (global as any).MediaStream = MockMediaStream;
}

// Install onto global navigator if in test runtime
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    mediaDevices: mockMediaDevices,
  };
} else if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: mockMediaDevices,
    writable: true,
  });
}

// Install lightweight DOM mock for headless Node / tsx execution
if (typeof document === 'undefined') {
  (global as any).document = {
    createElement: (tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 720,
          height: 1280,
          getContext: (_ctxType: string) => ({
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} }),
            fillRect: () => {},
            strokeRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            arc: () => {},
            ellipse: () => {},
            fill: () => {},
            fillText: () => {},
            drawImage: () => {},
            translate: () => {},
            scale: () => {},
          }),
          toDataURL: (_format = 'image/jpeg', _quality = 0.85) =>
            `data:image/jpeg;base64,${Buffer.from('MOCK_CANVAS_PAYLOAD').toString('base64')}`,
          captureStream: (_fps = 60) => new MockMediaStream(),
        };
      }
      if (tagName === 'video') {
        return {
          muted: true,
          playsInline: true,
          srcObject: null,
          videoWidth: 640,
          videoHeight: 480,
          play: async () => {},
        };
      }
      return {};
    },
  };
}
