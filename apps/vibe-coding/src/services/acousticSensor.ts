// Analizador de Clima Acústico Ambiental (Web Audio API / FFT)
// Opera 100% en cliente sin transmisión de red (Privacidad estricta COPPA/GDPR-K).

export interface SensoryClimateState {
  rmsDb: number;              // Nivel sonoro en dB (aprox 30-90 dB)
  spectralFlatness: number;   // 0 (armonía tonal pura) a 1 (ruido blanco caótico)
  climateMode: 'calm' | 'balanced' | 'creative';
  isListening: boolean;
}

export type ClimateListener = (state: SensoryClimateState) => void;

class AcousticSensorService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private listeners: Set<ClimateListener> = new Set();
  private currentState: SensoryClimateState = {
    rmsDb: 40,
    spectralFlatness: 0.2,
    climateMode: 'balanced',
    isListening: false,
  };

  public subscribe(listener: ClimateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  public async startListening(): Promise<boolean> {
    if (this.currentState.isListening) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
        video: false,
      });

      this.micStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      this.currentState.isListening = true;
      this.loopAnalysis();
      this.notify();
      return true;
    } catch {
      // Si el usuario deniega o no hay mic, usamos un modo balanceado simulado suave
      this.currentState.isListening = false;
      this.currentState.climateMode = 'balanced';
      this.notify();
      return false;
    }
  }

  public stopListening(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.currentState.isListening = false;
    this.notify();
  }

  private loopAnalysis = () => {
    if (!this.analyser || !this.currentState.isListening) return;

    const buffer = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatTimeDomainData(buffer);

    // Calcular RMS
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    // Convertir a dB aproximados
    const db = Math.max(30, Math.min(95, Math.round(20 * Math.log10(Math.max(1e-4, rms)) + 90)));

    // Calcular Spectral Flatness simple
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);

    let geomSum = 0;
    let arithSum = 0;
    const count = freqData.length;
    for (let i = 0; i < count; i++) {
      const val = Math.max(1, freqData[i]);
      geomSum += Math.log(val);
      arithSum += val;
    }
    const geometricMean = Math.exp(geomSum / count);
    const arithmeticMean = arithSum / count;
    const flatness = Math.min(1, Math.max(0, geometricMean / (arithmeticMean || 1)));

    // Clasificación del modo
    let mode: 'calm' | 'balanced' | 'creative' = 'balanced';
    if (db > 72 || flatness > 0.65) {
      mode = 'calm'; // Entorno ruidoso -> modo calma
    } else if (db < 54 && flatness < 0.35) {
      mode = 'creative'; // Entorno armónico/silencioso -> máxima creatividad
    } else {
      mode = 'balanced';
    }

    this.currentState = {
      rmsDb: db,
      spectralFlatness: Math.round(flatness * 100) / 100,
      climateMode: mode,
      isListening: true,
    };
    this.notify();

    // Reducir frecuencia de análisis a ~10 fps para no consumir CPU
    setTimeout(() => {
      if (this.currentState.isListening) {
        this.animFrameId = requestAnimationFrame(this.loopAnalysis);
      }
    }, 100);
  };

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentState));
  }
}

export const acousticSensor = new AcousticSensorService();
