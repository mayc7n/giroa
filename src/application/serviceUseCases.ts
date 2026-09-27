import type { QuoteRepository, ServiceRepository } from './ports';

type ServiceUseCaseDependencies = {
  quotes: QuoteRepository;
  services: ServiceRepository;
  idFactory: () => string;
  clock: () => string;
};

export function createServiceUseCases({ quotes, services, idFactory, clock }: ServiceUseCaseDependencies) {
  return {
    async createFromApprovedQuote(quoteId: string) {
      const quote = await quotes.getById(quoteId);
      if (!quote) {
        throw new Error('Orçamento não encontrado.');
      }
      if (quote.status !== 'approved') {
        throw new Error('Somente orçamentos aprovados podem virar serviços.');
      }

      const existing = await services.getByQuoteId(quoteId);
      if (existing) return existing;

      const now = clock();
      return services.createFromApprovedQuote({
        id: idFactory(),
        clientId: quote.clientId,
        quoteId: quote.id,
        description: quote.description,
        totalCents: quote.totalCents,
        workStatus: 'planned',
        createdAt: now,
        updatedAt: now,
      });
    },
  };
}
