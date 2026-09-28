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
import { buildQuotePdfHtml, buildReceiptPdfHtml } from '@/features/documents/pdfContent';
import { sharePdf } from '@/features/documents/sharePdf';
import QuoteDetail from '@/features/quotes/QuoteDetail';
import QuoteForm from '@/features/quotes/QuoteForm';
import ServiceDetail from '@/features/services/ServiceDetail';
import ServiceList from '@/features/services/ServiceList';
import type { ServiceFinancialSummary } from '@/application/paymentUseCases';
import type { ServiceRecord } from '@/data/sqliteTypes';
import { colors, dimensions, spacing, typeScale } from '@/ui/tokens';

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
  const [savedServices, setSavedServices] = useState<ServiceRecord[]>([]);
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof repositories.quotes.getById>>>(null);
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [summary, setSummary] = useState<ServiceFinancialSummary | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([repositories.clients.list(), repositories.services.list()])
      .then(([nextClients, nextServices]) => {
        if (!active) return;
        setClients(nextClients);
        setSavedServices(nextServices);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os serviços. Tente novamente.');
      });

    return () => {
      active = false;
    };
  }, [repositories.clients, repositories.services]);

  async function loadServiceSummary(serviceId: string) {
    const nextSummary = await paymentUseCases.getServiceFinancialSummary(serviceId);
    setSummary(nextSummary);
  }

  if (service && summary) {
    if (showPaymentForm) {
      return (
        <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setShowPaymentForm(false)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
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
        <Pressable accessibilityRole="button" onPress={() => { setService(null); setSummary(null); }} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para orçamentos</Text>
        </Pressable>
        <ServiceDetail
          service={service}
          summary={summary}
          payments={summary.payments}
          onRegisterPayment={() => setShowPaymentForm(true)}
          onShareReceipt={async (payment) => {
            try {
              setError(null);
              const client = clients.find((item) => item.id === service.clientId);
              await sharePdf('Compartilhar recibo', buildReceiptPdfHtml({
                clientName: client?.name ?? 'Cliente não identificado',
                serviceDescription: service.description,
                payment,
                serviceTotalCents: summary.totalCents,
                balanceCents: summary.balanceCents,
              }));
            } catch (documentError) {
              setError(documentError instanceof Error ? documentError.message : 'Não foi possível gerar o recibo.');
            }
          }}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (quote) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => { setQuote(null); setShowNewQuote(false); }} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
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
              setSavedServices((currentServices) => [
                createdService,
                ...currentServices.filter((currentService) => currentService.id !== createdService.id),
              ]);
              setService(createdService);
              await loadServiceSummary(createdService.id);
              setQuote(null);
              setShowNewQuote(false);
            } catch (serviceError) {
              setError(serviceError instanceof Error ? serviceError.message : 'Não foi possível criar o serviço.');
            }
          }}
          onShareQuote={async () => {
            try {
              setError(null);
              const client = clients.find((item) => item.id === quote.clientId);
              await sharePdf('Compartilhar orçamento', buildQuotePdfHtml({
                quote,
                clientName: client?.name ?? 'Cliente não identificado',
                clientContact: client?.contact,
              }));
            } catch (documentError) {
              setError(documentError instanceof Error ? documentError.message : 'Não foi possível gerar o orçamento.');
            }
          }}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (!showNewQuote && savedServices.length > 0) {
    return (
      <View style={styles.screen}>
        <ServiceList
          services={savedServices.map((savedService) => ({
            service: savedService,
            clientName: clients.find((client) => client.id === savedService.clientId)?.name ?? 'Cliente não identificado',
          }))}
          onSelect={async (selectedService) => {
            try {
              setError(null);
              setSummary(null);
              setService(selectedService);
              await loadServiceSummary(selectedService.id);
            } catch (serviceError) {
              setService(null);
              setError(serviceError instanceof Error ? serviceError.message : 'Não foi possível abrir o serviço.');
            }
          }}
          onCreateQuote={() => setShowNewQuote(true)}
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
    <View style={styles.screen}>
      {savedServices.length > 0 ? (
        <Pressable accessibilityRole="button" onPress={() => setShowNewQuote(false)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para serviços salvos</Text>
        </Pressable>
      ) : null}
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
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  backButton: { minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[5] },
  backPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  backText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  error: { ...typeScale.body, color: colors.status.negative, paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
});
