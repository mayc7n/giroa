import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createRuntimeId, currentCivilDate } from '@/application/runtime';
import { formatISODateToBR, parseBRDateToISO } from '@/domain/date';
import { parseMoneyToCents } from '@/domain/money';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

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
  flex: { flex: 1, backgroundColor: colors.background.canvas },
  content: { padding: spacing[5], gap: spacing[4] },
  title: { ...typeScale.title, color: colors.content.primary },
  field: { gap: spacing[2] },
  label: { ...typeScale.bodyStrong, color: colors.content.primary },
  input: { ...typeScale.body, minHeight: dimensions.input, borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, color: colors.content.primary, paddingHorizontal: spacing[4] },
  error: { ...typeScale.body, color: colors.status.negative },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
});
