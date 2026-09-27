import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createRuntimeId, currentCivilDate } from '@/application/runtime';
import { formatISODateToBR, parseBRDateToISO } from '@/domain/date';
import { parseMoneyToCents } from '@/domain/money';

type ExpenseFormProps = {
  onSubmit: (input: {
    description: string;
    amountCents: number;
    expenseDate: string;
    category: string;
    clientOperationId: string;
  }) => Promise<void> | void;
};

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(formatISODateToBR(currentCivilDate()));
  const [category, setCategory] = useState('outros');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operationIdRef = useRef<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const operationId = operationIdRef.current ?? createRuntimeId('expense-operation');
      operationIdRef.current = operationId;
      await onSubmit({
        description,
        amountCents: parseMoneyToCents(amount),
        expenseDate: parseBRDateToISO(expenseDate),
        category,
        clientOperationId: operationId,
      });
      operationIdRef.current = null;
      setDescription('');
      setAmount('');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível registrar a saída.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrar saída</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Descrição da saída</Text>
          <TextInput
            accessibilityLabel="Descrição da saída"
            onChangeText={setDescription}
            placeholder="Ex.: compra de material"
            style={styles.input}
            value={description}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor da saída</Text>
          <TextInput
            accessibilityLabel="Valor da saída"
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="R$ 0,00"
            style={styles.input}
            value={amount}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data da saída</Text>
          <TextInput
            accessibilityLabel="Data da saída"
            keyboardType="numbers-and-punctuation"
            onChangeText={setExpenseDate}
            placeholder="DD/MM/AAAA"
            style={styles.input}
            value={expenseDate}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria da saída</Text>
          <TextInput
            accessibilityLabel="Categoria da saída"
            onChangeText={setCategory}
            placeholder="Ex.: material"
            style={styles.input}
            value={category}
          />
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{submitting ? 'Registrando…' : 'Registrar saída'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 24, gap: 16 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  field: { gap: 8 },
  label: { color: '#273632', fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 12, backgroundColor: '#FFFFFF', color: '#17211F', fontSize: 17, paddingHorizontal: 14 },
  error: { color: '#A3312D', fontSize: 15, lineHeight: 21 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
