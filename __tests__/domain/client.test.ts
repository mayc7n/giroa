import { resolveClientSelection } from '@/domain/client';

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
});
