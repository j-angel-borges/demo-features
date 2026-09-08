import type { CanvasAnimationType } from '../types/skinner.types.js';

export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  dopamineScore: number;
  accentColor: string;
}

export class ProceduralCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationType: CanvasAnimationType;
  private dopamineScore: number;
  private accentColor: string;
  private animFrameId: number | null = null;
  private startTime: number = performance.now();
  private isDestroyed: boolean = false;

  // Particle systems & states
  private particles: any[] = [];
  private matrixDrops: number[] = [];
  private gridOffset: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    animationType: CanvasAnimationType,
    dopamineScore: number = 50,
    accentColor: string = '#D6C8FA'
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to obtain 2D canvas context');
    }
    this.ctx = context;
    this.animationType = animationType;
    this.dopamineScore = dopamineScore;
    this.accentColor = accentColor;

    this.initScene();
    this.start();
  }

  public updateParameters(animationType: CanvasAnimationType, dopamineScore: number, accentColor: string) {
    this.animationType = animationType;
    this.dopamineScore = dopamineScore;
    this.accentColor = accentColor;
    this.initScene();
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  private initScene() {
    this.resize();
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.particles = [];

    const count = Math.min(120, Math.floor((w * h) / 10000) + 40);

    if (this.animationType === 'galaxy') {
      for (let i = 0; i < count * 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 1.5) * Math.min(w, h) * 0.45;
        this.particles.push({
          angle,
          radius,
          speed: (0.002 + Math.random() * 0.004) * (radius < 50 ? 2 : 1),
          size: Math.random() * 2.5 + 0.5,
          color: Math.random() > 0.4 ? this.accentColor : '#D6C8FA',
          alpha: Math.random() * 0.8 + 0.2,
        });
      }
    } else if (this.animationType === 'cellular') {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: Math.random() * 4 + 2,
          pulse: Math.random() * Math.PI,
        });
      }
    } else if (this.animationType === 'matrix_terminal') {
      const columns = Math.floor(w / 20);
      this.matrixDrops = [];
      for (let i = 0; i < columns; i++) {
        this.matrixDrops[i] = Math.floor(Math.random() * -50);
      }
    } else if (this.animationType === 'slime_kinetic') {
      for (let i = 0; i < 24; i++) {
        this.particles.push({
          x: w / 2 + (Math.random() - 0.5) * 100,
          y: h / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 28 + 16,
          hue: Math.random() * 60 + 280,
        });
      }
    } else if (this.animationType === 'popit_bubble') {
      const cols = 5;
      const rows = 8;
      const spacingX = w / (cols + 1);
      const spacingY = h / (rows + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.particles.push({
            x: spacingX * (c + 1),
            y: spacingY * (r + 1),
            baseRadius: Math.min(spacingX, spacingY) * 0.38,
            popState: 0, // 0 = idle, 1 = popping, 2 = popped
            colorHue: ((c + r) * 35) % 360,
          });
        }
      }
    }
  }

  private start() {
    const loop = (timestamp: number) => {
      if (this.isDestroyed) return;
      this.resize();
      const time = (timestamp - this.startTime) / 1000;
      this.renderFrame(time);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(t: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;

    // Dark canvas background with slight trail persistence
    ctx.fillStyle = '#080D1A';
    ctx.fillRect(0, 0, w, h);

    switch (this.animationType) {
      case 'galaxy':
        this.renderGalaxy(ctx, w, h, t);
        break;
      case 'cellular':
        this.renderCellular(ctx, w, h, t);
        break;
      case 'slime_kinetic':
        this.renderSlime(ctx, w, h, t);
        break;
      case 'matrix_terminal':
        this.renderMatrix(ctx, w, h, t);
        break;
      case 'tokamak_plasma':
        this.renderPlasma(ctx, w, h, t);
        break;
      case 'rayleigh_prism':
        this.renderPrism(ctx, w, h, t);
        break;
      case 'popit_bubble':
        this.renderPopit(ctx, w, h, t);
        break;
      case 'pixel_glitch':
        this.renderPixelGlitch(ctx, w, h, t);
        break;
      case 'minecraft_runner':
        this.renderMinecraftRunner(ctx, w, h, t);
        break;
      case 'audio_wave':
      case 'fractal_neon':
      default:
        this.renderAudioWave(ctx, w, h, t);
        break;
    }
  }

  // 1. Galaxy Spiral Simulation
  private renderGalaxy(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const cx = w / 2;
    const cy = h / 2;

    // Central core glow
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, Math.min(w, h) * 0.4);
    grad.addColorStop(0, 'rgba(214, 200, 250, 0.9)');
    grad.addColorStop(0.2, 'rgba(83, 59, 135, 0.6)');
    grad.addColorStop(0.6, 'rgba(194, 244, 231, 0.15)');
    grad.addColorStop(1, 'rgba(8, 13, 26, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Particle orbits
    for (const p of this.particles) {
      p.angle += p.speed * (1 + this.dopamineScore / 100);
      const spiralOffset = p.radius * 0.02;
      const x = cx + Math.cos(p.angle + spiralOffset) * p.radius;
      const y = cy + Math.sin(p.angle + spiralOffset) * p.radius * 0.65;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.6 + Math.sin(t * 3 + p.radius) * 0.4);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // 2. Cellular Synaptic Neural Mesh
  private renderCellular(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx * (1 + this.dopamineScore / 80);
      p.y += p.vy * (1 + this.dopamineScore / 80);

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Draw node
      const pulseRadius = p.radius + Math.sin(t * 4 + p.pulse) * 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.accentColor;
      ctx.shadowColor = this.accentColor;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Connect nearby nodes
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 90;

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#D6C8FA';
          ctx.lineWidth = 1 - dist / maxDist;
          ctx.globalAlpha = (1 - dist / maxDist) * 0.7;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  // 3. Viscous Slime Kinetic Simulation
  private renderSlime(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Spring to center
      p.vx += (cx - p.x) * 0.003;
      p.vy += (cy - p.y) * 0.003;

      // Viscous damping
      p.vx *= 0.96;
      p.vy *= 0.96;

      const squish = Math.sin(t * 5 + i) * 8;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius + squish, p.radius - squish * 0.5, t + i, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue + (t * 40) % 60}, 90%, 65%, 0.7)`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // 4. Matrix Terminal Cascade
  private renderMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number) {
    const chars = '0123456789ABCDEF⚡λΨΩ§∆∑ZENTRY';
    ctx.fillStyle = 'rgba(8, 13, 26, 0.2)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#C2F4E7';
    ctx.font = '14px JetBrains Mono, monospace';

    const colWidth = 20;
    for (let i = 0; i < this.matrixDrops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * colWidth;
      const y = this.matrixDrops[i] * 20;

      // Highlight head
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(char, x, y);
      ctx.fillStyle = this.accentColor;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 20);

      if (y > h && Math.random() > 0.975) {
        this.matrixDrops[i] = 0;
      }
      this.matrixDrops[i] += 1 + this.dopamineScore / 100;
    }
  }

  // 5. Tokamak Plasma Torus
  private renderPlasma(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.28; // Major radius
    const r = Math.min(w, h) * 0.12; // Minor radius

    const points = 70;
    for (let ring = 0; ring < 12; ring++) {
      const ringAngle = (ring / 12) * Math.PI * 2 + t * 2;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const u = (i / points) * Math.PI * 2;
        const helical = u * 4 + ringAngle;
        const x3D = (R + r * Math.cos(helical)) * Math.cos(u);
        const y3D = (R + r * Math.cos(helical)) * Math.sin(u) * 0.5 + r * Math.sin(helical);

        const px = cx + x3D;
        const py = cy + y3D;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = ring % 2 === 0 ? '#FBBF24' : '#533B87';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 15;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // 6. Rayleigh Prism Light Scatter
  private renderPrism(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.35;

    // Draw glass prism triangle
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx - size, cy + size * 0.8);
    ctx.lineTo(cx + size, cy + size * 0.8);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(214, 200, 250, 0.8)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(83, 59, 135, 0.25)';
    ctx.fill();
    ctx.stroke();

    // Incident White Beam
    ctx.beginPath();
    ctx.moveTo(0, cy + Math.sin(t * 2) * 40);
    ctx.lineTo(cx - size * 0.4, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Dispersed Spectrum Rays
    const spectrum = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#38BDF8', '#818CF8', '#C084FC'];
    for (let i = 0; i < spectrum.length; i++) {
      const spreadAngle = (i / spectrum.length - 0.5) * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.3, cy + (i - 3) * 6);
      ctx.lineTo(w, cy + Math.tan(spreadAngle) * (w - cx) + Math.sin(t * 3 + i) * 20);
      ctx.strokeStyle = spectrum[i];
      ctx.lineWidth = 3.5;
      ctx.shadowColor = spectrum[i];
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // 7. Pop-It Infinite Bubble Matrix
  private renderPopit(ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const popOsc = Math.sin(t * 8 + i * 0.5);
      const isDepressed = popOsc > 0.3;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${p.colorHue}, 85%, ${isDepressed ? 35 : 60}%)`;
      ctx.shadowColor = `hsl(${p.colorHue}, 90%, 60%)`;
      ctx.shadowBlur = isDepressed ? 5 : 18;
      ctx.fill();

      // Bubble rim highlight
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.baseRadius * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = isDepressed ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // 8. Pixel Glitch 8-Bit Loop
  private renderPixelGlitch(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const tileSize = 24;
    const cols = Math.ceil(w / tileSize);
    const rows = Math.ceil(h / tileSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const noise = Math.sin(c * 0.4 + t * 6) * Math.cos(r * 0.4 + t * 6);
        if (noise > 0.4) {
          ctx.fillStyle = (c + r) % 2 === 0 ? '#C2F4E7' : '#D6C8FA';
          ctx.fillRect(c * tileSize, r * tileSize, tileSize - 2, tileSize - 2);
        }
      }
    }

    // Horizontal Glitch Scanline
    const scanlineY = ((t * 200) % h);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
    ctx.fillRect(0, scanlineY, w, 6);
  }

  // 9. Minecraft 3D Runner Fast Terrain
  private renderMinecraftRunner(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    this.gridOffset = (this.gridOffset + 8 * (1 + this.dopamineScore / 100)) % 60;
    const vanishingY = h * 0.4;
    const cx = w / 2;

    // Horizon sky
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, w, vanishingY);

    // Grid Floor
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, vanishingY, w, h - vanishingY);

    // Perspective Lines
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2;
    for (let x = -w; x <= w * 2; x += 50) {
      ctx.beginPath();
      ctx.moveTo(cx, vanishingY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal moving terrain stripes
    for (let y = vanishingY; y <= h; y += 25) {
      const currentY = y + this.gridOffset * ((y - vanishingY) / (h - vanishingY));
      if (currentY > vanishingY && currentY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(w, currentY);
        ctx.strokeStyle = '#10b981';
        ctx.stroke();
      }
    }

    // Runner character silhouette
    const runnerX = cx + Math.sin(t * 12) * 35;
    const runnerY = h * 0.78 - Math.abs(Math.sin(t * 15)) * 40;
    ctx.fillStyle = '#FBBF24';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 20;
    ctx.fillRect(runnerX - 15, runnerY - 30, 30, 30);
    ctx.shadowBlur = 0;
  }

  // 10. Audio Spectrum Waveform Visualizer
  private renderAudioWave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const cx = w / 2;
    const cy = h / 2;
    const bars = 48;
    const radius = Math.min(w, h) * 0.22;

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2;
      const freq = Math.sin(t * 5 + i * 0.4) * 0.5 + 0.5;
      const barHeight = freq * 60 * (1 + this.dopamineScore / 100);

      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius + barHeight);
      const y2 = cy + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i % 2 === 0 ? '#C2F4E7' : '#D6C8FA';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Central pulsing orb
    const coreRadius = radius * 0.65 + Math.sin(t * 8) * 8;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(83, 59, 135, 0.7)';
    ctx.strokeStyle = '#D6C8FA';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
