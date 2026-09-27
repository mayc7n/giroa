import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';
import type { ServiceRecord } from '@/data/sqliteTypes';

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
  content: { flexGrow: 1, gap: 16, padding: 24, backgroundColor: '#F7F5F0' },
  header: { gap: 16 },
  heading: { gap: 6 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  description: { color: '#4A5753', fontSize: 16, lineHeight: 23 },
  button: { alignSelf: 'flex-start', minHeight: 46, justifyContent: 'center', borderRadius: 11, backgroundColor: '#0B776D', paddingHorizontal: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  emptyState: { gap: 7, padding: 18, borderRadius: 14, backgroundColor: '#E7F2EF' },
  emptyTitle: { color: '#173C35', fontSize: 17, fontWeight: '800' },
  emptyDescription: { color: '#34564F', fontSize: 15, lineHeight: 21 },
  row: { gap: 5, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C7D0CC' },
  rowTitle: { color: '#17211F', fontSize: 17, fontWeight: '800' },
  rowDescription: { color: '#4A5753', fontSize: 15 },
  total: { color: '#173C35', fontSize: 16, fontWeight: '800' },
});
