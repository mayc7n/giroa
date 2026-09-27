import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

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
    backgroundColor: '#F7F5F0',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    color: '#0B776D',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    color: '#17211F',
    fontSize: 34,
    fontWeight: '800',
  },
  introduction: {
    color: '#4A5753',
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 440,
  },
  emptyState: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#E7F2EF',
    gap: 8,
  },
  emptyTitle: {
    color: '#173C35',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDescription: {
    color: '#34564F',
    fontSize: 16,
    lineHeight: 23,
  },
});
