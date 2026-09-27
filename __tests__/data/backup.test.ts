import type { SQLiteDatabase } from 'expo-sqlite';

import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  createBackupPayload,
  parseBackup,
  restoreBackup,
  serializeBackup,
} from '@/data/backup';
import type { GiroaBackup } from '@/data/backup';
import { DATABASE_VERSION } from '@/data/migrations';

const backup: GiroaBackup = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  databaseVersion: DATABASE_VERSION,
  exportedAt: '2026-09-27T15:00:00.000Z',
  data: {
    clients: [],
    quotes: [],
    quoteItems: [],
    services: [],
    payments: [],
    expenses: [],
  },
};

describe('backup local versioned', () => {
  it('serializes and validates the backup format', () => {
    expect(parseBackup(serializeBackup(backup))).toEqual(backup);
  });

  it('rejects malformed or unsupported backup files', () => {
    expect(() => parseBackup('{"format":"outro-app"}')).toThrow(/backup inválido|versão/i);
    expect(() => parseBackup(JSON.stringify({ ...backup, version: BACKUP_VERSION + 1 }))).toThrow(/versão/i);
    expect(() => parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, payments: [{}] } }))).toThrow(/backup inválido/i);
  });

  it('exports every local table with the current database version', async () => {
    const db = {
      getAllAsync: jest.fn(async (sql: string) => {
        if (sql.includes('FROM clients')) return [{ id: 'client-1' }];
        if (sql.includes('FROM quotes')) return [{ id: 'quote-1' }];
        if (sql.includes('FROM quote_items')) return [{ id: 'item-1' }];
        if (sql.includes('FROM services')) return [{ id: 'service-1' }];
        if (sql.includes('FROM payments')) return [{ id: 'payment-1' }];
        if (sql.includes('FROM expenses')) return [{ id: 'expense-1' }];
        return [];
      }),
    } as unknown as SQLiteDatabase;

    await expect(createBackupPayload(db, backup.exportedAt)).resolves.toMatchObject({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      databaseVersion: DATABASE_VERSION,
      exportedAt: backup.exportedAt,
      data: {
        clients: [{ id: 'client-1' }],
        quotes: [{ id: 'quote-1' }],
        quoteItems: [{ id: 'item-1' }],
        services: [{ id: 'service-1' }],
        payments: [{ id: 'payment-1' }],
        expenses: [{ id: 'expense-1' }],
      },
    });
  });

  it('replaces local data inside one exclusive transaction', async () => {
    const statements: string[] = [];
    const db = {
      withExclusiveTransactionAsync: jest.fn(async (work: () => Promise<void>) => work()),
      runAsync: jest.fn(async (sql: string) => {
        statements.push(sql);
        return { changes: 1, lastInsertRowId: 1 };
      }),
    } as unknown as SQLiteDatabase;

    await restoreBackup(db, serializeBackup(backup));

    expect(db.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
    expect(statements.slice(0, 6)).toEqual([
      'DELETE FROM expenses',
      'DELETE FROM payments',
      'DELETE FROM services',
      'DELETE FROM quote_items',
      'DELETE FROM quotes',
      'DELETE FROM clients',
    ]);
  });
});
