import { calculateQuoteTotal } from '@/domain/quote';

describe('quote totals', () => {
  it('rounds a fractional quantity half-up using integer arithmetic', () => {
    const result = calculateQuoteTotal(
      [{ description: 'Peça', quantityMilli: 1500, unitPriceCents: 333 }],
      0,
    );

    expect(result.lineTotalsCents).toEqual([500]);
    expect(result.subtotalCents).toBe(500);
    expect(result.totalCents).toBe(500);
  });

  it('calculates the required R$ 850,00 example', () => {
    const result = calculateQuoteTotal(
      [{ description: 'Serviço', quantityMilli: 1000, unitPriceCents: 85000 }],
      0,
    );

    expect(result.totalCents).toBe(85000);
  });

  it('rejects invalid quantities, prices and discounts', () => {
    expect(() =>
      calculateQuoteTotal([{ description: 'x', quantityMilli: 0, unitPriceCents: 100 }], 0),
    ).toThrow();
    expect(() =>
      calculateQuoteTotal([{ description: 'x', quantityMilli: 1000, unitPriceCents: -1 }], 0),
    ).toThrow();
    expect(() =>
      calculateQuoteTotal([{ description: 'x', quantityMilli: 1000, unitPriceCents: 100 }], -1),
    ).toThrow();
    expect(() =>
      calculateQuoteTotal([{ description: 'x', quantityMilli: 1000, unitPriceCents: 100 }], 101),
    ).toThrow();
  });
});
