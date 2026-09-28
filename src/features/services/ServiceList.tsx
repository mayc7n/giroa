import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';
import type { ServiceRecord } from '@/data/sqliteTypes';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type ServiceListProps = {
  services: { service: ServiceRecord; clientName: string }[];
  onSelect: (service: ServiceRecord) => void;
  onCreateQuote: () => void;
};

const workStatusLabels: Record<ServiceRecord['workStatus'], string> = {
  planned: 'Planejado',
  inProgress: 'Em execução',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function ServiceList({ services, onSelect, onCreateQuote }: ServiceListProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Serviços</Text>
          <Text style={styles.description}>Serviços salvos e seus valores históricos.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onCreateQuote} style={styles.button}>
          <Text style={styles.buttonText}>Novo orçamento</Text>
        </Pressable>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum serviço cadastrado.</Text>
          <Text style={styles.emptyDescription}>Aprove um orçamento para criar o primeiro serviço.</Text>
        </View>
      ) : services.map(({ service, clientName }) => (
        <Pressable
          key={service.id}
          accessibilityRole="button"
          onPress={() => onSelect(service)}
          style={styles.row}
        >
          <Text style={styles.rowTitle}>{service.description}</Text>
          <Text style={styles.rowDescription}>{clientName}</Text>
          <Text style={styles.rowDescription}>{workStatusLabels[service.workStatus]}</Text>
          <Text style={styles.total}>Total {formatCentsToBRL(service.totalCents)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing[4], padding: spacing[5], backgroundColor: colors.background.canvas },
  header: { gap: spacing[4] },
  heading: { gap: spacing[2] },
  title: { ...typeScale.title, color: colors.content.primary },
  description: { ...typeScale.body, color: colors.content.secondary },
  button: { alignSelf: 'flex-start', minHeight: dimensions.action, justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  emptyState: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.surface },
  emptyTitle: { ...typeScale.section, color: colors.content.primary },
  emptyDescription: { ...typeScale.body, color: colors.content.secondary },
  row: { gap: spacing[1], minHeight: dimensions.row, paddingVertical: spacing[4], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  rowTitle: { ...typeScale.section, color: colors.content.primary },
  rowDescription: { ...typeScale.body, color: colors.content.secondary },
  total: { ...typeScale.bodyStrong, color: colors.content.primary },
});
