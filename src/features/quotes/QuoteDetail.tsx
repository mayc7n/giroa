import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCentsToBRL } from '@/domain/money';
import type { QuoteRecord } from '@/data/sqliteTypes';

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
        <Pressable accessibilityRole="button" onPress={onApprove} style={styles.button}>
          <Text style={styles.buttonText}>Aprovar orçamento</Text>
        </Pressable>
      ) : null}
      {quote.status === 'approved' && onCreateService ? (
        <Pressable accessibilityRole="button" onPress={onCreateService} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Criar serviço</Text>
        </Pressable>
      ) : null}
      {onShareQuote ? (
        <Pressable accessibilityRole="button" onPress={onShareQuote} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Compartilhar orçamento</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 24, backgroundColor: '#F7F5F0' },
  title: { color: '#17211F', fontSize: 26, fontWeight: '800' },
  status: { color: '#0B776D', fontSize: 15, fontWeight: '700' },
  totalBox: { gap: 5, padding: 18, borderRadius: 14, backgroundColor: '#E7F2EF' },
  totalLabel: { color: '#34564F', fontSize: 14, fontWeight: '700' },
  total: { color: '#173C35', fontSize: 22, fontWeight: '800' },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#0B776D', paddingHorizontal: 18 },
  secondaryButtonText: { color: '#0B776D', fontSize: 16, fontWeight: '800' },
});
