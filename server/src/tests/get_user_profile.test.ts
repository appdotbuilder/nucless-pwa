
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUserProfile } from '../handlers/get_user_profile';

describe('getUserProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get user profile by id', async () => {
    // Create test user
    const insertResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
        phone: '+1234567890',
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = insertResult[0].id;

    const result = await getUserProfile(userId);

    // Verify user profile data
    expect(result.id).toEqual(userId);
    expect(result.email).toEqual('testuser@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.phone).toEqual('+1234567890');
    expect(result.role).toEqual('customer');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Verify password is not returned
    expect(result.password).toEqual('');
  });

  it('should throw error for non-existent user', async () => {
    const nonExistentUserId = 999;

    await expect(getUserProfile(nonExistentUserId))
      .rejects.toThrow(/user not found/i);
  });

  it('should handle user with null phone', async () => {
    // Create test user with null phone
    const insertResult = await db.insert(usersTable)
      .values({
        email: 'nophone@example.com',
        password: 'hashedpassword123',
        name: 'No Phone User',
        phone: null,
        role: 'admin'
      })
      .returning()
      .execute();

    const userId = insertResult[0].id;

    const result = await getUserProfile(userId);

    expect(result.id).toEqual(userId);
    expect(result.email).toEqual('nophone@example.com');
    expect(result.name).toEqual('No Phone User');
    expect(result.phone).toBeNull();
    expect(result.role).toEqual('admin');
    expect(result.password).toEqual('');
  });
});
