import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { calculateBalance, validatePaymentAmount } from '@/domain/payment';
import type {
  ClientRepository,
  CreateClientInput,
  CreatePaymentInput,
  CreateQuoteInput,
  CreateServiceInput,
  GiroaRepositories,
  OperationContext,
  PaymentRepository,
  QuoteRepository,
  ServiceRepository,
  TransactionPort,
} from '@/application/ports';
import type {
  ClientRecord,
  ClientRow,
  PaymentRecord,
  PaymentRow,
  QuoteItemRecord,
  QuoteItemRow,
  QuoteRecord,
  QuoteRow,
  ServiceRecord,
  ServiceRow,
} from './sqliteTypes';
import { migrateDatabase } from './migrations';

function mapClient(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    contact: row.contact,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapQuoteItem(row: QuoteItemRow): QuoteItemRecord {
  return {
    id: row.id,
    description: row.description,
    quantityMilli: row.quantity_milli,
    unitPriceCents: row.unit_price_cents,
    totalCents: row.total_cents,
    position: row.position,
  };
}

function mapQuote(row: QuoteRow, items: QuoteItemRow[]): QuoteRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    description: row.description,
    discountCents: row.discount_cents,
    validUntil: row.valid_until,
    status: row.status,
    totalCents: row.total_cents,
    items: items.map(mapQuoteItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    quoteId: row.quote_id,
    description: row.description,
    totalCents: row.total_cents,
    workStatus: row.work_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    serviceId: row.service_id,
    amountCents: row.amount_cents,
    paymentDate: row.payment_date,
    method: row.method,
    clientOperationId: row.client_operation_id,
    status: row.status,
    createdAt: row.created_at,
    reversedAt: row.reversed_at,
  };
}

function createTransactionPort(db: SQLiteDatabase): TransactionPort {
  return {
    async withExclusive<T>(_operation: OperationContext, work: () => Promise<T>): Promise<T> {
      let result!: T;
      await db.withExclusiveTransactionAsync(async () => {
        result = await work();
      });
      return result;
    },
  };
}

