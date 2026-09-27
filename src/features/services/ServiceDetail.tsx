import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import type { ServiceFinancialSummary } from '@/application/paymentUseCases';
import MoneyText from '@/components/MoneyText';
import { formatISODateToBR } from '@/domain/date';
import { formatCentsToBRL } from '@/domain/money';

type ServiceDetailProps = {
  service: ServiceRecord;
  summary: Pick<ServiceFinancialSummary, 'totalCents' | 'receivedCents' | 'balanceCents'>;
  payments: PaymentRecord[];
  onRegisterPayment: () => void;
};

const workStatusLabels: Record<ServiceRecord['workStatus'], string> = {
  planned: 'Planejado',
  inProgress: 'Em execução',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

function formatPaymentDate(value: string): string {
  try {
    return formatISODateToBR(value);
  } catch {
    return value;
  }
}

export default function ServiceDetail({ service, summary, payments, onRegisterPayment }: ServiceDetailProps) {
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
      <View style={styles.history}>
        <Text style={styles.historyTitle}>Histórico de recebimentos</Text>
        {payments.length === 0 ? (
          <Text style={styles.historyEmpty}>Nenhum recebimento registrado.</Text>
        ) : payments.map((payment) => (
          <View key={payment.id} style={styles.paymentRow}>
            <Text style={styles.paymentDescription}>
              {formatPaymentDate(payment.paymentDate)} · {payment.status === 'reversed' ? 'Estornado' : paymentMethodLabels[payment.method] ?? payment.method}
            </Text>
            <Text style={styles.paymentAmount}>{formatCentsToBRL(payment.amountCents)}</Text>
          </View>
        ))}
      </View>
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
  history: { gap: 10, marginTop: 8 },
  historyTitle: { color: '#17211F', fontSize: 18, fontWeight: '800' },
  historyEmpty: { color: '#4A5753', fontSize: 15 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C7D0CC' },
  paymentDescription: { flex: 1, color: '#4A5753', fontSize: 15 },
  paymentAmount: { color: '#173C35', fontSize: 15, fontWeight: '800' },
});
