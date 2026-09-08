/**
 * AdaptiveMagneticSnapper: Implementación del targeting inteligente pediátrico.
 * Basado en la Ley de Fitts adaptada a preescolares (Hourcade et al., 2004) y la patente US10140011B2.
 * Amplía dinámicamente el radio de atracción magnética según la desaceleración del contacto.
 */

export interface TargetZone {
  id: string;
  x: number;
  y: number;
  baseRadius: number;
  weight?: number;
}

export class AdaptiveMagneticSnapper {
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private currentSpeed = 0; // px/ms

  public updateVelocity(x: number, y: number, time: number): void {
    if (this.lastTime > 0) {
      const dt = Math.max(1, time - this.lastTime);
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      this.currentSpeed = dist / dt;
    }
    this.lastX = x;
    this.lastY = y;
    this.lastTime = time;
  }

  /**
   * Encuentra el target magnético más cercano considerando radio dinámico de Fitts.
   */
  public findSnappingTarget(
    pointerX: number,
    pointerY: number,
    targets: TargetZone[],
    contactRadius: number = 24
  ): { target: TargetZone | null; distance: number; snapFactor: number } {
    let closestTarget: TargetZone | null = null;
    let minEffectiveDist = Infinity;
    let finalSnapFactor = 0;

    // A menor velocidad del dedo (fase de corrección fina de Hourcade), mayor es la atracción magnética
    const speedDamping = Math.max(0.4, 1.4 - Math.min(1.0, this.currentSpeed * 0.8));
    const effectiveTouchRadius = contactRadius * 1.5;

    for (const target of targets) {
      const dist = Math.hypot(pointerX - target.x, pointerY - target.y);
      const dynamicAttractionRadius = (target.baseRadius + effectiveTouchRadius) * speedDamping;

      if (dist < dynamicAttractionRadius) {
        // Normalizar factor de atracción (1 = en el centro, 0 = en el límite)
        const snapFactor = 1 - dist / dynamicAttractionRadius;
        if (dist < minEffectiveDist) {
          minEffectiveDist = dist;
          closestTarget = target;
          finalSnapFactor = snapFactor;
        }
      }
    }

    return {
      target: closestTarget,
      distance: minEffectiveDist,
      snapFactor: finalSnapFactor,
    };
  }

  /**
   * Calcula la posición con suavizado magnético elástico (spring snap).
   */
  public getMagneticPosition(
    pointerX: number,
    pointerY: number,
    target: TargetZone,
    strength: number = 0.45
  ): { x: number; y: number } {
    const snapX = pointerX + (target.x - pointerX) * strength;
    const snapY = pointerY + (target.y - pointerY) * strength;
    return { x: snapX, y: snapY };
  }
}
