import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ClientDetails } from '@/application/clientUseCases';
import { formatISODateToBR } from '@/domain/date';
import { formatCentsToBRL } from '@/domain/money';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type ClientDetailProps = {
  details: ClientDetails;
  onEdit: () => void;
};

const quoteStatusLabels: Record<ClientDetails['quotes'][number]['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
};

const workStatusLabels: Record<ClientDetails['services'][number]['workStatus'], string> = {
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

function formatDate(value: string): string {
  try {
    return formatISODateToBR(value);
  } catch {
    return value;
  }
}

export default function ClientDetail({ details, onEdit }: ClientDetailProps) {
  const serviceNames = new Map(details.services.map((service) => [service.id, service.description]));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.identity}>
        <Text style={styles.title}>{details.client.name}</Text>
        <Text style={styles.contact}>{details.client.contact || 'Sem contato informado'}</Text>
        <Pressable accessibilityRole="button" onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.editPressed]}>
          <Text style={styles.editText}>Editar cliente</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de orçamentos</Text>
        {details.quotes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum orçamento relacionado.</Text>
        ) : details.quotes.map((quote) => (
          <View key={quote.id} style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{quote.description}</Text>
              <Text style={styles.rowMeta}>{quoteStatusLabels[quote.status]}</Text>
            </View>
            <Text style={styles.amount}>{formatCentsToBRL(quote.totalCents)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de serviços</Text>
        {details.services.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum serviço relacionado.</Text>
        ) : details.services.map((service) => (
          <View key={service.id} style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{service.description}</Text>
              <Text style={styles.rowMeta}>{workStatusLabels[service.workStatus]}</Text>
            </View>
            <Text style={styles.amount}>{formatCentsToBRL(service.totalCents)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de recebimentos</Text>
        {details.payments.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum recebimento relacionado.</Text>
        ) : details.payments.map((payment) => (
          <View key={payment.id} style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{serviceNames.get(payment.serviceId) ?? 'Recebimento'}</Text>
              <Text style={styles.rowMeta}>
                {formatDate(payment.paymentDate)} · {payment.status === 'reversed' ? 'Estornado' : paymentMethodLabels[payment.method] ?? payment.method}
              </Text>
            </View>
            <Text style={styles.amount}>{formatCentsToBRL(payment.amountCents)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing[6], padding: spacing[5], backgroundColor: colors.background.canvas },
  identity: { gap: spacing[2] },
  title: { ...typeScale.title, color: colors.content.primary },
  contact: { ...typeScale.body, color: colors.content.secondary },
  editButton: { alignSelf: 'flex-start', minHeight: dimensions.touchTarget, justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  editPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  editText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  section: { gap: spacing[2] },
  sectionTitle: { ...typeScale.section, color: colors.content.primary },
  emptyText: { ...typeScale.body, color: colors.content.secondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  rowContent: { flex: 1, gap: spacing[1] },
  rowTitle: { ...typeScale.bodyStrong, color: colors.content.primary },
  rowMeta: { ...typeScale.caption, color: colors.content.secondary },
  amount: { ...typeScale.bodyStrong, color: colors.content.primary },
});
