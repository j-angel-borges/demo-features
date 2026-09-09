// Motor Bio-Morph Canvas a 60 FPS
// Diseñado para dinámicas motrices de infantes de 2 a 5 años:
// - Soporte nativo de multidedo y palma (Courage 2021)
// - Deduplicación de ráfagas rápidas (<120ms) como carga de energía (Patente US10031619B2)
// - Snapping magnético adaptativo (Hourcade 2004)
// - Pre-carpetas vivas (3 Estanques: Seres, Colores, Sonidos)

import { sounds } from '../services/soundSynthesizer';
import confetti from 'canvas-confetti';

export interface BioSprite {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  eyeColor: string;
  category: 'characters' | 'scenes' | 'sounds';
  isGiant: boolean;
  energy: number; // 0 to 100
  blinkCounter: number;
  squishX: number;
  squishY: number;
  isDragged: boolean;
}

export interface PondZone {
  id: 'characters' | 'scenes' | 'sounds';
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  itemCount: number;
}

interface PointerTrack {
  id: number;
  x: number;
  y: number;
  lastTapTime: number;
  tapCount: number;
}

export class BioMorphEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private animFrameId: number | null = null;
  private sprites: BioSprite[] = [];
  private activePointers: Map<number, PointerTrack> = new Map();
  private draggedSprite: BioSprite | null = null;
  private isCalmMode = false;
  private lastTime = 0;

  // Los 3 Estanques (Pre-carpetas)
  public ponds: PondZone[] = [];

  // Paleta Zentry
  private characterColors = ['#C2F4E7', '#7A59BF', '#38BDF8', '#34D399', '#F472B6'];
  private soundColors = ['#FBBF24', '#F59E0B', '#FB923C', '#F87171'];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('No 2D context available');
    this.ctx = context;

    this.resize();
    this.initPonds();
    this.spawnInitialCreatures();
    this.bindEvents();
    this.start();
  }

  public setCalmMode(calm: boolean): void {
    this.isCalmMode = calm;
  }

  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    this.height = this.canvas.parentElement?.clientHeight || window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);

    this.initPonds();
  }

  private initPonds(): void {
    const pondRadius = Math.min(65, Math.max(45, this.width * 0.08));
    const margin = pondRadius + 16;

    this.ponds = [
      {
        id: 'characters',
        name: 'Seres',
        x: margin,
        y: this.height - margin - 8,
        radius: pondRadius,
        color: '#C2F4E7',
        itemCount: 4,
      },
      {
        id: 'scenes',
        name: 'Colores',
        x: this.width / 2,
        y: this.height - margin - 8,
        radius: pondRadius,
        color: '#D6C8FA',
        itemCount: 3,
      },
      {
        id: 'sounds',
        name: 'Sonidos',
        x: this.width - margin,
        y: this.height - margin - 8,
        radius: pondRadius,
        color: '#FDE68A',
        itemCount: 5,
      },
    ];
  }

  private spawnInitialCreatures(): void {
    this.sprites = [];
    const count = this.width < 600 ? 3 : 5;
    for (let i = 0; i < count; i++) {
      this.createCreature(
        this.width * 0.25 + Math.random() * (this.width * 0.5),
        this.height * 0.2 + Math.random() * (this.height * 0.4),
        false
      );
    }
  }

  public createCreature(x: number, y: number, isGiant = false): BioSprite {
    const baseRadius = isGiant ? 60 : 32 + Math.random() * 8;
    const color = this.characterColors[Math.floor(Math.random() * this.characterColors.length)];

    const sprite: BioSprite = {
      id: `sprite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x,
      y,
      vx: (Math.random() - 0.5) * (isGiant ? 1.5 : 3.5),
      vy: (Math.random() - 0.5) * (isGiant ? 1.5 : 3.5),
      radius: baseRadius,
      baseRadius,
      color,
      eyeColor: '#1E1633',
      category: 'characters',
      isGiant,
      energy: 0,
      blinkCounter: Math.floor(Math.random() * 120),
      squishX: 1,
      squishY: 1,
      isDragged: false,
    };

    this.sprites.push(sprite);
    if (isGiant) {
      sounds.playGiantMorph();
    } else {
      sounds.playSpawnNote();
    }
    return sprite;
  }

  // Tocar un estanque para sacar criaturas de esa carpeta
  public spawnFromPond(pondId: 'characters' | 'scenes' | 'sounds'): void {
    const pond = this.ponds.find((p) => p.id === pondId);
    if (!pond) return;

    sounds.playPondSplash();
    pond.itemCount++;

    const spawnY = pond.y - pond.radius - 30;
    const creature = this.createCreature(pond.x, spawnY, false);
    creature.vy = -6; // Salto hacia arriba desde el estanque
    creature.vx = (Math.random() - 0.5) * 4;

    if (pondId === 'sounds') {
      creature.color = this.soundColors[Math.floor(Math.random() * this.soundColors.length)];
      creature.category = 'sounds';
    }
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
  }

  public unbindEvents(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private handlePointerDown = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    // Actualizar punteros activos
    this.activePointers.set(e.pointerId, {
      id: e.pointerId,
      x,
      y,
      lastTapTime: now,
      tapCount: 1,
    });

    // 1. Detección de toques en los Estanques (Pre-carpetas)
    for (const pond of this.ponds) {
      const dist = Math.hypot(x - pond.x, y - pond.y);
      if (dist < pond.radius + 15) {
        this.spawnFromPond(pond.id);
        return;
      }
    }

    // 2. Detección de Palma / Multidedo masivo (Courage 2021)
    if (this.activePointers.size >= 3) {
      // Centroide de los 3+ dedos
      let avgX = 0;
      let avgY = 0;
      this.activePointers.forEach((p) => {
        avgX += p.x;
        avgY += p.y;
      });
      avgX /= this.activePointers.size;
      avgY /= this.activePointers.size;

      // Crear un Súper-Morph gigante en el centroide
      this.createCreature(avgX, avgY, true);
      return;
    }

    // 3. Snapping Magnético Adaptativo (Hourcade 2004) hacia criatura existente
    let closestSprite: BioSprite | null = null;
    let minDist = Infinity;

    for (const sprite of this.sprites) {
      const dist = Math.hypot(x - sprite.x, y - sprite.y);
      // Radio magnético expandido para evitar fallos de puntería en preescolares
      const effectiveHitRadius = sprite.radius * 1.6 + 20;
      if (dist < effectiveHitRadius && dist < minDist) {
        minDist = dist;
        closestSprite = sprite;
      }
    }

    if (closestSprite) {
      // Manejo de ráfagas rápidas (Rapid Tapping < 120ms)
      const prevTrack = this.activePointers.get(e.pointerId);
      const isBurst = prevTrack && now - prevTrack.lastTapTime < 250;

      if (isBurst) {
        // Carga de energía sin frustración
        closestSprite.energy = Math.min(100, closestSprite.energy + 25);
        closestSprite.squishX = 1.35;
        closestSprite.squishY = 0.7;
        sounds.playChargeChirp(Math.floor(closestSprite.energy / 20));

        if (closestSprite.energy >= 100) {
          sounds.playSuccessCelebration();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: closestSprite.x / this.width, y: closestSprite.y / this.height },
          });
          closestSprite.energy = 0;
          closestSprite.color = this.characterColors[Math.floor(Math.random() * this.characterColors.length)];
        }
      } else {
        // Inicio de arrastre
        closestSprite.isDragged = true;
        this.draggedSprite = closestSprite;
        closestSprite.squishX = 0.85;
        closestSprite.squishY = 1.25;
        sounds.playSpawnNote();
      }
    } else {
      // Toque en espacio libre: spawnea criatura nueva
      this.createCreature(x, y, false);
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const track = this.activePointers.get(e.pointerId);
    if (track) {
      track.x = x;
      track.y = y;
    }

    if (this.draggedSprite) {
      this.draggedSprite.x = x;
      this.draggedSprite.y = y;
      this.draggedSprite.vx = 0;
      this.draggedSprite.vy = 0;

      // Verificar si se está arrastrando hacia un estanque (guardar en carpeta)
      for (const pond of this.ponds) {
        const dist = Math.hypot(x - pond.x, y - pond.y);
        if (dist < pond.radius + 15) {
          // Destello visual en el estanque
          pond.radius = Math.min(75, pond.radius + 0.5);
        }
      }
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);

    if (this.draggedSprite) {
      const sprite = this.draggedSprite;
      sprite.isDragged = false;
      this.draggedSprite = null;

      // Verificar si se soltó dentro de un estanque (guardado en pre-carpeta)
      for (const pond of this.ponds) {
        const dist = Math.hypot(sprite.x - pond.x, sprite.y - pond.y);
        if (dist < pond.radius + 20) {
          // Absorber criatura en la carpeta
          sounds.playPondSplash();
          pond.itemCount++;
          this.sprites = this.sprites.filter((s) => s.id !== sprite.id);
          return;
        }
      }

      // Impulso de lanzamiento si se soltó al aire
      sprite.vx = (Math.random() - 0.5) * 3;
      sprite.vy = (Math.random() - 0.5) * 3;
    }
  };

  public update(): void {
    const speedFactor = this.isCalmMode ? 0.45 : 0.85;

    // Actualizar físicas de cada criatura
    for (const sprite of this.sprites) {
      if (!sprite.isDragged) {
        sprite.x += sprite.vx * speedFactor;
        sprite.y += sprite.vy * speedFactor;

        // Suave fricción
        sprite.vx *= 0.985;
        sprite.vy *= 0.985;

        // Rebotes elásticos en paredes con squash & stretch
        const pad = sprite.radius;
        if (sprite.x - pad < 0) {
          sprite.x = pad;
          sprite.vx = Math.abs(sprite.vx) * 0.8;
          sprite.squishX = 0.8;
          sprite.squishY = 1.2;
        } else if (sprite.x + pad > this.width) {
          sprite.x = this.width - pad;
          sprite.vx = -Math.abs(sprite.vx) * 0.8;
          sprite.squishX = 0.8;
          sprite.squishY = 1.2;
        }

        if (sprite.y - pad < 0) {
          sprite.y = pad;
          sprite.vy = Math.abs(sprite.vy) * 0.8;
          sprite.squishX = 1.2;
          sprite.squishY = 0.8;
        } else if (sprite.y + pad > this.height - 100) {
          // Límite sobre los estanques
          sprite.y = this.height - 100 - pad;
          sprite.vy = -Math.abs(sprite.vy) * 0.8;
          sprite.squishX = 1.25;
          sprite.squishY = 0.75;
        }
      }

      // Recuperación natural de forma de gelatina
      sprite.squishX += (1 - sprite.squishX) * 0.12;
      sprite.squishY += (1 - sprite.squishY) * 0.12;

      // Parpadeo aleatorio de ojos
      sprite.blinkCounter++;
      if (sprite.blinkCounter > 180) {
        sprite.blinkCounter = 0;
      }
    }

    // Colisiones elásticas entre criaturas
    for (let i = 0; i < this.sprites.length; i++) {
      for (let j = i + 1; j < this.sprites.length; j++) {
        const s1 = this.sprites[i];
        const s2 = this.sprites[j];
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = s1.radius + s2.radius;

        if (dist < minDist && dist > 0) {
          // Separación
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          if (!s1.isDragged) {
            s1.x -= nx * overlap;
            s1.y -= ny * overlap;
            s1.vx -= nx * 0.5;
            s1.vy -= ny * 0.5;
          }
          if (!s2.isDragged) {
            s2.x += nx * overlap;
            s2.y += ny * overlap;
            s2.vx += nx * 0.5;
            s2.vy += ny * 0.5;
          }

          // Squish de colisión suave
          s1.squishX = 1.15;
          s1.squishY = 0.85;
          s2.squishX = 0.85;
          s2.squishY = 1.15;
        }
      }
    }
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Dibujar los 3 Estanques (Pre-carpetas)
    this.renderPonds();

    // 2. Dibujar Criaturas Bio-Sprites
    for (const sprite of this.sprites) {
      this.renderSprite(sprite);
    }
  }

  private renderPonds(): void {
    for (const pond of this.ponds) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(pond.x, pond.y, pond.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = pond.color;
      this.ctx.globalAlpha = 0.75;
      this.ctx.fill();

      // Borde suave
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#533B87';
      this.ctx.globalAlpha = 0.4;
      this.ctx.stroke();

      // Texto de carpeta (Grande y claro para niños/padres)
      this.ctx.globalAlpha = 1.0;
      this.ctx.fillStyle = '#1E1633';
      this.ctx.font = 'bold 15px Outfit, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(pond.name, pond.x, pond.y + 4);

      // Contador de elementos guardados
      this.ctx.font = '12px Outfit, sans-serif';
      this.ctx.fillStyle = '#533B87';
      this.ctx.fillText(`(${pond.itemCount})`, pond.x, pond.y + 20);

      this.ctx.restore();
    }
  }

  private renderSprite(sprite: BioSprite): void {
    this.ctx.save();
    this.ctx.translate(sprite.x, sprite.y);
    this.ctx.scale(sprite.squishX, sprite.squishY);

    // Halo de energía si está siendo tocado repetidamente
    if (sprite.energy > 0) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sprite.radius + sprite.energy * 0.25, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FBBF24';
      this.ctx.globalAlpha = 0.35 + (sprite.energy / 100) * 0.4;
      this.ctx.fill();
    }

    // Cuerpo de gelatina
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sprite.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = sprite.color;
    this.ctx.globalAlpha = 0.95;
    this.ctx.fill();

    // Borde brillante Zentry
    this.ctx.lineWidth = sprite.isGiant ? 5 : 3;
    this.ctx.strokeStyle = '#533B87';
    this.ctx.globalAlpha = 0.3;
    this.ctx.stroke();

    // Carita / Ojos vivos
    const isBlinking = sprite.blinkCounter > 170;
    const eyeOffsetX = sprite.radius * 0.32;
    const eyeOffsetY = -sprite.radius * 0.15;
    const eyeSize = sprite.isGiant ? 9 : 5;

    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#1E1633';

    if (isBlinking) {
      // Línea de ojo cerrado
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-eyeOffsetX - eyeSize, eyeOffsetY);
      this.ctx.lineTo(-eyeOffsetX + eyeSize, eyeOffsetY);
      this.ctx.moveTo(eyeOffsetX - eyeSize, eyeOffsetY);
      this.ctx.lineTo(eyeOffsetX + eyeSize, eyeOffsetY);
      this.ctx.stroke();
    } else {
      // Ojos redondos abiertos con brillo
      this.ctx.beginPath();
      this.ctx.arc(-eyeOffsetX, eyeOffsetY, eyeSize, 0, Math.PI * 2);
      this.ctx.arc(eyeOffsetX, eyeOffsetY, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Pupila blanca brillante
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(-eyeOffsetX - 1.5, eyeOffsetY - 1.5, eyeSize * 0.4, 0, Math.PI * 2);
      this.ctx.arc(eyeOffsetX - 1.5, eyeOffsetY - 1.5, eyeSize * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Sonrisa feliz
    this.ctx.beginPath();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#1E1633';
    this.ctx.arc(0, sprite.radius * 0.18, sprite.radius * 0.28, 0.1 * Math.PI, 0.9 * Math.PI);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private loop = (time: number) => {
    this.update();
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public start(): void {
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public stop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.unbindEvents();
  }
}
