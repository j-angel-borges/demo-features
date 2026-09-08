/**
 * Core Interface Contracts and TypeScript Definitions for Zentry Commercial Demo Suite.
 * Establishes strict data schemas across the 3 micro-PWAs and Firestore in GCP quarz-group.
 */

export * from './types/skinner.js';

// ============================================================================
// 1. FIRESTORE COLLECTION: sessions_skinner
// ============================================================================

export interface DecayCurvePoint {
  scrollIndex: number;
  nominalDurationSeconds: number;
  actualViewSeconds: number;
  retentionPct: number;
  isJackpot: boolean;
  timestamp: number;
}

export interface SkinnerSessionRecord {
  sessionId: string;
  userId: string;
  targetProfile: 'child' | 'adult';
  status: 'active' | 'completed';
  startTime: number;
  endTime?: number;
  totalScrolls: number;
  totalDurationSeconds: number;
  averageRetentionPct: number;
  completedItemsCount: number;
  currentScrollVelocity: number; // scrolls per minute (RPM)
  activeContentId: string;
  activeNominalDuration: number;
  activeElapsedSeconds: number;
  activeRetentionPct: number;
  decayCurveData: DecayCurvePoint[];
  topicDistribution: Record<string, number>;
  lastUpdated: number;
}

// ============================================================================
// 2. FIRESTORE COLLECTION: island_telemetry
// ============================================================================

export type CameraMode = 'environment' | 'user' | 'dual_bereal';

export type IslandActionType =
  | 'landscape'
  | 'touch_explain'
  | 'scene_redesign'
  | 'agentic_copilot'
  | 'circadian_phase_change'
  | 'theme_toggle'
  | 'art_break_suggested'
  | 'biological_query';

export type GenerativeStyle = 'enhanced' | 'comic' | 'pixel_art' | 'videogame' | 'spatial';

export interface RedesignOption {
  title: string;
  description: string;
  style: string;
}

export interface IslandTelemetryEvent {
  eventId: string;
  deviceId: string;
  timestamp: number;
  cameraMode: CameraMode;
  activeAction?: IslandActionType;
  touchCoordinates?: { x: number; y: number };
  aiPrompt?: string;
  aiResponse?: string;
  generativeStyle?: GenerativeStyle;
  redesignOptions?: RedesignOption[];
  frameSnapshotUrl?: string; // base64 or storage url
  circadianPhase?: string;
  circadianHour?: number;
  actionPayload?: Record<string, any>;
}

// ============================================================================
// 3. FIRESTORE COLLECTION: devices_live
// ============================================================================

export type DemoAppName = 'isla-dinamica' | 'skinner-box' | 'parent-dashboard' | 'creative-studio';

export interface DeviceLiveStatus {
  deviceId: string;
  appName: DemoAppName;
  isOnline: boolean;
  lastHeartbeat: number;
  activeSessionId?: string;
}

// ============================================================================
// 4. FIRESTORE COLLECTION: documents (Parental Vault)
// ============================================================================

export type DocumentCategory = 'salud' | 'identidad' | 'educacion' | 'legal';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  sizeBytes: number;
  uploadDate: number;
  status: 'verified' | 'pending' | 'archived';
  tags: string[];
  summary?: string;
}

// ============================================================================
// 5. DOMAIN MODELS & EXTENDED TYPES
// ============================================================================

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl?: string;
  grade?: string;
  emergencyContact?: string;
  riskLevel: 'low' | 'moderate' | 'high';
  dailyLimitMinutes: number;
  activeRestrictions?: string[];
  enrolledSince?: string;
}

export type SkinnerVisualType =
  | 'procedural_math'
  | 'physics_sim'
  | 'space_exploration'
  | 'dopamine_loop'
  | 'micro_fact'
  | 'satisfying_render';

export interface SkinnerContentItem {
  id: string;
  title: string;
  category: string;
  targetAudience: 'child' | 'adult';
  nominalDurationSeconds: number;
  isJackpot: boolean;
  narrativeHook: string;
  contentTheme: string;
  visualType: SkinnerVisualType;
  videoSrc?: string;
  gradientColors?: [string, string];
}

export type GeminiLiveStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface GeminiLiveMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  latencyMs?: number;
}

