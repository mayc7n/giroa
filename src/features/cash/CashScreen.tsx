import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CashMovement, CashSummary } from '@/application/paymentUseCases';
import { formatISODateToBR } from '@/domain/date';
import { formatCentsToBRL, formatSignedCentsToBRL } from '@/domain/money';
import GiroaLogo from '@/ui/GiroaLogo';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type CashScreenProps = {
  summary?: CashSummary | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRegisterExpense?: () => void;
  onReverseMovement?: (movement: CashMovement) => void;
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

const expenseCategoryLabels: Record<string, string> = {
  material: 'Material',
  transporte: 'Transporte',
  ferramentas: 'Ferramentas',
  outros: 'Outros',
};

function formatMovementDate(value: string): string {
  try {
    return formatISODateToBR(value);
  } catch {
    return value;
  }
}

function getCategoryLabel(movement: CashMovement): string {
  return movement.kind === 'entry'
    ? paymentMethodLabels[movement.category] ?? movement.category
    : expenseCategoryLabels[movement.category] ?? movement.category;
}

function getMovementAmountLabel(movement: CashMovement): string {
  const sign = movement.kind === 'entry' ? '+' : '-';
  return `${sign}${formatCentsToBRL(movement.amountCents)}`;
}

function getStatusLabel(status: CashMovement['status']): string {
  return status === 'active' ? 'Ativa' : 'Estornada';
}

function requestMovementReversal(movement: CashMovement, onConfirm: (movement: CashMovement) => void): void {
  Alert.alert(
    'Confirmar estorno?',
    `${movement.description}\nO registro continuará no histórico como estornado.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Estornar', style: 'destructive', onPress: () => onConfirm(movement) },
    ],
  );
}

export default function CashScreen({
  summary = null,
  isLoading = false,
  error = null,
  onRetry,
  onRegisterExpense,
  onReverseMovement,
}: CashScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <GiroaLogo />
        <Text style={styles.title}>Caixa</Text>
        <Text style={styles.description}>Entradas e saídas efetivamente registradas.</Text>

        {onRegisterExpense ? (
          <Pressable accessibilityRole="button" onPress={onRegisterExpense} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}>
            <Text style={styles.primaryActionText}>Registrar saída</Text>
          </Pressable>
        ) : null}

        {isLoading && !summary ? (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Carregando o caixa...</Text>
            <Text style={styles.emptyDescription}>Buscando as movimentações salvas neste aparelho.</Text>
          </View>
        ) : error && !summary ? (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Não foi possível carregar o caixa.</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            {onRetry ? (
              <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}>
                <Text style={styles.secondaryActionText}>Tentar novamente</Text>
              </Pressable>
            ) : null}
          </View>
        ) : summary ? (
          <>
            <View style={styles.summaryBox} accessibilityRole="summary">
              <Text style={styles.summaryTitle}>Saldo do período</Text>
              <Text style={[styles.summaryAmount, summary.periodBalanceCents < 0 && styles.negativeAmount]}>
                {formatSignedCentsToBRL(summary.periodBalanceCents)}
              </Text>
              <Text style={styles.summaryLine}>Entradas {formatCentsToBRL(summary.entriesCents)}</Text>
              <Text style={styles.summaryLine}>Saídas {formatCentsToBRL(summary.exitsCents)}</Text>
            </View>

            <View style={styles.pendingBox}>
              <Text style={styles.pendingTitle}>Valores a receber</Text>
              <Text style={styles.pendingAmount}>{formatCentsToBRL(summary.pendingCents)}</Text>
            </View>

            <View style={styles.movementsSection}>
              <Text style={styles.sectionTitle}>Movimentações</Text>
              {summary.movements.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyDescription}>Nenhuma movimentação neste período.</Text>
                </View>
              ) : (
                <View style={styles.movementList}>
                  {summary.movements.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
                      onReverse={onReverseMovement}
                    />
                  ))}
                </View>
              )}
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MovementRow({ movement, onReverse }: { movement: CashMovement; onReverse?: (movement: CashMovement) => void }) {
  const canReverse = movement.status === 'active' && onReverse;
  return (
    <View style={styles.movementRow}>
      <View style={styles.movementCopy}>
        <Text style={styles.movementDate}>{formatMovementDate(movement.date)}</Text>
        <Text style={styles.movementDescription}>{movement.description}</Text>
        <Text style={styles.movementMeta}>{movement.kind === 'entry' ? 'Entrada' : 'Saída'} · {getCategoryLabel(movement)}</Text>
      </View>
      <View style={styles.movementValue}>
        <Text style={[styles.amount, movement.kind === 'entry' ? styles.entryAmount : styles.exitAmount]}>
          {getMovementAmountLabel(movement)}
        </Text>
        <Text style={[styles.status, movement.status === 'reversed' && styles.reversedStatus]}>{getStatusLabel(movement.status)}</Text>
        {canReverse ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Estornar ${movement.description}`}
            onPress={() => requestMovementReversal(movement, onReverse)}
            style={({ pressed }) => [styles.reverseButton, pressed && styles.actionPressed]}
          >
            <Text style={styles.reverseText}>Estornar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.canvas },
  content: { flexGrow: 1, gap: spacing[3], padding: spacing[5], backgroundColor: colors.background.canvas },
  title: { ...typeScale.display, color: colors.content.primary },
  description: { ...typeScale.section, color: colors.content.secondary, maxWidth: 440 },
  primaryAction: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  primaryActionPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  primaryActionText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  emptyState: { marginTop: spacing[5], padding: spacing[5], borderRadius: radii.lg, backgroundColor: colors.background.surface, gap: spacing[2] },
  emptyTitle: { ...typeScale.section, color: colors.content.primary },
  emptyDescription: { ...typeScale.body, color: colors.content.secondary },
  secondaryAction: { minHeight: dimensions.touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  actionPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  secondaryActionText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  summaryBox: { gap: spacing[2], marginTop: spacing[5], padding: spacing[5], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  summaryTitle: { ...typeScale.bodyStrong, color: colors.content.secondary },
  summaryAmount: { ...typeScale.money, color: colors.content.primary },
  negativeAmount: { color: colors.status.negative },
  summaryLine: { ...typeScale.body, color: colors.content.secondary },
  pendingBox: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.surface },
  pendingTitle: { ...typeScale.bodyStrong, color: colors.status.pending },
  pendingAmount: { ...typeScale.money, color: colors.status.pending },
  movementsSection: { gap: spacing[3], marginTop: spacing[5] },
  sectionTitle: { ...typeScale.section, color: colors.content.primary },
  emptySection: { paddingVertical: spacing[2] },
  movementList: { borderTopWidth: borders.width, borderTopColor: colors.border.default },
  movementRow: { flexDirection: 'row', gap: spacing[3], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  movementCopy: { flex: 1, gap: spacing[1] },
  movementDate: { ...typeScale.caption, color: colors.content.muted },
  movementDescription: { ...typeScale.bodyStrong, color: colors.content.primary },
  movementMeta: { ...typeScale.caption, color: colors.content.secondary },
  movementValue: { alignItems: 'flex-end', gap: spacing[1] },
  amount: { ...typeScale.bodyStrong },
  entryAmount: { color: colors.interactive.accent },
  exitAmount: { color: colors.content.primary },
  status: { ...typeScale.caption, color: colors.content.secondary },
  reversedStatus: { color: colors.status.negative },
  reverseButton: { minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[2] },
  reverseText: { ...typeScale.caption, color: colors.status.negative },
  error: { ...typeScale.body, color: colors.status.negative },
});
