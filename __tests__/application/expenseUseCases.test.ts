import type { ExpenseRepository } from '@/application/ports';
import type { ExpenseRecord } from '@/data/sqliteTypes';
import { createExpenseUseCases } from '@/application/expenseUseCases';

function makeExpense(id: string, operationId: string): ExpenseRecord {
  return {
    id,
    description: 'Material',
    amountCents: 10000,
    expenseDate: '2026-09-27',
    category: 'material',
    clientOperationId: operationId,
    status: 'active',
    createdAt: '2026-09-27T13:00:00.000Z',
    reversedAt: null,
  };
}

function makeUseCases(existing: ExpenseRecord | null = null) {
  const records = existing ? [existing] : [];
  const expenses = {
    create: jest.fn(async (input) => {
      const created = { ...input, reversedAt: null } as ExpenseRecord;
      records.push(created);
      return created;
    }),
    getByOperationId: jest.fn(async (operationId: string) => records.find((record) => record.clientOperationId === operationId) ?? null),
    listAll: jest.fn(async () => records),
    reverse: jest.fn(async (id: string, reversedAt: string) => {
      const record = records.find((item) => item.id === id);
      if (!record) throw new Error('Despesa não encontrada.');
      const reversed = { ...record, status: 'reversed' as const, reversedAt };
      records.splice(records.indexOf(record), 1, reversed);
      return reversed;
    }),
  } satisfies ExpenseRepository;

  return { expenses, useCases: createExpenseUseCases({ expenses, idFactory: () => 'expense-1', clock: () => '2026-09-27T13:00:00.000Z' }) };
}

describe('expense use cases', () => {
  it('registers an expense in cents and keeps repeated operations idempotent', async () => {
    const { expenses, useCases } = makeUseCases();

    const first = await useCases.register({
      description: '  Material  ',
      amountCents: 10000,
      expenseDate: '2026-09-27',
      category: 'material',
      clientOperationId: 'operation-1',
    });
    const repeated = await useCases.register({
      description: 'Material',
      amountCents: 10000,
      expenseDate: '2026-09-27',
      category: 'material',
      clientOperationId: 'operation-1',
    });

    expect(first).toEqual(repeated);
    expect(expenses.create).toHaveBeenCalledTimes(1);
  });

  it('reverses without deleting the expense record', async () => {
    const { useCases } = makeUseCases(makeExpense('expense-1', 'operation-1'));

    await expect(useCases.reverse('expense-1')).resolves.toMatchObject({ status: 'reversed', reversedAt: '2026-09-27T13:00:00.000Z' });
  });
});
