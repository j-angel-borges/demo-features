import { useState, useEffect, useMemo } from 'react';
import type { IslandTelemetryEvent } from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore';
import type { IslandAggregateStats } from '../types';

export const INITIAL_ISLAND_MOCK_EVENTS: IslandTelemetryEvent[] = [
  {
    eventId: 'event_island_04',
    deviceId: 'ipad_mateo_01',
    timestamp: Date.now() - 35000,
    cameraMode: 'dual_bereal',
    activeAction: 'landscape',
    generativeStyle: 'comic',
    aiPrompt: 'Transformar escena cotidiana a estilo Novela Gráfica / Cómic con trazos entintados',
    aiResponse: 'Estilo Cómic aplicado exitosamente a 60fps con realce de bordes y viñeta.',
    frameSnapshotUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  },
  {
    eventId: 'event_island_03',
    deviceId: 'ipad_mateo_01',
    timestamp: Date.now() - 90000,
    cameraMode: 'environment',
    activeAction: 'touch_explain',
    touchCoordinates: { x: 0.42, y: 0.68 },
    aiPrompt: 'Explicar objeto seleccionado en coordenadas (42%, 68%)',
    aiResponse: 'Microscopio Óptico Monocular: Instrumento que utiliza lentes bicóncavas para magnificar muestras biológicas hasta 400x.',
    frameSnapshotUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    eventId: 'event_island_02',
    deviceId: 'ipad_mateo_01',
    timestamp: Date.now() - 180000,
    cameraMode: 'environment',
    activeAction: 'scene_redesign',
    generativeStyle: 'spatial',
    aiPrompt: 'Proponer rediseño arquitectónico vs futurista',
    redesignOptions: [
      { title: 'Laboratorio Futurista 3D', description: 'Reemplaza el escritorio con hologramas interactivos de anatomía y física cuántica.', style: 'Cyber Cyan 3D' },
      { title: 'Bioma Botánico Encapsulado', description: 'Transforma la habitación en un domo botánico con flora bioluminiscente.', style: 'Eco Greenhouse' },
    ],
    frameSnapshotUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
  },
  {
    eventId: 'event_island_01',
    deviceId: 'ipad_mateo_01',
    timestamp: Date.now() - 300000,
    cameraMode: 'user',
    activeAction: 'landscape',
    generativeStyle: 'pixel_art',
    aiPrompt: 'Convertir selfie a Pixel Art 16-bit retro',
    aiResponse: 'Avatar Pixel Art generado con paleta de 16 colores Zentry Lavanda/Menta.',
    frameSnapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
];

export function useLiveIsland() {
  const [events, setEvents] = useState<IslandTelemetryEvent[]>(INITIAL_ISLAND_MOCK_EVENTS);
  const [isLive, setIsLive] = useState<boolean>(true);

  useEffect(() => {
    // Seed initial mock events to local bus
    INITIAL_ISLAND_MOCK_EVENTS.forEach((ev) => {
      parentFirestoreService.publishIslandEvent(ev);
    });

    const unsubscribe = parentFirestoreService.subscribeIslandTelemetry((telemetryList) => {
      if (telemetryList && telemetryList.length > 0) {
        setEvents(telemetryList);
        setIsLive(true);
      }
    }, 40);

    return () => {
      unsubscribe();
    };
  }, []);

  const stats: IslandAggregateStats = useMemo(() => {
    let landscapeCount = 0;
    let touchExplainCount = 0;
    let sceneRedesignCount = 0;

    events.forEach((e) => {
      if (e.activeAction === 'landscape') landscapeCount++;
      else if (e.activeAction === 'touch_explain') touchExplainCount++;
      else if (e.activeAction === 'scene_redesign') sceneRedesignCount++;
    });

    const latest = events[0] || INITIAL_ISLAND_MOCK_EVENTS[0];
    const touchEvent = events.find((e) => e.activeAction === 'touch_explain' && e.touchCoordinates) || events[1];
    const genEvent = events.find((e) => e.activeAction === 'landscape' && e.generativeStyle) || events[0];

    return {
      landscapeCount,
      touchExplainCount,
      sceneRedesignCount,
      totalInteractions: events.length,
      cameraMode: latest.cameraMode || 'dual_bereal',
      lastActiveAction: latest.activeAction,
      lastTouchCoordinates: touchEvent?.touchCoordinates || { x: 0.42, y: 0.68 },
      lastDetectedObject: 'Microscopio Óptico Monocular',
      lastExplanation: touchEvent?.aiResponse || 'Instrumento óptico para magnificación celular.',
      lastGenerativeStyle: genEvent?.generativeStyle || 'comic',
      lastSnapshotUrl: latest.frameSnapshotUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
      averageLatencyMs: 742,
    };
  }, [events]);

  return {
    events,
    stats,
    isLive,
    latestEvent: events[0] || null,
  };
}
