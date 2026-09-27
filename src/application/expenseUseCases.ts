import { assertISODate } from '@/domain/date';
import type { ExpenseRecord } from '@/data/sqliteTypes';
import type { ExpenseRepository } from './ports';

type ExpenseUseCaseDependencies = {
  expenses: ExpenseRepository;
  idFactory: () => string;
  clock: () => string;
};

export function createExpenseUseCases({ expenses, idFactory, clock }: ExpenseUseCaseDependencies) {
  return {
    async register(input: {
      description: string;
      amountCents: number;
      expenseDate: string;
      category: string;
      clientOperationId: string;
    }): Promise<ExpenseRecord> {
      const operationId = input.clientOperationId.trim();
      if (!operationId) throw new Error('Identificador da operação ausente.');

      const existing = await expenses.getByOperationId(operationId);
      if (existing) return existing;

      const description = input.description.trim();
      if (!description) throw new Error('Informe a descrição da saída.');
      if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
        throw new Error('A saída deve ser maior que zero.');
      }
      assertISODate(input.expenseDate);

      return expenses.create({
        id: idFactory(),
        description,
        amountCents: input.amountCents,
        expenseDate: input.expenseDate,
        category: input.category.trim() || 'outros',
        clientOperationId: operationId,
        status: 'active',
        createdAt: clock(),
      });
    },
    async reverse(id: string): Promise<ExpenseRecord> {
      return expenses.reverse(id, clock());
    },
  };
}