export function createSqliteRepositories(db: SQLiteDatabase): GiroaRepositories {
  const transactions = createTransactionPort(db);

  const clients: ClientRepository = {
    async create(input: CreateClientInput): Promise<ClientRecord> {
      await db.runAsync(
        `INSERT INTO clients (id, name, normalized_name, contact, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        input.id,
        input.name,
        input.normalizedName,
        input.contact,
        input.createdAt,
        input.updatedAt,
      );
      return input;
    },
    async list() {
      const rows = await db.getAllAsync<ClientRow>('SELECT * FROM clients ORDER BY name COLLATE NOCASE, id');
      return rows.map(mapClient);
    },
    async getById(id: string): Promise<ClientRecord | null> {
      const row = await db.getFirstAsync<ClientRow>('SELECT * FROM clients WHERE id = ?', id);
      return row ? mapClient(row) : null;
    },
  };

  const quotes: QuoteRepository = {
    async create(input: CreateQuoteInput): Promise<QuoteRecord> {
      await transactions.withExclusive({}, async () => {
        await db.runAsync(
          `INSERT INTO quotes (id, client_id, description, discount_cents, valid_until, status, total_cents, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          input.id,
          input.clientId,
          input.description,
          input.discountCents,
          input.validUntil,
          input.status,
          input.totalCents,
          input.createdAt,
          input.updatedAt,
        );
        for (const item of input.items) {
          await db.runAsync(
            `INSERT INTO quote_items (id, quote_id, description, quantity_milli, unit_price_cents, total_cents, position)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            item.id,
            input.id,
            item.description,
            item.quantityMilli,
            item.unitPriceCents,
            item.totalCents,
            item.position,
          );
        }
      });
      return input;
    },
    async getById(id: string): Promise<QuoteRecord | null> {
      const row = await db.getFirstAsync<QuoteRow>('SELECT * FROM quotes WHERE id = ?', id);
      if (!row) return null;
      const items = await db.getAllAsync<QuoteItemRow>('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY position', id);
      return mapQuote(row, items);
    },
    async updateStatus(id: string, status, updatedAt: string): Promise<void> {
      await db.runAsync('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?', status, updatedAt, id);
    },
  };

  const services: ServiceRepository = {
    async createFromApprovedQuote(input: CreateServiceInput): Promise<ServiceRecord> {
      return transactions.withExclusive({}, async () => {
        const existing = await db.getFirstAsync<ServiceRow>('SELECT * FROM services WHERE quote_id = ?', input.quoteId);
        if (existing) return mapService(existing);

        const quote = await db.getFirstAsync<Pick<QuoteRow, 'status'>>('SELECT status FROM quotes WHERE id = ?', input.quoteId);
        if (!quote || quote.status !== 'approved') {
          throw new Error('Somente orçamentos aprovados podem virar serviços.');
        }

        await db.runAsync(
          `INSERT INTO services (id, client_id, quote_id, description, total_cents, work_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          input.id,
          input.clientId,
          input.quoteId,
          input.description,
          input.totalCents,
          input.workStatus,
          input.createdAt,
          input.updatedAt,
        );
        return input;
      });
    },
    async getById(id: string): Promise<ServiceRecord | null> {
      const row = await db.getFirstAsync<ServiceRow>('SELECT * FROM services WHERE id = ?', id);
      return row ? mapService(row) : null;
    },
    async getByQuoteId(quoteId: string): Promise<ServiceRecord | null> {
      const row = await db.getFirstAsync<ServiceRow>('SELECT * FROM services WHERE quote_id = ?', quoteId);
      return row ? mapService(row) : null;
    },
  };

  const payments: PaymentRepository = {
    async create(input: CreatePaymentInput): Promise<PaymentRecord> {
      return transactions.withExclusive({ clientOperationId: input.clientOperationId }, async () => {
        const existing = await db.getFirstAsync<PaymentRow>(
          'SELECT * FROM payments WHERE client_operation_id = ?',
          input.clientOperationId,
        );
        if (existing) return mapPayment(existing);

        const service = await db.getFirstAsync<Pick<ServiceRow, 'total_cents'>>(
          'SELECT total_cents FROM services WHERE id = ?',
          input.serviceId,
        );
        if (!service) throw new Error('Serviço não encontrado.');

        const received = await db.getFirstAsync<{ received_cents: number }>(
          `SELECT COALESCE(SUM(amount_cents), 0) AS received_cents
           FROM payments WHERE service_id = ? AND status = 'active'`,
          input.serviceId,
        );
        const balanceCents = calculateBalance(service.total_cents, [
          { amountCents: received?.received_cents ?? 0, status: 'active' },
        ]);
        validatePaymentAmount(input.amountCents, balanceCents);

        await db.runAsync(
          `INSERT INTO payments (id, service_id, amount_cents, payment_date, method, client_operation_id, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          input.id,
          input.serviceId,
          input.amountCents,
          input.paymentDate,
          input.method,
          input.clientOperationId,
          input.status,
          input.createdAt,
        );
        return { ...input, reversedAt: null };
      });
    },
    async getByOperationId(clientOperationId: string): Promise<PaymentRecord | null> {
      const row = await db.getFirstAsync<PaymentRow>(
        'SELECT * FROM payments WHERE client_operation_id = ?',
        clientOperationId,
      );
      return row ? mapPayment(row) : null;
    },
    async listByServiceId(serviceId: string): Promise<PaymentRecord[]> {
      const rows = await db.getAllAsync<PaymentRow>('SELECT * FROM payments WHERE service_id = ? ORDER BY payment_date, created_at', serviceId);
      return rows.map(mapPayment);
    },
  };

  return { clients, quotes, services, payments, transactions };
}

export async function openGiroaDatabase(): Promise<SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('giroa.db');
  await migrateDatabase(db);
  return db;
}
