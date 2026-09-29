import { filterClientSummaries, resolveClientSelection } from '@/domain/client';

describe('client selection', () => {
  const clients = [
    { id: 'ana-1', name: 'Ana Souza', contact: '(11) 99999-0001' },
    { id: 'ana-2', name: 'Ana Souza', contact: '(11) 99999-0002' },
  ];

  it('requires an explicit choice for homonyms', () => {
    expect(resolveClientSelection(clients, 'ana souza')).toEqual({
      kind: 'requiresChoice',
      clients,
    });
  });

  it('returns a single match without silently choosing between people', () => {
    expect(resolveClientSelection([clients[0]], ' ANA SÓUZA ')).toEqual({
      kind: 'single',
      client: clients[0],
    });
  });

  it('reports when no client matches', () => {
    expect(resolveClientSelection(clients, 'Carlos')).toEqual({ kind: 'none' });
  });

  it('filters clients by an accent-insensitive name fragment', () => {
    const searchedClients = [
      { id: 'joao-1', name: 'João da Silva', contact: 'joao@example.com' },
      { id: 'ana-1', name: 'Ana Souza', contact: '11999990001' },
    ];

    expect(filterClientSummaries(searchedClients, ' joao da ')).toEqual([searchedClients[0]]);
  });

  it('filters formatted contacts and reports no result for an unknown query', () => {
    const searchedClients = [
      { id: 'joao-1', name: 'João da Silva', contact: '(11) 99999-0001' },
      { id: 'ana-1', name: 'Ana Souza', contact: 'ana@example.com' },
    ];

    expect(filterClientSummaries(searchedClients, '119999')).toEqual([searchedClients[0]]);
    expect(filterClientSummaries(searchedClients, 'Carlos')).toEqual([]);
  });
});
