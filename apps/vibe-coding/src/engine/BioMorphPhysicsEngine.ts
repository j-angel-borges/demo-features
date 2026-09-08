import { BioMorphEntity, OrientationState, PointerClusterState } from '../types';
import { organicAudio } from '../services/organicAudioService';
import { vibeTelemetry } from '../services/vibeTelemetryService';

/**
 * BioMorphPhysicsEngine: Motor de física 2D de deformación elástica a 60 fps.
 * Simula bio-morfos orgánicos gelatinosos con micro-expresiones y gravedad inercial.
 */
export class BioMorphPhysicsEngine {
  public entities: BioMorphEntity[] = [];
  private canvasWidth = 800;
  private canvasHeight = 600;
  private lastTime = 0;

  // Parámetros de paleta Zentry Aurora
  private readonly colorPalette = [
    { main: '#533B87', glow: '#D6C8FA', pitch: 324 }, // Púrpura Zentry
    { main: '#7A59BF', glow: '#00F2FE', pitch: 388 }, // Púrpura Vibrante
    { main: '#0E5A49', glow: '#C2F4E7', pitch: 432 }, // Menta Profundo
    { main: '#1A365D', glow: '#00F2FE', pitch: 486 }, // Océano Glacial
    { main: '#B83280', glow: '#FED7E2', pitch: 540 }, // Rosa Aurora
  ];

  public resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public spawnEntity(x?: number, y?: number, category: 'characters' | 'scenes' | 'sounds' = 'characters'): BioMorphEntity {
    const palette = this.colorPalette[this.entities.length % this.colorPalette.length];
    const spawnX = x ?? this.canvasWidth * (0.3 + Math.random() * 0.4);
    const spawnY = y ?? this.canvasHeight * (0.3 + Math.random() * 0.4);

    const baseRadius = 38 + Math.random() * 16;
    const shapes: Array<'round' | 'star' | 'cloud' | 'jelly'> = ['round', 'jelly', 'cloud', 'star'];

    const entity: BioMorphEntity = {
      id: 'bio_' + Math.random().toString(36).substring(2, 8),
      name: 'Amigo ' + (this.entities.length + 1),
      category,
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 6,
      vy: -4 - Math.random() * 4,
      baseRadius,
      currentRadius: 10, // Comienza pequeño y se expande elásticamente (pop in)
      targetRadius: baseRadius,
      squishX: 1.4,
      squishY: 0.6,
      color: palette.main,
      glowColor: palette.glow,
      basePitchHz: palette.pitch,
      energyLevel: 10,
      eyeOffset: { x: 0, y: 0 },
      isBlinking: false,
      shapeVariant: shapes[this.entities.length % shapes.length],
      inCanvas: true,
      createdAt: Date.now(),
    };

    this.entities.push(entity);
    organicAudio.playCrystalChime(palette.pitch);
    vibeTelemetry.recordEntityCreated();

    return entity;
  }

  public removeEntity(id: string): void {
    this.entities = this.entities.filter((e) => e.id !== id);
  }

  public clearAll(): void {
    this.entities = [];
    organicAudio.playWoodPop(0.8);
  }

