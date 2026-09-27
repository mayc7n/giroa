import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, migrateDatabase } from '@/data/migrations';

describe('Giroa database migrations', () => {
  it('creates the local schema from version zero', async () => {
    const executedSql: string[] = [];
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
      execAsync: jest.fn(async (sql: string) => {
        executedSql.push(sql);
      }),
      withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    const sql = executedSql.join('\n');
    expect(sql).toContain('PRAGMA foreign_keys = ON');
    expect(sql).toContain('PRAGMA journal_mode = WAL');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS clients');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS quotes');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS quote_items');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS services');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS payments');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS expenses');
    expect(sql).toContain('quote_id TEXT UNIQUE');
    expect(sql).toContain('client_operation_id TEXT NOT NULL UNIQUE');
    expect(sql).toContain(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });

  it('upgrades version one with the expenses table', async () => {
    const executedSql: string[] = [];
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
      execAsync: jest.fn(async (sql: string) => {
        executedSql.push(sql);
      }),
      withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
    } as unknown as SQLiteDatabase;

    await migrateDatabase(db);

    expect(executedSql.join('\n')).toContain('CREATE TABLE IF NOT EXISTS expenses');
    expect(executedSql.join('\n')).toContain(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
});
