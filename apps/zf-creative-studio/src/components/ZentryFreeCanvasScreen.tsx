import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Trash2,
  Eraser,
  Paintbrush,
  Sparkles,
  Check,
  Shapes,
  Circle,
  Square,
  Star,
  Triangle,
  Heart,
  Diamond,
  Flower2,
  Rocket,
  Download,
  Palette,
  X,
  Maximize2,
  Minimize2,
  Wand2,
  LucideIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';
import { GuidedTransformWizard } from './creative/GuidedTransformWizard';
import { PostGenToolsPanel } from './creative/PostGenToolsPanel';
import { TalkingAvatarPlayer } from './creative/miniapps/TalkingAvatarPlayer';
import { Diorama3DWorldPlayer } from './creative/miniapps/Diorama3DWorldPlayer';
import { InteractiveToyPlayer } from './creative/miniapps/InteractiveToyPlayer';
import {
  saveCreativeCreation,
  CreativeCategory,
  DoodleAnalysis,
  InteractiveAvatarData,
  InteractiveWorldData,
  InteractiveToyData,
  CreativeCreationRecord
} from '@zentry/shared';

export type ShapeType =
  | 'circle'
  | 'rectangle'
  | 'star'
  | 'triangle'
  | 'heart'
  | 'diamond'
  | 'flower'
  | 'rocket';

const GEOMETRIC_SHAPES: Array<{ id: ShapeType; label: string; Icon: LucideIcon }> = [
  { id: 'circle', label: 'Círculo', Icon: Circle },
  { id: 'rectangle', label: 'Rectángulo', Icon: Square },
  { id: 'star', label: 'Estrella', Icon: Star },
  { id: 'triangle', label: 'Triángulo', Icon: Triangle },
  { id: 'heart', label: 'Corazón', Icon: Heart },
  { id: 'diamond', label: 'Rombo', Icon: Diamond },
  { id: 'flower', label: 'Flor', Icon: Flower2 },
  { id: 'rocket', label: 'Cohete', Icon: Rocket }
];

const BRUSH_SIZES = [
  { id: 'fine', size: 6, dotSize: 8, label: 'Fino' },
  { id: 'medium', size: 14, dotSize: 14, label: 'Medio' },
  { id: 'thick', size: 26, dotSize: 22, label: 'Grueso' },
  { id: 'jumbo', size: 44, dotSize: 30, label: 'Jumbo' }
];

const PAINT_PALETTE_MATRIX = [
  ['#000000', '#334155', '#64748B', '#94A3B8', '#E2E8F0', '#FFFFFF'],
  ['#881337', '#DC2626', '#EF4444', '#F87171', '#EC4899', '#F472B6'],
  ['#7C2D12', '#EA580C', '#F97316', '#FB923C', '#EAB308', '#FDE047'],
  ['#14532D', '#16A34A', '#22C55E', '#4ADE80', '#84CC16', '#A3E635'],
  ['#164E63', '#0891B2', '#06B6D4', '#38BDF8', '#2563EB', '#60A5FA'],
  ['#4C1D95', '#7C3AED', '#8B5CF6', '#C084FC', '#92400E', '#FDDFD0']
];

const QUICK_COLORS = ['#EC4899', '#3B82F6', '#10B981', '#EAB308', '#000000'];

type ToolMode = 'brush' | 'rainbow' | 'shape' | 'eraser';

