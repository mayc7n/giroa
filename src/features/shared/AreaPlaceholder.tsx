import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typeScale } from '@/ui/tokens';

type AreaPlaceholderProps = {
  title: string;
  description: string;
};

export default function AreaPlaceholder({ title, description }: AreaPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
});
