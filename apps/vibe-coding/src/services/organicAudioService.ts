/**
 * OrganicAudioService: Síntesis procedural Web Audio API para Zentry Bio-Morph Canvas.
 * Respeta el SSOT de la Mesa de Trabajo (Directrices de Motion y Sonido):
 * - Tonos cálidos en afinación armónica (base 432 Hz).
 * - Sonidos orgánicos: madera pulida, campanas de cristal esmerilado, squish de gelatina.
 * - Cero pitidos estridentes.
 * - Pulsaciones hápticas sincronizadas.
 */

export class OrganicAudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public triggerHaptic(pattern: number | number[] = 15): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  /**
   * Pop suave de madera pulida al tocar un bio-morfo o estanque.
   */
  public playWoodPop(pitchMod: number = 1.0): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(12);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 432 * pitchMod;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Squish de gelatina elástica ante presión o contacto multidedo.
   */
  public playJellySquish(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([18, 25]);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Campanitas de cristal esmerilado al nacer un bio-morfo o liberar energía.
   */
  public playCrystalChime(freqHz: number = 648): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([10, 15, 20]);
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freqHz, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqHz * 1.5, now); // Quinta armónica

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  }

  /**
   * Pulso de relajación cuando el entorno entra en calma.
   */
  public playCalmChord(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [216, 270, 324, 432]; // Acorde mayor en 432Hz
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.06, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + 0.82);
    });
  }
}

export const organicAudio = new OrganicAudioService();
