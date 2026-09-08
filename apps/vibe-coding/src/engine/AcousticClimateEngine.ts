import { AcousticClimateState } from '../types';

/**
 * AcousticClimateEngine: Sensor de entorno acústico no invasivo (Web Audio API / FFT).
 * Respeta 100% la privacidad infantil: ningún audio se graba ni se transmite.
 * Mide RMS (dB) y Spectral Flatness (ruido caótico vs armonía).
 */
export class AcousticClimateEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening = false;

  // Estado del sensor
  private currentState: AcousticClimateState = {
    rmsDb: 42,
    spectralFlatness: 0.22,
    isCalm: true,
    ambientMode: 'creative',
    isListening: false,
  };

  public async startListening(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false, // Permitir captar el clima de fondo real
            autoGainControl: false,
          },
          video: false,
        });

        const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.isListening = true;
        this.currentState.isListening = true;
        return true;
      }
    } catch (err) {
      console.warn('[AcousticClimateEngine] Mic access deferred or simulated:', err);
    }
    return false;
  }

  public stopListening(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isListening = false;
    this.currentState.isListening = false;
  }

  public update(): AcousticClimateState {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      // Simulación orgánica sutil en ausencia de permiso directo
      const time = performance.now() * 0.001;
      const simDb = 40 + Math.sin(time * 0.4) * 5;
      const simFlatness = 0.2 + Math.cos(time * 0.3) * 0.08;
      const isCalm = simDb < 62;

      this.currentState = {
        rmsDb: Math.round(simDb),
        spectralFlatness: Number(simFlatness.toFixed(3)),
        isCalm,
        ambientMode: isCalm ? 'creative' : 'calm',
        isListening: false,
      };
      return this.currentState;
    }

    // 1. Obtener datos espectrales
    (this.analyser as any).getByteFrequencyData(this.dataArray as any);

    let sum = 0;
    let logSum = 0;
    const len = this.dataArray.length;

    for (let i = 0; i < len; i++) {
      const val = this.dataArray[i] / 255;
      sum += val;
      logSum += Math.log(val + 1e-6);
    }

    // 2. RMS aproximado en dB (0 a 100)
    const avg = sum / len;
    const rmsDb = Math.min(100, Math.max(20, Math.round(avg * 110)));

    // 3. Spectral Flatness (media geométrica / media aritmética)
    const geometricMean = Math.exp(logSum / len);
    const arithmeticMean = avg + 1e-6;
    const spectralFlatness = Math.min(1, Math.max(0, geometricMean / arithmeticMean));

    // Si dB > 68 y flatness > 0.45, es ruido caótico estridente (TV/tráfico)
    const isOverload = rmsDb > 70 && spectralFlatness > 0.4;
    const isCalm = rmsDb < 58;

    this.currentState = {
      rmsDb,
      spectralFlatness: Number(spectralFlatness.toFixed(3)),
      isCalm,
      ambientMode: isOverload ? 'overload' : isCalm ? 'creative' : 'calm',
      isListening: true,
    };

    return this.currentState;
  }

  public getState(): AcousticClimateState {
    return this.currentState;
  }
}
