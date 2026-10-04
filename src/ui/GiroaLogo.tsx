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
        <View style={styles.arrow} />
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
  arrow: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[3],
    width: dimensions.logoArrow,
    height: dimensions.logoArrow,
    borderRightWidth: dimensions.logoStroke,
    borderBottomWidth: dimensions.logoStroke,
    borderRightColor: colors.background.canvas,
    borderBottomColor: colors.background.canvas,
    transform: [{ rotate: '-45deg' }],
  },
  wordmark: {
    ...typeScale.section,
    color: colors.content.primary,
  },
});
