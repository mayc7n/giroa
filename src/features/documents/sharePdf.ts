import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function sharePdf(title: string, html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento não está disponível neste dispositivo.');
  }
  await Sharing.shareAsync(uri, {
    dialogTitle: title,
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
  });
}
