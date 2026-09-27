import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION } from './migrations';
import type {
  ClientRow,
  ExpenseRow,
  PaymentRow,
  QuoteItemRow,
  QuoteRow,
  ServiceRow,
} from './sqliteTypes';

export const BACKUP_FORMAT = 'giroa-local-backup';
export const BACKUP_VERSION = 1;

export type GiroaBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  databaseVersion: number;
  exportedAt: string;
  data: {
    clients: ClientRow[];
    quotes: QuoteRow[];
    quoteItems: QuoteItemRow[];
    services: ServiceRow[];
    payments: PaymentRow[];
    expenses: ExpenseRow[];
  };
};

function invalidBackup(): never {
  throw new Error('Arquivo de backup inválido.');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalidBackup();
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return invalidBackup();
  return value;
}

function nullableStringValue(value: unknown): string | null {
  if (value === null) return null;
  return stringValue(value);
}

function integerValue(value: unknown, minimum: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) return invalidBackup();
  return value;
}

function civilDateValue(value: unknown): string {
  const date = stringValue(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return invalidBackup();
  const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (parsed.getUTCFullYear() !== Number(match[1]) || parsed.getUTCMonth() !== Number(match[2]) - 1 || parsed.getUTCDate() !== Number(match[3])) {
    return invalidBackup();
  }
  return date;
}

function statusValue<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) return invalidBackup();
  return value as T;
}

function parseClients(value: unknown): ClientRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      name: stringValue(row.name),
      normalized_name: stringValue(row.normalized_name),
      contact: nullableStringValue(row.contact),
      created_at: stringValue(row.created_at),
      updated_at: stringValue(row.updated_at),
    };
  });
}

function parseQuotes(value: unknown): QuoteRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      client_id: stringValue(row.client_id),
      description: stringValue(row.description),
      discount_cents: integerValue(row.discount_cents, 0),
      valid_until: row.valid_until === null ? null : civilDateValue(row.valid_until),
      status: statusValue(row.status, ['draft', 'sent', 'approved', 'rejected', 'cancelled'] as const),
      total_cents: integerValue(row.total_cents, 0),
      created_at: stringValue(row.created_at),
      updated_at: stringValue(row.updated_at),
    };
  });
}

function parseQuoteItems(value: unknown): QuoteItemRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      quote_id: stringValue(row.quote_id),
      description: stringValue(row.description),
      quantity_milli: integerValue(row.quantity_milli, 1),
      unit_price_cents: integerValue(row.unit_price_cents, 0),
      total_cents: integerValue(row.total_cents, 0),
      position: integerValue(row.position, 0),
    };
  });
}

function parseServices(value: unknown): ServiceRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      client_id: stringValue(row.client_id),
      quote_id: nullableStringValue(row.quote_id),
      description: stringValue(row.description),
      total_cents: integerValue(row.total_cents, 0),
      work_status: statusValue(row.work_status, ['planned', 'inProgress', 'completed', 'cancelled'] as const),
      created_at: stringValue(row.created_at),
      updated_at: stringValue(row.updated_at),
    };
  });
}

function parsePayments(value: unknown): PaymentRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      service_id: stringValue(row.service_id),
      amount_cents: integerValue(row.amount_cents, 1),
      payment_date: civilDateValue(row.payment_date),
      method: stringValue(row.method),
      client_operation_id: stringValue(row.client_operation_id),
      status: statusValue(row.status, ['active', 'reversed'] as const),
      created_at: stringValue(row.created_at),
      reversed_at: nullableStringValue(row.reversed_at),
    };
  });
}

function parseExpenses(value: unknown): ExpenseRow[] {
  if (!Array.isArray(value)) return invalidBackup();
  return value.map((item) => {
    const row = record(item);
    return {
      id: stringValue(row.id),
      description: stringValue(row.description),
      amount_cents: integerValue(row.amount_cents, 1),
      expense_date: civilDateValue(row.expense_date),
      category: stringValue(row.category),
      client_operation_id: stringValue(row.client_operation_id),
      status: statusValue(row.status, ['active', 'reversed'] as const),
      created_at: stringValue(row.created_at),
      reversed_at: nullableStringValue(row.reversed_at),
    };
  });
}

