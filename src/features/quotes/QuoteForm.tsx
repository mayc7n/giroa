import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatCentsToBRL, parseMoneyToCents } from '@/domain/money';
import { calculateQuoteTotal } from '@/domain/quote';
import type { ClientSummary, QuoteItemInput } from '@/domain/types';

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
                style={[styles.clientOption, client.id === clientId && styles.clientOptionSelected]}
              >
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientContact}>{client.contact || 'Sem contato informado'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput accessibilityLabel="Descrição do orçamento" onChangeText={setDescription} placeholder="Ex.: Instalação" returnKeyType="next" style={styles.input} value={description} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput accessibilityLabel="Quantidade do item" keyboardType="decimal-pad" onChangeText={setQuantity} returnKeyType="next" style={styles.input} value={quantity} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Preço unitário</Text>
          <TextInput accessibilityLabel="Preço unitário do item" keyboardType="decimal-pad" onChangeText={setUnitPrice} placeholder="R$ 0,00" returnKeyType="next" style={styles.input} value={unitPrice} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Desconto</Text>
          <TextInput accessibilityLabel="Desconto do orçamento" keyboardType="decimal-pad" onChangeText={setDiscount} returnKeyType="done" style={styles.input} value={discount} />
        </View>
        <Text style={styles.total}>Total {formatCentsToBRL(total)}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Salvar orçamento</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 24, gap: 15 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  field: { gap: 8 },
  label: { color: '#273632', fontSize: 15, fontWeight: '700' },
  clientOptions: { gap: 8 },
  clientOption: { gap: 3, padding: 12, borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 12, backgroundColor: '#FFFFFF' },
  clientOptionSelected: { borderColor: '#0B776D', backgroundColor: '#E7F2EF' },
  clientName: { color: '#17211F', fontSize: 16, fontWeight: '700' },
  clientContact: { color: '#4A5753', fontSize: 14 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 12, backgroundColor: '#FFFFFF', color: '#17211F', fontSize: 17, paddingHorizontal: 14 },
  total: { color: '#173C35', fontSize: 22, fontWeight: '800', marginTop: 4 },
  error: { color: '#A3312D', fontSize: 15 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
