import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { createClientUseCases } from '@/application/clientUseCases';
import { createRuntimeId, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import ClientForm from '@/features/clients/ClientForm';
import ClientList from '@/features/clients/ClientList';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

export default function ClientsScreen() {
  const db = useSQLiteContext();
  const repositories = useMemo(() => createSqliteRepositories(db), [db]);
  const useCases = useMemo(() => createClientUseCases({
    clients: repositories.clients,
    idFactory: () => createRuntimeId('client'),
    clock: currentInstant,
  }), [repositories.clients]);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof repositories.clients.list>>>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadClients() {
    try {
      setClients(await repositories.clients.list());
      setError(null);
    } catch {
      setError('Não foi possível carregar os clientes. Tente novamente.');
    }
  }

  useEffect(() => {
    let active = true;
    repositories.clients.list()
      .then((nextClients) => {
        if (!active) return;
        setClients(nextClients);
        setError(null);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os clientes. Tente novamente.');
      });

    return () => {
      active = false;
    };
  }, [repositories.clients]);

  if (showForm) {
    return (
      <View style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setShowForm(false)} style={styles.backButton}>
          <Text style={styles.backText}>Voltar para clientes</Text>
        </Pressable>
        <ClientForm
          onSubmit={async (input) => {
            await useCases.register(input);
            await loadClients();
            setShowForm(false);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ClientList clients={clients} onRegister={() => setShowForm(true)} onSelectClient={() => undefined} />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/servicos')} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Ir para Serviços</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.canvas },
  backButton: { minHeight: dimensions.touchTarget, justifyContent: 'center', paddingHorizontal: spacing[5] },
  backText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
  error: { ...typeScale.body, color: colors.status.negative, paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  secondaryButton: { alignSelf: 'flex-start', marginHorizontal: spacing[5], marginBottom: spacing[4], minHeight: dimensions.touchTarget, justifyContent: 'center', borderRadius: radii.md, borderWidth: borders.width, borderColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  secondaryText: { ...typeScale.bodyStrong, color: colors.interactive.accent },
});
