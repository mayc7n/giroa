import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import type { TodaySummary } from '@/application/todayUseCases';
import { formatCentsToBRL, formatSignedCentsToBRL } from '@/domain/money';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type TodayScreenProps = {
  summary?: TodaySummary | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onOpenClients?: () => void;
  onOpenServices?: () => void;
  onOpenCash?: () => void;
  footer?: ReactNode;
};

export default function TodayScreen({
  summary = null,
  isLoading = false,
  error = null,
  onRetry,
  onOpenClients,
  onOpenServices,
  onOpenCash,
  footer,
}: TodayScreenProps = {}) {
  const showEmptyWorkspace = summary && summary.clientsCount === 0 && summary.serviceCount === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Giroa</Text>
        <Text style={styles.title}>Hoje</Text>
        <Text style={styles.introduction}>
          Acompanhe o que precisa da sua atenção no trabalho.
        </Text>

        {isLoading ? (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Carregando seu dia...</Text>
            <Text style={styles.emptyDescription}>Buscando os registros salvos neste aparelho.</Text>
          </View>
        ) : error && !summary ? (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Não foi possível carregar o dia.</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
            {onRetry ? (
              <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}>
                <Text style={styles.secondaryActionText}>Tentar novamente</Text>
              </Pressable>
            ) : null}
          </View>
        ) : showEmptyWorkspace ? (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Comece pelo primeiro cliente.</Text>
            <Text style={styles.emptyDescription}>
              Cadastre alguém para criar um orçamento e acompanhar o que tem para receber.
            </Text>
            {onOpenClients ? (
              <Pressable accessibilityRole="button" onPress={onOpenClients} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}>
                <Text style={styles.primaryActionText}>Cadastrar cliente</Text>
              </Pressable>
            ) : null}
          </View>
        ) : summary ? (
          <TodaySummaryContent
            summary={summary}
            onOpenServices={onOpenServices}
            onOpenCash={onOpenCash}
          />
        ) : (
          <View style={styles.emptyState} accessibilityRole="summary">
            <Text style={styles.emptyTitle}>Nada pendente por enquanto.</Text>
            <Text style={styles.emptyDescription}>
              Cadastre um cliente ou registre um serviço para começar.
            </Text>
          </View>
        )}
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

type TodaySummaryContentProps = {
  summary: TodaySummary;
  onOpenServices?: () => void;
  onOpenCash?: () => void;
};

function TodaySummaryContent({ summary, onOpenServices, onOpenCash }: TodaySummaryContentProps) {
  const visiblePendingServices = summary.pendingServices.slice(0, 3);

  return (
    <>
      <View style={styles.financialSummary} accessibilityRole="summary">
        <View style={styles.financialPrimary}>
          <Text style={styles.summaryLabel}>A receber</Text>
          <Text style={styles.summaryAmount}>{formatCentsToBRL(summary.pendingCents)}</Text>
        </View>
        <View style={styles.financialDetails}>
          <Text style={styles.detailLine}>Saldo do mês {formatSignedCentsToBRL(summary.periodBalanceCents)}</Text>
          <Text style={styles.detailLine}>Entradas {formatCentsToBRL(summary.entriesCents)}</Text>
          <Text style={styles.detailLine}>Saídas {formatCentsToBRL(summary.exitsCents)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Precisa de atenção</Text>
          <Text style={styles.sectionMeta}>{summary.pendingServices.length} serviço(s) com saldo</Text>
        </View>
        {visiblePendingServices.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyDescription}>Nenhum serviço com saldo pendente.</Text>
          </View>
        ) : (
          <View style={styles.serviceList}>
            {visiblePendingServices.map(({ service, clientName, balanceCents }) => (
              <Pressable
                key={service.id}
                accessibilityRole="button"
                onPress={onOpenServices}
                style={({ pressed }) => [styles.serviceRow, pressed && styles.rowPressed]}
              >
                <View style={styles.serviceCopy}>
                  <Text style={styles.serviceTitle}>{service.description}</Text>
                  <Text style={styles.serviceClient}>{clientName}</Text>
                </View>
                <Text style={styles.serviceBalance}>{formatCentsToBRL(balanceCents)}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {onOpenServices && summary.pendingServices.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={onOpenServices} style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}>
            <Text style={styles.secondaryActionText}>Ver serviços pendentes</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        {onOpenServices ? (
          <Pressable accessibilityRole="button" onPress={onOpenServices} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}>
            <Text style={styles.primaryActionText}>Abrir Serviços</Text>
          </Pressable>
        ) : null}
        {onOpenCash ? (
          <Pressable accessibilityRole="button" onPress={onOpenCash} style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}>
            <Text style={styles.secondaryActionText}>Abrir Caixa</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  content: {
    flexGrow: 1,
    padding: spacing[5],
    gap: spacing[3],
  },
  eyebrow: {
    ...typeScale.caption,
    color: colors.interactive.accent,
    letterSpacing: spacing[1] / 10,
  },
  title: {
    ...typeScale.display,
    color: colors.content.primary,
  },
  introduction: {
    ...typeScale.section,
    color: colors.content.secondary,
    maxWidth: 440,
  },
  emptyState: {
    marginTop: spacing[5],
    padding: spacing[5],
    borderRadius: radii.lg,
    backgroundColor: colors.background.surface,
    gap: spacing[2],
  },
  emptyTitle: {
    ...typeScale.section,
    color: colors.content.primary,
  },
  emptyDescription: {
    ...typeScale.body,
    color: colors.content.secondary,
  },
  financialSummary: {
    marginTop: spacing[5],
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
  },
  financialPrimary: { gap: spacing[1] },
  summaryLabel: { ...typeScale.bodyStrong, color: colors.content.secondary },
  summaryAmount: { ...typeScale.money, color: colors.content.primary },
  financialDetails: { gap: spacing[1] },
  detailLine: { ...typeScale.body, color: colors.content.secondary },
  section: { gap: spacing[3], marginTop: spacing[5] },
  sectionHeading: { gap: spacing[1] },
  sectionTitle: { ...typeScale.section, color: colors.content.primary },
  sectionMeta: { ...typeScale.caption, color: colors.content.muted },
  emptySection: { paddingVertical: spacing[2] },
  serviceList: { borderTopWidth: borders.width, borderTopColor: colors.border.default },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  rowPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  serviceCopy: { flex: 1, gap: spacing[1] },
  serviceTitle: { ...typeScale.bodyStrong, color: colors.content.primary },
  serviceClient: { ...typeScale.caption, color: colors.content.secondary },
  serviceBalance: { ...typeScale.bodyStrong, color: colors.status.pending },
  actions: { gap: spacing[3], marginTop: spacing[5] },
  primaryAction: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  primaryActionPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  primaryActionText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  secondaryAction: { minHeight: dimensions.touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  actionPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  secondaryActionText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
});
