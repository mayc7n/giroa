import type { QuoteItemInput, QuoteTotals } from './types';

function assertSafeInteger(value: number, message: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(message);
  }
}

function calculateLineTotalCents(item: QuoteItemInput): number {
  if (!item.description.trim()) {
    throw new Error('Cada item precisa de uma descrição.');
  }
  assertSafeInteger(item.quantityMilli, 'A quantidade deve ser inteira em milésimos.');
  assertSafeInteger(item.unitPriceCents, 'O preço deve ser inteiro em centavos.');
  if (item.quantityMilli <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }
  if (item.unitPriceCents < 0) {
    throw new Error('O preço não pode ser negativo.');
  }

  const product = item.quantityMilli * item.unitPriceCents;
  assertSafeInteger(product, 'O total do item excede o limite suportado.');
  return Math.floor((product + 500) / 1000);
}

export function calculateQuoteTotal(
  items: QuoteItemInput[],
  discountCents: number,
): QuoteTotals {
  if (items.length === 0) {
    throw new Error('O orçamento precisa de pelo menos um item.');
  }
  assertSafeInteger(discountCents, 'O desconto deve ser inteiro em centavos.');
  if (discountCents < 0) {
    throw new Error('O desconto não pode ser negativo.');
  }

  const lineTotalsCents = items.map(calculateLineTotalCents);
  const subtotalCents = lineTotalsCents.reduce((total, line) => total + line, 0);
  assertSafeInteger(subtotalCents, 'O subtotal excede o limite suportado.');
  if (discountCents > subtotalCents) {
    throw new Error('O desconto não pode superar o subtotal.');
  }

  return {
    lineTotalsCents,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}
