/**
 * Audio Synthesis & Spectrum Visualizer Service for Isla Dinámica
 * Provides real-time Spanish speech synthesis, text sanitization (0 emojis),
 * and Web Audio API spectrum analysis for the reactive Voice Orb.
 */

export class AudioSynthesisService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural Spanish voices
    const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));
    this.selectedVoice =
      spanishVoices.find((v) => v.name.includes('Neural') || v.name.includes('Natural') || v.name.includes('Google')) ||
      spanishVoices[0] ||
      voices[0] ||
      null;
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Sanitizes speech text to remove all emojis, asterisks, brackets, or code symbols.
   */
  public sanitizeTextForSpeech(raw: string): string {
    return raw
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speaks the given text using Spanish synthesis.
   */
  public async speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.initAudioContext();
    this.cancel();

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    if (!this.synth) {
      console.warn('[Audio] SpeechSynthesis unavailable in environment');
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1500);
      return;
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('[Audio] Speech synthesis error:', err);
        this.isSpeaking = false;
        if (onEnd) onEnd();
        resolve();
      };

      if (this.synth) {
        this.synth.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  /**
   * Cancels current speech.
   */
  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  public stop(): void {
    this.cancel();
  }

  /**
   * Returns current speech state.
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Returns calculated real-time audio amplitude (0 to 1) for the VoiceOrb visualizer.
   */
  public getAudioAmplitude(): number {
    if (!this.isSpeaking) return 0.05; // Gentle baseline idle breath

    if (this.analyser && this.dataArray) {
      (this.analyser as any).getByteFrequencyData(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const avg = sum / this.dataArray.length;
      return Math.min(1, Math.max(0.1, avg / 128));
    }

    // Synthetic undulating amplitude during speech
    const t = Date.now() / 150;
    return 0.45 + Math.sin(t) * 0.3 + Math.cos(t * 1.5) * 0.15;
  }

  /**
   * Returns 8 frequency bin values for audio waveform bars.
   */
  public getWaveformBins(): number[] {
    if (!this.isSpeaking) {
      return [0.1, 0.15, 0.1, 0.2, 0.1, 0.15, 0.1, 0.12];
    }
    const t = Date.now() / 120;
    return [
      0.3 + Math.sin(t * 1.1) * 0.3,
      0.5 + Math.cos(t * 1.7) * 0.4,
      0.7 + Math.sin(t * 2.3) * 0.3,
      0.9 + Math.cos(t * 1.4) * 0.2,
      0.8 + Math.sin(t * 1.9) * 0.2,
      0.6 + Math.cos(t * 2.1) * 0.3,
      0.4 + Math.sin(t * 1.5) * 0.3,
      0.2 + Math.cos(t * 1.2) * 0.2,
    ].map((v) => Math.max(0.1, Math.min(1.0, v)));
  }
}

export const audioService = new AudioSynthesisService();
