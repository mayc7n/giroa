import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createRuntimeId, currentCivilDate } from '@/application/runtime';
import { formatISODateToBR, parseBRDateToISO } from '@/domain/date';
import { formatCentsToBRL, parseMoneyToCents } from '@/domain/money';
import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type PaymentFormProps = {
  balanceCents: number;
  onSubmit: (input: {
    amountCents: number;
    paymentDate: string;
    method: string;
    clientOperationId: string;
  }) => Promise<void> | void;
};

const methods = [
  { value: 'pix', label: 'Pix' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
];

export default function PaymentForm({ balanceCents, onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(formatISODateToBR(currentCivilDate()));
  const [method, setMethod] = useState('pix');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const operationIdRef = useRef<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const amountCents = parseMoneyToCents(amount);
      const operationId = operationIdRef.current ?? createRuntimeId('payment-operation');
      operationIdRef.current = operationId;
      await onSubmit({
        amountCents,
        paymentDate: parseBRDateToISO(paymentDate),
        method,
        clientOperationId: operationId,
      });
      operationIdRef.current = null;
      setAmount('');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível registrar o recebimento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrar recebimento</Text>
        <Text style={styles.balance}>Saldo a receber {formatCentsToBRL(balanceCents)}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Valor recebido</Text>
          <TextInput
            accessibilityLabel="Valor recebido"
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.content.muted}
            returnKeyType="next"
            style={[styles.input, inputFocused && styles.inputFocused]}
            value={amount}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data do recebimento</Text>
          <TextInput
            accessibilityLabel="Data do recebimento"
            keyboardType="numbers-and-punctuation"
            onChangeText={setPaymentDate}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.content.muted}
            style={[styles.input, inputFocused && styles.inputFocused]}
            value={paymentDate}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Forma de pagamento</Text>
          <View style={styles.methodOptions}>
            {methods.map((paymentMethod) => (
              <Pressable
                key={paymentMethod.value}
                accessibilityRole="button"
                accessibilityState={{ selected: method === paymentMethod.value }}
                onPress={() => setMethod(paymentMethod.value)}
                style={({ pressed }) => [styles.methodOption, method === paymentMethod.value && styles.methodOptionSelected, pressed && styles.methodOptionPressed]}
              >
                <Text style={styles.methodText}>{paymentMethod.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [styles.button, pressed && !submitting && styles.buttonPressed, submitting && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, submitting && styles.buttonDisabledText]}>{submitting ? 'Registrando…' : 'Registrar recebimento'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.canvas },
  content: { padding: spacing[5], gap: spacing[4] },
  title: { ...typeScale.title, color: colors.content.primary },
  balance: { ...typeScale.section, color: colors.content.primary },
  field: { gap: spacing[2] },
  label: { ...typeScale.bodyStrong, color: colors.content.primary },
  input: { ...typeScale.body, minHeight: dimensions.input, borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, color: colors.content.primary, paddingHorizontal: spacing[4] },
  inputFocused: { borderColor: colors.interactive.accent, borderWidth: borders.width + 1 },
  methodOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  methodOption: { minHeight: dimensions.touchTarget, justifyContent: 'center', borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, paddingHorizontal: spacing[4] },
  methodOptionSelected: { borderColor: colors.interactive.accent, backgroundColor: colors.background.pressed },
  methodOptionPressed: { backgroundColor: colors.background.pressed, opacity: 0.92 },
  methodText: { ...typeScale.bodyStrong, color: colors.content.primary },
  error: { ...typeScale.body, color: colors.status.negative },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  buttonDisabled: { backgroundColor: colors.background.surface },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  buttonDisabledText: { color: colors.content.muted },
});
