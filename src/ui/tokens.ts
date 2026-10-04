export const colors = {
  ink: {
    950: '#0B1412',
    900: '#12201C',
    800: '#192C26',
    700: '#1E3A31',
    600: '#294239',
  },
  lime: {
    500: '#C7F36B',
    400: '#A9D858',
  },
  neutral: {
    50: '#F4F7EF',
    300: '#AAB8B0',
    500: '#73867C',
  },
  amber: {
    400: '#F1C46B',
  },
  red: {
    400: '#FF8B87',
  },
  background: {
    canvas: '#0B1412',
    surface: '#12201C',
    elevated: '#192C26',
    pressed: '#1E3A31',
  },
  border: {
    default: '#294239',
  },
  content: {
    primary: '#F4F7EF',
    secondary: '#AAB8B0',
    muted: '#73867C',
  },
  interactive: {
    accent: '#C7F36B',
    accentPressed: '#A9D858',
  },
  status: {
    pending: '#F1C46B',
    negative: '#FF8B87',
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const dimensions = {
  touchTarget: 44,
  action: 52,
  row: 56,
  input: 52,
  logoMark: 36,
  logoInner: 20,
  logoStroke: 3,
  logoBar: 10,
} as const;

export const typeScale = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  section: { fontSize: 17, lineHeight: 23, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  money: { fontSize: 28, lineHeight: 32, fontWeight: '700' as const },
} as const;

export const borders = {
  width: 1,
  color: colors.border.default,
} as const;

export const shadows = {
  elevated: {
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