export const ZentryFreeCanvasScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Modo de Expansión de Lienzo (Pantalla Completa con Botones Flotantes en las Esquinas)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [selectedColor, setSelectedColor] = useState<string>('#EC4899');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showShapePicker, setShowShapePicker] = useState<boolean>(false);

  const isDrawingRef = useRef(false);
  const strokePointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const rainbowHueRef = useRef(0);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Estados de la Suite Creativa WOW
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showPostGenPanel, setShowPostGenPanel] = useState<boolean>(false);
  const [activeMiniApp, setActiveMiniApp] = useState<'avatar' | 'world' | 'toy' | null>(null);
  const [currentDoodleBase64, setCurrentDoodleBase64] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [, setColoringBookImageUrl] = useState<string>('');
  const [doodleAnalysis, setDoodleAnalysis] = useState<DoodleAnalysis | null>(null);
  const [currentMiniAppData, setCurrentMiniAppData] = useState<
    InteractiveAvatarData | InteractiveWorldData | InteractiveToyData | null
  >(null);
  const [currentCategory, setCurrentCategory] = useState<CreativeCategory>('character');

  const initCanvases = useCallback(() => {
    const container = containerRef.current;
    const drawCanvas = drawCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !drawCanvas || !overlayCanvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const prevCtx = drawCanvas.getContext('2d');

    // Preservar dibujo anterior en canvas temporal para re-escalado suave sin pérdida
    let tempCanvas: HTMLCanvasElement | null = null;
    const prevW = drawCanvas.width;
    const prevH = drawCanvas.height;
    if (prevCtx && prevW > 0 && prevH > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = prevW;
      tempCanvas.height = prevH;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(drawCanvas, 0, 0);
      }
    }

    drawCanvas.width = Math.round(rect.width * dpr);
    drawCanvas.height = Math.round(rect.height * dpr);
    overlayCanvas.width = Math.round(rect.width * dpr);
    overlayCanvas.height = Math.round(rect.height * dpr);

    const drawCtx = drawCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (drawCtx) {
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';

      if (tempCanvas && prevW > 0 && prevH > 0) {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        // Preservar relación de aspecto uniforme (aspect-ratio contain) y centrar el dibujo para evitar distorsión
        const scale = Math.min(drawCanvas.width / prevW, drawCanvas.height / prevH);
        const targetW = prevW * scale;
        const targetH = prevH * scale;
        const offsetX = (drawCanvas.width - targetW) / 2;
        const offsetY = (drawCanvas.height - targetH) / 2;
        drawCtx.drawImage(tempCanvas, 0, 0, prevW, prevH, offsetX, offsetY, targetW, targetH);
      } else {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        const initialSnap = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
        setHistory([initialSnap]);
      }
    }

    if (overlayCtx) {
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    // Inicialización inicial
    const timeout = setTimeout(() => {
      initCanvases();
    }, 50);

    const handleResize = () => {
      requestAnimationFrame(() => initCanvases());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [initCanvases, isExpanded]);

  const pushSnapshot = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sounds.playTap();
    sounds.vibrate(8);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = history.slice(0, -1);
    const lastSnap = next[next.length - 1];
    ctx.putImageData(lastSnap, 0, 0);
    setHistory(next);
  };

  const handleClear = () => {
    sounds.playTrash();
    sounds.vibrate([15, 20]);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushSnapshot();
  };

  const handleSave = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    sounds.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    const link = document.createElement('a');
    link.download = `zentry-dibujo-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const loadBackgroundImage = (url: string) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      pushSnapshot();
      sounds.playStarBurst();
    };
    img.src = url;
  };

  const getCoordinates = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = drawCanvasRef.current;
    if (!container || !canvas) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCoordinates(e);
    strokePointsRef.current = [pt];

    sounds.playBrushStroke();
    sounds.vibrate(4);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 1.8;
    } else if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 25) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 100%, 55%)`;
      ctx.lineWidth = brushSize;
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getCoordinates(e);
    const pts = strokePointsRef.current;
    pts.push(pt);

    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const oCtx = overlay.getContext('2d');
      if (!oCtx) return;

      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      const startPt = pts[0];
      drawGeometricShape(oCtx, selectedShape, startPt.x, startPt.y, pt.x, pt.y, selectedColor, brushSize);
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 4) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 100%, 55%)`;
      ctx.lineWidth = brushSize;
    } else if (toolMode === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 1.8;
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }

    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];

      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const pts = strokePointsRef.current;
    if (toolMode === 'shape' && pts.length >= 2) {
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        oCtx?.clearRect(0, 0, overlay.width, overlay.height);
      }

      const canvas = drawCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const startPt = pts[0];
          const endPt = pts[pts.length - 1];
          drawGeometricShape(ctx, selectedShape, startPt.x, startPt.y, endPt.x, endPt.y, selectedColor, brushSize);
        }
      }
    }

    strokePointsRef.current = [];
    pushSnapshot();
  };

  const drawGeometricShape = (
    ctx: CanvasRenderingContext2D,
    shape: ShapeType,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    size: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '22';
    ctx.lineWidth = size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const cx = minX + w / 2;
    const cy = minY + h / 2;
    const radius = Math.min(w, h) / 2;

    ctx.beginPath();
    switch (shape) {
      case 'circle':
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        break;
      case 'rectangle':
        ctx.rect(minX, minY, w, h);
        break;
      case 'triangle':
        ctx.moveTo(cx, minY);
        ctx.lineTo(minX + w, minY + h);
        ctx.lineTo(minX, minY + h);
        ctx.closePath();
        break;
      case 'star': {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          let x = cx + Math.cos(rot) * outerRadius;
          let y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        break;
      }
      case 'heart': {
        const topCurveHeight = h * 0.3;
        ctx.moveTo(cx, minY + topCurveHeight);
        ctx.bezierCurveTo(cx, minY, minX, minY, minX, minY + topCurveHeight);
        ctx.bezierCurveTo(minX, minY + (h + topCurveHeight) / 2, cx, minY + (h + topCurveHeight) / 1.4, cx, minY + h);
        ctx.bezierCurveTo(cx, minY + (h + topCurveHeight) / 1.4, minX + w, minY + (h + topCurveHeight) / 2, minX + w, minY + topCurveHeight);
        ctx.bezierCurveTo(minX + w, minY, cx, minY, cx, minY + topCurveHeight);
        ctx.closePath();
        break;
      }
      case 'diamond':
        ctx.moveTo(cx, minY);
        ctx.lineTo(minX + w, cy);
        ctx.lineTo(cx, minY + h);
        ctx.lineTo(minX, cy);
        ctx.closePath();
        break;
      case 'flower': {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const angle = (i * 2 * Math.PI) / petals;
          const px = cx + Math.cos(angle) * (radius * 0.6);
          const py = cy + Math.sin(angle) * (radius * 0.6);
          ctx.moveTo(px + radius * 0.4, py);
          ctx.arc(px, py, radius * 0.4, 0, Math.PI * 2);
        }
        ctx.moveTo(cx + radius * 0.3, cy);
        ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
        break;
      }
      case 'rocket':
        ctx.moveTo(cx, minY);
        ctx.quadraticCurveTo(minX + w * 0.8, cy, minX + w * 0.8, minY + h * 0.8);
        ctx.lineTo(minX + w, minY + h);
        ctx.lineTo(cx, minY + h * 0.85);
        ctx.lineTo(minX, minY + h);
        ctx.lineTo(minX + w * 0.2, minY + h * 0.8);
        ctx.quadraticCurveTo(minX + w * 0.2, cy, cx, minY);
        ctx.closePath();
        break;
    }

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const handleOpenMagicWizard = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    sounds.playStarBurst();
    sounds.vibrate([20, 30, 20]);

    const base64 = canvas.toDataURL('image/png');
    setCurrentDoodleBase64(base64);
    // Limpieza explícita del estado previo para evitar cualquier fuga visual o parpadeo de imagen anterior
    setGeneratedImageUrl('');
    setDoodleAnalysis(null);
    setCurrentMiniAppData(null);
    setShowWizard(true);
  };

  const handleWizardGenerated = (data: {
    analysis: DoodleAnalysis;
    generatedImageUrl: string;
    miniAppData: InteractiveAvatarData | InteractiveWorldData | InteractiveToyData;
  }) => {
    const { analysis, generatedImageUrl: renderedUrl, miniAppData } = data;
    const category: CreativeCategory = analysis.category || currentCategory || 'character';
    
    // Transición directa y atómica en el mismo frame para evitar cualquier salto a la pantalla anterior
    setCurrentCategory(category);
    setDoodleAnalysis(analysis);
    setGeneratedImageUrl(renderedUrl);
    setCurrentMiniAppData(miniAppData);
    setShowWizard(false);
    setShowPostGenPanel(true);

    const record: CreativeCreationRecord = {
      id: `creative_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      childId: 'child_mateo_01',
      deviceId: 'device_ipad_01',
      category,
      title: analysis.title,
      originalDrawingBase64: currentDoodleBase64,
      generatedImageUrl: renderedUrl,
      coloringBookImageUrl: '',
      analysis,
      miniAppType: category === 'character' ? 'avatar' : category === 'landscape' ? 'world' : 'toy',
      miniAppData,
      syncedToFirestore: true,
      createdAt: Date.now()
    };

    // Guardado asíncrono no bloqueante en Firestore
    saveCreativeCreation(record).catch((err) => {
      console.warn('[ZentryFreeCanvasScreen] Background Firestore sync:', err);
    });
  };

  // Si hay una mini-app activa a pantalla completa:
  if (activeMiniApp === 'avatar' && currentMiniAppData) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080D1A]">
        <TalkingAvatarPlayer
          avatarData={currentMiniAppData as InteractiveAvatarData}
          characterImageUrl={generatedImageUrl}
          onBack={() => setActiveMiniApp(null)}
        />
      </div>
    );
  }

  if (activeMiniApp === 'world' && currentMiniAppData) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080D1A]">
        <Diorama3DWorldPlayer
          worldData={currentMiniAppData as InteractiveWorldData}
          landscapeImageUrl={generatedImageUrl}
          onBack={() => setActiveMiniApp(null)}
        />
      </div>
    );
  }

  if (activeMiniApp === 'toy' && currentMiniAppData) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080D1A]">
        <InteractiveToyPlayer
          toyData={currentMiniAppData as InteractiveToyData}
          toyImageUrl={generatedImageUrl}
          onBack={() => setActiveMiniApp(null)}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full select-none ${
        isExpanded
          ? 'fixed inset-0 z-20 bg-white overflow-hidden'
          : 'relative flex flex-col justify-between px-2 sm:px-3 pt-1.5 sm:pt-2 pb-2 sm:pb-3 max-w-7xl mx-auto overflow-hidden'
      }`}
    >
      {/* ========================================================================= */}
      {/* MODO 1: PANTALLA COMPLETA EXPANDIDA (BOTONES FLOTANTES EN LAS 4 ESQUINAS) */}
      {/* ========================================================================= */}
      {isExpanded ? (
        <>
          {/* LIENZO COMPLETO INSET-0 */}
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              if (showColorPicker) setShowColorPicker(false);
              if (showShapePicker) setShowShapePicker(false);
              handlePointerDown(e);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 w-full h-full touch-none bg-white cursor-crosshair z-10"
          >
            <canvas ref={drawCanvasRef} className="w-full h-full block absolute inset-0 z-10" />
            <canvas ref={overlayCanvasRef} className="w-full h-full block absolute inset-0 z-20 pointer-events-none" />
          </div>

          {/* ESQUINA SUPERIOR DERECHA: REDUCIR LIENZO, DESHACER, LIMPIAR, GUARDAR */}
          <div className="fixed top-2.5 right-2.5 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-[#D6C8FA]/60 shadow-xl text-slate-800">
            <button
              onClick={() => {
                sounds.playTap();
                setIsExpanded(false);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-300/80 cursor-pointer zentry-spring-press"
              title="Reducir Lienzo (Modo Normal)"
            >
              <Minimize2 className="w-5 h-5 text-pink-600" />
            </button>

            <div className="h-5 w-px bg-slate-200" />

            <button
              onClick={handleUndo}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer zentry-spring-press border border-slate-200/80"
              title="Deshacer"
            >
              <Undo2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleClear}
              className="p-2 sm:p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer zentry-spring-press border border-rose-200/80"
              title="Limpiar Lienzo"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleSave}
              className="p-2 sm:p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500 cursor-pointer zentry-spring-press shadow-sm"
              title="Guardar Dibujo"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* ESQUINA SUPERIOR IZQUIERDA: SELECTOR DE HERRAMIENTA */}
          <div className="fixed top-2.5 left-2.5 z-30 flex items-center gap-1 p-1.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-[#D6C8FA]/60 shadow-xl text-slate-800">
            <button
              onClick={() => {
                sounds.playTap();
                setToolMode('brush');
                setShowShapePicker(false);
              }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'brush' ? 'bg-[#533B87] text-white shadow-lg border border-purple-400/40' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Pincel Suave"
            >
              <Paintbrush className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                sounds.playSparkle();
                setToolMode('rainbow');
                setShowShapePicker(false);
              }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'rainbow' ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Pincel Arcoíris Mágico"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setToolMode('shape');
                setShowShapePicker(!showShapePicker);
              }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'shape' ? 'bg-sky-600 text-white shadow-lg border border-sky-400/40' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Formas Geométricas"
            >
              <Shapes className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setToolMode('eraser');
                setShowShapePicker(false);
              }}
              className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'eraser' ? 'bg-rose-600 text-white shadow-lg border border-rose-400/40' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Borrador Mágico"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* ESQUINA INFERIOR IZQUIERDA: PALETA DE COLORES Y GROSOR */}
          <div className="fixed bottom-2.5 left-2.5 z-30 flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/90 backdrop-blur-2xl border border-[#D6C8FA]/60 shadow-xl max-w-[calc(100vw-130px)] sm:max-w-none overflow-x-auto no-scrollbar text-slate-800">
            <button
              onClick={() => {
                sounds.playTap();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer zentry-spring-press shrink-0 text-slate-700"
              title="Paleta Completa (36 Colores)"
            >
              <div
                style={{ backgroundColor: selectedColor }}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
              />
              <Palette className="w-4 h-4 text-slate-700" />
            </button>

            <div className="flex items-center gap-1 shrink-0">
              {QUICK_COLORS.map((hex) => {
                const isSelected = selectedColor.toLowerCase() === hex.toLowerCase() && toolMode !== 'eraser';
                return (
                  <button
                    key={hex}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedColor(hex);
                      if (toolMode === 'eraser') setToolMode('brush');
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                      isSelected ? 'scale-125 border-white ring-2 ring-pink-500 shadow-md' : 'border-white/80 ring-1 ring-slate-200/80 hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-1 shrink-0">
              {BRUSH_SIZES.map((b) => {
                const isSelected = brushSize === b.size;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playTap();
                      setBrushSize(b.size);
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-100 ring-1 ring-[#533B87]' : 'hover:bg-slate-100'
                    }`}
                    title={`Tamaño ${b.label}`}
                  >
                    <span
                      style={{ width: `${Math.min(18, b.dotSize)}px`, height: `${Math.min(18, b.dotSize)}px` }}
                      className={`rounded-full block ${isSelected ? 'bg-[#533B87]' : 'bg-slate-400'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ESQUINA INFERIOR DERECHA: BOTÓN MÁGICO VECTORIAL (FACTOR WOW - MESA DE TRABAJO) */}
          <div className="fixed bottom-2.5 right-2.5 z-30">
            <button
              onClick={handleOpenMagicWizard}
              className="relative group px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#533B87] to-[#7A59BF] hover:from-[#5E4399] hover:to-[#8662D1] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(83,59,135,0.35)] hover:shadow-[0_0_24px_rgba(0,242,254,0.4)] border border-[#D6C8FA]/50 cursor-pointer zentry-spring-press transition-all overflow-hidden"
              title="Evolución Mágica (Factor WOW)"
            >
              <Wand2 className="w-5 h-5 text-[#00F2FE] stroke-[2]" />
              <span className="tracking-wide">Mágico</span>
            </button>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* MODO 2: NORMAL DOCKEADO (A LA ALTURA EXACTA DE LA ISLA DINÁMICA - TEMA CLARO) */
        /* ========================================================================= */
        <>
          {/* BARRA SUPERIOR COMPACTA EN TEMA CLARO */}
          <div className="relative z-20 flex items-center justify-between gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5 min-h-[44px] sm:min-h-[48px] bg-white/85 backdrop-blur-2xl rounded-2xl border border-[#D6C8FA]/60 shadow-lg shadow-purple-950/5 shrink-0 text-slate-800">
            {/* LADO IZQUIERDO: Herramientas de trazo y selector de tamaño */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  sounds.playTap();
                  setToolMode('brush');
                  setShowShapePicker(false);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'brush' ? 'bg-[#533B87] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Pincel Suave"
              >
                <Paintbrush className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playSparkle();
                  setToolMode('rainbow');
                  setShowShapePicker(false);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'rainbow' ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Pincel Arcoíris"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setToolMode('shape');
                  setShowShapePicker(!showShapePicker);
                }}
                className={`hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center rounded-lg sm:rounded-xl transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'shape' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Formas Geométricas"
              >
                <Shapes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setToolMode('eraser');
                  setShowShapePicker(false);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Borrador"
              >
                <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Selector de Tamaños (visible en pantallas medianas / desktop) */}
              <div className="hidden md:flex items-center gap-1 pl-1 ml-0.5 border-l border-slate-200">
                {BRUSH_SIZES.map((b) => {
                  const isSelected = brushSize === b.size;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        sounds.playTap();
                        setBrushSize(b.size);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                        isSelected ? 'bg-purple-100 ring-1 ring-[#533B87]' : 'hover:bg-slate-100'
                      }`}
                      title={`Tamaño ${b.label}`}
                    >
                      <span
                        style={{ width: `${Math.min(16, b.dotSize)}px`, height: `${Math.min(16, b.dotSize)}px` }}
                        className={`rounded-full block ${isSelected ? 'bg-[#533B87]' : 'bg-slate-400'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTRO: ESPACIADOR ESTRUCTURAL PARA LA ISLA DINÁMICA (164px - 176px) */}
            <div className="w-[164px] sm:w-[176px] h-7 shrink-0 pointer-events-none" aria-hidden="true" />

            {/* LADO DERECHO: Deshacer, Limpiar y Expansión */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleUndo}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 cursor-pointer zentry-spring-press"
                title="Deshacer"
              >
                <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleClear}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 cursor-pointer zentry-spring-press"
                title="Limpiar Lienzo"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="h-4 sm:h-5 w-px bg-slate-200 mx-0.5" />

              {/* BOTÓN DE EXPANSIÓN DE LIENZO A PANTALLA COMPLETA */}
              <button
                onClick={() => {
                  sounds.playStarBurst();
                  setIsExpanded(true);
                }}
                className="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#533B87] to-pink-600 text-white hover:opacity-90 border border-purple-300/40 shadow-sm cursor-pointer zentry-spring-press"
                title="Expandir Lienzo a Pantalla Completa"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[11px] font-bold hidden sm:inline">Expandir</span>
              </button>
            </div>
          </div>

          {/* LIENZO DE DIBUJO CENTRAL QUE OCUPA TODO EL ESPACIO RESTANTE SIN SCROLL */}
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              if (showColorPicker) setShowColorPicker(false);
              if (showShapePicker) setShowShapePicker(false);
              handlePointerDown(e);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex-1 min-h-0 w-full relative my-1.5 sm:my-2 rounded-[28px] overflow-hidden shadow-xl shadow-purple-950/5 border-2 sm:border-4 border-white ring-1 ring-slate-200/90 touch-none bg-white cursor-crosshair z-10"
          >
            <canvas ref={drawCanvasRef} className="w-full h-full block absolute inset-0 z-10" />
            <canvas ref={overlayCanvasRef} className="w-full h-full block absolute inset-0 z-20 pointer-events-none" />
          </div>

          {/* BARRA INFERIOR COMPACTA EN TEMA CLARO */}
          <div className="relative z-20 flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-white/85 backdrop-blur-2xl rounded-2xl border border-[#D6C8FA]/60 shadow-lg shadow-purple-950/5 shrink-0 text-slate-800">
            {/* Color activo y accesos rápidos */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowColorPicker(!showColorPicker);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/90 shadow-sm flex items-center gap-1.5 cursor-pointer zentry-spring-press text-slate-700"
                title="Paleta de Colores"
              >
                <div
                  style={{ backgroundColor: selectedColor }}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0 ring-1 ring-slate-200/70"
                />
                <Palette className="w-4 h-4 text-slate-700" />
              </button>

              <div className="hidden xs:flex items-center gap-1.5 pl-1 border-l border-slate-200">
                {QUICK_COLORS.map((hex) => {
                  const isSelected = selectedColor.toLowerCase() === hex.toLowerCase() && toolMode !== 'eraser';
                  return (
                    <button
                      key={hex}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedColor(hex);
                        if (toolMode === 'eraser') setToolMode('brush');
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                        isSelected ? 'scale-120 border-white ring-2 ring-pink-500 shadow-md' : 'border-white ring-1 ring-slate-200/80 hover:scale-110'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Acciones principales: MÁGICO y GUARDAR (Estándar Mesa de Trabajo) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenMagicWizard}
                className="relative group px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#533B87] to-[#7A59BF] hover:from-[#5E4399] hover:to-[#8662D1] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_4px_16px_rgba(83,59,135,0.3)] hover:shadow-[0_0_20px_rgba(0,242,254,0.35)] border border-[#D6C8FA]/40 cursor-pointer zentry-spring-press transition-all overflow-hidden"
                title="Evolución Mágica (Factor WOW)"
              >
                <Wand2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#00F2FE] stroke-[2]" />
                <span className="tracking-wide">Mágico</span>
              </button>

              <button
                onClick={handleSave}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm border border-emerald-500 active:scale-95 cursor-pointer zentry-spring-press"
                title="Guardar"
              >
                <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL POPUP: SELECTOR DE FORMAS GEOMÉTRICAS */}
      {showShapePicker && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 select-none"
          onClick={() => setShowShapePicker(false)}
        >
          <div
            className="relative max-w-xs w-full rounded-3xl p-4 bg-white/95 backdrop-blur-2xl border-2 border-sky-300 shadow-2xl text-slate-900 animate-spring-in space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shapes className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-black uppercase text-slate-900">Formas</span>
              </div>
              <button
                onClick={() => setShowShapePicker(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {GEOMETRIC_SHAPES.map((item) => {
                const isSelected = selectedShape === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedShape(item.id);
                      setToolMode('shape');
                      setShowShapePicker(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 border-white text-white shadow-lg scale-105 ring-2 ring-sky-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELECTOR DE 36 COLORES ESTILO PAINT */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 select-none"
          onClick={() => setShowColorPicker(false)}
        >
          <div
            className="relative max-w-sm w-full rounded-[32px] p-4 bg-white/95 backdrop-blur-2xl border-2 border-purple-300 shadow-2xl text-slate-900 animate-spring-in space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-black uppercase text-slate-900">Colores</span>
              </div>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {PAINT_PALETTE_MATRIX.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-6 gap-1.5">
                  {row.map((hex) => {
                    const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={hex}
                        onClick={() => {
                          sounds.playTap();
                          setSelectedColor(hex);
                          if (toolMode === 'eraser') setToolMode('brush');
                        }}
                        style={{ backgroundColor: hex }}
                        className={`w-full aspect-square rounded-xl border transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected ? 'scale-115 border-white ring-2 ring-pink-500 shadow-lg' : 'border-slate-200/80 shadow-xs'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASISTENTE VISUAL GUIADO (FASE 2) */}
      {showWizard && (
        <GuidedTransformWizard
          doodleBase64={currentDoodleBase64}
          onClose={() => setShowWizard(false)}
          onGenerated={handleWizardGenerated}
        />
      )}

      {/* MODAL: SUITE DE HERRAMIENTAS POST-GENERACIÓN (FASE 3) */}
      {showPostGenPanel && doodleAnalysis && currentMiniAppData && (
        <PostGenToolsPanel
          category={currentCategory}
          title={doodleAnalysis.title}
          imageUrl={generatedImageUrl}
          analysis={doodleAnalysis}
          miniAppData={currentMiniAppData}
          onClose={() => setShowPostGenPanel(false)}
          onContinueDrawing={(bgUrl) => {
            loadBackgroundImage(bgUrl);
            setShowPostGenPanel(false);
            setToolMode('brush');
          }}
          onStartColoringBook={(coloringUrl) => {
            setColoringBookImageUrl(coloringUrl);
            loadBackgroundImage(coloringUrl);
            setShowPostGenPanel(false);
            setToolMode('brush');
          }}
          onLaunchMiniApp={() => {
            setShowPostGenPanel(false);
            setActiveMiniApp(
              currentCategory === 'character'
                ? 'avatar'
                : currentCategory === 'landscape'
                ? 'world'
                : 'toy'
            );
          }}
          onUpdateImage={(newUrl) => {
            setGeneratedImageUrl(newUrl);
          }}
        />
      )}
    </div>
  );
};
