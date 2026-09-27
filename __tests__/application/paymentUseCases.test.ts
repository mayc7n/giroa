import type { PaymentRepository, ServiceRepository } from '@/application/ports';
import type { PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import { createPaymentUseCases } from '@/application/paymentUseCases';

const service: ServiceRecord = {
  id: 'service-1',
  clientId: 'client-1',
  quoteId: 'quote-1',
  description: 'Instalação',
  totalCents: 85000,
  workStatus: 'planned',
  createdAt: '2026-09-27T12:00:00.000Z',
  updatedAt: '2026-09-27T12:00:00.000Z',
};

function makePayment(id: string, amountCents: number, operationId: string): PaymentRecord {
  return {
    id,
    serviceId: 'service-1',
    amountCents,
    paymentDate: '2026-09-27',
    method: 'pix',
    clientOperationId: operationId,
    status: 'active',
    createdAt: '2026-09-27T13:00:00.000Z',
    reversedAt: null,
  };
}

function makeUseCases(initialPayments: PaymentRecord[] = []) {
  const payments = [...initialPayments];
  const services = {
    createFromApprovedQuote: jest.fn(),
    getById: jest.fn(async () => service),
    getByQuoteId: jest.fn(),
    list: jest.fn(async () => [service]),
  } satisfies ServiceRepository;
  const paymentRepository = {
    create: jest.fn(async (input) => {
      const created = { ...input, reversedAt: null } as PaymentRecord;
      payments.push(created);
      return created;
    }),
    getByOperationId: jest.fn(async (operationId: string) => payments.find((payment) => payment.clientOperationId === operationId) ?? null),
    listByServiceId: jest.fn(async () => payments),
    listAll: jest.fn(async () => payments),
  } satisfies PaymentRepository;

  return {
    payments,
    paymentRepository,
    useCases: createPaymentUseCases({
      services,
      payments: paymentRepository,
      idFactory: () => `payment-${payments.length + 1}`,
      clock: () => '2026-09-27T13:00:00.000Z',
    }),
  };
}

describe('payment use cases', () => {
  it('registers R$ 300,00 and reports R$ 550,00 pending', async () => {
    const { useCases } = makeUseCases();

    await useCases.register({
      serviceId: 'service-1',
      amountCents: 30000,
      paymentDate: '2026-09-27',
      method: 'pix',
      clientOperationId: 'operation-1',
    });

    await expect(useCases.getServiceFinancialSummary('service-1')).resolves.toMatchObject({
      totalCents: 85000,
      receivedCents: 30000,
      balanceCents: 55000,
    });
  });

  it('settles the remaining balance at zero', async () => {
    const { useCases } = makeUseCases([makePayment('payment-1', 30000, 'operation-1')]);

    await useCases.register({
      serviceId: 'service-1',
      amountCents: 55000,
      paymentDate: '2026-09-28',
      method: 'dinheiro',
      clientOperationId: 'operation-2',
    });

    await expect(useCases.getServiceFinancialSummary('service-1')).resolves.toMatchObject({
      receivedCents: 85000,
      balanceCents: 0,
    });
  });

  it('rejects a payment above the balance without writing', async () => {
    const { paymentRepository, useCases } = makeUseCases([makePayment('payment-1', 30000, 'operation-1')]);

    await expect(useCases.register({
      serviceId: 'service-1',
      amountCents: 55001,
      paymentDate: '2026-09-28',
      method: 'pix',
      clientOperationId: 'operation-2',
    })).rejects.toThrow(/saldo/i);
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  it('returns the existing payment for a repeated operation ID', async () => {
    const existing = makePayment('payment-1', 30000, 'operation-1');
    const { paymentRepository, useCases } = makeUseCases([existing]);

    await expect(useCases.register({
      serviceId: 'service-1',
      amountCents: 30000,
      paymentDate: '2026-09-27',
      method: 'pix',
      clientOperationId: 'operation-1',
    })).resolves.toEqual(existing);
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });
});
