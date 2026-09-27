import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import * as Sharing from 'expo-sharing';

import { createBackupUseCases } from '@/application/backupUseCases';
import { parseBackup } from '@/data/backup';

export default function BackupActions() {
  const db = useSQLiteContext();
  const useCases = createBackupUseCases(db);
  const [busy, setBusy] = useState<'exporting' | 'restoring' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exportData() {
    setBusy('exporting');
    setMessage(null);
    setError(null);
    try {
      const content = await useCases.exportData();
      const file = new File(Paths.cache, `giroa-backup-${Date.now()}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(content);

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('O compartilhamento não está disponível neste dispositivo.');
      }
      await Sharing.shareAsync(file.uri, {
        dialogTitle: 'Compartilhar backup do Giroa',
        mimeType: 'application/json',
        UTI: 'public.json',
      });
      setMessage('Backup pronto para compartilhar.');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Não foi possível exportar os dados.');
    } finally {
      setBusy(null);
    }
  }

  async function restoreData() {
    setBusy('restoring');
    setMessage(null);
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled || !result.assets[0]) return;

      const content = await new File(result.assets[0].uri).text();
      parseBackup(content);
      const confirmed = await confirmRestore();
      if (!confirmed) return;

      await useCases.restoreData(content);
      setMessage('Dados restaurados. Abra novamente as telas para consultar o conteúdo importado.');
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Não foi possível restaurar os dados.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados locais</Text>
      <Text style={styles.description}>
        Exporte uma cópia dos seus dados ou restaure um arquivo do Giroa. A restauração substitui os dados atuais após sua confirmação.
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy !== null }}
          disabled={busy !== null}
          onPress={exportData}
          style={[styles.button, busy !== null && styles.disabled]}
        >
          <Text style={styles.buttonText}>{busy === 'exporting' ? 'Preparando…' : 'Exportar dados'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy !== null }}
          disabled={busy !== null}
          onPress={restoreData}
          style={[styles.secondaryButton, busy !== null && styles.disabled]}
        >
          <Text style={styles.secondaryText}>{busy === 'restoring' ? 'Lendo arquivo…' : 'Restaurar dados'}</Text>
        </Pressable>
      </View>
      {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function confirmRestore(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Substituir dados atuais?',
      'A restauração substituirá clientes, orçamentos, serviços, recebimentos e despesas deste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Restaurar', style: 'destructive', onPress: () => resolve(true) },
      ],
    );
  });
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: '#E7F2EF' },
  title: { color: '#173C35', fontSize: 18, fontWeight: '800' },
  description: { color: '#34564F', fontSize: 15, lineHeight: 21 },
  actions: { gap: 10 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#0B776D', paddingHorizontal: 16 },
  secondaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1, borderColor: '#0B776D', paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryText: { color: '#0B776D', fontSize: 15, fontWeight: '800' },
  message: { color: '#173C35', fontSize: 15, lineHeight: 21 },
  error: { color: '#A3312D', fontSize: 15, lineHeight: 21 },
});
