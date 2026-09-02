export const colors = {
  bg: '#1A1033',
  bgGradient: ['#2D1B69', '#8E2DE2', '#FF5DA2'] as const,
  card: '#FFFFFF',
  cardAlt: '#F4F0FF',
  text: '#1A1033',
  textMuted: '#6B6483',
  textOnDark: '#FFFFFF',
  primary: '#8E2DE2',
  primaryAlt: '#FF5DA2',
  success: '#00D9A3',
  danger: '#FF4D6D',
  warning: '#FFC93C',
  gold: '#FFC93C',
  border: '#E8E2FF',
};

export const gradients = {
  hero: ['#FF5DA2', '#8E2DE2', '#2D1B69'] as const,
  success: ['#00D9A3', '#00B4D8'] as const,
  danger: ['#FF4D6D', '#FF8A5B'] as const,
  gold: ['#FFC93C', '#FF9F1C'] as const,
  card: ['#8E2DE2', '#FF5DA2'] as const,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = (n: number) => n * 8;
