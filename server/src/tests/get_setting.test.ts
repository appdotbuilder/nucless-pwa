
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { settingsTable } from '../db/schema';
import { getSetting } from '../handlers/get_setting';

describe('getSetting', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return setting when it exists', async () => {
    // Create test setting
    const testSetting = await db.insert(settingsTable)
      .values({
        key: 'whatsapp_admin',
        value: '6281234567890'
      })
      .returning()
      .execute();

    const result = await getSetting('whatsapp_admin');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testSetting[0].id);
    expect(result!.key).toEqual('whatsapp_admin');
    expect(result!.value).toEqual('6281234567890');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when setting does not exist', async () => {
    const result = await getSetting('nonexistent_key');

    expect(result).toBeNull();
  });

  it('should handle different setting types', async () => {
    // Create multiple settings
    await db.insert(settingsTable)
      .values([
        { key: 'app_name', value: 'My Food App' },
        { key: 'max_orders', value: '100' },
        { key: 'maintenance_mode', value: 'false' }
      ])
      .execute();

    const appName = await getSetting('app_name');
    const maxOrders = await getSetting('max_orders');
    const maintenanceMode = await getSetting('maintenance_mode');

    expect(appName!.value).toEqual('My Food App');
    expect(maxOrders!.value).toEqual('100');
    expect(maintenanceMode!.value).toEqual('false');
  });

  it('should return correct setting when multiple settings exist', async () => {
    // Create multiple settings
    await db.insert(settingsTable)
      .values([
        { key: 'setting1', value: 'value1' },
        { key: 'setting2', value: 'value2' },
        { key: 'setting3', value: 'value3' }
      ])
      .execute();

    const result = await getSetting('setting2');

    expect(result).not.toBeNull();
    expect(result!.key).toEqual('setting2');
    expect(result!.value).toEqual('value2');
  });
});
