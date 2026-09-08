/**
 * Zentry DNA Design Tokens & Liquid Glass Physics Constants
 * Canonical color palette, spring curves, and glassmorphism styling for Zentry Commercial Demo Suite.
 */

// ============================================================================
// 1. CANONICAL ZENTRY COLOR PALETTE (Light & Dark Variations)
// ============================================================================

export type ZentryTheme = 'light' | 'dark';

export const ZENTRY_COLORS = {
  /** Púrpura Imperial - Primary brand anchor */
  purpura: '#533B87',
  /** Lavanda Eléctrica - High-contrast text accent and secondary highlights */
  lavanda: '#D6C8FA',
  /** Menta Neón - AI active states, real-time sync indicators, success signals */
  menta: '#C2F4E7',
  /** Glacial Puro - Subtle light background, crisp card surfaces, high speculars */
  glacial: '#EBF1F5',
  /** Pizarra / Slate - Structural borders, secondary text, muted metadata */
  slate: '#4A5160',
  /** Oscuro Profundo / Obsidian Dark - Liquid Glass background foundation */
  dark: '#080D1A',

  // Light Theme Specific Bases
  lightBg: '#FBFCFD',
  lightSurface: '#FFFFFF',
  lightSurfaceSubtle: '#F4F7FA',
  lightTextPrimary: '#242730',
  lightTextSecondary: '#4A5160',
  lightTextMuted: '#6A717E',
  lightBorder: 'rgba(214, 200, 250, 0.55)',

  // Functional & Semantic Accents
  amberJackpot: '#FBBF24',
  coralAlert: '#F87171',
  cyanStream: '#38BDF8',
  emeraldOnline: '#34D399',
} as const;

export type ZentryColorName = keyof typeof ZENTRY_COLORS;

// ============================================================================
// 2. ALPHA COLOR VARIANTS (RGBA for Glassmorphism & Layers)
// ============================================================================

export const ZENTRY_ALPHA = {
  // Dark Foundation Overlays
  dark95: 'rgba(8, 13, 26, 0.95)',
  dark85: 'rgba(8, 13, 26, 0.85)',
  dark75: 'rgba(8, 13, 26, 0.75)',
  dark60: 'rgba(8, 13, 26, 0.60)',
  dark40: 'rgba(8, 13, 26, 0.40)',
  dark20: 'rgba(8, 13, 26, 0.20)',

  // Purpura Overlays & Glows
  purpura90: 'rgba(83, 59, 135, 0.90)',
  purpura60: 'rgba(83, 59, 135, 0.60)',
  purpura30: 'rgba(83, 59, 135, 0.30)',
  purpura15: 'rgba(83, 59, 135, 0.15)',
  purpura08: 'rgba(83, 59, 135, 0.08)',

  // Lavanda Highlights & Speculars
  lavanda80: 'rgba(214, 200, 250, 0.80)',
  lavanda50: 'rgba(214, 200, 250, 0.50)',
  lavanda25: 'rgba(214, 200, 250, 0.25)',
  lavanda12: 'rgba(214, 200, 250, 0.12)',
  lavanda05: 'rgba(214, 200, 250, 0.05)',

  // Menta Indicators
  menta80: 'rgba(194, 244, 231, 0.80)',
  menta40: 'rgba(194, 244, 231, 0.40)',
  menta20: 'rgba(194, 244, 231, 0.20)',
  menta10: 'rgba(194, 244, 231, 0.10)',

  // Glacial Glass Accents
  glacial80: 'rgba(235, 241, 245, 0.80)',
  glacial40: 'rgba(235, 241, 245, 0.40)',
  glacial20: 'rgba(235, 241, 245, 0.20)',
  glacial08: 'rgba(235, 241, 245, 0.08)',

  // Specular Border Highlighting
  specularLight: 'rgba(255, 255, 255, 0.25)',
  specularSubtle: 'rgba(255, 255, 255, 0.12)',
} as const;

// ============================================================================
// 3. SPRING PHYSICS & ANIMATION CURVES
// ============================================================================

export interface SpringConfig {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
  restDelta?: number;
}

