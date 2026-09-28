import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import type { ServiceFinancialSummary } from '@/application/paymentUseCases';
import MoneyText from '@/components/MoneyText';
import { formatISODateToBR } from '@/domain/date';
import { formatCentsToBRL } from '@/domain/money';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type ServiceDetailProps = {
  service: ServiceRecord;
  summary: Pick<ServiceFinancialSummary, 'totalCents' | 'receivedCents' | 'balanceCents'>;
  payments: PaymentRecord[];
  onRegisterPayment: () => void;
  onShareReceipt?: (payment: PaymentRecord) => void;
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

export default function ServiceDetail({ service, summary, payments, onRegisterPayment, onShareReceipt }: ServiceDetailProps) {
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
        <Pressable accessibilityRole="button" onPress={onRegisterPayment} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
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
            {payment.status === 'active' && onShareReceipt ? (
              <Pressable accessibilityRole="button" onPress={() => onShareReceipt(payment)} style={({ pressed }) => [styles.receiptButton, pressed && styles.receiptPressed]}>
                <Text style={styles.receiptLink}>Compartilhar recibo</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[4], padding: spacing[5], backgroundColor: colors.background.canvas },
  title: { ...typeScale.title, color: colors.content.primary },
  statusRow: { gap: spacing[1] },
  statusLabel: { ...typeScale.caption, color: colors.content.secondary },
  status: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  financialBox: { gap: spacing[3], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  received: { ...typeScale.section, color: colors.content.secondary },
  balance: { ...typeScale.money, color: colors.content.primary },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  settled: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  history: { gap: spacing[2], marginTop: spacing[2] },
  historyTitle: { ...typeScale.section, color: colors.content.primary },
  historyEmpty: { ...typeScale.body, color: colors.content.secondary },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  paymentDescription: { flex: 1, ...typeScale.body, color: colors.content.secondary },
  paymentAmount: { ...typeScale.bodyStrong, color: colors.content.primary },
  receiptButton: { minHeight: dimensions.touchTarget, justifyContent: 'center' },
  receiptPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  receiptLink: { ...typeScale.caption, color: colors.interactive.accent },
});
