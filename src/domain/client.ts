import type { ClientSelection, ClientSummary } from './types';

export function normalizeClientName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeClientContact(contact: string): string {
  return contact
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function filterClientSummaries(clients: ClientSummary[], query: string): ClientSummary[] {
  const normalizedNameQuery = normalizeClientName(query);
  const normalizedContactQuery = normalizeClientContact(query);
  if (!normalizedNameQuery && !normalizedContactQuery) return clients;

  return clients.filter((client) => (
    normalizeClientName(client.name).includes(normalizedNameQuery)
    || normalizeClientContact(client.contact ?? '').includes(normalizedContactQuery)
  ));
}

export function resolveClientSelection(
  clients: ClientSummary[],
  normalizedName: string,
): ClientSelection {
  const target = normalizeClientName(normalizedName);
  const matches = target ? clients.filter((client) => normalizeClientName(client.name) === target) : [];

  if (matches.length === 0) {
    return { kind: 'none' };
  }
  if (matches.length === 1) {
    return { kind: 'single', client: matches[0] };
  }
  return { kind: 'requiresChoice', clients: matches };
}
