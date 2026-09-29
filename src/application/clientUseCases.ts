import { normalizeClientName, resolveClientSelection } from '@/domain/client';
import type { ClientSelection } from '@/domain/types';
import type { ClientRecord, PaymentRecord, QuoteRecord, ServiceRecord } from '@/data/sqliteTypes';
import type { ClientRepository, CreateClientInput, PaymentRepository, QuoteRepository, ServiceRepository, UpdateClientInput } from './ports';

type ClientUseCaseDependencies = {
  clients: ClientRepository;
  quotes: Pick<QuoteRepository, 'listByClientId'>;
  services: Pick<ServiceRepository, 'listByClientId'>;
  payments: Pick<PaymentRepository, 'listByServiceId'>;
  idFactory: () => string;
  clock: () => string;
};

export type ClientDetails = {
  client: ClientRecord;
  quotes: QuoteRecord[];
  services: ServiceRecord[];
  payments: PaymentRecord[];
};

export function createClientUseCases({ clients, quotes, services, payments, idFactory, clock }: ClientUseCaseDependencies) {
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
    async update(id: string, input: { name: string; contact?: string | null }) {
      const current = await clients.getById(id);
      if (!current) {
        throw new Error('Cliente não encontrado.');
      }

      const name = input.name.trim();
      if (!name) {
        throw new Error('Informe o nome do cliente.');
      }

      const update: UpdateClientInput = {
        id: current.id,
        name,
        normalizedName: normalizeClientName(name),
        contact: input.contact?.trim() || null,
        updatedAt: clock(),
      };
      return clients.update(update);
    },
    async getDetails(id: string): Promise<ClientDetails> {
      const client = await clients.getById(id);
      if (!client) {
        throw new Error('Cliente não encontrado.');
      }

      const [quotesFound, servicesFound] = await Promise.all([
        quotes.listByClientId(id),
        services.listByClientId(id),
      ]);
      const paymentsByService = await Promise.all(
        servicesFound.map((service) => payments.listByServiceId(service.id)),
      );

      return {
        client,
        quotes: quotesFound,
        services: servicesFound,
        payments: paymentsByService.flat(),
      };
    },
  };
}