  public update(
    time: number,
    cluster: PointerClusterState,
    orientation: OrientationState,
    isCalm: boolean
  ): void {
    if (this.lastTime === 0) this.lastTime = time;
    const dt = Math.min(0.033, (time - this.lastTime) * 0.001);
    this.lastTime = time;

    // Modulación por clima acústico: calma desacelera suavemente la física
    const damping = isCalm ? 0.94 : 0.91;

    // Gravedad inercial de la tableta / smartphone
    const gx = orientation.gravityX * 9.8 * 35;
    const gy = (orientation.gravityY * 9.8 * 35) + 80; // Sesgo hacia abajo natural

    // Procesar entidades
    for (let i = 0; i < this.entities.length; i++) {
      const e = this.entities[i];

      // Aplicar gravedad
      e.vx += gx * dt;
      e.vy += gy * dt;

      // Aplicar fricción de aire
      e.vx *= damping;
      e.vy *= damping;

      // Mover
      e.x += e.vx;
      e.y += e.vy;

      // Expansión elástica hacia targetRadius (Spring physics)
      const radiusDelta = e.targetRadius - e.currentRadius;
      e.currentRadius += radiusDelta * 0.2;

      // Recuperación elástica de squish (retorno a 1.0)
      e.squishX += (1.0 - e.squishX) * 0.15;
      e.squishY += (1.0 - e.squishY) * 0.15;

      // Disipación gradual de energía acumulada
      if (e.energyLevel > 10) {
        e.energyLevel = Math.max(10, e.energyLevel - 15 * dt);
      }

      // Parpadeo aleatorio de ojos
      if (Math.random() < 0.008) {
        e.isBlinking = true;
        setTimeout(() => {
          e.isBlinking = false;
        }, 120);
      }

      // Mirar hacia el centroide de toques más cercano
      if (cluster.pointers.length > 0) {
        const dx = cluster.centroidX - e.x;
        const dy = cluster.centroidY - e.y;
        const dist = Math.hypot(dx, dy) || 1;
        e.eyeOffset.x = (dx / dist) * Math.min(6, dist * 0.04);
        e.eyeOffset.y = (dy / dist) * Math.min(6, dist * 0.04);

        // Reacción ante contacto de palma completa: atracción magnética afectiva
        if (cluster.contactType === 'palm_press' && dist < 220) {
          e.vx += (dx / dist) * 120 * dt;
          e.vy += (dy / dist) * 120 * dt;
          e.squishX = 1.25;
          e.squishY = 0.8;
          vibeTelemetry.recordPalmContact();
        }
      } else {
        e.eyeOffset.x += (0 - e.eyeOffset.x) * 0.1;
        e.eyeOffset.y += (0 - e.eyeOffset.y) * 0.1;
      }

      // Colisión contra bordes de la pantalla (Rebote elástico)
      const r = e.currentRadius;
      if (e.x - r < 0) {
        e.x = r;
        e.vx = -e.vx * 0.75;
        e.squishX = 0.7;
        e.squishY = 1.3;
        organicAudio.playWoodPop(0.9);
      } else if (e.x + r > this.canvasWidth) {
        e.x = this.canvasWidth - r;
        e.vx = -e.vx * 0.75;
        e.squishX = 0.7;
        e.squishY = 1.3;
        organicAudio.playWoodPop(0.9);
      }

      if (e.y - r < 0) {
        e.y = r;
        e.vy = -e.vy * 0.75;
        e.squishX = 1.3;
        e.squishY = 0.7;
      } else if (e.y + r > this.canvasHeight) {
        e.y = this.canvasHeight - r;
        e.vy = -e.vy * 0.75;
        e.squishX = 1.35;
        e.squishY = 0.65;
        if (Math.abs(e.vy) > 1.2) {
          organicAudio.playWoodPop(1.1);
        }
      }

      // Colisión circular entre bio-morfos
      for (let j = i + 1; j < this.entities.length; j++) {
        const other = this.entities[j];
        const cdx = other.x - e.x;
        const cdy = other.y - e.y;
        const dist = Math.hypot(cdx, cdy);
        const minDist = e.currentRadius + other.currentRadius;

        if (dist < minDist && dist > 0.01) {
          const overlap = (minDist - dist) * 0.5;
          const nx = cdx / dist;
          const ny = cdy / dist;

          e.x -= nx * overlap;
          e.y -= ny * overlap;
          other.x += nx * overlap;
          other.y += ny * overlap;

          // Separación de velocidades
          const kx = e.vx - other.vx;
          const ky = e.vy - other.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          e.vx -= p * nx * 0.8;
          e.vy -= p * ny * 0.8;
          other.vx += p * nx * 0.8;
          other.vy += p * ny * 0.8;

          e.squishX = 1.15;
          e.squishY = 0.85;
          other.squishX = 0.85;
          other.squishY = 1.15;
        }
      }
    }
  }

  /**
   * Maneja el impacto directo de un toque sobre las entidades.
   * Aplica la conversión de ráfaga rápida en sobrecarga de energía creativa.
   */
  public handlePointerImpact(x: number, y: number, isBurst: boolean): BioMorphEntity | null {
    let hitEntity: BioMorphEntity | null = null;

    for (const e of this.entities) {
      const dist = Math.hypot(x - e.x, y - e.y);
      // Radio de impacto aumentado para Fitts pediátrico
      if (dist < e.currentRadius * 1.45) {
        hitEntity = e;

        if (isBurst) {
          // Ráfaga rápida: sobrecarga de energía, expansión elástica y notas armónicas
          e.energyLevel = Math.min(100, e.energyLevel + 28);
          e.targetRadius = e.baseRadius * (1.1 + (e.energyLevel / 100) * 0.5);
          e.vy = -6 - (e.energyLevel / 20);
          e.squishX = 0.75;
          e.squishY = 1.35;
          organicAudio.playCrystalChime(e.basePitchHz * (1 + (e.energyLevel / 100) * 0.5));
          vibeTelemetry.recordRapidTap();
        } else {
          // Toque único: impulso de rebote y squish
          e.vy = -5;
          e.squishX = 1.25;
          e.squishY = 0.75;
          organicAudio.playJellySquish();
        }
        break;
      }
    }

    return hitEntity;
  }
}
