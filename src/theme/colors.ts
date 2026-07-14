export const COLORS = {
  primary: '#E5752F',
  secondary: '#FFFFFF',
  background: '#F9F9F9',
  textDark: '#1E1E1E',
  textLight: '#666666',
  // Backwards-compatible aliases used across the codebase
  text: '#1E1E1E',
  accent: '#FFE8D6',
  cardShadow: 'rgba(0,0,0,0.1)',
  shadow: 'rgba(0,0,0,0.1)',
};

// Font Family Constants
export const FONT_FAMILY = {
  regular: 'Figtree-VariableFont_wght',
  italic: 'Figtree-Italic-VariableFont_wght',
};

// Font Weight Constants - using proper RN types
export const FONT_WEIGHT = {
  normal: '400' as const,
  medium: '500' as const, 
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '900' as const,
} as const;

// Font Styles with proper typing
export const FONT_STYLES = {
  // Regular styles
  largeTitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 32,
    fontWeight: '700' as any,
    lineHeight: 40,
  },
  title1: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 28,
    fontWeight: '700' as any,
    lineHeight: 36,
  },
  title2: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 24,
    fontWeight: '600' as any,
    lineHeight: 32,
  },
  title3: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 20,
    fontWeight: '600' as any,
    lineHeight: 28,
  },
  headline: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 18,
    fontWeight: '600' as any,
    lineHeight: 24,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    fontWeight: '400' as any,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    fontWeight: '500' as any,
    lineHeight: 24,
  },
  bodySemibold: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    fontWeight: '600' as any,
    lineHeight: 24,
  },
  callout: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    fontWeight: '400' as any,
    lineHeight: 20,
  },
  calloutMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    fontWeight: '500' as any,
    lineHeight: 20,
  },
  calloutSemibold: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    fontWeight: '600' as any,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    fontWeight: '400' as any,
    lineHeight: 16,
  },
  captionMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    fontWeight: '500' as any,
    lineHeight: 16,
  },
  captionSemibold: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    fontWeight: '600' as any,
    lineHeight: 16,
  },
  // Italic styles
  bodyItalic: {
    fontFamily: FONT_FAMILY.italic,
    fontSize: 16,
    fontWeight: '400' as any,
    lineHeight: 24,
  },
  captionItalic: {
    fontFamily: FONT_FAMILY.italic,
    fontSize: 12,
    fontWeight: '400' as any,
    lineHeight: 16,
  },
};
