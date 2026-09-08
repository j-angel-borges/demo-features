import { useState, useEffect } from 'react';
import type {
  CreativeCreationRecord,
  InteractiveAvatarData,
  InteractiveWorldData,
  InteractiveToyData
} from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore';

const demoAvatarData: InteractiveAvatarData = {
  id: 'avatar_draco',
  name: 'Draco Saltarín',
  avatarType: 'magical_creature',
  primaryColor: '#22C55E',
  secondaryColor: '#EAB308',
  voiceStyle: 'playful',
  personality: 'Curioso, entusiasta y amigable',
  mission: 'Volar por las nubes en busca de estrellas doradas',
  speechScript: [
    '¡Hola Mateo! ¡Me encanta cómo me dibujaste con escamas verdes!',
    '¿A qué lugar secreto deberíamos volar hoy para buscar tesoros?'
  ],
  headFeature: 'horns',
  bodyStyle: 'fluffy'
};

const demoWorldData: InteractiveWorldData = {
  id: 'world_emerald',
  worldName: 'Cielos de Esmeralda',
  biome: 'sky_islands',
  dayNightCycle: 'sunset',
  weather: 'stars',
  groundColor: '#10B981',
  skyColors: ['#1E1B4B', '#F59E0B'],
  props: [
    { id: 'p1', name: 'Gemas de Luz', type: 'crystal', x: 30, y: 40, z: 0, scale: 1.2, color: '#38BDF8' },
    { id: 'p2', name: 'Árbol Mágico', type: 'tree', x: 60, y: 70, z: 0, scale: 1.5, color: '#10B981' }
  ],
  lore: 'Una isla flotante de ensueño suspendida en un crepúsculo eterno.'
};

const demoToyData: InteractiveToyData = {
  id: 'toy_chispitas',
  toyName: 'Chispitas 3000',
  mechanic: 'sound_buttons',
  primaryColor: '#8B5CF6',
  accentColor: '#F43F5E',
  powerLevel: 85,
  controls: [
    { id: 'b1', label: 'Chispa', icon: 'zap', soundFx: 'sparkle', color: '#38BDF8', actionType: 'glow' },
    { id: 'b2', label: 'Girar', icon: 'rotate', soundFx: 'victory', color: '#EC4899', actionType: 'spin' },
    { id: 'b3', label: 'Salto', icon: 'arrow-up', soundFx: 'laser', color: '#FDE047', actionType: 'bounce' }
  ],
  soundTrackName: 'Electro Toy Joy'
};

