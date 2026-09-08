import { useState, useRef, useCallback } from 'react';

/**
 * Hook for calculating real-time scroll velocity in RPM (revolutions / scrolls per minute).
 * Utilizes a rolling time window with smoothing.
 */
export function useScrollVelocity(windowMs: number = 30000) {
  const [velocityRpm, setVelocityRpm] = useState<number>(0);
  const timestampsRef = useRef<number[]>([]);

  const registerScroll = useCallback(() => {
    const now = performance.now();
    timestampsRef.current.push(now);

    // Keep only timestamps within rolling window
    const cutoff = now - windowMs;
    timestampsRef.current = timestampsRef.current.filter((t) => t >= cutoff);

    const count = timestampsRef.current.length;
    if (count <= 1) {
      setVelocityRpm(0);
      return 0;
    }

    const oldest = timestampsRef.current[0];
    const spanSeconds = Math.max(1, (now - oldest) / 1000);
    const rpm = Math.round((count / spanSeconds) * 60);

    setVelocityRpm(rpm);
    return rpm;
  }, [windowMs]);

  const resetVelocity = useCallback(() => {
    timestampsRef.current = [];
    setVelocityRpm(0);
  }, []);

  return {
    velocityRpm,
    registerScroll,
    resetVelocity,
  };
}
