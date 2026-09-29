import type { ExpenseRepository, PaymentRepository, ServiceRepository } from '@/application/ports';
import type { ExpenseRecord, PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
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

function makeExpense(id: string, amountCents: number, expenseDate: string, status: ExpenseRecord['status'] = 'active'): ExpenseRecord {
  return {
    id,
    description: 'Material',
    amountCents,
    expenseDate,
    category: 'material',
    clientOperationId: `expense-operation-${id}`,
    status,
    createdAt: '2026-09-27T13:00:00.000Z',
    reversedAt: status === 'reversed' ? '2026-09-27T14:00:00.000Z' : null,
  };
}

function makeUseCases(initialPayments: PaymentRecord[] = [], initialExpenses: ExpenseRecord[] = []) {
  const payments = [...initialPayments];
  const expenses = [...initialExpenses];
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
    reverse: jest.fn(async (id: string, reversedAt: string) => {
      const record = payments.find((payment) => payment.id === id);
      if (!record) throw new Error('Recebimento não encontrado.');
      const reversed = { ...record, status: 'reversed' as const, reversedAt };
      payments.splice(payments.indexOf(record), 1, reversed);
      return reversed;
    }),
  } satisfies PaymentRepository;
  const expenseRepository = {
    create: jest.fn(),
    getByOperationId: jest.fn(),
    listAll: jest.fn(async () => expenses),
    reverse: jest.fn(async (id: string, reversedAt: string) => {
      const record = expenses.find((expense) => expense.id === id);
      if (!record) throw new Error('Despesa não encontrada.');
      const reversed = { ...record, status: 'reversed' as const, reversedAt };
      expenses.splice(expenses.indexOf(record), 1, reversed);
      return reversed;
    }),
  } satisfies ExpenseRepository;

  return {
    payments,
    paymentRepository,
    useCases: createPaymentUseCases({
      services,
      payments: paymentRepository,
      expenses: expenseRepository,
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

  it('filters the cash balance by the requested civil period', async () => {
    const inPeriod = makePayment('payment-1', 30000, 'operation-1');
    const previousPeriod = { ...makePayment('payment-2', 5000, 'operation-2'), paymentDate: '2026-08-31' };
    const { useCases } = makeUseCases([inPeriod, previousPeriod]);

    await expect(useCases.getCashSummary({ startDate: '2026-09-01', endDate: '2026-09-30' })).resolves.toMatchObject({
      entriesCents: 30000,
      periodBalanceCents: 30000,
      pendingCents: 50000,
    });
  });

  it('subtracts active expenses from the requested civil period', async () => {
    const { useCases } = makeUseCases(
      [makePayment('payment-1', 30000, 'operation-1')],
      [makeExpense('expense-1', 7000, '2026-09-20'), makeExpense('expense-2', 5000, '2026-08-31')],
    );

    await expect(useCases.getCashSummary({ startDate: '2026-09-01', endDate: '2026-09-30' })).resolves.toMatchObject({
      entriesCents: 30000,
      exitsCents: 7000,
      periodBalanceCents: 23000,
    });
  });

  it('lists active and reversed movements with a negative period balance', async () => {
    const activePayment = makePayment('payment-1', 30000, 'operation-1');
    const reversedPayment = { ...makePayment('payment-2', 90000, 'operation-2'), status: 'reversed' as const, reversedAt: '2026-09-27T14:00:00.000Z' };
    const activeExpense = makeExpense('expense-1', 50000, '2026-09-27');
    const reversedExpense = makeExpense('expense-2', 40000, '2026-09-27', 'reversed');
    const { useCases } = makeUseCases([activePayment, reversedPayment], [activeExpense, reversedExpense]);

    const summary = await useCases.getCashSummary({ startDate: '2026-09-01', endDate: '2026-09-30' });

    expect(summary).toMatchObject({
      entriesCents: 30000,
      exitsCents: 50000,
      periodBalanceCents: -20000,
    });
    expect(summary.movements).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'payment-1', kind: 'entry', description: 'Instalação', category: 'pix', amountCents: 30000, status: 'active' }),
      expect.objectContaining({ id: 'payment-2', kind: 'entry', status: 'reversed' }),
      expect.objectContaining({ id: 'expense-1', kind: 'exit', description: 'Material', category: 'material', amountCents: 50000, status: 'active' }),
      expect.objectContaining({ id: 'expense-2', kind: 'exit', status: 'reversed' }),
    ]));
    expect(summary.movements).toHaveLength(4);
  });

  it('updates the cash summary immediately after reversing a payment', async () => {
    const { useCases } = makeUseCases(
      [makePayment('payment-1', 30000, 'operation-1')],
      [makeExpense('expense-1', 10000, '2026-09-27')],
    );

    await expect(useCases.getCashSummary({ startDate: '2026-09-01', endDate: '2026-09-30' })).resolves.toMatchObject({
      periodBalanceCents: 20000,
    });

    await useCases.reversePayment('payment-1');

    await expect(useCases.getCashSummary({ startDate: '2026-09-01', endDate: '2026-09-30' })).resolves.toMatchObject({
      entriesCents: 0,
      exitsCents: 10000,
      periodBalanceCents: -10000,
      movements: expect.arrayContaining([expect.objectContaining({ id: 'payment-1', status: 'reversed' })]),
    });
  });

  it('reverses a payment without deleting its history', async () => {
    const { useCases } = makeUseCases([makePayment('payment-1', 30000, 'operation-1')]);

    await expect(useCases.reversePayment('payment-1')).resolves.toMatchObject({
      status: 'reversed',
      reversedAt: '2026-09-27T13:00:00.000Z',
    });
  });
});
