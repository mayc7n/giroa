import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type ClientFormProps = {
  onSubmit: (input: { name: string; contact: string | null }) => Promise<void> | void;
  submitting?: boolean;
};

export default function ClientForm({ onSubmit, submitting = false }: ClientFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }

    try {
      await onSubmit({ name, contact: contact.trim() || null });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível salvar o cliente.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Novo cliente</Text>
        <Text style={styles.description}>Só o nome é necessário para começar.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            accessibilityLabel="Nome do cliente"
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setName}
            placeholder="Ex.: Ana Souza"
            returnKeyType="next"
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contato (opcional)</Text>
          <TextInput
            accessibilityLabel="Contato do cliente"
            keyboardType="phone-pad"
            onChangeText={setContact}
            placeholder="WhatsApp ou telefone"
            returnKeyType="done"
            style={styles.input}
            value={contact}
          />
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{submitting ? 'Salvando…' : 'Salvar cliente'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { padding: 24, gap: 16 },
  title: { color: '#17211F', fontSize: 30, fontWeight: '800' },
  description: { color: '#4A5753', fontSize: 16, lineHeight: 23 },
  field: { gap: 8 },
  label: { color: '#273632', fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#B7C4BF', borderRadius: 12, backgroundColor: '#FFFFFF', color: '#17211F', fontSize: 17, paddingHorizontal: 14 },
  error: { color: '#A3312D', fontSize: 15, lineHeight: 21 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#0B776D', paddingHorizontal: 18 },
  buttonPressed: { opacity: 0.82 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
