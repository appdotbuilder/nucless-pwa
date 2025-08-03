
import { db } from '../db';
import { settingsTable } from '../db/schema';
import { type Setting } from '../schema';
import { eq } from 'drizzle-orm';

export async function getSetting(key: string): Promise<Setting | null> {
  try {
    const results = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, key))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const setting = results[0];
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    };
  } catch (error) {
    console.error('Failed to get setting:', error);
    throw error;
  }
}
