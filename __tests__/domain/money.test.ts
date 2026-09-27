import { formatCentsToBRL, parseMoneyToCents } from '@/domain/money';

describe('money', () => {
  it('converts Brazilian money input to integer cents', () => {
    expect(parseMoneyToCents('R$ 850,00')).toBe(85000);
    expect(parseMoneyToCents('850,00')).toBe(85000);
    expect(parseMoneyToCents('1.234,56')).toBe(123456);
  });

  it('rejects invalid, negative and over-precise values', () => {
    expect(() => parseMoneyToCents('')).toThrow();
    expect(() => parseMoneyToCents('-10,00')).toThrow();
    expect(() => parseMoneyToCents('10,001')).toThrow();
    expect(() => parseMoneyToCents('10.00')).toThrow();
  });

  it('formats integer cents as Brazilian reais', () => {
    expect(formatCentsToBRL(85000)).toBe('R$ 850,00');
  });
});
