import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { createClientUseCases } from '@/application/clientUseCases';
import { createRuntimeId, currentInstant } from '@/application/runtime';
import { createSqliteRepositories } from '@/data/database';
import ClientForm from '@/features/clients/ClientForm';
import ClientList from '@/features/clients/ClientList';

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
  screen: { flex: 1, backgroundColor: '#F7F5F0' },
  backButton: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 24 },
  backText: { color: '#0B776D', fontSize: 15, fontWeight: '800' },
  error: { color: '#A3312D', paddingHorizontal: 24, paddingBottom: 12 },
  secondaryButton: { alignSelf: 'flex-start', marginHorizontal: 24, marginBottom: 18, minHeight: 46, justifyContent: 'center', borderRadius: 11, borderWidth: 1, borderColor: '#0B776D', paddingHorizontal: 16 },
  secondaryText: { color: '#0B776D', fontSize: 15, fontWeight: '800' },
});
