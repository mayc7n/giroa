import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { createExpenseUseCases } from '@/application/expenseUseCases';
import { createPaymentUseCases, type CashMovement, type CashSummary } from '@/application/paymentUseCases';
import { createRuntimeId, currentCivilMonthPeriod, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import CashScreen from '@/features/cash/CashScreen';
import ExpenseForm from '@/features/expenses/ExpenseForm';
import { colors, dimensions, spacing, typeScale } from '@/ui/tokens';

export default function CashNativeScreen() {
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
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const refreshSummary = useCallback(async (isActive: () => boolean, showLoading: boolean) => {
    if (showLoading) setIsLoading(true);
    try {
      const nextSummary = await paymentUseCases.getCashSummary(currentCivilMonthPeriod());
      if (!isActive()) return;
      setSummary(nextSummary);
      setError(null);
    } catch (summaryError) {
      if (isActive()) {
        setError(summaryError instanceof Error ? summaryError.message : 'Não foi possível carregar o caixa. Tente novamente.');
      }
      throw summaryError;
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, [paymentUseCases]);

  const loadSummary = useCallback(async () => {
    await refreshSummary(() => true, true);
  }, [refreshSummary]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void refreshSummary(() => active, false).catch(() => undefined);

    return () => {
      active = false;
    };
  }, [refreshSummary]));

  async function handleReverseMovement(movement: CashMovement): Promise<void> {
    try {
      setError(null);
      if (movement.kind === 'entry') {
        await paymentUseCases.reversePayment(movement.id);
      } else {
        await expenseUseCases.reverse(movement.id);
      }
      await loadSummary();
    } catch (reversalError) {
      setError(reversalError instanceof Error ? reversalError.message : 'Não foi possível estornar a movimentação.');
    }
  }

  if (showExpenseForm) {
    return (
      <View style={styles.formScreen}>
        <Pressable accessibilityRole="button" onPress={() => setShowExpenseForm(false)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para Caixa</Text>
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
    <CashScreen
      summary={summary}
      isLoading={isLoading}
      error={error}
      onRetry={() => { void loadSummary().catch(() => undefined); }}
      onRegisterExpense={() => setShowExpenseForm(true)}
      onReverseMovement={handleReverseMovement}
    />
  );
}

const styles = StyleSheet.create({
  formScreen: { flex: 1, backgroundColor: colors.background.canvas },
  backButton: { minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[5] },
  backPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  backText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
});
