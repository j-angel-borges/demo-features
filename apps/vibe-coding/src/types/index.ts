export type PondCategory = 'characters' | 'scenes' | 'sounds';

export type ContactType = 'single_finger' | 'multi_finger_cluster' | 'palm_press' | 'hover_touch';

export interface RawPointer {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
  radiusX: number;
  radiusY: number;
  pressure: number;
  pointerType: string;
}

export interface PointerClusterState {
  pointers: RawPointer[];
  centroidX: number;
  centroidY: number;
  convexHullArea: number;
  contactType: ContactType;
  isBurst: boolean; // Detección de ráfaga rápida <150ms IAT
  burstCount: number;
  lastUpdated: number;
}

export interface BioMorphEntity {
  id: string;
  name: string;
  category: PondCategory;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  currentRadius: number;
  targetRadius: number;
  squishX: number;
  squishY: number;
  color: string;
  glowColor: string;
  basePitchHz: number;
  energyLevel: number; // 0 to 100% (cargado por ráfagas o toques persistentes)
  eyeOffset: { x: number; y: number };
  isBlinking: boolean;
  shapeVariant: 'round' | 'star' | 'cloud' | 'jelly';
  inCanvas: boolean;
  createdAt: number;
}

export interface SensoryPondData {
  category: PondCategory;
  title: string;
  folderPath: string; // Metáfora de carpeta tangible: assets/characters, etc.
  primaryColor: string;
  glowColor: string;
  itemCount: number;
  iconType: 'creatures' | 'climates' | 'melodies';
  position: 'left' | 'top' | 'right';
}

export interface AcousticClimateState {
  rmsDb: number;
  spectralFlatness: number;
  isCalm: boolean;
  ambientMode: 'calm' | 'creative' | 'overload';
  isListening: boolean;
}

export interface OrientationState {
  tiltX: number; // Inclinación gamma (-90 a 90)
  tiltY: number; // Inclinación beta (-180 a 180)
  gravityX: number;
  gravityY: number;
  isSimulated: boolean;
}
