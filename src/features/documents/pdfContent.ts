import type { PaymentRecord, QuoteRecord } from '@/data/sqliteTypes';
import { formatISODateToBR } from '@/domain/date';
import { formatCentsToBRL } from '@/domain/money';

const quoteStatusLabels: Record<QuoteRecord['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function formatDate(value: string): string {
  try {
    return formatISODateToBR(value);
  } catch {
    return value;
  }
}

function formatQuantity(quantityMilli: number): string {
  const integerPart = Math.floor(quantityMilli / 1000);
  const fractionPart = String(quantityMilli % 1000).padStart(3, '0').replace(/0+$/, '');
  return fractionPart ? `${integerPart},${fractionPart}` : String(integerPart);
}

function documentShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 28px; }
      body { color: #17211F; font-family: Arial, sans-serif; margin: 0; }
      h1 { color: #0B776D; font-size: 24px; margin: 0 0 4px; }
      h2 { font-size: 18px; margin: 24px 0 8px; }
      .muted { color: #4A5753; }
      .header { border-bottom: 2px solid #0B776D; margin-bottom: 20px; padding-bottom: 12px; }
      .label { color: #4A5753; font-size: 12px; text-transform: uppercase; }
      .value { font-size: 16px; margin-top: 3px; }
      table { border-collapse: collapse; margin-top: 12px; width: 100%; }
      th, td { border-bottom: 1px solid #D8E0DC; padding: 8px 4px; text-align: left; }
      th { color: #34564F; font-size: 12px; text-transform: uppercase; }
      .number { text-align: right; }
      .total { border-top: 2px solid #0B776D; font-size: 18px; font-weight: bold; margin-top: 16px; padding-top: 12px; text-align: right; }
      .notice { background: #F7F5F0; color: #4A5753; font-size: 12px; margin-top: 28px; padding: 12px; }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export function buildQuotePdfHtml(input: { quote: QuoteRecord; clientName: string; clientContact?: string | null }): string {
  const { quote } = input;
  const items = quote.items.length === 0
    ? '<tr><td colspan="4">Nenhum item informado.</td></tr>'
    : quote.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.description)}</td>
        <td class="number">${formatQuantity(item.quantityMilli)}</td>
        <td class="number">${formatCentsToBRL(item.unitPriceCents)}</td>
        <td class="number">${formatCentsToBRL(item.totalCents)}</td>
      </tr>`).join('');
  const validity = quote.validUntil ? `Validade: ${formatDate(quote.validUntil)}` : 'Validade não informada';
  const contact = input.clientContact ? `<div class="muted">${escapeHtml(input.clientContact)}</div>` : '';

  return documentShell('Orçamento - Giroa', `
    <div class="header">
      <h1>ORÇAMENTO</h1>
      <div class="muted">Giroa · ${escapeHtml(quoteStatusLabels[quote.status])}</div>
    </div>
    <div class="label">Cliente</div>
    <div class="value">${escapeHtml(input.clientName)}</div>
    ${contact}
    <h2>${escapeHtml(quote.description)}</h2>
    <div class="muted">${escapeHtml(validity)}</div>
    <table>
      <thead><tr><th>Descrição</th><th class="number">Qtd.</th><th class="number">Unitário</th><th class="number">Total</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="muted">Desconto: ${formatCentsToBRL(quote.discountCents)}</div>
    <div class="total">Total: ${formatCentsToBRL(quote.totalCents)}</div>
  `);
}

export function buildReceiptPdfHtml(input: {
  clientName: string;
  serviceDescription: string;
  payment: PaymentRecord;
  serviceTotalCents: number;
  balanceCents: number;
}): string {
  if (input.payment.status !== 'active') {
    throw new Error('O recibo exige um recebimento ativo.');
  }

  return documentShell('Recibo - Giroa', `
    <div class="header">
      <h1>RECIBO</h1>
      <div class="muted">Giroa · Recebimento registrado</div>
    </div>
    <div class="label">Recebemos de</div>
    <div class="value">${escapeHtml(input.clientName)}</div>
    <h2>${escapeHtml(input.serviceDescription)}</h2>
    <div class="label">Valor recebido</div>
    <div class="value">${formatCentsToBRL(input.payment.amountCents)}</div>
    <p class="muted">Data: ${formatDate(input.payment.paymentDate)} · Forma: ${escapeHtml(paymentMethodLabels[input.payment.method] ?? input.payment.method)}</p>
    <p class="muted">Total do serviço: ${formatCentsToBRL(input.serviceTotalCents)} · Saldo a receber: ${formatCentsToBRL(input.balanceCents)}</p>
    <div class="notice">Este recibo comprova apenas o recebimento registrado no Giroa. Este recibo não é nota fiscal.</div>
  `);
}
