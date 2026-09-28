import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatCentsToBRL, parseMoneyToCents } from '@/domain/money';
import { calculateQuoteTotal } from '@/domain/quote';
import type { ClientSummary, QuoteItemInput } from '@/domain/types';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type QuoteFormProps = {
  clients: ClientSummary[];
  onSubmit: (input: { clientId: string; description: string; discountCents: number; validUntil: string | null; items: QuoteItemInput[] }) => Promise<void> | void;
};

function parseQuantityMilli(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) throw new Error('Informe uma quantidade válida.');
  const [integerPart, decimalPart = ''] = normalized.split('.');
  return Number(`${integerPart}${decimalPart.padEnd(3, '0')}`);
}

export default function QuoteForm({ clients, onSubmit }: QuoteFormProps) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const total = useMemo(() => {
    try {
      const item = { description: description || 'Item', quantityMilli: parseQuantityMilli(quantity), unitPriceCents: unitPrice ? parseMoneyToCents(unitPrice) : 0 };
      return calculateQuoteTotal([item], discount ? parseMoneyToCents(discount) : 0).totalCents;
    } catch {
      return 0;
    }
  }, [description, quantity, unitPrice, discount]);

  async function handleSubmit() {
    setError(null);
    try {
      const item = { description, quantityMilli: parseQuantityMilli(quantity), unitPriceCents: parseMoneyToCents(unitPrice) };
      await onSubmit({ clientId, description, discountCents: discount ? parseMoneyToCents(discount) : 0, validUntil: null, items: [item] });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível salvar o orçamento.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Novo orçamento</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Cliente</Text>
          <View style={styles.clientOptions}>
            {clients.map((client) => (
              <Pressable
                key={client.id}
                accessibilityRole="button"
                accessibilityState={{ selected: client.id === clientId }}
                onPress={() => setClientId(client.id)}
                style={({ pressed }) => [styles.clientOption, client.id === clientId && styles.clientOptionSelected, pressed && styles.clientOptionPressed]}
              >
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientContact}>{client.contact || 'Sem contato informado'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput accessibilityLabel="Descrição do orçamento" onChangeText={setDescription} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder="Ex.: Instalação" placeholderTextColor={colors.content.muted} returnKeyType="next" style={[styles.input, inputFocused && styles.inputFocused]} value={description} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput accessibilityLabel="Quantidade do item" keyboardType="decimal-pad" onChangeText={setQuantity} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholderTextColor={colors.content.muted} returnKeyType="next" style={[styles.input, inputFocused && styles.inputFocused]} value={quantity} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Preço unitário</Text>
          <TextInput accessibilityLabel="Preço unitário do item" keyboardType="decimal-pad" onChangeText={setUnitPrice} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder="R$ 0,00" placeholderTextColor={colors.content.muted} returnKeyType="next" style={[styles.input, inputFocused && styles.inputFocused]} value={unitPrice} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Desconto</Text>
          <TextInput accessibilityLabel="Desconto do orçamento" keyboardType="decimal-pad" onChangeText={setDiscount} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholderTextColor={colors.content.muted} returnKeyType="done" style={[styles.input, inputFocused && styles.inputFocused]} value={discount} />
        </View>
        <Text style={styles.total}>Total {formatCentsToBRL(total)}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={handleSubmit} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Salvar orçamento</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.canvas },
  content: { padding: spacing[5], gap: spacing[4] },
  title: { ...typeScale.title, color: colors.content.primary },
  field: { gap: spacing[2] },
  label: { ...typeScale.bodyStrong, color: colors.content.primary },
  clientOptions: { gap: 0 },
  clientOption: { gap: spacing[1], minHeight: dimensions.row, justifyContent: 'center', paddingVertical: spacing[3], borderBottomWidth: borders.width, borderBottomColor: colors.border.default },
  clientOptionSelected: { borderBottomColor: colors.interactive.accent, backgroundColor: colors.background.pressed },
  clientOptionPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  clientName: { ...typeScale.bodyStrong, color: colors.content.primary },
  clientContact: { ...typeScale.caption, color: colors.content.secondary },
  input: { ...typeScale.body, minHeight: dimensions.input, borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, color: colors.content.primary, paddingHorizontal: spacing[4] },
  inputFocused: { borderColor: colors.interactive.accent, borderWidth: borders.width + 1 },
  total: { ...typeScale.money, color: colors.content.primary, marginTop: spacing[1] },
  error: { ...typeScale.body, color: colors.status.negative },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
});
