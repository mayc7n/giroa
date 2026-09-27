import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createRuntimeId, currentCivilDate } from '@/application/runtime';
import { formatCentsToBRL, parseMoneyToCents } from '@/domain/money';

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
  const [paymentDate, setPaymentDate] = useState(currentCivilDate());
  const [method, setMethod] = useState('pix');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        paymentDate: paymentDate.trim(),
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
            placeholder="R$ 0,00"
            returnKeyType="next"
            style={styles.input}
            value={amount}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data do recebimento</Text>
          <TextInput
            accessibilityLabel="Data do recebimento"
            keyboardType="numbers-and-punctuation"
            onChangeText={setPaymentDate}
            placeholder="AAAA-MM-DD"
            style={styles.input}
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
                style={[styles.methodOption, method === paymentMethod.value && styles.methodOptionSelected]}
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
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{submitting ? 'Registrando…' : 'Registrar recebimento'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 24, gap: 16 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  balance: { color: '#173C35', fontSize: 20, fontWeight: '800' },
  field: { gap: 8 },
  label: { color: '#273632', fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 12, backgroundColor: '#FFFFFF', color: '#17211F', fontSize: 17, paddingHorizontal: 14 },
  methodOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodOption: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 11, backgroundColor: '#FFFFFF', paddingHorizontal: 15 },
  methodOptionSelected: { borderColor: '#0B776D', backgroundColor: '#E7F2EF' },
  methodText: { color: '#17211F', fontSize: 15, fontWeight: '700' },
  error: { color: '#A3312D', fontSize: 15, lineHeight: 21 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
