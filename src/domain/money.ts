const BRAZILIAN_MONEY_PATTERN = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
const DECIMAL_MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;

function assertNonNegativeCents(cents: number): void {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new Error('O valor deve ser um número inteiro de centavos não negativo.');
  }
}

export function parseMoneyToCents(input: string): number {
  const value = input.trim().replace(/^R\$\s*/i, '');

  if (!value) {
    throw new Error('Informe um valor em reais com até duas casas decimais.');
  }

  let integerPart: string;
  let decimalPart = '';
  if (value.includes(',')) {
    if (!BRAZILIAN_MONEY_PATTERN.test(value)) {
      throw new Error('Informe um valor em reais com até duas casas decimais.');
    }
    [integerPart, decimalPart = ''] = value.split(',');
  } else if (DECIMAL_MONEY_PATTERN.test(value)) {
    [integerPart, decimalPart = ''] = value.split('.');
  } else if (BRAZILIAN_MONEY_PATTERN.test(value)) {
    integerPart = value;
  } else {
    throw new Error('Informe um valor em reais com até duas casas decimais.');
  }

  const integerDigits = integerPart.replaceAll('.', '');
  const cents = Number(`${integerDigits}${decimalPart.padEnd(2, '0')}`);

  assertNonNegativeCents(cents);
  return cents;
}

export function formatCentsToBRL(cents: number): string {
  assertNonNegativeCents(cents);

  const value = String(cents).padStart(3, '0');
  const integerPart = value.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = value.slice(-2);

  return `R$ ${integerPart},${decimalPart}`;
}

export function formatSignedCentsToBRL(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('O valor deve ser um número inteiro de centavos.');
  }

  const sign = cents < 0 ? '-' : '';
  return `${sign}${formatCentsToBRL(Math.abs(cents))}`;
}
