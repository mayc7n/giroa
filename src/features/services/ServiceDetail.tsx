import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ServiceRecord } from '@/data/sqliteTypes';
import type { ServiceFinancialSummary } from '@/application/paymentUseCases';
import MoneyText from '@/components/MoneyText';

type ServiceDetailProps = {
  service: ServiceRecord;
  summary: Pick<ServiceFinancialSummary, 'totalCents' | 'receivedCents' | 'balanceCents'>;
  onRegisterPayment: () => void;
};

const workStatusLabels: Record<ServiceRecord['workStatus'], string> = {
  planned: 'Planejado',
  inProgress: 'Em execução',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function ServiceDetail({ service, summary, onRegisterPayment }: ServiceDetailProps) {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>{service.description}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Execução</Text>
        <Text style={styles.status}>{workStatusLabels[service.workStatus]}</Text>
      </View>
      <View style={styles.financialBox}>
        <MoneyText label="Total" cents={summary.totalCents} />
        <MoneyText label="Recebido" cents={summary.receivedCents} style={styles.received} />
        <MoneyText label="Saldo a receber" cents={summary.balanceCents} style={styles.balance} />
      </View>
      {summary.balanceCents > 0 ? (
        <Pressable accessibilityRole="button" onPress={onRegisterPayment} style={styles.button}>
          <Text style={styles.buttonText}>Registrar recebimento</Text>
        </Pressable>
      ) : (
        <Text style={styles.settled}>Pagamento quitado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 24, backgroundColor: '#F7F5F0' },
  title: { color: '#17211F', fontSize: 26, fontWeight: '800' },
  statusRow: { gap: 4 },
  statusLabel: { color: '#4A5753', fontSize: 14, fontWeight: '700' },
  status: { color: '#0B776D', fontSize: 16, fontWeight: '800' },
  financialBox: { gap: 12, padding: 18, borderRadius: 14, backgroundColor: '#E7F2EF' },
  received: { color: '#34564F', fontSize: 18 },
  balance: { color: '#173C35', fontSize: 22 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  settled: { color: '#0B776D', fontSize: 16, fontWeight: '800' },
});
