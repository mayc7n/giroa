import { StyleSheet, Text, View } from 'react-native';

import { colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type GiroaLogoProps = {
  showWordmark?: boolean;
};

export default function GiroaLogo({ showWordmark = true }: GiroaLogoProps) {
  return (
    <View accessible accessibilityLabel="Giroa" accessibilityRole="image" style={styles.logo}>
      <View style={styles.mark}>
        <View style={styles.loop} />
        <View style={styles.gBar} />
      </View>
      {showWordmark ? <Text style={styles.wordmark}>giroa</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    minHeight: dimensions.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  mark: {
    width: dimensions.logoMark,
    height: dimensions.logoMark,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.interactive.accent,
  },
  loop: {
    width: dimensions.logoInner,
    height: dimensions.logoInner,
    borderWidth: dimensions.logoStroke,
    borderColor: colors.background.canvas,
    borderRightColor: colors.interactive.accent,
    borderRadius: radii.pill,
    transform: [{ rotate: '-28deg' }],
  },
  gBar: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[3],
    width: dimensions.logoBar,
    height: dimensions.logoStroke,
    borderRadius: radii.pill,
    backgroundColor: colors.background.canvas,
  },
  wordmark: {
    ...typeScale.section,
    color: colors.content.primary,
  },
});
