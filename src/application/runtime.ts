export function createRuntimeId(prefix: string): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return `${prefix}-${randomUuid}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function currentInstant(): string {
  return new Date().toISOString();
}

export function currentCivilDate(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function currentCivilMonthPeriod(): { startDate: string; endDate: string } {
  const currentDate = currentCivilDate();
  const [year, month] = currentDate.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    startDate: `${currentDate.slice(0, 7)}-01`,
    endDate: `${currentDate.slice(0, 7)}-${String(lastDay).padStart(2, '0')}`,
  };
}
