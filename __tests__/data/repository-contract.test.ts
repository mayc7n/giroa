import type { SQLiteDatabase } from 'expo-sqlite';

import { createSqliteRepositories } from '@/data/database';
import type {
  ClientRow,
  PaymentRow,
  QuoteItemRow,
  QuoteRow,
  ServiceRow,
} from '@/data/sqliteTypes';

type FakeState = {
  clients: ClientRow[];
  quotes: QuoteRow[];
  quoteItems: QuoteItemRow[];
  services: ServiceRow[];
  payments: PaymentRow[];
};

type FakeDatabase = {
  runAsync: (sql: string, ...params: unknown[]) => Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync: (sql: string, ...params: unknown[]) => Promise<unknown>;
  getAllAsync: (sql: string, ...params: unknown[]) => Promise<unknown[]>;
  withExclusiveTransactionAsync: (callback: (transaction: FakeDatabase) => Promise<void>) => Promise<void>;
};

function createFakeDatabase(state: FakeState): SQLiteDatabase {
  const database: FakeDatabase = {
    runAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
      if (sql.includes('INSERT INTO clients')) {
        const [id, name, normalizedName, contact, createdAt, updatedAt] = params as [
          string,
          string,
          string,
          string | null,
          string,
          string,
        ];
        state.clients.push({ id, name, normalized_name: normalizedName, contact, created_at: createdAt, updated_at: updatedAt });
      } else if (sql.includes('INSERT INTO quotes')) {
        const [id, clientId, description, discountCents, validUntil, status, totalCents, createdAt, updatedAt] = params as [
          string,
          string,
          string,
          number,
          string | null,
          QuoteRow['status'],
          number,
          string,
          string,
        ];
        state.quotes.push({ id, client_id: clientId, description, discount_cents: discountCents, valid_until: validUntil, status, total_cents: totalCents, created_at: createdAt, updated_at: updatedAt });
      } else if (sql.includes('INSERT INTO quote_items')) {
        const [id, quoteId, description, quantityMilli, unitPriceCents, totalCents, position] = params as [
          string,
          string,
          string,
          number,
          number,
          number,
          number,
        ];
        state.quoteItems.push({ id, quote_id: quoteId, description, quantity_milli: quantityMilli, unit_price_cents: unitPriceCents, total_cents: totalCents, position });
      } else if (sql.includes('INSERT INTO services')) {
        const [id, clientId, quoteId, description, totalCents, workStatus, createdAt, updatedAt] = params as [
          string,
          string,
          string,
          string,
          number,
          ServiceRow['work_status'],
          string,
          string,
        ];
        state.services.push({ id, client_id: clientId, quote_id: quoteId, description, total_cents: totalCents, work_status: workStatus, created_at: createdAt, updated_at: updatedAt });
      } else if (sql.includes('INSERT INTO payments')) {
        const [id, serviceId, amountCents, paymentDate, method, clientOperationId, status, createdAt] = params as [
          string,
          string,
          number,
          string,
          string,
          string,
          PaymentRow['status'],
          string,
        ];
        state.payments.push({ id, service_id: serviceId, amount_cents: amountCents, payment_date: paymentDate, method, client_operation_id: clientOperationId, status, created_at: createdAt, reversed_at: null });
      }
      return { changes: 1, lastInsertRowId: 1 };
    }),
    getFirstAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
      const [value] = params;
      if (sql.includes('FROM clients WHERE id')) return state.clients.find((row) => row.id === value) ?? null;
      if (sql.includes('FROM quotes WHERE id')) return state.quotes.find((row) => row.id === value) ?? null;
      if (sql.includes('SELECT status FROM quotes')) return state.quotes.find((row) => row.id === value) ?? null;
      if (sql.includes('FROM services WHERE quote_id')) return state.services.find((row) => row.quote_id === value) ?? null;
      if (sql.includes('FROM services WHERE id')) return state.services.find((row) => row.id === value) ?? null;
      if (sql.includes('FROM payments WHERE client_operation_id')) return state.payments.find((row) => row.client_operation_id === value) ?? null;
      if (sql.includes('SELECT total_cents FROM services')) return state.services.find((row) => row.id === value) ?? null;
      if (sql.includes('COALESCE(SUM(amount_cents)')) {
        const activePayments = state.payments.filter((row) => row.service_id === value && row.status === 'active');
        return { received_cents: activePayments.reduce((sum, row) => sum + row.amount_cents, 0) };
      }
      return null;
    }),
    getAllAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
      const [value] = params;
      if (sql.includes('FROM clients')) return state.clients;
      if (sql.includes('FROM quote_items')) return state.quoteItems.filter((row) => row.quote_id === value);
      if (sql.includes('FROM payments')) return state.payments.filter((row) => row.service_id === value);
      return [];
    }),
    withExclusiveTransactionAsync: jest.fn(async (callback: (transaction: FakeDatabase) => Promise<void>) => callback(database)),
  };

  return database as unknown as SQLiteDatabase;
}

describe('SQLite repository contracts', () => {
  it('persists clients, quotes, services and idempotent payments', async () => {
    const state: FakeState = { clients: [], quotes: [], quoteItems: [], services: [], payments: [] };
    const repositories = createSqliteRepositories(createFakeDatabase(state));

    await repositories.clients.create({
      id: 'client-1',
      name: 'Ana Souza',
      normalizedName: 'ana souza',
      contact: '11999990000',
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
    });
    expect((await repositories.clients.list())[0].name).toBe('Ana Souza');

    await repositories.quotes.create({
      id: 'quote-1',
      clientId: 'client-1',
      description: 'Instalação',
      discountCents: 0,
      validUntil: null,
      status: 'approved',
      totalCents: 85000,
      items: [{ id: 'item-1', description: 'Instalação', quantityMilli: 1000, unitPriceCents: 85000, totalCents: 85000, position: 0 }],
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
    });
    expect((await repositories.quotes.getById('quote-1'))?.items[0].totalCents).toBe(85000);

    const serviceInput = {
      id: 'service-1',
      clientId: 'client-1',
      quoteId: 'quote-1',
      description: 'Instalação',
      totalCents: 85000,
      workStatus: 'planned' as const,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T12:00:00.000Z',
    };
    const firstService = await repositories.services.createFromApprovedQuote(serviceInput);
    const repeatedService = await repositories.services.createFromApprovedQuote(serviceInput);
    expect(repeatedService.id).toBe(firstService.id);

    const paymentInput = {
      id: 'payment-1',
      serviceId: 'service-1',
      amountCents: 30000,
      paymentDate: '2026-09-27',
      method: 'pix',
      clientOperationId: 'payment-operation-1',
      status: 'active' as const,
      createdAt: '2026-09-27T12:00:00.000Z',
    };
    const firstPayment = await repositories.payments.create(paymentInput);
    const repeatedPayment = await repositories.payments.create(paymentInput);
    expect(repeatedPayment.id).toBe(firstPayment.id);
    expect(state.payments).toHaveLength(1);
  });
});
