import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { sharePdf } from '@/features/documents/sharePdf';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(async () => ({ uri: 'file:///cache/document.pdf' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

describe('compartilhamento de PDF', () => {
  beforeEach(() => jest.clearAllMocks());

  it('converte HTML em PDF e compartilha o arquivo', async () => {
    await sharePdf('Compartilhar orçamento', '<html>Orçamento</html>');

    expect(Print.printToFileAsync).toHaveBeenCalledWith({ html: '<html>Orçamento</html>' });
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///cache/document.pdf', expect.objectContaining({
      dialogTitle: 'Compartilhar orçamento',
      mimeType: 'application/pdf',
    }));
  });

  it('informa quando o compartilhamento está indisponível', async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);

    await expect(sharePdf('Compartilhar recibo', '<html>Recibo</html>')).rejects.toThrow(/compartilhamento não está disponível/i);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});