// ============================================================================
// 6. SKINNER COMMAND BUS (Parent Dashboard -> Skinner Box Master Control)
// ============================================================================

export type SkinnerCommandType = 'START_SESSION' | 'END_SESSION' | 'RESET_SESSION';

export interface SkinnerCommandEvent {
  commandId?: string;
  type: SkinnerCommandType;
  sessionId?: string;
  targetProfile?: 'child' | 'adult';
  timestamp: number;
  payload?: Record<string, any>;
}

export type SkinnerCommandMessage = SkinnerCommandEvent;

// ============================================================================
// 7. FIRESTORE COLLECTION: creative_creations (Z-Art Creative WOW Studio)
// ============================================================================

export type CreativeCategory = 'character' | 'landscape' | 'object';

export interface DoodleAnalysis {
  title: string;
  category: CreativeCategory;
  detectedSubject: string;
  primaryColors: string[];
  spatialLayout: string;
  enhancedPrompt: string;
  childQuestion: string;
  speechFeedback: string;
}

export interface InteractiveAvatarData {
  id: string;
  name: string;
  avatarType: 'superhero' | 'animal' | 'robot' | 'magical_creature';
  primaryColor: string;
  secondaryColor: string;
  voiceStyle: 'playful' | 'heroic' | 'gentle';
  personality: string;
  mission: string;
  speechScript: string[];
  headFeature: 'ears' | 'horns' | 'crown' | 'hat' | 'visor';
  bodyStyle: 'cape' | 'armor' | 'fluffy' | 'mechanic';
}

export interface WorldProp {
  id: string;
  name: string;
  type: 'tree' | 'crystal' | 'cloud' | 'creature' | 'flower' | 'building' | 'star';
  x: number;
  y: number;
  z: number;
  scale: number;
  color: string;
}

export interface InteractiveWorldData {
  id: string;
  worldName: string;
  biome: 'space' | 'enchanted_forest' | 'ocean' | 'candy_kingdom' | 'sky_islands' | 'volcano';
  dayNightCycle: 'day' | 'sunset' | 'night';
  weather: 'clear' | 'stars' | 'bubbles' | 'petals';
  groundColor: string;
  skyColors: [string, string];
  props: WorldProp[];
  lore: string;
}

export interface ToyButtonControl {
  id: string;
  label: string;
  icon: string;
  soundFx: 'sparkle' | 'starburst' | 'victory' | 'brush' | 'tap' | 'laser';
  color: string;
  actionType: 'spin' | 'bounce' | 'glow' | 'pulse' | 'launch';
}

export interface InteractiveToyData {
  id: string;
  toyName: string;
  mechanic: 'sound_buttons' | 'spring_popper' | 'gear_spinner' | 'energy_beam';
  primaryColor: string;
  accentColor: string;
  powerLevel: number;
  controls: ToyButtonControl[];
  soundTrackName: string;
}

export interface CreativeCreationRecord {
  id: string;
  deviceId: string;
  childId: string;
  createdAt: number;
  category: CreativeCategory;
  title: string;
  originalDrawingBase64: string;
  generatedImageUrl: string;
  coloringBookImageUrl?: string;
  analysis: DoodleAnalysis;
  miniAppType: 'avatar' | 'world' | 'toy';
  miniAppData: InteractiveAvatarData | InteractiveWorldData | InteractiveToyData;
  syncedToFirestore: boolean;
}

// ============================================================================
// 6. FIRESTORE COLLECTION: sessions_vibe (Vibe Coding Pediátrico 2-5 años)
// ============================================================================

export interface VibeAcousticClimateData {
  rmsDb: number;
  spectralFlatness: number;
  isCalm: boolean;
  sampleCount: number;
  lastUpdated: number;
}

export interface VibeSessionRecord {
  sessionId: string;
  childId: string;
  appName: 'vibe-coding';
  targetCohort: '2-5';
  deviceType: 'tablet' | 'smartphone';
  status: 'active' | 'completed';
  startTime: number;
  endTime?: number;
  lastUpdated: number;
  totalEntitiesCreated: number;
  rapidTapBurstCount: number;
  multiPointerCount: number;
  palmContactCount: number;
  acousticClimate: VibeAcousticClimateData;
  explorationScore: number; // 0-100%
  activeFolderCategories: string[];
}

