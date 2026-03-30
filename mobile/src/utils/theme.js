/**
 * Cogniscan Design System — "Stable Med-Tech" Professional Overhaul
 * - Colors: Navy blue, light grey background, teal accents.
 * - Shapes: Shorter border radii (sharper edges).
 * - Typography: Clean, high readability.
 */

export const COLORS = {
  // Brand Colors — Inspired by reference image
  primary: '#003B95',      // Deep Navy Blue (Cogniscan Brand)
  primaryGlow: '#003B951A', // 10% Opacity Blue
  accent: '#006B6B',       // Professional Teal (Progress/Actions)
  accentGlow: '#006B6B15', // 8% Opacity Teal

  // Neutral Colors
  background: '#F8FAFC',   // Clean Off-White/Grey
  backgroundCard: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  surfaceLight: '#F1F5F9', // Light Slate for nested boxes

  // Text Colors
  textPrimary: '#0F172A',  // Deep Navy for text
  textSecondary: '#475569', // Slate Grey (Slate 600)
  textMuted: '#94A3B8',    // Light Slate (Slate 400)
  textOnPrimary: '#FFFFFF',

  // Status Colors
  success: '#10B981',      // Emerald 500
  warning: '#F59E0B',      // Amber 500
  error: '#EF4444',        // Red 500
  info: '#3B82F6',         // Blue 500

  // Risk Scale
  riskLow: '#10B981',
  riskModerate: '#F59E0B',
  riskHigh: '#EF4444',

  // Boarders/Dividers
  border: '#E2E8F0',       // Slate 200
  divider: '#F1F5F9',      // Slate 100
  white: '#FFFFFF',
  black: '#000000',
};

export const RADIUS = {
  xs: 2,
  sm: 4,                   // Sharper edges
  md: 6,
  lg: 10,
  xl: 16,
  round: 4,                // Sharp but subtly rounded
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  sizeHero: 32,
  sizeXXL: 28,
  sizeXL: 24,
  sizeLG: 20,
  sizeMD: 16,
  sizeSM: 14,
  sizeXS: 12,

  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// add this line
console.log("test change");