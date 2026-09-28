import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { colors, radii, spacing, typeScale } from '@/ui/tokens';

type TodayScreenProps = {
  footer?: ReactNode;
};

export default function TodayScreen({ footer }: TodayScreenProps = {}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Giroa</Text>
        <Text style={styles.title}>Hoje</Text>
        <Text style={styles.introduction}>
          Acompanhe o que precisa da sua atenção no trabalho.
        </Text>

        <View style={styles.emptyState} accessibilityRole="summary">
          <Text style={styles.emptyTitle}>Nada pendente por enquanto.</Text>
          <Text style={styles.emptyDescription}>
            Cadastre um cliente ou registre um serviço para começar.
          </Text>
        </View>
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  content: {
    flexGrow: 1,
    padding: spacing[5],
    gap: spacing[3],
  },
  eyebrow: {
    ...typeScale.caption,
    color: colors.interactive.accent,
    letterSpacing: spacing[1] / 10,
  },
  title: {
    ...typeScale.display,
    color: colors.content.primary,
  },
  introduction: {
    ...typeScale.section,
    color: colors.content.secondary,
    maxWidth: 440,
  },
  emptyState: {
    marginTop: spacing[5],
    padding: spacing[5],
    borderRadius: radii.lg,
    backgroundColor: colors.background.surface,
    gap: spacing[2],
  },
  emptyTitle: {
    ...typeScale.section,
    color: colors.content.primary,
  },
  emptyDescription: {
    ...typeScale.body,
    color: colors.content.secondary,
  },
});
