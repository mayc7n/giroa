import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackupActions from '@/features/backup/BackupActions';
import { colors, spacing, typeScale } from '@/ui/tokens';

export default function DataScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Giroa</Text>
        <Text style={styles.title}>Dados</Text>
        <Text style={styles.description}>
          Proteja os registros deste aparelho ou restaure uma cópia anterior.
        </Text>
        <BackupActions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.canvas },
  content: { flexGrow: 1, gap: spacing[3], padding: spacing[5] },
  eyebrow: { ...typeScale.caption, color: colors.interactive.accent },
  title: { ...typeScale.display, color: colors.content.primary },
  description: { ...typeScale.section, color: colors.content.secondary, maxWidth: 440 },
});
