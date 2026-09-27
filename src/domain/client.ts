import type { ClientSelection, ClientSummary } from './types';

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

export function resolveClientSelection(
  clients: ClientSummary[],
  normalizedName: string,
): ClientSelection {
  const target = normalizeName(normalizedName);
  const matches = target ? clients.filter((client) => normalizeName(client.name) === target) : [];

  if (matches.length === 0) {
    return { kind: 'none' };
  }
  if (matches.length === 1) {
    return { kind: 'single', client: matches[0] };
  }
  return { kind: 'requiresChoice', clients: matches };
}
