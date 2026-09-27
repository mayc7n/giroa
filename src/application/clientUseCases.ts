import { normalizeClientName, resolveClientSelection } from '@/domain/client';
import type { ClientSelection } from '@/domain/types';
import type { ClientRepository, CreateClientInput } from './ports';

type ClientUseCaseDependencies = {
  clients: ClientRepository;
  idFactory: () => string;
  clock: () => string;
};

export function createClientUseCases({ clients, idFactory, clock }: ClientUseCaseDependencies) {
  return {
    async register(input: { name: string; contact?: string | null }) {
      const name = input.name.trim();
      if (!name) {
        throw new Error('Informe o nome do cliente.');
      }

      const now = clock();
      const record: CreateClientInput = {
        id: idFactory(),
        name,
        normalizedName: normalizeClientName(name),
        contact: input.contact?.trim() || null,
        createdAt: now,
        updatedAt: now,
      };
      return clients.create(record);
    },
    async findByName(name: string): Promise<ClientSelection> {
      const clientsFound = await clients.list();
      return resolveClientSelection(clientsFound, normalizeClientName(name));
    },
  };
}
