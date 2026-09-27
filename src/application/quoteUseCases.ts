import { calculateQuoteTotal } from '@/domain/quote';
import type { QuoteItemInput } from '@/domain/types';
import type { ClientRepository, CreateQuoteInput, QuoteRepository } from './ports';

type QuoteUseCaseDependencies = {
  clients: ClientRepository;
  quotes: QuoteRepository;
  idFactory: () => string;
  clock: () => string;
};

export function createQuoteUseCases({ clients, quotes, idFactory, clock }: QuoteUseCaseDependencies) {
  return {
    async create(input: {
      clientId: string;
      description: string;
      discountCents: number;
      validUntil: string | null;
      items: QuoteItemInput[];
    }) {
      const description = input.description.trim();
      if (!description) {
        throw new Error('Informe a descrição do orçamento.');
      }
      if (!(await clients.getById(input.clientId))) {
        throw new Error('Cliente não encontrado.');
      }

      const totals = calculateQuoteTotal(input.items, input.discountCents);
      const now = clock();
      const record: CreateQuoteInput = {
        id: idFactory(),
        clientId: input.clientId,
        description,
        discountCents: totals.discountCents,
        validUntil: input.validUntil,
        status: 'draft',
        totalCents: totals.totalCents,
        items: input.items.map((item, index) => ({
          id: idFactory(),
          description: item.description.trim(),
          quantityMilli: item.quantityMilli,
          unitPriceCents: item.unitPriceCents,
          totalCents: totals.lineTotalsCents[index],
          position: index,
        })),
        createdAt: now,
        updatedAt: now,
      };
      return quotes.create(record);
    },
    async approve(id: string) {
      const quote = await quotes.getById(id);
      if (!quote) {
        throw new Error('Orçamento não encontrado.');
      }
      if (quote.status === 'approved') {
        return quote;
      }
      if (quote.status !== 'draft' && quote.status !== 'sent') {
        throw new Error('Este orçamento não pode ser aprovado.');
      }

      const updatedAt = clock();
      await quotes.updateStatus(id, 'approved', updatedAt);
      return { ...quote, status: 'approved' as const, updatedAt };
    },
  };
}
