import type { SQLiteDatabase } from 'expo-sqlite';

import { createBackupPayload, restoreBackup, serializeBackup } from '@/data/backup';

export function createBackupUseCases(db: SQLiteDatabase) {
  return {
    async exportData(): Promise<string> {
      return serializeBackup(await createBackupPayload(db));
    },
    async restoreData(content: string): Promise<void> {
      await restoreBackup(db, content);
    },
  };
}
