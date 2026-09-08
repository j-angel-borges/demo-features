import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BioMorphPhysicsEngine } from '../engine/BioMorphPhysicsEngine';
import { PointersHullEngine } from '../engine/PointersHullEngine';
import { AcousticClimateEngine } from '../engine/AcousticClimateEngine';
import { SensoryPonds } from './SensoryPonds';
import { AcousticClimateBadge } from './AcousticClimateBadge';
import { TouchOrientationHUD } from './TouchOrientationHUD';
import { OrientationState, AcousticClimateState, ContactType } from '../types';
import { organicAudio } from '../services/organicAudioService';
import { vibeTelemetry } from '../services/vibeTelemetryService';

interface BioMorphCanvasProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const BioMorphCanvas: React.FC<BioMorphCanvasProps> = ({
  theme,
  onToggleTheme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<BioMorphPhysicsEngine>(new BioMorphPhysicsEngine());
  const hullRef = useRef<PointersHullEngine>(new PointersHullEngine());
  const acousticRef = useRef<AcousticClimateEngine>(new AcousticClimateEngine());

  const [creaturesCount, setCreaturesCount] = useState<number>(0);
  const [contactType, setContactType] = useState<ContactType>('single_finger');
  const [acousticState, setAcousticState] = useState<AcousticClimateState>({
    rmsDb: 42,
    spectralFlatness: 0.22,
    isCalm: true,
    ambientMode: 'creative',
    isListening: false,
  });

  const [orientation, setOrientation] = useState<OrientationState>({
    tiltX: 0,
    tiltY: 0,
    gravityX: 0,
    gravityY: 0,
    isSimulated: false,
  });

  const [sceneIndex, setSceneIndex] = useState<number>(0);

  const sceneGradients = [
    // 0: Pradera Lavanda Aurora (Light Default)
    {
      light: 'radial-gradient(circle at 50% 30%, rgba(214, 200, 250, 0.4) 0%, rgba(248, 246, 254, 0.95) 75%)',
      dark: 'radial-gradient(circle at 50% 30%, rgba(83, 59, 135, 0.4) 0%, rgba(10, 8, 19, 0.95) 75%)',
    },
    // 1: Océano Menta Fresco
    {
      light: 'radial-gradient(circle at 50% 30%, rgba(194, 244, 231, 0.45) 0%, rgba(240, 253, 250, 0.95) 75%)',
      dark: 'radial-gradient(circle at 50% 30%, rgba(14, 90, 73, 0.4) 0%, rgba(8, 20, 18, 0.95) 75%)',
    },
    // 2: Galaxia Glacial Neón
    {
      light: 'radial-gradient(circle at 50% 30%, rgba(0, 242, 254, 0.25) 0%, rgba(245, 247, 250, 0.95) 75%)',
      dark: 'radial-gradient(circle at 50% 30%, rgba(0, 242, 254, 0.2) 0%, rgba(9, 15, 28, 0.95) 75%)',
    },
  ];

  // Spawn inicial pedagógico (2 criaturas amigables listas para interactuar)
  useEffect(() => {
    const p = physicsRef.current;
    if (p.entities.length === 0) {
      setTimeout(() => {
        p.spawnEntity(window.innerWidth * 0.4, window.innerHeight * 0.45, 'characters');
        p.spawnEntity(window.innerWidth * 0.6, window.innerHeight * 0.45, 'characters');
        setCreaturesCount(p.entities.length);
      }, 100);
    }
  }, []);

  // Escuchar DeviceOrientation en iPads/Smartphones reales
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltX = Math.min(45, Math.max(-45, e.gamma));
        const tiltY = Math.min(45, Math.max(-45, e.beta - 40)); // Restar ángulo cómodo de mano

        setOrientation({
          tiltX,
          tiltY,
          gravityX: tiltX / 45,
          gravityY: tiltY / 45,
          isSimulated: false,
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Simulación manual de inclinación para pruebas en pads sobre soporte
  const handleSimulateTilt = useCallback(() => {
    setOrientation((prev) => {
      const nextTilt = prev.tiltX > 20 ? -25 : prev.tiltX < -15 ? 0 : 25;
      return {
        tiltX: nextTilt,
        tiltY: 10,
        gravityX: nextTilt / 45,
        gravityY: 10 / 45,
        isSimulated: true,
      };
    });
    organicAudio.playWoodPop(1.3);
  }, []);

  // Toggle de micrófono ambiental
  const handleToggleMic = useCallback(async () => {
    const a = acousticRef.current;
    if (acousticState.isListening) {
      a.stopListening();
      setAcousticState((prev) => ({ ...prev, isListening: false }));
    } else {
      const started = await a.startListening();
      if (started) {
        organicAudio.playCalmChord();
      }
    }
  }, [acousticState.isListening]);

  // Spawn manual desde el estanque izquierdo
  const handleSpawnCreature = useCallback(() => {
    const p = physicsRef.current;
    p.spawnEntity();
    setCreaturesCount(p.entities.length);
  }, []);

  // Ciclar escena desde el estanque superior
  const handleCycleScene = useCallback(() => {
    setSceneIndex((prev) => (prev + 1) % sceneGradients.length);
  }, [sceneGradients.length]);

  // Melodía armónica desde el estanque derecho
  const handlePlayMelody = useCallback(() => {
    const p = physicsRef.current;
    organicAudio.playCalmChord();
    // Excitación alegre de todos los bio-morfos
    p.entities.forEach((e) => {
      e.vy = -7;
      e.squishX = 0.8;
      e.squishY = 1.3;
      e.energyLevel = Math.min(100, e.energyLevel + 35);
    });
  }, []);

  // Limpiar lienzo
  const handleClearAll = useCallback(() => {
    const p = physicsRef.current;
    p.clearAll();
    setCreaturesCount(0);
  }, []);

  // Bucle de animación a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      physicsRef.current.resize(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Loop de render
    const render = (time: number) => {
      const p = physicsRef.current;
      const a = acousticRef.current;

      // Actualizar sensor acústico cada ~15 frames
      if (Math.round(time) % 15 === 0) {
        const nextAcoustic = a.update();
        setAcousticState(nextAcoustic);
        vibeTelemetry.updateAcousticMetrics(
          nextAcoustic.rmsDb,
          nextAcoustic.spectralFlatness,
          nextAcoustic.isCalm
        );
      }

      // 1. Física
      const dummyCluster = {
        pointers: [],
        centroidX: 0,
        centroidY: 0,
        convexHullArea: 0,
        contactType: 'single_finger' as ContactType,
        isBurst: false,
        burstCount: 0,
        lastUpdated: time,
      };

      p.update(time, dummyCluster, orientation, acousticState.isCalm);

      // 2. Dibujar Canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Dibujar cada Bio-Morfo
      for (const e of p.entities) {
        ctx.save();
        ctx.translate(e.x, e.y);

        // Deformación elástica (Squish & Stretch)
        ctx.scale(e.squishX, e.squishY);

        const r = e.currentRadius;

        // Halo de resplandor (Glow)
        ctx.shadowColor = e.glowColor;
        ctx.shadowBlur = e.energyLevel > 20 ? 30 : 14;

        // Cuerpo elástico principal (Gradiente radial)
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, e.glowColor);
        grad.addColorStop(1, e.color);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de energía si hay ráfaga activa
        if (e.energyLevel > 25) {
          ctx.strokeStyle = '#00F2FE';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, r + 6 + Math.sin(time * 0.02) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Dibujar ojos expresivos
        ctx.shadowBlur = 0; // Ojos nítidos sin sombra
        const eyeSpacing = r * 0.32;
        const eyeY = -r * 0.15;
        const eyeRadius = Math.max(3, r * 0.18);

        // Ojo izquierdo y derecho
        [-eyeSpacing, eyeSpacing].forEach((eyeX) => {
          if (e.isBlinking) {
            // Línea de parpadeo tierno
            ctx.strokeStyle = '#1E1633';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(eyeX - eyeRadius, eyeY);
            ctx.lineTo(eyeX + eyeRadius, eyeY);
            ctx.stroke();
          } else {
            // Fondo blanco del ojo
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Pupila que sigue al dedo
            ctx.fillStyle = '#1E1633';
            ctx.beginPath();
            ctx.arc(eyeX + e.eyeOffset.x, eyeY + e.eyeOffset.y, eyeRadius * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // Brillo especular infantil
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(eyeX + e.eyeOffset.x - 1.5, eyeY + e.eyeOffset.y - 1.5, eyeRadius * 0.22, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Sonrisa tierna
        ctx.strokeStyle = '#1E1633';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, r * 0.2, r * 0.22, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [orientation, acousticState.isCalm]);

  // Manejo táctil con PointersHullEngine
  const handlePointerDown = (e: React.PointerEvent) => {
    const cluster = hullRef.current.handlePointerDown(e.nativeEvent);
    setContactType(cluster.contactType);

    if (cluster.contactType === 'multi_finger_cluster') {
      vibeTelemetry.recordMultiPointer();
    } else if (cluster.contactType === 'palm_press') {
      vibeTelemetry.recordPalmContact();
      organicAudio.playJellySquish();
    }

    // Impacto de física sobre bio-morfos
    const p = physicsRef.current;
    const hit = p.handlePointerImpact(e.clientX, e.clientY, cluster.isBurst);

    // Si tocó en área vacía y no fue palma masiva, crear ondulación suave
    if (!hit && cluster.contactType === 'single_finger') {
      organicAudio.playWoodPop(0.95);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const cluster = hullRef.current.handlePointerMove(e.nativeEvent);
    setContactType(cluster.contactType);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const cluster = hullRef.current.handlePointerUp(e.pointerId);
    setContactType(cluster.contactType);
  };

  const currentGradient = sceneGradients[sceneIndex][theme];

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none touch-none"
      style={{ background: currentGradient }}
    >
      {/* 1. HUD Superior Izquierdo: Sensores & Tema */}
      <TouchOrientationHUD
        contactType={contactType}
        orientation={orientation}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSimulateTilt={handleSimulateTilt}
      />

      {/* 2. HUD Superior Derecho: Clima Acústico */}
      <AcousticClimateBadge
        state={acousticState}
        onToggleMic={handleToggleMic}
      />

      {/* 3. Estanques Periféricos (Pre-Carpetas Tangibles) */}
      <SensoryPonds
        onSpawnCreature={handleSpawnCreature}
        onCycleScene={handleCycleScene}
        onPlayMelody={handlePlayMelody}
        onClearAll={handleClearAll}
        creaturesCount={creaturesCount}
      />

      {/* 4. Lienzo Principal Táctil Retina 60fps */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
      />
    </div>
  );
};
