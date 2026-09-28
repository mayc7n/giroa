import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { borders, colors, dimensions, radii, spacing, typeScale } from '@/ui/tokens';

type ClientFormProps = {
  onSubmit: (input: { name: string; contact: string | null }) => Promise<void> | void;
  submitting?: boolean;
};

export default function ClientForm({ onSubmit, submitting = false }: ClientFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

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
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ex.: Ana Souza"
            placeholderTextColor={colors.content.muted}
            returnKeyType="next"
            style={[styles.input, inputFocused && styles.inputFocused]}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contato (opcional)</Text>
          <TextInput
            accessibilityLabel="Contato do cliente"
            keyboardType="phone-pad"
            onChangeText={setContact}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="WhatsApp ou telefone"
            placeholderTextColor={colors.content.muted}
            returnKeyType="done"
            style={[styles.input, inputFocused && styles.inputFocused]}
            value={contact}
          />
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [styles.button, pressed && !submitting && styles.buttonPressed, submitting && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, submitting && styles.buttonDisabledText]}>{submitting ? 'Salvando…' : 'Salvar cliente'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.canvas },
  content: { padding: spacing[5], gap: spacing[4] },
  title: { ...typeScale.title, color: colors.content.primary },
  description: { ...typeScale.body, color: colors.content.secondary },
  field: { gap: spacing[2] },
  label: { ...typeScale.bodyStrong, color: colors.content.primary },
  input: { ...typeScale.body, minHeight: dimensions.input, borderWidth: borders.width, borderColor: colors.border.default, borderRadius: radii.md, backgroundColor: colors.background.surface, color: colors.content.primary, paddingHorizontal: spacing[4] },
  inputFocused: { borderColor: colors.interactive.accent, borderWidth: borders.width + 1 },
  error: { ...typeScale.body, color: colors.status.negative },
  button: { minHeight: dimensions.action, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.interactive.accent, paddingHorizontal: spacing[4] },
  buttonPressed: { backgroundColor: colors.interactive.accentPressed, opacity: 0.92 },
  buttonDisabled: { backgroundColor: colors.background.surface },
  buttonText: { ...typeScale.bodyStrong, color: colors.background.canvas },
  buttonDisabledText: { color: colors.content.muted },
});
