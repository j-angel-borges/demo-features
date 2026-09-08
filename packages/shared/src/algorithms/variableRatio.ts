import { LeverPullFeedback } from '../types/skinner.js';

/**
 * Evaluates real-time slot machine reaction and variable ratio schedule parameters.
 *
 * Grounded in:
 * - Schultz, W. (2024) PNAS: Reward Prediction Error (RPE)
 * - Ferster & Skinner (1957): Schedules of Reinforcement (VR-7)
 */
export function evaluateSlotMachineEvent(
  consecutiveScrolls: number,
  dwellTimeSeconds: number,
  targetDurationSeconds: number = 40.0
): LeverPullFeedback {
  // Condition 1: Premature impulsive skip (< 6.0s) triggers instant dopaminergic reward
  if (dwellTimeSeconds < 6.0) {
    return {
      isJackpot: true,
      dopaminePulseLevel: 'CRITICAL_JACKPOT',
      soundFx: 'jackpot_alarm',
      reelIcons: ['zap', 'zap', 'zap'],
    };
  }

  // Condition 2: Variable-Ratio Schedule VR-7 trigger (7th consecutive scroll)
  const isVrTrigger = (consecutiveScrolls > 0 && consecutiveScrolls % 7 === 0) || Math.random() < 0.1428;
  if (isVrTrigger) {
    return {
      isJackpot: true,
      dopaminePulseLevel: 'HIGH',
      soundFx: 'wheel_spin',
      reelIcons: ['sparkles', 'sparkles', 'sparkles'],
    };
  }

  // Condition 3: Mindful completion (>80% of target duration) vs normal progress
  const isDeepFocus = dwellTimeSeconds >= Math.max(10, targetDurationSeconds * 0.8);
  return {
    isJackpot: false,
    dopaminePulseLevel: isDeepFocus ? 'LOW' : 'MEDIUM',
    soundFx: 'lever_drop',
    reelIcons: isDeepFocus ? ['heart', 'brain', 'sparkles'] : ['brain', 'clock', 'bell'],
  };
}

/**
 * Calculates theoretical attention decay curve target:
 * T_target(n) = T_min + (T_max - T_min) * exp(-lambda * n)
 *
 * Grounded in Christakis et al. (2018) PNAS
 */
export function calculateDecayTarget(
  scrollCount: number,
  tMax: number = 40.0,
  tMin: number = 5.0,
  lambda: number = 0.18
): number {
  const n = Math.max(0, scrollCount);
  const target = tMin + (tMax - tMin) * Math.exp(-lambda * n);
  return Number(Math.max(tMin, target).toFixed(1));
}

/**
 * Normalizes user scroll velocity to physical lever pull force ratio [0.0, 1.0]
 */
export function calculateLeverForceRatio(
  scrollVelocityRpm: number,
  dwellTimeSeconds: number
): number {
  const baseForce = Math.min(1.0, Math.max(0.15, scrollVelocityRpm / 50.0));
  // Fast skip (<6s) adds sudden mechanical jerk
  const jerkMultiplier = dwellTimeSeconds < 6.0 ? 1.25 : 1.0;
  return Number(Math.min(1.0, baseForce * jerkMultiplier).toFixed(2));
}
