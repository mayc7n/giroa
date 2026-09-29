import type { ClientRepository, ExpenseRepository, PaymentRepository, ServiceRepository } from '@/application/ports';
import type { ExpenseRecord, PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import { createTodayUseCases } from '@/application/todayUseCases';

const serviceOne: ServiceRecord = {
  id: 'service-1',
  clientId: 'client-1',
  quoteId: 'quote-1',
  description: 'Instalação elétrica',
  totalCents: 100000,
  workStatus: 'inProgress',
  createdAt: '2026-09-20T12:00:00.000Z',
  updatedAt: '2026-09-27T12:00:00.000Z',
};

const serviceTwo: ServiceRecord = {
  ...serviceOne,
  id: 'service-2',
  clientId: 'client-2',
  description: 'Manutenção',
  totalCents: 50000,
  workStatus: 'planned',
};

const payments: PaymentRecord[] = [
  {
    id: 'payment-1',
    serviceId: 'service-1',
    amountCents: 30000,
    paymentDate: '2026-09-27',
    method: 'pix',
    clientOperationId: 'operation-1',
    status: 'active',
    createdAt: '2026-09-27T13:00:00.000Z',
    reversedAt: null,
  },
  {
    id: 'payment-2',
    serviceId: 'service-1',
    amountCents: 20000,
    paymentDate: '2026-09-26',
    method: 'pix',
    clientOperationId: 'operation-2',
    status: 'reversed',
    createdAt: '2026-09-26T13:00:00.000Z',
    reversedAt: '2026-09-27T14:00:00.000Z',
  },
  {
    id: 'payment-3',
    serviceId: 'service-2',
    amountCents: 10000,
    paymentDate: '2026-08-31',
    method: 'dinheiro',
    clientOperationId: 'operation-3',
    status: 'active',
    createdAt: '2026-08-31T13:00:00.000Z',
    reversedAt: null,
  },
];

const expenses: ExpenseRecord[] = [
  {
    id: 'expense-1',
    description: 'Material',
    amountCents: 10000,
    expenseDate: '2026-09-28',
    category: 'material',
    clientOperationId: 'expense-operation-1',
    status: 'active',
    createdAt: '2026-09-28T13:00:00.000Z',
    reversedAt: null,
  },
  {
    id: 'expense-2',
    description: 'Combustível estornado',
    amountCents: 5000,
    expenseDate: '2026-09-28',
    category: 'transporte',
    clientOperationId: 'expense-operation-2',
    status: 'reversed',
    createdAt: '2026-09-28T13:00:00.000Z',
    reversedAt: '2026-09-28T14:00:00.000Z',
  },
];

describe('today use cases', () => {
  it('builds an operational summary from active local records', async () => {
    const clients = {
      list: jest.fn(async () => [
        { id: 'client-1', name: 'Ana Souza' },
        { id: 'client-2', name: 'Bruno Lima' },
      ]),
    } satisfies Pick<ClientRepository, 'list'>;
    const services = {
      list: jest.fn(async () => [serviceOne, serviceTwo]),
    } satisfies Pick<ServiceRepository, 'list'>;
    const paymentRepository = {
      listAll: jest.fn(async () => payments),
    } satisfies Pick<PaymentRepository, 'listAll'>;
    const expenseRepository = {
      listAll: jest.fn(async () => expenses),
    } satisfies Pick<ExpenseRepository, 'listAll'>;
    const useCases = createTodayUseCases({
      clients,
      services,
      payments: paymentRepository,
      expenses: expenseRepository,
      period: () => ({ startDate: '2026-09-01', endDate: '2026-09-30' }),
    });

    await expect(useCases.getSummary()).resolves.toEqual({
      clientsCount: 2,
      serviceCount: 2,
      entriesCents: 30000,
      exitsCents: 10000,
      periodBalanceCents: 20000,
      pendingCents: 110000,
      pendingServices: [
        { service: serviceOne, clientName: 'Ana Souza', balanceCents: 70000 },
        { service: serviceTwo, clientName: 'Bruno Lima', balanceCents: 40000 },
      ],
    });
  });
});
