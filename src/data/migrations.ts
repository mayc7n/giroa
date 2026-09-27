import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

const INITIAL_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    contact TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS clients_normalized_name_idx
    ON clients (normalized_name);

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    discount_cents INTEGER NOT NULL CHECK (discount_cents >= 0),
    valid_until TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'cancelled')),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS quotes_client_id_idx ON quotes (client_id);

  CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY NOT NULL,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity_milli INTEGER NOT NULL CHECK (quantity_milli > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    position INTEGER NOT NULL CHECK (position >= 0)
  );
  CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON quote_items (quote_id, position);

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    quote_id TEXT UNIQUE REFERENCES quotes(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    work_status TEXT NOT NULL CHECK (work_status IN ('planned', 'inProgress', 'completed', 'cancelled')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS services_client_id_idx ON services (client_id);

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY NOT NULL,
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    payment_date TEXT NOT NULL,
    method TEXT NOT NULL,
    client_operation_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'reversed')),
    created_at TEXT NOT NULL,
    reversed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS payments_service_id_idx ON payments (service_id, status);
`;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (currentVersion === 0) {
      await db.execAsync(INITIAL_SCHEMA_SQL);
      currentVersion = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
  });
}
