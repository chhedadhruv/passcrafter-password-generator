import { Platform } from 'react-native';

// Same palette as the website (app/globals.css) so the products feel like one family.
export const Colors = {
  light: {
    bg: '#f5f8f7',
    surface: '#ffffff',
    surfaceMuted: '#e7f1ef',
    border: '#dde7e5',
    text: '#142423',
    textSecondary: '#556866',
    primary: '#0f766e',
    primaryText: '#0f766e',
    onPrimary: '#ffffff',
    danger: '#c82626',
    success: '#15803d',
    warning: '#b45309',
  },
  dark: {
    bg: '#0b1212',
    surface: '#141e1e',
    surfaceMuted: '#1c2a29',
    border: '#283836',
    text: '#e8f0ef',
    textSecondary: '#9cafac',
    primary: '#2dd4bf',
    primaryText: '#5eead4',
    onPrimary: '#04201d',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radius = { sm: 10, md: 14, card: 16, pill: 999 } as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', mono: 'ui-monospace' },
  default: { sans: 'sans-serif', mono: 'monospace' },
})!;
