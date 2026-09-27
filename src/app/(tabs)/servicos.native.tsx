import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { createPaymentUseCases } from '@/application/paymentUseCases';
import { createRuntimeId, currentInstant } from '@/application/runtime';
import { createQuoteUseCases } from '@/application/quoteUseCases';
import { createServiceUseCases } from '@/application/serviceUseCases';
import { createSqliteRepositories } from '@/data/database';
import AreaPlaceholder from '@/features/shared/AreaPlaceholder';
import PaymentForm from '@/features/payments/PaymentForm';
import QuoteDetail from '@/features/quotes/QuoteDetail';
import QuoteForm from '@/features/quotes/QuoteForm';
import ServiceDetail from '@/features/services/ServiceDetail';
import type { ServiceFinancialSummary } from '@/application/paymentUseCases';
import type { ServiceRecord } from '@/data/sqliteTypes';

export default function ServicesScreen() {
  const db = useSQLiteContext();
  const repositories = useMemo(() => createSqliteRepositories(db), [db]);
  const useCases = useMemo(() => createQuoteUseCases({
    clients: repositories.clients,
    quotes: repositories.quotes,
    idFactory: () => createRuntimeId('record'),
    clock: currentInstant,
  }), [repositories.clients, repositories.quotes]);
  const serviceUseCases = useMemo(() => createServiceUseCases({
    quotes: repositories.quotes,
    services: repositories.services,
    idFactory: () => createRuntimeId('service'),
    clock: currentInstant,
  }), [repositories.quotes, repositories.services]);
  const paymentUseCases = useMemo(() => createPaymentUseCases({
    services: repositories.services,
    payments: repositories.payments,
    idFactory: () => createRuntimeId('payment'),
    clock: currentInstant,
  }), [repositories.payments, repositories.services]);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof repositories.clients.list>>>([]);
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof repositories.quotes.getById>>>(null);
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [summary, setSummary] = useState<ServiceFinancialSummary | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void repositories.clients.list().then(setClients).catch(() => setError('Não foi possível carregar os clientes.'));
  }, [repositories.clients]);

  async function loadServiceSummary(serviceId: string) {
    const nextSummary = await paymentUseCases.getServiceFinancialSummary(serviceId);
    setSummary(nextSummary);
  }

  if (service && summary) {
    if (showPaymentForm) {
      return (
        <View style={styles.screen}>
          <Pressable accessibilityRole="button" onPress={() => setShowPaymentForm(false)} style={styles.backButton}>
            <Text style={styles.backText}>Voltar para o serviço</Text>
          </Pressable>
          <PaymentForm
            balanceCents={summary.balanceCents}
            onSubmit={async (input) => {
              await paymentUseCases.register({ ...input, serviceId: service.id });
              await loadServiceSummary(service.id);
              setShowPaymentForm(false);
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setService(null)} style={styles.backButton}>
          <Text style={styles.backText}>Voltar para orçamentos</Text>
        </Pressable>
        <ServiceDetail service={service} summary={summary} onRegisterPayment={() => setShowPaymentForm(true)} />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (quote) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setQuote(null)} style={styles.backButton}>
          <Text style={styles.backText}>Novo orçamento</Text>
        </Pressable>
        <QuoteDetail
          quote={quote}
          onApprove={async () => {
            const approved = await useCases.approve(quote.id);
            setQuote(approved);
          }}
          onCreateService={async () => {
            try {
              setError(null);
              const createdService = await serviceUseCases.createFromApprovedQuote(quote.id);
              setService(createdService);
              await loadServiceSummary(createdService.id);
              setQuote(null);
            } catch (serviceError) {
              setError(serviceError instanceof Error ? serviceError.message : 'Não foi possível criar o serviço.');
            }
          }}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (clients.length === 0) {
    return (
      <View style={styles.screen}>
        <AreaPlaceholder title="Serviços" description="Cadastre um cliente antes de criar um orçamento." />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <QuoteForm
      clients={clients}
      onSubmit={async (input) => {
        setError(null);
        try {
          const created = await useCases.create(input);
          setQuote(created);
        } catch (submissionError) {
          setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível criar o orçamento.');
          throw submissionError;
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F0' },
  backButton: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 24 },
  backText: { color: '#0B776D', fontSize: 15, fontWeight: '800' },
  error: { color: '#A3312D', paddingHorizontal: 24, paddingBottom: 12 },
});
