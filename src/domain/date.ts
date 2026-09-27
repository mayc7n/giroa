function assertDate(day: number, month: number, year: number, message: string): void {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(message);
  }
}

export function parseBRDateToISO(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error('Informe uma data válida no formato DD/MM/AAAA.');
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  assertDate(day, month, year, 'Informe uma data válida no formato DD/MM/AAAA.');
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatISODateToBR(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) throw new Error('Informe uma data ISO válida.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  assertDate(day, month, year, 'Informe uma data ISO válida.');
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function assertISODate(value: string): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) throw new Error('A data do recebimento deve ser válida.');
  assertDate(Number(match[3]), Number(match[2]), Number(match[1]), 'A data do recebimento deve ser válida.');
}
