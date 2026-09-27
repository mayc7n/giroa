import { calculateBalance, validatePaymentAmount } from '@/domain/payment';

describe('payments', () => {
  it('leaves R$ 550,00 after receiving R$ 300,00 from R$ 850,00', () => {
    const balance = calculateBalance(85000, [{ amountCents: 30000, status: 'active' }]);

    expect(balance).toBe(55000);
  });

  it('reaches zero after settlement and ignores reversed payments', () => {
    expect(
      calculateBalance(85000, [
        { amountCents: 30000, status: 'active' },
        { amountCents: 55000, status: 'active' },
        { amountCents: 10000, status: 'reversed' },
      ]),
    ).toBe(0);
  });

  it('rejects payments above balance and non-positive amounts', () => {
    expect(() => validatePaymentAmount(55001, 55000)).toThrow();
    expect(() => validatePaymentAmount(0, 55000)).toThrow();
    expect(() => validatePaymentAmount(-1, 55000)).toThrow();
  });
});
