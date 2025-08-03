
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { settingsTable } from '../db/schema';
import { type UpdateSettingInput } from '../schema';
import { updateSetting } from '../handlers/update_setting';
import { eq } from 'drizzle-orm';

// Test input for updating/creating a setting
const testInput: UpdateSettingInput = {
  key: 'whatsapp_admin_number',
  value: '+1234567890'
};

describe('updateSetting', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new setting when key does not exist', async () => {
    const result = await updateSetting(testInput);

    // Verify returned setting
    expect(result.key).toEqual('whatsapp_admin_number');
    expect(result.value).toEqual('+1234567890');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update existing setting when key exists', async () => {
    // First, create a setting
    await db.insert(settingsTable)
      .values({
        key: 'whatsapp_admin_number',
        value: '+0987654321'
      })
      .execute();

    // Update the setting
    const result = await updateSetting(testInput);

    // Verify the setting was updated
    expect(result.key).toEqual('whatsapp_admin_number');
    expect(result.value).toEqual('+1234567890');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save setting to database correctly', async () => {
    const result = await updateSetting(testInput);

    // Query database to verify setting was saved
    const settings = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, 'whatsapp_admin_number'))
      .execute();

    expect(settings).toHaveLength(1);
    expect(settings[0].key).toEqual('whatsapp_admin_number');
    expect(settings[0].value).toEqual('+1234567890');
    expect(settings[0].id).toEqual(result.id);
  });

  it('should update timestamps correctly when updating existing setting', async () => {
    // Create initial setting
    const initialSetting = await db.insert(settingsTable)
      .values({
        key: 'whatsapp_admin_number',
        value: '+0000000000'
      })
      .returning()
      .execute();

    const originalCreatedAt = initialSetting[0].created_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1));

    // Update the setting
    const updatedSetting = await updateSetting({
      key: 'whatsapp_admin_number',
      value: '+1111111111'
    });

    // Verify timestamps
    expect(updatedSetting.created_at).toEqual(originalCreatedAt);
    expect(updatedSetting.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });

  it('should handle multiple different settings', async () => {
    // Create first setting
    const adminNumber = await updateSetting({
      key: 'whatsapp_admin_number',
      value: '+1234567890'
    });

    // Create second setting
    const appName = await updateSetting({
      key: 'app_name',
      value: 'Food Delivery App'
    });

    // Verify both settings exist independently
    const allSettings = await db.select()
      .from(settingsTable)
      .execute();

    expect(allSettings).toHaveLength(2);
    expect(allSettings.find(s => s.key === 'whatsapp_admin_number')?.value).toEqual('+1234567890');
    expect(allSettings.find(s => s.key === 'app_name')?.value).toEqual('Food Delivery App');
  });
});
