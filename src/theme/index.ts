/**
 * Forge design system.
 * Dark, athletic, premium — inspired by modern fitness apps (BetterMe / Whoop / Gymshark).
 */

export const colors = {
  // Backgrounds
  bg: '#0B0B0F',
  bgElevated: '#121218',
  surface: '#16161D',
  surfaceAlt: '#1E1E27',
  card: '#1A1A22',

  // Brand
  primary: '#D7FF3E', // electric lime
  primaryDim: '#A9CC2E',
  primaryText: '#0B0B0F', // text on primary buttons

  // Accents for gradients / categories
  accent: '#7B6CFF', // violet
  accent2: '#FF6B6B', // coral
  accent3: '#3EC5FF', // sky
  accent4: '#FFB13E', // amber

  // Text
  text: '#FFFFFF',
  textMuted: '#9A9AA8',
  textFaint: '#5C5C68',

  // Utility
  border: '#26262F',
  borderStrong: '#33333F',
  success: '#4ADE80',
  danger: '#FF5A5A',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const gradients = {
  primary: ['#E4FF66', '#B6F03A'] as const,
  violet: ['#8E7BFF', '#5B47E0'] as const,
  coral: ['#FF8A8A', '#FF5252'] as const,
  sky: ['#5CD2FF', '#2E9BE0'] as const,
  amber: ['#FFC65C', '#FF9F2E'] as const,
  dark: ['#1E1E27', '#121218'] as const,
  hero: ['#1A1A22', '#0B0B0F'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  bodyMuted: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '600' as const },
  tiny: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const theme = { colors, gradients, spacing, radius, typography, shadow };
export type Theme = typeof theme;
