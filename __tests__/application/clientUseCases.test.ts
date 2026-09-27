import type { ClientRepository } from '@/application/ports';
import { createClientUseCases } from '@/application/clientUseCases';

describe('client use cases', () => {
  it('rejects a client without a name', async () => {
    const clients = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({
      clients,
      idFactory: () => 'client-1',
      clock: () => '2026-09-27T12:00:00.000Z',
    });

    await expect(useCases.register({ name: '  ', contact: '' })).rejects.toThrow();
    expect(clients.create).not.toHaveBeenCalled();
  });

  it('registers a client with normalized name and optional contact', async () => {
    const clients = {
      create: jest.fn(async (input) => input),
      list: jest.fn(),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({
      clients,
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
      list: jest.fn(async () => [
        { id: 'client-1', name: 'Ana Souza', normalizedName: 'ana souza', contact: '111' },
        { id: 'client-2', name: 'Ana Souza', normalizedName: 'ana souza', contact: '222' },
      ]),
      getById: jest.fn(),
    } satisfies ClientRepository;
    const useCases = createClientUseCases({ clients, idFactory: () => 'unused', clock: () => 'now' });

    await expect(useCases.findByName('ana souza')).resolves.toMatchObject({ kind: 'requiresChoice' });
  });
});