export function parseBackup(content: string): GiroaBackup {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    return invalidBackup();
  }

  const root = record(value);
  if (root.format !== BACKUP_FORMAT || root.version !== BACKUP_VERSION || root.databaseVersion !== DATABASE_VERSION) {
    throw new Error('Versão de backup não compatível com esta versão do Giroa.');
  }

  const data = record(root.data);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    databaseVersion: DATABASE_VERSION,
    exportedAt: stringValue(root.exportedAt),
    data: {
      clients: parseClients(data.clients),
      quotes: parseQuotes(data.quotes),
      quoteItems: parseQuoteItems(data.quoteItems),
      services: parseServices(data.services),
      payments: parsePayments(data.payments),
      expenses: parseExpenses(data.expenses),
    },
  };
}

export function serializeBackup(payload: GiroaBackup): string {
  return JSON.stringify(payload, null, 2);
}

export async function createBackupPayload(db: SQLiteDatabase, exportedAt = new Date().toISOString()): Promise<GiroaBackup> {
  const [clients, quotes, quoteItems, services, payments, expenses] = await Promise.all([
    db.getAllAsync<ClientRow>('SELECT * FROM clients ORDER BY id'),
    db.getAllAsync<QuoteRow>('SELECT * FROM quotes ORDER BY id'),
    db.getAllAsync<QuoteItemRow>('SELECT * FROM quote_items ORDER BY quote_id, position'),
    db.getAllAsync<ServiceRow>('SELECT * FROM services ORDER BY id'),
    db.getAllAsync<PaymentRow>('SELECT * FROM payments ORDER BY id'),
    db.getAllAsync<ExpenseRow>('SELECT * FROM expenses ORDER BY id'),
  ]);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    databaseVersion: DATABASE_VERSION,
    exportedAt,
    data: { clients, quotes, quoteItems, services, payments, expenses },
  };
}

export async function restoreBackup(db: SQLiteDatabase, content: string): Promise<void> {
  const payload = parseBackup(content);
  const { clients, quotes, quoteItems, services, payments, expenses } = payload.data;

  await db.withExclusiveTransactionAsync(async () => {
    for (const table of ['expenses', 'payments', 'services', 'quote_items', 'quotes', 'clients']) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    for (const row of clients) {
      await db.runAsync(
        'INSERT INTO clients (id, name, normalized_name, contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        row.id, row.name, row.normalized_name, row.contact, row.created_at, row.updated_at,
      );
    }
    for (const row of quotes) {
      await db.runAsync(
        'INSERT INTO quotes (id, client_id, description, discount_cents, valid_until, status, total_cents, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        row.id, row.client_id, row.description, row.discount_cents, row.valid_until, row.status, row.total_cents, row.created_at, row.updated_at,
      );
    }
    for (const row of quoteItems) {
      await db.runAsync(
        'INSERT INTO quote_items (id, quote_id, description, quantity_milli, unit_price_cents, total_cents, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
        row.id, row.quote_id, row.description, row.quantity_milli, row.unit_price_cents, row.total_cents, row.position,
      );
    }
    for (const row of services) {
      await db.runAsync(
        'INSERT INTO services (id, client_id, quote_id, description, total_cents, work_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        row.id, row.client_id, row.quote_id, row.description, row.total_cents, row.work_status, row.created_at, row.updated_at,
      );
    }
    for (const row of payments) {
      await db.runAsync(
        'INSERT INTO payments (id, service_id, amount_cents, payment_date, method, client_operation_id, status, created_at, reversed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        row.id, row.service_id, row.amount_cents, row.payment_date, row.method, row.client_operation_id, row.status, row.created_at, row.reversed_at,
      );
    }
    for (const row of expenses) {
      await db.runAsync(
        'INSERT INTO expenses (id, description, amount_cents, expense_date, category, client_operation_id, status, created_at, reversed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        row.id, row.description, row.amount_cents, row.expense_date, row.category, row.client_operation_id, row.status, row.created_at, row.reversed_at,
      );
    }
  });
}
