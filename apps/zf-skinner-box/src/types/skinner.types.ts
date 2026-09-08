import type { SkinnerSessionRecord, DecayCurvePoint } from '@zentry/shared';

export type CatalogMode = 'child' | 'adult';
export type SessionStatus = 'idle' | 'active' | 'completed';
export type DopamineState = 'baseline' | 'accelerated' | 'hyper_fragmented' | 'jackpot';

export type CanvasAnimationType =
  | 'galaxy'
  | 'cellular'
  | 'slime_kinetic'
  | 'fractal_neon'
  | 'audio_wave'
  | 'matrix_terminal'
  | 'tokamak_plasma'
  | 'rayleigh_prism'
  | 'popit_bubble'
  | 'pixel_glitch'
  | 'minecraft_runner';

export interface VideoComment {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  likes: number;
  timeAgo: string;
}

export interface SkinnerVideoItem {
  id: string;
  mode: CatalogMode;
  stage?: 1 | 2 | 3 | 'jackpot' | number;
  title: string;
  topic: string;
  category: 'educational' | 'trivia' | 'fast_paced' | 'hyper_fragmented' | 'jackpot';
  nominalDurationSeconds: number;
  dopamineScore: number; // 0 - 100
  cognitiveLoad: number; // 0 - 100
  description: string;
  narrativeHook: string;
  thumbnailGradient: [string, string];
  canvasAnimationType?: CanvasAnimationType;
  accentColor: string;
  soundtrackTempoBpm: number;
  isJackpot?: boolean;
  posterUrl?: string;
  // TikTok-Style Engagement & Social Metadata
  creatorHandle?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  isVerifiedCreator?: boolean;
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  sharesCount?: number;
  soundTitle?: string;
  videoUrl?: string;
  hashtags?: string[];
  comments?: VideoComment[];
}

export interface SkinnerMetrics {
  totalScrolls: number;
  completedItemsCount: number;
  averageRetentionPct: number;
  currentScrollVelocity: number; // RPM (scrolls per minute)
  totalDurationSeconds: number;
  activeNominalDuration: number;
  activeElapsedSeconds: number;
  activeRetentionPct: number;
  dopamineState: DopamineState;
}

export { SkinnerSessionRecord, DecayCurvePoint };
