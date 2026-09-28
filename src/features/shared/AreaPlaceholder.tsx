import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type AreaPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function AreaPlaceholder({ title, description, actionLabel, onAction }: AreaPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  content: {
    flex: 1,
    padding: spacing[5],
    gap: spacing[3],
  },
  title: {
    ...typeScale.title,
    color: colors.content.primary,
  },
  description: {
    ...typeScale.section,
    color: colors.content.secondary,
  },
  action: {
    alignSelf: 'flex-start',
    minHeight: dimensions.action,
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: borders.width,
    borderColor: colors.interactive.accent,
    paddingHorizontal: spacing[4],
  },
  actionPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  actionText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
});
