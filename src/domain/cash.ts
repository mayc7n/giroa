export type CashRecord = {
  amountCents: number;
  status: 'active' | 'reversed';
};

export function sumActiveCents(records: CashRecord[]): number {
  const total = records
    .filter((record) => record.status === 'active')
    .reduce((sum, record) => {
      if (!Number.isSafeInteger(record.amountCents) || record.amountCents < 0) {
        throw new Error('O valor do caixa deve ser inteiro em centavos não negativo.');
      }
      return sum + record.amountCents;
    }, 0);

  if (!Number.isSafeInteger(total)) {
    throw new Error('O total do caixa excede o limite seguro.');
  }
  return total;
}

export function calculateNetCashBalance(entries: CashRecord[], exits: CashRecord[]): number {
  const balance = sumActiveCents(entries) - sumActiveCents(exits);
  if (!Number.isSafeInteger(balance)) {
    throw new Error('O saldo do caixa excede o limite seguro.');
  }
  return balance;
}
