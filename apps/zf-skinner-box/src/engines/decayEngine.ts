import type { SkinnerVideoItem, CatalogMode, DopamineState } from '../types/skinner.types.js';
import { CHILD_CATALOG } from '../data/childCatalog.js';
import { ADULT_CATALOG } from '../data/adultCatalog.js';

export interface NextVideoDecision {
  item: SkinnerVideoItem;
  nominalDurationSeconds: number;
  isJackpot: boolean;
  dopamineState: DopamineState;
  scrollCount: number;
}

export class SkinnerDecayEngine {
  private ratioMean: number;
  private lastJackpotIndex: number = 0;
  private mode: CatalogMode;

  constructor(mode: CatalogMode = 'child', ratioMean: number = 7) {
    this.mode = mode;
    this.ratioMean = ratioMean;
  }

  public setMode(mode: CatalogMode) {
    this.mode = mode;
  }

  public getMode(): CatalogMode {
    return this.mode;
  }

  /**
   * Calculates the nominal video duration (in seconds) based on cumulative scroll count.
   * Baseline: 45.0s at S=0, decaying exponentially to a 5.0s floor.
   * If isJackpot is true, returns 35.0s - 44.0s.
   */
  public calculateNominalDuration(scrollCount: number, isJackpot: boolean): number {
    if (isJackpot) {
      return 35.0; // High-production anchor reward
    }
    // Exponential decay formula: 5.0 + 40.0 * exp(-0.08 * scrollCount)
    const raw = 5.0 + 40.0 * Math.exp(-0.08 * scrollCount);
    const clamped = Math.max(5.0, raw);
    return Math.round(clamped * 10) / 10;
  }

  /**
   * Evaluates whether the current scroll triggers a Variable Ratio (VR-7) jackpot.
   */
  public evaluateJackpot(scrollCount: number): boolean {
    if (scrollCount <= 3) return false;
    const delta = scrollCount - this.lastJackpotIndex;
    const isJackpot = delta >= 5 && (delta === this.ratioMean || Math.random() < 0.25 || delta >= 10);
    if (isJackpot) {
      this.lastJackpotIndex = scrollCount;
    }
    return isJackpot;
  }

  /**
   * Classifies dopamine habituation state based on scroll frequency and jackpot status.
   */
  public getDopamineState(scrollCount: number, isJackpot: boolean): DopamineState {
    if (isJackpot) return 'jackpot';
    if (scrollCount <= 3) return 'baseline';
    if (scrollCount <= 13) return 'accelerated';
    return 'hyper_fragmented';
  }

  /**
   * Selects the next content item matching the current decay stage and mode.
   */
  public selectNextContent(scrollCount: number): NextVideoDecision {
    const isJackpot = this.evaluateJackpot(scrollCount);
    const nominalDuration = this.calculateNominalDuration(scrollCount, isJackpot);
    const dopamineState = this.getDopamineState(scrollCount, isJackpot);
    const catalog = this.mode === 'child' ? CHILD_CATALOG : ADULT_CATALOG;

    let selectedItem: SkinnerVideoItem;

    if (isJackpot) {
      const jackpotItems = catalog.filter((i) => i.isJackpot);
      selectedItem = jackpotItems[Math.floor(Math.random() * jackpotItems.length)] || catalog[0];
    } else if (scrollCount <= 3) {
      // Stage 1: Long-Form Educational
      const stage1 = catalog.filter((i) => i.category === 'educational' && !i.isJackpot);
      selectedItem = stage1[scrollCount % stage1.length] || catalog[0];
    } else if (scrollCount <= 13) {
      // Stage 2: Mid-Form Informative & Trivia
      const stage2 = catalog.filter((i) => i.category === 'trivia' && !i.isJackpot);
      selectedItem = stage2[(scrollCount - 4) % stage2.length] || catalog[1];
    } else {
      // Stage 3: Hyper-Fragmented Loops
      const stage3 = catalog.filter((i) => i.category === 'hyper_fragmented' && !i.isJackpot);
      selectedItem = stage3[(scrollCount - 14) % stage3.length] || catalog[2];
    }

    return {
      item: {
        ...selectedItem,
        nominalDurationSeconds: nominalDuration,
        isJackpot,
      },
      nominalDurationSeconds: nominalDuration,
      isJackpot,
      dopamineState,
      scrollCount,
    };
  }

  public reset() {
    this.lastJackpotIndex = 0;
  }
}
