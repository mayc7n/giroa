import { colors, radii, shadows, spacing, typeScale } from '@/ui/tokens';

describe('Giroa UI tokens', () => {
  it('exposes the approved semantic dark palette', () => {
    expect(colors.background.canvas).toBe('#0B1412');
    expect(colors.background.surface).toBe('#12201C');
    expect(colors.content.primary).toBe('#F4F7EF');
    expect(colors.interactive.accent).toBe('#C7F36B');
    expect(colors.status.pending).toBe('#F1C46B');
    expect(colors.status.negative).toBe('#FF8B87');
  });

  it('exposes the approved spacing, radius and type scales', () => {
    expect(spacing).toMatchObject({ 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 });
    expect(radii).toMatchObject({ sm: 8, md: 12, lg: 16, xl: 20, pill: 999 });
    expect(typeScale.display).toMatchObject({ fontSize: 32, lineHeight: 38, fontWeight: '700' });
    expect(typeScale.body).toMatchObject({ fontSize: 15, lineHeight: 22, fontWeight: '400' });
    expect(typeScale.money).toMatchObject({ fontSize: 28, lineHeight: 32, fontWeight: '700' });
  });

  it('exposes the shared elevated-surface shadow', () => {
    expect(shadows.elevated).toMatchObject({
      shadowColor: '#000000',
      shadowOpacity: 0.24,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    });
  });
});
