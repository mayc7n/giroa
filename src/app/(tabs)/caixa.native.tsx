import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { createPaymentUseCases } from '@/application/paymentUseCases';
import { createExpenseUseCases } from '@/application/expenseUseCases';
import { createRuntimeId, currentCivilMonthPeriod, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import { formatCentsToBRL } from '@/domain/money';
import ExpenseForm from '@/features/expenses/ExpenseForm';

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
        <Pressable accessibilityRole="button" onPress={() => setShowExpenseForm(false)}>
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
      <Pressable accessibilityRole="button" onPress={() => setShowExpenseForm(true)} style={styles.action}>
        <Text style={styles.actionText}>Registrar saída</Text>
      </Pressable>
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Saldo do período</Text>
        <Text style={styles.total}>{formatCentsToBRL(summary.periodBalanceCents)}</Text>
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
  screen: { flex: 1, gap: 16, padding: 24, backgroundColor: '#F7F5F0' },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  description: { color: '#4A5753', fontSize: 16, lineHeight: 23 },
  back: { color: '#0B776D', fontSize: 16, fontWeight: '800' },
  action: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  box: { gap: 10, padding: 18, borderRadius: 14, backgroundColor: '#E7F2EF' },
  boxTitle: { color: '#34564F', fontSize: 15, fontWeight: '700' },
  total: { color: '#173C35', fontSize: 24, fontWeight: '800' },
  line: { color: '#34564F', fontSize: 16 },
  pendingBox: { gap: 6, padding: 18, borderRadius: 14, backgroundColor: '#FFF4D6' },
  pendingTitle: { color: '#5B4613', fontSize: 15, fontWeight: '700' },
  pending: { color: '#5B4613', fontSize: 22, fontWeight: '800' },
  error: { color: '#A3312D', fontSize: 15 },
});
