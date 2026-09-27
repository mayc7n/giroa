import type { Payment } from './types';

function assertNonNegativeCents(value: number, message: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(message);
  }
}

export function calculateBalance(totalCents: number, payments: Payment[]): number {
  assertNonNegativeCents(totalCents, 'O total deve ser inteiro em centavos.');

  const receivedCents = payments
    .filter((payment) => payment.status === 'active')
    .reduce((total, payment) => {
      assertNonNegativeCents(payment.amountCents, 'O recebimento deve ser não negativo.');
      return total + payment.amountCents;
    }, 0);

  if (!Number.isSafeInteger(receivedCents) || receivedCents > totalCents) {
    throw new Error('Os recebimentos ativos não podem superar o total.');
  }

  return totalCents - receivedCents;
}

export function validatePaymentAmount(amountCents: number, balanceCents: number): void {
  assertNonNegativeCents(balanceCents, 'O saldo deve ser inteiro em centavos.');
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error('O recebimento deve ser maior que zero.');
  }
  if (amountCents > balanceCents) {
    throw new Error('O recebimento não pode superar o saldo a receber.');
  }
}