export const SPRING_PRESETS = {
  /** Dynamic Island Expansion / Collapse with fluid elastic snap */
  islandBounce: {
    type: 'spring',
    stiffness: 420,
    damping: 26,
    mass: 0.8,
    restDelta: 0.001,
  } as SpringConfig,

  /** Snappy button taps, camera switcher mode changes, corner tools */
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.5,
    restDelta: 0.001,
  } as SpringConfig,

  /** Gentle fluid transitions, metric gauge movements, volume waves */
  fluid: {
    type: 'spring',
    stiffness: 240,
    damping: 22,
    mass: 1.0,
    restDelta: 0.001,
  } as SpringConfig,

  /** Operant conditioning dopamine reward bounce (Skinner lever pull) */
  leverBounce: {
    type: 'spring',
    stiffness: 380,
    damping: 18,
    mass: 0.85,
    restDelta: 0.001,
  } as SpringConfig,

  /** Soft modal popup / card reveal */
  softModal: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 0.9,
    restDelta: 0.001,
  } as SpringConfig,
} as const;

export const CSS_BEZIERS = {
  /** Elastic snap bounce */
  springElastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Super-smooth decelerate curve */
  smoothDecel: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Standard liquid glass ease */
  liquidEase: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  /** High-speed exit */
  fastExit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ============================================================================
// 4. LIQUID GLASSMORPHISM PRESETS & OPTICS
// ============================================================================

export interface GlassmorphismStyle {
  backdropFilter: string;
  WebkitBackdropFilter: string;
  backgroundColor: string;
  border: string;
  boxShadow: string;
}

export const LIQUID_GLASS_PRESETS: Record<string, GlassmorphismStyle> = {
  /** Primary Liquid Glass Container (Dynamic Island & Main Hubs) */
  primaryDark: {
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    backgroundColor: 'rgba(8, 13, 26, 0.72)',
    border: '1px solid rgba(214, 200, 250, 0.16)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },

  /** High-Isolation Glass (Camera expanded view & Modal Sheets) */
  highIsolation: {
    backdropFilter: 'blur(36px) saturate(200%)',
    WebkitBackdropFilter: 'blur(36px) saturate(200%)',
    backgroundColor: 'rgba(8, 13, 26, 0.88)',
    border: '1px solid rgba(214, 200, 250, 0.24)',
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.70), inset 0 1px 1px rgba(255, 255, 255, 0.22)',
  },

  /** Floating Pills & Real-Time Status Badges */
  floatingPill: {
    backdropFilter: 'blur(20px) saturate(170%)',
    WebkitBackdropFilter: 'blur(20px) saturate(170%)',
    backgroundColor: 'rgba(83, 59, 135, 0.35)',
    border: '1px solid rgba(194, 244, 231, 0.30)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  },

  /** Dashboard Card Glass (Parental Observador) */
  dashboardCard: {
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    backgroundColor: 'rgba(8, 13, 26, 0.65)',
    border: '1px solid rgba(214, 200, 250, 0.12)',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
  },

  /** Light / Glacial Surface Glass */
  glacialSurface: {
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    backgroundColor: 'rgba(235, 241, 245, 0.80)',
    border: '1px solid rgba(83, 59, 135, 0.14)',
    boxShadow: '0 10px 30px rgba(8, 13, 26, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  },

  /** Interactive Glass Button (Corner tools, camera switcher buttons) */
  interactiveButton: {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(214, 200, 250, 0.10)',
    border: '1px solid rgba(214, 200, 250, 0.20)',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
};

// ============================================================================
// 5. GLOWS & AMBIENT ILLUMINATION
// ============================================================================

export const ZENTRY_GLOWS = {
  purpuraGlow: '0 0 30px rgba(83, 59, 135, 0.55)',
  lavandaGlow: '0 0 25px rgba(214, 200, 250, 0.45)',
  mentaGlow: '0 0 25px rgba(194, 244, 231, 0.50)',
  amberJackpotGlow: '0 0 35px rgba(251, 191, 36, 0.65)',
  aiVoicePulseGlow: '0 0 40px rgba(194, 244, 231, 0.70), 0 0 80px rgba(83, 59, 135, 0.40)',
} as const;

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a hex color string to rgba with given alpha opacity.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Returns dynamic liquid glass style with customizable opacity and blur.
 */
export function createCustomLiquidGlass(
  bgRgba: string = ZENTRY_ALPHA.dark75,
  borderRgba: string = ZENTRY_ALPHA.lavanda12,
  blurPx: number = 28
): GlassmorphismStyle {
  return {
    backdropFilter: `blur(${blurPx}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blurPx}px) saturate(180%)`,
    backgroundColor: bgRgba,
    border: `1px solid ${borderRgba}`,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  };
}
