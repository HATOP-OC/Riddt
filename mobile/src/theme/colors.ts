// Color palette based on web app theme.json and tailwind.config.ts
export const colors = {
  // Brand colors
  primary: '#6C5CE7',           // Main brand color (purple) - hsl(252, 79%, 57%)
  primaryForeground: '#FFFFFF',
  
  // Light mode colors
  background: '#FFFFFF',
  foreground: '#1F2937',
  card: '#FFFFFF',
  cardForeground: '#1F2937',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  border: '#E5E7EB',
  input: '#E5E7EB',
  ring: '#1F2937',
  
  // Dark mode colors
  backgroundDark: '#0F172A',
  foregroundDark: '#F9FAFB',
  cardDark: '#1E293B',
  cardForegroundDark: '#F9FAFB',
  mutedDark: '#334155',
  mutedForegroundDark: '#94A3B8',
  borderDark: '#334155',
  inputDark: '#334155',
  ringDark: '#CBD5E1',
  
  // Semantic colors
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  
  // Vote colors (from web app)
  upvote: '#FF4500',            // Orange-red for upvotes
  downvote: '#7193FF',          // Blue for downvotes
  
  // Accent colors
  teal: {
    light: '#99F6E4',
    DEFAULT: '#14B8A6',
    dark: '#134E4A',
  },
  blue: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E3A8A',
  },
  
  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Theme object for light and dark modes
export const lightTheme = {
  colors: {
    primary: colors.primary,
    primaryForeground: colors.primaryForeground,
    background: colors.background,
    foreground: colors.foreground,
    card: colors.card,
    cardForeground: colors.cardForeground,
    muted: colors.muted,
    mutedForeground: colors.mutedForeground,
    border: colors.border,
    input: colors.input,
    ring: colors.ring,
    destructive: colors.destructive,
    destructiveForeground: colors.destructiveForeground,
    upvote: colors.upvote,
    downvote: colors.downvote,
  },
};

export const darkTheme = {
  colors: {
    primary: colors.primary,
    primaryForeground: colors.primaryForeground,
    background: colors.backgroundDark,
    foreground: colors.foregroundDark,
    card: colors.cardDark,
    cardForeground: colors.cardForegroundDark,
    muted: colors.mutedDark,
    mutedForeground: colors.mutedForegroundDark,
    border: colors.borderDark,
    input: colors.inputDark,
    ring: colors.ringDark,
    destructive: colors.destructive,
    destructiveForeground: colors.destructiveForeground,
    upvote: colors.upvote,
    downvote: colors.downvote,
  },
};

export type Theme = typeof lightTheme;
