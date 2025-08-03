
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginUserInput } from '../schema';
import { loginUser } from '../handlers/login_user';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  phone: '+1234567890',
  role: 'customer' as const
};

const testInput: LoginUserInput = {
  email: 'test@example.com',
  password: 'password123'
};

describe('loginUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should login user with valid credentials', async () => {
    // Create test user first with hashed password
    const hashedPassword = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        ...testUser,
        password: hashedPassword
      })
      .execute();

    const result = await loginUser(testInput);

    // Verify user data
    expect(result.user.email).toEqual('test@example.com');
    expect(result.user.name).toEqual('Test User');
    expect(result.user.phone).toEqual('+1234567890');
    expect(result.user.role).toEqual('customer');
    expect(result.user.password).toEqual(''); // Password should be empty
    expect(result.user.id).toBeDefined();
    expect(result.user.created_at).toBeInstanceOf(Date);
    expect(result.user.updated_at).toBeInstanceOf(Date);

    // Verify token
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('should throw error for invalid email', async () => {
    // Create test user first with hashed password
    const hashedPassword = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        ...testUser,
        password: hashedPassword
      })
      .execute();

    const invalidInput: LoginUserInput = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    await expect(loginUser(invalidInput)).rejects.toThrow(/invalid email or password/i);
  });

  it('should throw error for invalid password', async () => {
    // Create test user first with hashed password
    const hashedPassword = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        ...testUser,
        password: hashedPassword
      })
      .execute();

    const invalidInput: LoginUserInput = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    await expect(loginUser(invalidInput)).rejects.toThrow(/invalid email or password/i);
  });

  it('should work with admin role user', async () => {
    // Create admin user
    const adminUser = {
      ...testUser,
      email: 'admin@example.com',
      role: 'admin' as const
    };

    const hashedPassword = await Bun.password.hash(adminUser.password);
    await db.insert(usersTable)
      .values({
        ...adminUser,
        password: hashedPassword
      })
      .execute();

    const adminInput: LoginUserInput = {
      email: 'admin@example.com',
      password: 'password123'
    };

    const result = await loginUser(adminInput);

    expect(result.user.email).toEqual('admin@example.com');
    expect(result.user.role).toEqual('admin');
    expect(result.token).toBeDefined();
  });

  it('should handle user with null phone', async () => {
    // Create user with null phone
    const userWithNullPhone = {
      ...testUser,
      phone: null
    };

    const hashedPassword = await Bun.password.hash(userWithNullPhone.password);
    await db.insert(usersTable)
      .values({
        ...userWithNullPhone,
        password: hashedPassword
      })
      .execute();

    const result = await loginUser(testInput);

    expect(result.user.phone).toBeNull();
    expect(result.token).toBeDefined();
  });

  it('should generate valid JWT token structure', async () => {
    // Create test user first with hashed password
    const hashedPassword = await Bun.password.hash(testUser.password);
    await db.insert(usersTable)
      .values({
        ...testUser,
        password: hashedPassword
      })
      .execute();

    const result = await loginUser(testInput);

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