// Default demo creations for showcase if child hasn't created one yet
const DEMO_PRESET_CREATIONS: CreativeCreationRecord[] = [
  {
    id: 'creation_demo_dragon_01',
    childId: 'child_mateo_01',
    deviceId: 'ipad_mateo_01',
    category: 'character',
    title: 'Draco el Dragón Amistoso',
    originalDrawingBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231E153A"/><circle cx="200" cy="180" r="70" fill="%2322C55E"/><circle cx="175" cy="170" r="14" fill="%230F172A"/><circle cx="225" cy="170" r="14" fill="%230F172A"/><circle cx="177" cy="168" r="5" fill="%23FFF"/><circle cx="227" cy="168" r="5" fill="%23FFF"/><ellipse cx="200" cy="280" rx="90" ry="80" fill="%2316A34A"/><path d="M 170 340 L 160 380 L 190 380 Z" fill="%23EAB308"/><path d="M 230 340 L 220 380 L 250 380 Z" fill="%23EAB308"/><path d="M 120 220 C 80 180, 70 260, 110 260 Z" fill="%234ADE80"/><path d="M 280 220 C 320 180, 330 260, 290 260 Z" fill="%234ADE80"/></svg>',
    generatedImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    analysis: {
      title: 'Draco el Dragón Amistoso',
      category: 'character',
      detectedSubject: 'Dragón amistoso con alas de esmeralda',
      primaryColors: ['#22C55E', '#16A34A', '#EAB308'],
      spatialLayout: 'Cuerpo central con alas abiertas y mirada frontal',
      enhancedPrompt: 'A whimsical baby dragon with emerald scales, large glossy animated eyes, cute friendly smile, Pixar 3D animation style, volumetric morning sunlight, subsurface scattering.',
      childQuestion: '¿A qué lugar secreto deberíamos volar hoy para buscar tesoros?',
      speechFeedback: '¡Tu dragón Draco ha cobrado vida! ¡Mira cómo te sigue con sus grandes ojitos!'
    },
    miniAppType: 'avatar',
    miniAppData: demoAvatarData,
    syncedToFirestore: true,
    createdAt: Date.now() - 1000 * 60 * 35 // 35 min ago
  },
  {
    id: 'creation_demo_floating_island_02',
    childId: 'child_mateo_01',
    deviceId: 'ipad_mateo_01',
    category: 'landscape',
    title: 'Cielos de Esmeralda',
    originalDrawingBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230A1128"/><circle cx="330" cy="80" r="40" fill="%23FBBF24"/><path d="M 50 250 Q 200 180 350 250 L 320 340 Q 200 370 80 340 Z" fill="%230284C7"/><rect x="180" y="160" width="30" height="70" fill="%23854D0E"/><circle cx="195" cy="150" r="50" fill="%2310B981"/></svg>',
    generatedImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    analysis: {
      title: 'Cielos de Esmeralda',
      category: 'landscape',
      detectedSubject: 'Isla flotante de cristal con cascada infinita',
      primaryColors: ['#0284C7', '#10B981', '#FBBF24'],
      spatialLayout: 'Isla flotante superior con colinas y sol poniente',
      enhancedPrompt: 'A magical floating island diorama in a dreamy twilight sky, lush glowing moss, crystalline waterfall falling into clouds, cozy treehouse, Pixar RenderMan lighting.',
      childQuestion: '¿Prefieres explorar este mundo de día o bajo las estrellas?',
      speechFeedback: '¡Tu isla mágica ya está flotando! Toca y arrastra para girarla en 3D.'
    },
    miniAppType: 'world',
    miniAppData: demoWorldData,
    syncedToFirestore: true,
    createdAt: Date.now() - 1000 * 60 * 120 // 2h ago
  },
  {
    id: 'creation_demo_robot_03',
    childId: 'child_mateo_01',
    deviceId: 'ipad_mateo_01',
    category: 'object',
    title: 'Chispitas 3000',
    originalDrawingBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231E1E2E"/><rect x="140" y="100" width="120" height="100" rx="20" fill="%238B5CF6"/><circle cx="170" cy="140" r="15" fill="%2338BDF8"/><circle cx="230" cy="140" r="15" fill="%2338BDF8"/><rect x="160" y="170" width="80" height="15" rx="5" fill="%23F43F5E"/><rect x="120" y="210" width="160" height="120" rx="25" fill="%236366F1"/><line x1="200" y1="100" x2="200" y2="60" stroke="%23FBBF24" stroke-width="8"/><circle cx="200" cy="50" r="12" fill="%23EF4444"/></svg>',
    generatedImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80',
    analysis: {
      title: 'Chispitas 3000',
      category: 'object',
      detectedSubject: 'Caja de Sorpresas y Engranes Robotizados',
      primaryColors: ['#8B5CF6', '#38BDF8', '#F43F5E'],
      spatialLayout: 'Bloque mecánico estructurado con botones e indicadores luminosos',
      enhancedPrompt: 'A vibrant retro-futuristic music robot toy with polished chrome buttons, spinning gears, warm analog vacuum tubes, studio toy photography lighting.',
      childQuestion: '¿Qué botón secreto crees que produce el sonido más divertido?',
      speechFeedback: '¡Tu juguete robotizado está listo! Presiona los botones y tira de la palanca.'
    },
    miniAppType: 'toy',
    miniAppData: demoToyData,
    syncedToFirestore: true,
    createdAt: Date.now() - 1000 * 60 * 240 // 4h ago
  }
];

export const useCreativeCreations = () => {
  const [creations, setCreations] = useState<CreativeCreationRecord[]>(DEMO_PRESET_CREATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = parentFirestoreService.subscribeCreativeCreations((liveCreations) => {
      if (liveCreations && liveCreations.length > 0) {
        const liveIds = new Set(liveCreations.map((c) => c.id));
        const nonDuplicatePresets = DEMO_PRESET_CREATIONS.filter((p) => !liveIds.has(p.id));
        setCreations([...liveCreations, ...nonDuplicatePresets]);
      } else {
        setCreations(DEMO_PRESET_CREATIONS);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    creations,
    isLoading
  };
};
