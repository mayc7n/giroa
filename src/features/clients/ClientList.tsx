import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ClientSelection, ClientSummary } from '@/domain/types';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type ClientListProps = {
  clients: ClientSummary[];
  onRegister: () => void;
  selection?: ClientSelection;
  onSelectClient: (client: ClientSummary) => void;
  isLoading?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
};

export default function ClientList({
  clients,
  onRegister,
  selection,
  onSelectClient,
  isLoading = false,
  onSearchChange,
  searchQuery = '',
}: ClientListProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.description}>Pessoas atendidas e seus históricos.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onRegister} style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}>
          <Text style={styles.smallButtonText}>Registrar cliente</Text>
        </Pressable>
      </View>

      {onSearchChange ? (
        <TextInput
          accessibilityLabel="Buscar cliente"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onSearchChange}
          placeholder="Buscar por nome ou contato"
          placeholderTextColor={colors.content.muted}
          style={styles.searchInput}
          value={searchQuery}
        />
      ) : null}

      {isLoading ? (
        <Text style={styles.stateText}>Carregando clientes…</Text>
      ) : clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado.'}
          </Text>
          <Text style={styles.emptyDescription}>
            {searchQuery.trim() ? 'Tente outro nome ou contato.' : 'Cadastre o primeiro cliente para criar um orçamento.'}
          </Text>
        </View>
      ) : (
        clients.map((client) => (
          <Pressable
            key={client.id}
            accessibilityRole="button"
            accessibilityLabel={client.name}
            onPress={() => onSelectClient(client)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowTitle}>{client.name}</Text>
            <Text style={styles.rowDescription}>{client.contact || 'Sem contato informado'}</Text>
          </Pressable>
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
              style={({ pressed }) => [styles.candidate, pressed && styles.candidatePressed]}
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
  smallButtonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  smallButtonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  searchInput: { ...typeScale.body, minHeight: dimensions.input, borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, color: colors.content.primary, paddingHorizontal: spacing[4] },
  stateText: { ...typeScale.body, color: colors.content.secondary },
  emptyState: { gap: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.surface },
  emptyTitle: { ...typeScale.section, color: colors.content.primary },
  emptyDescription: { ...typeScale.body, color: colors.content.secondary },
  row: { gap: spacing[1], minHeight: dimensions.row, paddingVertical: spacing[4], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  rowPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  rowTitle: { ...typeScale.section, color: colors.content.primary },
  rowDescription: { ...typeScale.body, color: colors.content.secondary },
  selection: { gap: spacing[3], marginTop: spacing[2], padding: spacing[4], borderRadius: radii.lg, backgroundColor: colors.background.elevated },
  selectionTitle: { ...typeScale.bodyStrong, color: colors.status.pending },
  candidate: { gap: spacing[1], minHeight: dimensions.row, paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  candidatePressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
});
