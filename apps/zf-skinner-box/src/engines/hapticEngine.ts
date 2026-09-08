/**
 * Web Audio API Tone Synthesizer & Web Vibration API Haptics Engine
 * Provides tactile and acoustic feedback for Skinner Box operant lever presses.
 */

class HapticAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Synthesizes an acoustic mechanical lever click tone.
   */
  public playLeverClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio autoplay policy fallback
    }

    // Accompanying tactile vibration
    this.vibrateLever();
  }

  /**
   * Synthesizes an intermittent VR-7 Jackpot celebration chime.
   */
  public playJackpotChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {
      // Audio autoplay policy fallback
    }

    this.vibrateJackpot();
  }

  /**
   * Synthesizes a soft dopamine pulse tone.
   */
  public playDopaminePulse() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.085);
    } catch {
      // Fallback
    }

    this.vibrateDopamine();
  }

  /**
   * Synthesizes a subtle pop for double-tap heart likes.
   */
  public playTapHeart() {
    this.playDopaminePulse();
  }

  /**
   * Tactile vibration for standard lever scroll
   */
  public vibrateLever() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18); // Crisp 18ms tactile click
      } catch {
        // Not supported or blocked
      }
    }
  }

  /**
   * Celebratory multi-pulse vibration for Jackpot
   */
  public vibrateJackpot() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40, 60, 100]); // Rich celebratory pattern
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Micro-pulse vibration for dopamine burst
   */
  public vibrateDopamine() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10, 15]);
      } catch {
        // Ignore
      }
    }
  }
}

export const hapticEngine = new HapticAudioEngine();

