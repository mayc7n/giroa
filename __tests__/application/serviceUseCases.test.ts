import type { QuoteRepository, ServiceRepository } from '@/application/ports';
import type { QuoteRecord, ServiceRecord } from '@/data/sqliteTypes';
import { createServiceUseCases } from '@/application/serviceUseCases';

function makeQuote(status: QuoteRecord['status']): QuoteRecord {
  return {
    id: 'quote-1',
    clientId: 'client-1',
    description: 'Instalação',
    discountCents: 0,
    validUntil: null,
    status,
    totalCents: 85000,
    items: [],
    createdAt: '2026-09-27T12:00:00.000Z',
    updatedAt: '2026-09-27T12:00:00.000Z',
  };
}

function makeService(): ServiceRecord {
  return {
    id: 'service-1',
    clientId: 'client-1',
    quoteId: 'quote-1',
    description: 'Instalação',
    totalCents: 85000,
    workStatus: 'planned',
    createdAt: '2026-09-27T12:00:00.000Z',
    updatedAt: '2026-09-27T12:00:00.000Z',
  };
}

function makeUseCases(quote: QuoteRecord, existing: ServiceRecord | null = null) {
  const quotes = {
    create: jest.fn(),
    getById: jest.fn(async () => quote),
    listByClientId: jest.fn(),
    updateStatus: jest.fn(),
  } satisfies QuoteRepository;
  const services = {
    createFromApprovedQuote: jest.fn(async () => makeService()),
    getById: jest.fn(),
    getByQuoteId: jest.fn(async () => existing),
    listByClientId: jest.fn(),
    list: jest.fn(async () => []),
  } satisfies ServiceRepository;

  return {
    services,
    useCases: createServiceUseCases({
      quotes,
      services,
      idFactory: () => 'service-1',
      clock: () => '2026-09-27T13:00:00.000Z',
    }),
  };
}

describe('service use cases', () => {
  it('rejects conversion of an unapproved quote', async () => {
    const { services, useCases } = makeUseCases(makeQuote('draft'));

    await expect(useCases.createFromApprovedQuote('quote-1')).rejects.toThrow(/aprovados/i);
    expect(services.createFromApprovedQuote).not.toHaveBeenCalled();
  });

  it('creates one service with the historical approved quote total', async () => {
    const { services, useCases } = makeUseCases(makeQuote('approved'));

    await expect(useCases.createFromApprovedQuote('quote-1')).resolves.toMatchObject({
      id: 'service-1',
      quoteId: 'quote-1',
      totalCents: 85000,
      workStatus: 'planned',
    });
    expect(services.createFromApprovedQuote).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'client-1',
      description: 'Instalação',
      totalCents: 85000,
    }));
  });

  it('returns the existing service when conversion is repeated', async () => {
    const existing = makeService();
    const { services, useCases } = makeUseCases(makeQuote('approved'), existing);

    await expect(useCases.createFromApprovedQuote('quote-1')).resolves.toEqual(existing);
    expect(services.createFromApprovedQuote).not.toHaveBeenCalled();
  });
});
