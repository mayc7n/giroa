import type { PaymentRecord, QuoteRecord } from '@/data/sqliteTypes';
import { buildQuotePdfHtml, buildReceiptPdfHtml } from '@/features/documents/pdfContent';

const quote: QuoteRecord = {
  id: 'quote-1',
  clientId: 'client-1',
  description: 'Instalação de torneira <especial>',
  discountCents: 5000,
  validUntil: '2026-10-10',
  status: 'approved',
  totalCents: 80000,
  items: [{
    id: 'item-1',
    description: 'Mão de obra & peça',
    quantityMilli: 1000,
    unitPriceCents: 85000,
    totalCents: 85000,
    position: 0,
  }],
  createdAt: '2026-09-27T12:00:00.000Z',
  updatedAt: '2026-09-27T12:00:00.000Z',
};

const payment: PaymentRecord = {
  id: 'payment-1',
  serviceId: 'service-1',
  amountCents: 30000,
  paymentDate: '2026-09-27',
  method: 'pix',
  clientOperationId: 'operation-1',
  status: 'active',
  createdAt: '2026-09-27T13:00:00.000Z',
  reversedAt: null,
};

describe('conteúdo dos documentos', () => {
  it('gera orçamento identificado e escapa texto informado pelo usuário', () => {
    const html = buildQuotePdfHtml({ quote, clientName: 'Ana & João' });

    expect(html).toContain('ORÇAMENTO');
    expect(html).toContain('Ana &amp; João');
    expect(html).toContain('Instalação de torneira &lt;especial&gt;');
    expect(html).toContain('R$ 800,00');
    expect(html).not.toContain('<especial>');
  });

  it('gera recibo somente para recebimento ativo e o identifica como recibo', () => {
    const html = buildReceiptPdfHtml({
      clientName: 'Ana Souza',
      serviceDescription: 'Instalação',
      payment,
      serviceTotalCents: 85000,
      balanceCents: 55000,
    });

    expect(html).toContain('RECIBO');
    expect(html).toContain('R$ 300,00');
    expect(html).toContain('Este recibo não é nota fiscal');
    expect(() => buildReceiptPdfHtml({
      clientName: 'Ana Souza',
      serviceDescription: 'Instalação',
      payment: { ...payment, status: 'reversed' },
      serviceTotalCents: 85000,
      balanceCents: 85000,
    })).toThrow(/recebimento ativo/i);
  });
});
