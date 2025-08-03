
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterUserInput, type UpdateUserInput } from '../schema';
import { updateUserProfile } from '../handlers/update_user_profile';
import { eq } from 'drizzle-orm';

// Helper to create a test user
const createTestUser = async (): Promise<number> => {
  const testUser: RegisterUserInput = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '1234567890',
    role: 'customer'
  };

  const result = await db.insert(usersTable)
    .values(testUser)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateUserProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user profile fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      email: 'updated@example.com',
      name: 'Updated Name',
      phone: '9876543210'
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.email).toEqual('updated@example.com');
    expect(result.name).toEqual('Updated Name');
    expect(result.phone).toEqual('9876543210');
    expect(result.role).toEqual('customer');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const userId = await createTestUser();

    const partialUpdate: UpdateUserInput = {
      id: userId,
      name: 'Only Name Updated'
    };

    const result = await updateUserProfile(partialUpdate);

    expect(result.name).toEqual('Only Name Updated');
    expect(result.email).toEqual('test@example.com'); // Original email preserved
    expect(result.phone).toEqual('1234567890'); // Original phone preserved
  });

  it('should save updated data to database', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      email: 'db-test@example.com',
      name: 'DB Test User'
    };

    await updateUserProfile(updateInput);

    // Verify changes were saved to database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('db-test@example.com');
    expect(users[0].name).toEqual('DB Test User');
    expect(users[0].phone).toEqual('1234567890'); // Unchanged
  });

  it('should handle null phone number', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      phone: null
    };

    const result = await updateUserProfile(updateInput);

    expect(result.phone).toBeNull();
  });

  it('should throw error for non-existent user', async () => {
    const updateInput: UpdateUserInput = {
      id: 999999,
      name: 'Non-existent User'
    };

    expect(updateUserProfile(updateInput)).rejects.toThrow(/user not found/i);
  });

  it('should update timestamp', async () => {
    const userId = await createTestUser();

    // Get original timestamp
    const originalUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    const originalTimestamp = originalUser[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Timestamp Test'
    };

    const result = await updateUserProfile(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
