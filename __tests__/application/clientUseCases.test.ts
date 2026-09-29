import type { ClientRepository } from '@/application/ports';
import { createClientUseCases } from '@/application/clientUseCases';

describe('client use cases', () => {
  it('rejects a client without a name', async () => {
    const clients = {
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({
      clients,
      quotes: { listByClientId: jest.fn() },
      services: { listByClientId: jest.fn() },
      payments: { listByServiceId: jest.fn() },
      idFactory: () => 'client-1',
      clock: () => '2026-09-27T12:00:00.000Z',
    });

    await expect(useCases.register({ name: '  ', contact: '' })).rejects.toThrow();
    expect(clients.create).not.toHaveBeenCalled();
  });

  it('registers a client with normalized name and optional contact', async () => {
    const clients = {
      create: jest.fn(async (input) => input),
      update: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({
      clients,
      quotes: { listByClientId: jest.fn() },
      services: { listByClientId: jest.fn() },
      payments: { listByServiceId: jest.fn() },
      idFactory: () => 'client-1',
      clock: () => '2026-09-27T12:00:00.000Z',
    });

    const result = await useCases.register({ name: ' Ana SÓUZA ', contact: ' 11999990000 ' });

    expect(result).toMatchObject({
      id: 'client-1',
      name: 'Ana SÓUZA',
      normalizedName: 'ana souza',
      contact: '11999990000',
    });
  });

  it('returns homonym candidates for explicit selection', async () => {
    const clients = {
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(async () => [
        { id: 'client-1', name: 'Ana Souza', normalizedName: 'ana souza', contact: '111' },
        { id: 'client-2', name: 'Ana Souza', normalizedName: 'ana souza', contact: '222' },
      ]),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({
      clients,
      quotes: { listByClientId: jest.fn() },
      services: { listByClientId: jest.fn() },
      payments: { listByServiceId: jest.fn() },
      idFactory: () => 'unused',
      clock: () => 'now',
    });

    await expect(useCases.findByName('ana souza')).resolves.toMatchObject({ kind: 'requiresChoice' });
  });

  it('updates only editable client fields and preserves the creation timestamp', async () => {
    const existingClient = {
      id: 'client-1',
      name: 'Ana Souza',
      normalizedName: 'ana souza',
      contact: '111',
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-01T12:00:00.000Z',
    };
    const clients = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(async () => existingClient),
      update: jest.fn(async (input) => ({ ...existingClient, ...input })),
    };
    const useCases = createClientUseCases({
      clients,
      quotes: { listByClientId: jest.fn() },
      services: { listByClientId: jest.fn() },
      payments: { listByServiceId: jest.fn() },
      idFactory: () => 'unused',
      clock: () => '2026-09-28T12:00:00.000Z',
    });

    await expect(useCases.update('client-1', { name: ' Ana Lima ', contact: ' 222 ' })).resolves.toMatchObject({
      id: 'client-1',
      name: 'Ana Lima',
      normalizedName: 'ana lima',
      contact: '222',
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-28T12:00:00.000Z',
    });
  });

  it('loads quotes, services and payments related to one client', async () => {
    const client = {
      id: 'client-1',
      name: 'Ana Souza',
      normalizedName: 'ana souza',
      contact: '111',
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-01T12:00:00.000Z',
    };
    const quote = {
      id: 'quote-1',
      clientId: 'client-1',
      description: 'Instalação',
      discountCents: 0,
      validUntil: null,
      status: 'approved' as const,
      totalCents: 50000,
      items: [],
      createdAt: '2026-09-02T12:00:00.000Z',
      updatedAt: '2026-09-02T12:00:00.000Z',
    };
    const service = {
      id: 'service-1',
      clientId: 'client-1',
      quoteId: 'quote-1',
      description: 'Instalação',
      totalCents: 50000,
      workStatus: 'planned' as const,
      createdAt: '2026-09-03T12:00:00.000Z',
      updatedAt: '2026-09-03T12:00:00.000Z',
    };
    const payment = {
      id: 'payment-1',
      serviceId: 'service-1',
      amountCents: 30000,
      paymentDate: '2026-09-04',
      method: 'pix',
      clientOperationId: 'op-1',
      status: 'active' as const,
      createdAt: '2026-09-04T12:00:00.000Z',
      reversedAt: null,
    };
    const clients = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(async () => client),
      update: jest.fn(),
    };
    const quotes = { listByClientId: jest.fn(async () => [quote]) };
    const services = { listByClientId: jest.fn(async () => [service]) };
    const payments = { listByServiceId: jest.fn(async () => [payment]) };
    const useCases = createClientUseCases({
      clients,
      quotes,
      services,
      payments,
      idFactory: () => 'unused',
      clock: () => 'now',
    });

    await expect(useCases.getDetails('client-1')).resolves.toEqual({
      client,
      quotes: [quote],
      services: [service],
      payments: [payment],
    });
    expect(quotes.listByClientId).toHaveBeenCalledWith('client-1');
    expect(services.listByClientId).toHaveBeenCalledWith('client-1');
    expect(payments.listByServiceId).toHaveBeenCalledWith('service-1');
  });
});
