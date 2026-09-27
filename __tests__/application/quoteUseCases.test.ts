import type { ClientRepository, QuoteRepository } from '@/application/ports';
import { createQuoteUseCases } from '@/application/quoteUseCases';

describe('quote use cases', () => {
  function makeDependencies() {
    const clients = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(async () => ({ id: 'client-1', name: 'Ana', normalizedName: 'ana', contact: null, createdAt: 'now', updatedAt: 'now' })),
    } satisfies ClientRepository;
    const quotes = {
      create: jest.fn(async (input) => input),
      getById: jest.fn(async () => ({
        id: 'quote-1', clientId: 'client-1', description: 'Instalação', discountCents: 0, validUntil: null,
        status: 'draft' as const, totalCents: 85000, items: [], createdAt: 'now', updatedAt: 'now',
      })),
      updateStatus: jest.fn(),
    } satisfies QuoteRepository;
    const useCases = createQuoteUseCases({
      clients,
      quotes,
      idFactory: (() => {
        const ids = ['quote-1', 'item-1'];
        return () => ids.shift() ?? 'unexpected-id';
      })(),
      clock: () => '2026-09-27T12:00:00.000Z',
    });
    return { clients, quotes, useCases };
  }

  it('creates a draft quote with at least one item and a calculated total', async () => {
    const { quotes, useCases } = makeDependencies();

    const result = await useCases.create({
      clientId: 'client-1',
      description: 'Instalação',
      discountCents: 0,
      validUntil: null,
      items: [{ description: 'Mão de obra', quantityMilli: 1000, unitPriceCents: 85000 }],
    });

    expect(result).toMatchObject({ id: 'quote-1', status: 'draft', totalCents: 85000 });
    expect(quotes.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'draft', totalCents: 85000 }));
  });

  it('rejects invalid discount and item values before persistence', async () => {
    const { quotes, useCases } = makeDependencies();

    await expect(useCases.create({
      clientId: 'client-1', description: 'Instalação', discountCents: 85001, validUntil: null,
      items: [{ description: 'Mão de obra', quantityMilli: 1000, unitPriceCents: 85000 }],
    })).rejects.toThrow();
    expect(quotes.create).not.toHaveBeenCalled();
  });

  it('approves a draft quote manually', async () => {
    const { quotes, useCases } = makeDependencies();

    await useCases.approve('quote-1');

    expect(quotes.updateStatus).toHaveBeenCalledWith('quote-1', 'approved', '2026-09-27T12:00:00.000Z');
  });
});
