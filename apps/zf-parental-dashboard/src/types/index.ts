export type {
  SkinnerSessionRecord,
  DecayCurvePoint,
  IslandTelemetryEvent,
  CameraMode,
  IslandActionType,
  GenerativeStyle,
  RedesignOption,
  DeviceLiveStatus,
  DemoAppName,
  DocumentItem,
  DocumentCategory,
  ChildProfile,
  GeminiLiveStatus,
  GeminiLiveMessage,
  CreativeCategory,
  CreativeCreationRecord,
} from '@zentry/shared';

export type DashboardTab = 'overview' | 'skinner' | 'island' | 'creative' | 'vault' | 'profile';

export type VaultCategory = 'all' | 'legal' | 'medical' | 'school' | 'identity';

export interface ChildProfileState {
  id: string;
  name: string;
  age: number;
  grade: string;
  school: string;
  avatarUrl: string;
  devicePaired: string;
  batteryPct: number;
  isOnline: boolean;
  activeApp: 'skinner' | 'island' | 'creative' | 'idle';
  circadianActive: boolean;
  dailyLimitMinutes: number;
  usedMinutesToday: number;
  sleepScheduleStart: string; // e.g. "21:30"
  sleepScheduleEnd: string;   // e.g. "07:00"
  emergencyContact: string;
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface TachometerReading {
  rpm: number;
  zone: 'calm' | 'warning' | 'alert';
  needleAngle: number;
  statusText: string;
}

export interface IslandAggregateStats {
  landscapeCount: number;
  touchExplainCount: number;
  sceneRedesignCount: number;
  totalInteractions: number;
  cameraMode: 'environment' | 'user' | 'dual_bereal';
  lastActiveAction?: string;
  lastTouchCoordinates?: { x: number; y: number };
  lastDetectedObject?: string;
  lastExplanation?: string;
  lastGenerativeStyle?: string;
  lastSnapshotUrl?: string;
  averageLatencyMs: number;
}
