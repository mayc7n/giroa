import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { createClientUseCases } from '@/application/clientUseCases';
import { createRuntimeId, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import { filterClientSummaries } from '@/domain/client';
import ClientForm from '@/features/clients/ClientForm';
import ClientDetail from '@/features/clients/ClientDetail';
import ClientList from '@/features/clients/ClientList';
import type { ClientDetails } from '@/application/clientUseCases';
import type { ClientSummary } from '@/domain/types';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

export default function ClientsScreen() {
  const db = useSQLiteContext();
  const repositories = useMemo(() => createSqliteRepositories(db), [db]);
  const useCases = useMemo(() => createClientUseCases({
    clients: repositories.clients,
    quotes: repositories.quotes,
    services: repositories.services,
    payments: repositories.payments,
    idFactory: () => createRuntimeId('client'),
    clock: currentInstant,
  }), [repositories.clients, repositories.payments, repositories.quotes, repositories.services]);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof repositories.clients.list>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [formMode, setFormMode] = useState<'new' | 'edit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      const nextClients = await repositories.clients.list();
      if (!isActive()) return;
      setClients(nextClients);
      setError(null);
    } catch {
      if (isActive()) setError('Não foi possível carregar os clientes. Tente novamente.');
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, [repositories.clients]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadClients(() => active);

    return () => {
      active = false;
    };
  }, [loadClients]));

  const visibleClients = useMemo(() => filterClientSummaries(clients, searchQuery), [clients, searchQuery]);

  async function handleSelectClient(client: ClientSummary): Promise<void> {
    setError(null);
    setSelectedClientId(client.id);
    setDetails(null);
    setIsDetailLoading(true);
    try {
      setDetails(await useCases.getDetails(client.id));
    } catch (detailError) {
      setSelectedClientId(null);
      setError(detailError instanceof Error ? detailError.message : 'Não foi possível carregar o cliente. Tente novamente.');
    } finally {
      setIsDetailLoading(false);
    }
  }

  function handleBackToList(): void {
    setSelectedClientId(null);
    setDetails(null);
    setFormMode(null);
  }

  if (formMode === 'new') {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setFormMode(null)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para clientes</Text>
        </Pressable>
        <ClientForm
          onSubmit={async (input) => {
            await useCases.register(input);
            await loadClients();
            setFormMode(null);
          }}
        />
      </View>
    );
  }

  if (formMode === 'edit' && details) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setFormMode(null)} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para cliente</Text>
        </Pressable>
        <ClientForm
          initialContact={details.client.contact}
          initialName={details.client.name}
          onSubmit={async (input) => {
            await useCases.update(details.client.id, input);
            setDetails(await useCases.getDetails(details.client.id));
            await loadClients();
            setFormMode(null);
          }}
          submitLabel="Salvar alterações"
          title="Editar cliente"
        />
      </View>
    );
  }

  if (selectedClientId) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={handleBackToList} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <Text style={styles.backText}>Voltar para clientes</Text>
        </Pressable>
        {isDetailLoading || !details ? (
          <Text style={styles.loadingText}>Carregando cliente…</Text>
        ) : (
          <ClientDetail details={details} onEdit={() => setFormMode('edit')} />
        )}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ClientList
        clients={visibleClients}
        isLoading={isLoading}
        onRegister={() => setFormMode('new')}
        onSearchChange={setSearchQuery}
        onSelectClient={handleSelectClient}
        searchQuery={searchQuery}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {error ? (
        <Pressable accessibilityRole="button" onPress={() => { setIsLoading(true); void loadClients(); }} style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/servicos')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
        <Text style={styles.secondaryText}>Ir para Serviços</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  backButton: { minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[5] },
  backPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  backText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  loadingText: { ...typeScale.body, color: colors.content.secondary, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  error: { ...typeScale.body, color: colors.status.negative, paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  retryButton: { alignSelf: 'flex-start', marginHorizontal: spacing[5], minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[4] },
  retryPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  retryText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  secondaryButton: { alignSelf: 'flex-start', marginHorizontal: spacing[5], marginBottom: spacing[4], minHeight: dimensions.touchTarget, justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  secondaryPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  secondaryText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
});
