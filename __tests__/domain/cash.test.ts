import { calculateNetCashBalance } from '@/domain/cash';

describe('cash domain', () => {
  it('calculates active entries and exits in integer cents', () => {
    expect(calculateNetCashBalance(
      [{ amountCents: 30000, status: 'active' }],
      [{ amountCents: 10000, status: 'active' }],
    )).toBe(20000);
  });

  it('keeps a negative net balance when active exits exceed entries', () => {
    expect(calculateNetCashBalance(
      [{ amountCents: 30000, status: 'active' }],
      [{ amountCents: 50000, status: 'active' }],
    )).toBe(-20000);
  });

  it('ignores reversed payments and expenses', () => {
    expect(calculateNetCashBalance(
      [
        { amountCents: 30000, status: 'active' },
        { amountCents: 90000, status: 'reversed' },
      ],
      [
        { amountCents: 10000, status: 'active' },
        { amountCents: 40000, status: 'reversed' },
      ],
    )).toBe(20000);
  });
});
