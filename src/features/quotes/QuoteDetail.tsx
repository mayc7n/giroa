import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';
import type { QuoteRecord } from '@/data/sqliteTypes';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type QuoteDetailProps = {
  quote: QuoteRecord;
  onApprove: () => void;
  onCreateService?: () => void;
  onShareQuote?: () => void;
};

const statusLabels: Record<QuoteRecord['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
};

export default function QuoteDetail({ quote, onApprove, onCreateService, onShareQuote }: QuoteDetailProps) {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>{quote.description}</Text>
      <Text style={styles.status}>{statusLabels[quote.status]}</Text>
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>Total {formatCentsToBRL(quote.totalCents)}</Text>
      </View>
      {quote.status === 'draft' || quote.status === 'sent' ? (
        <Pressable accessibilityRole="button" onPress={onApprove} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Aprovar orçamento</Text>
        </Pressable>
      ) : null}
      {quote.status === 'approved' && onCreateService ? (
        <Pressable accessibilityRole="button" onPress={onCreateService} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
          <Text style={styles.secondaryButtonText}>Criar serviço</Text>
        </Pressable>
      ) : null}
      {onShareQuote ? (
        <Pressable accessibilityRole="button" onPress={onShareQuote} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
          <Text style={styles.secondaryButtonText}>Compartilhar orçamento</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[4], padding: spacing[5], backgroundColor: colors.background.canvas },
  title: { ...typeScale.title, color: colors.content.primary },
  status: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  totalBox: { gap: spacing[1], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  totalLabel: { ...typeScale.caption, color: colors.content.secondary },
  total: { ...typeScale.money, color: colors.content.primary },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  secondaryButton: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  secondaryButtonText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  secondaryPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
});
