import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { createPaymentUseCases } from '@/application/paymentUseCases';
import { createExpenseUseCases } from '@/application/expenseUseCases';
import { createRuntimeId, currentCivilMonthPeriod, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import { formatCentsToBRL, formatSignedCentsToBRL } from '@/domain/money';
import ExpenseForm from '@/features/expenses/ExpenseForm';
import { colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

export default function CashScreen() {
  const db = useSQLiteContext();
  const repositories = useMemo(() => createSqliteRepositories(db), [db]);
  const paymentUseCases = useMemo(() => createPaymentUseCases({
    services: repositories.services,
    payments: repositories.payments,
    expenses: repositories.expenses,
    idFactory: () => createRuntimeId('payment'),
    clock: currentInstant,
  }), [repositories.expenses, repositories.payments, repositories.services]);
  const expenseUseCases = useMemo(() => createExpenseUseCases({
    expenses: repositories.expenses,
    idFactory: () => createRuntimeId('expense'),
    clock: currentInstant,
  }), [repositories.expenses]);
  const [summary, setSummary] = useState({ entriesCents: 0, exitsCents: 0, periodBalanceCents: 0, pendingCents: 0 });
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  async function loadSummary() {
    const nextSummary = await paymentUseCases.getCashSummary(currentCivilMonthPeriod());
    setSummary(nextSummary);
  }

  useEffect(() => {
    let active = true;
    paymentUseCases.getCashSummary(currentCivilMonthPeriod())
      .then((nextSummary) => {
        if (active) setSummary(nextSummary);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o caixa. Tente novamente.');
      });

    return () => {
      active = false;
    };
  }, [paymentUseCases]);

  if (showExpenseForm) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setShowExpenseForm(false)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.back}>Voltar para Caixa</Text>
        </Pressable>
        <ExpenseForm
          onSubmit={async (input) => {
            await expenseUseCases.register(input);
            await loadSummary();
            setShowExpenseForm(false);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Caixa</Text>
      <Text style={styles.description}>Movimentações efetivamente registradas.</Text>
      <Pressable accessibilityRole="button" onPress={() => setShowExpenseForm(true)} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
        <Text style={styles.actionText}>Registrar saída</Text>
      </Pressable>
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Saldo do período</Text>
        <Text style={styles.total}>{formatSignedCentsToBRL(summary.periodBalanceCents)}</Text>
        <Text style={styles.line}>Entradas {formatCentsToBRL(summary.entriesCents)}</Text>
        <Text style={styles.line}>Saídas {formatCentsToBRL(summary.exitsCents)}</Text>
      </View>
      <View style={styles.pendingBox}>
        <Text style={styles.pendingTitle}>Valores a receber</Text>
        <Text style={styles.pending}>{formatCentsToBRL(summary.pendingCents)}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: spacing[4], padding: spacing[5], backgroundColor: colors.background.canvas },
  backButton: { minHeight: dimensions.touchTarget, justifyContent: 'center' },
  backPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  title: { ...typeScale.title, color: colors.content.primary },
  description: { ...typeScale.body, color: colors.content.secondary },
  back: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  action: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  actionPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  actionText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  box: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  boxTitle: { ...typeScale.bodyStrong, color: colors.content.secondary },
  total: { ...typeScale.money, color: colors.content.primary },
  line: { ...typeScale.body, color: colors.content.secondary },
  pendingBox: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.surface },
  pendingTitle: { ...typeScale.bodyStrong, color: colors.status.pending },
  pending: { ...typeScale.money, color: colors.status.pending },
  error: { ...typeScale.body, color: colors.status.negative },
});
