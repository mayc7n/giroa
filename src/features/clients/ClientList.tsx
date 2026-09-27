import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ClientSelection, ClientSummary } from '@/domain/types';

type ClientListProps = {
  clients: ClientSummary[];
  onRegister: () => void;
  selection?: ClientSelection;
  onSelectClient: (client: ClientSummary) => void;
};

export default function ClientList({ clients, onRegister, selection, onSelectClient }: ClientListProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.description}>Pessoas atendidas e seus históricos.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onRegister} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Registrar cliente</Text>
        </Pressable>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum cliente cadastrado.</Text>
          <Text style={styles.emptyDescription}>Cadastre o primeiro cliente para criar um orçamento.</Text>
        </View>
      ) : (
        clients.map((client) => (
          <View key={client.id} style={styles.row}>
            <Text style={styles.rowTitle}>{client.name}</Text>
            <Text style={styles.rowDescription}>{client.contact || 'Sem contato informado'}</Text>
          </View>
        ))
      )}

      {selection?.kind === 'requiresChoice' ? (
        <View style={styles.selection}>
          <Text style={styles.selectionTitle}>Escolha o cliente correto</Text>
          {selection.clients.map((client) => (
            <Pressable
              key={client.id}
              accessibilityRole="button"
              onPress={() => onSelectClient(client)}
              style={styles.candidate}
            >
              <Text style={styles.rowTitle}>{client.name}</Text>
              <Text style={styles.rowDescription}>{client.contact || 'Sem contato informado'}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 24, gap: 16, backgroundColor: '#F7F5F0' },
  header: { gap: 16 },
  heading: { gap: 6 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  description: { color: '#4A5753', fontSize: 16, lineHeight: 23 },
  smallButton: { alignSelf: 'flex-start', minHeight: 46, justifyContent: 'center', borderRadius: 11, backgroundColor: '#0B776D', paddingHorizontal: 16 },
  smallButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  emptyState: { gap: 7, padding: 18, borderRadius: 14, backgroundColor: '#E7F2EF' },
  emptyTitle: { color: '#173C35', fontSize: 17, fontWeight: '800' },
  emptyDescription: { color: '#34564F', fontSize: 15, lineHeight: 21 },
  row: { gap: 4, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C7D0CC' },
  rowTitle: { color: '#17211F', fontSize: 17, fontWeight: '700' },
  rowDescription: { color: '#4A5753', fontSize: 15 },
  selection: { gap: 10, marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: '#FFF4D6' },
  selectionTitle: { color: '#5B4613', fontSize: 16, fontWeight: '800' },
  candidate: { gap: 4, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D8C99E' },
});
