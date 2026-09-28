import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ClientSelection, ClientSummary } from '@/domain/types';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

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
  content: { flexGrow: 1, padding: spacing[5], gap: spacing[4], backgroundColor: colors.background.canvas },
  header: { gap: spacing[4] },
  heading: { gap: spacing[2] },
  title: { ...typeScale.title, color: colors.content.primary },
  description: { ...typeScale.body, color: colors.content.secondary },
  smallButton: { alignSelf: 'flex-start', minHeight: dimensions.action, justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  smallButtonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  emptyState: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.surface },
  emptyTitle: { ...typeScale.section, color: colors.content.primary },
  emptyDescription: { ...typeScale.body, color: colors.content.secondary },
  row: { gap: spacing[1], minHeight: dimensions.row, paddingVertical: spacing[4], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  rowTitle: { ...typeScale.section, color: colors.content.primary },
  rowDescription: { ...typeScale.body, color: colors.content.secondary },
  selection: { gap: spacing[3], marginTop: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  selectionTitle: { ...typeScale.bodyStrong, color: colors.status.pending },
  candidate: { gap: spacing[1], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
});
