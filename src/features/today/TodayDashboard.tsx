import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { currentCivilMonthPeriod } from '@/application/runtime';
import { createTodayUseCases } from '@/application/todayUseCases';
import { createSqliteRepositories } from '@/data/database';
import TodayScreen from '@/features/today/TodayScreen';

export default function TodayDashboard() {
  const db = useSQLiteContext();
  const repositories = useMemo(() => createSqliteRepositories(db), [db]);
  const useCases = useMemo(() => createTodayUseCases({
    clients: repositories.clients,
    services: repositories.services,
    payments: repositories.payments,
    expenses: repositories.expenses,
    period: currentCivilMonthPeriod,
  }), [repositories.clients, repositories.expenses, repositories.payments, repositories.services]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof useCases.getSummary>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(() => useCases.getSummary(), [useCases]);

  const loadSummary = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      const nextSummary = await fetchSummary();
      if (!isActive()) return;
      setSummary(nextSummary);
      setError(null);
    } catch {
      if (isActive()) setError('Não foi possível carregar os registros locais. Tente novamente.');
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, [fetchSummary]);

  const retry = useCallback(() => {
    setIsLoading(true);
    void loadSummary();
  }, [loadSummary]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadSummary(() => active);

    return () => {
      active = false;
    };
  }, [loadSummary]));

  return (
    <TodayScreen
      summary={summary}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      onOpenClients={() => router.push('/(tabs)/clientes')}
      onOpenServices={() => router.push('/(tabs)/servicos')}
      onOpenCash={() => router.push('/(tabs)/caixa')}
    />
  );
}
