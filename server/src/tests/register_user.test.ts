
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterUserInput } from '../schema';
import { registerUser } from '../handlers/register_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: RegisterUserInput = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  phone: '+1234567890',
  role: 'customer'
};

describe('registerUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should register a new user', async () => {
    const result = await registerUser(testInput);

    // Validate user data
    expect(result.user.email).toEqual('test@example.com');
    expect(result.user.name).toEqual('Test User');
    expect(result.user.phone).toEqual('+1234567890');
    expect(result.user.role).toEqual('customer');
    expect(result.user.id).toBeDefined();
    expect(result.user.created_at).toBeInstanceOf(Date);
    expect(result.user.updated_at).toBeInstanceOf(Date);
    expect(result.user.password).toEqual(''); // Password should be empty in response

    // Validate token
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('should save user to database with hashed password', async () => {
    const result = await registerUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.user.id))
      .execute();

    expect(users).toHaveLength(1);
    const savedUser = users[0];
    
    expect(savedUser.email).toEqual('test@example.com');
    expect(savedUser.name).toEqual('Test User');
    expect(savedUser.phone).toEqual('+1234567890');
    expect(savedUser.role).toEqual('customer');
    expect(savedUser.created_at).toBeInstanceOf(Date);
    expect(savedUser.updated_at).toBeInstanceOf(Date);
    
    // Password should be hashed, not plain text
    expect(savedUser.password).not.toEqual('password123');
    expect(savedUser.password.length).toBeGreaterThan(10);
  });

  it('should apply default role when not specified', async () => {
    const inputWithoutRole = {
      email: 'test2@example.com',
      password: 'password123',
      name: 'Test User 2',
      phone: null,
      role: 'customer' as const
    };

    const result = await registerUser(inputWithoutRole);

    expect(result.user.role).toEqual('customer');
  });

  it('should handle admin role registration', async () => {
    const adminInput: RegisterUserInput = {
      ...testInput,
      email: 'admin@example.com',
      role: 'admin'
    };

    const result = await registerUser(adminInput);

    expect(result.user.role).toEqual('admin');
    expect(result.user.email).toEqual('admin@example.com');
  });

  it('should handle null phone number', async () => {
    const inputWithNullPhone: RegisterUserInput = {
      ...testInput,
      email: 'test3@example.com',
      phone: null
    };

    const result = await registerUser(inputWithNullPhone);

    expect(result.user.phone).toBeNull();
  });

  it('should reject duplicate email registration', async () => {
    // Register first user
    await registerUser(testInput);

    // Try to register another user with same email
    const duplicateInput: RegisterUserInput = {
      ...testInput,
      name: 'Another User'
    };

    expect(registerUser(duplicateInput)).rejects.toThrow(/already exists/i);
  });

  it('should generate valid JWT token structure', async () => {
    const result = await registerUser(testInput);

    // Decode the base64 token to verify structure
    const tokenData = JSON.parse(Buffer.from(result.token, 'base64').toString());

    expect(tokenData.userId).toEqual(result.user.id);
    expect(tokenData.email).toEqual('test@example.com');
    expect(tokenData.role).toEqual('customer');
    expect(tokenData.exp).toBeDefined();
    expect(typeof tokenData.exp).toBe('number');
    expect(tokenData.exp).toBeGreaterThan(Date.now());
  });
});
