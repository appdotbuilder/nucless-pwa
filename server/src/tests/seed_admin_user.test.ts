import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { seedAdminUser } from '../handlers/seed_admin_user';
import { eq } from 'drizzle-orm';

describe('seedAdminUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create admin user when none exists', async () => {
    const result = await seedAdminUser();

    // Should return the created user (without password)
    expect(result).toBeDefined();
    expect(result?.email).toEqual('admin@demo.com');
    expect(result?.name).toEqual('Admin User');
    expect(result?.phone).toBeNull();
    expect(result?.role).toEqual('admin');
    expect(result?.password).toEqual(''); // Password should be cleared

    // Verify admin user was created in database
    const adminUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
      .execute();

    expect(adminUsers).toHaveLength(1);
    expect(adminUsers[0].email).toEqual('admin@demo.com');
    expect(adminUsers[0].name).toEqual('Admin User');
    expect(adminUsers[0].phone).toBeNull();
    expect(adminUsers[0].role).toEqual('admin');
    expect(adminUsers[0].password).toBeDefined();
    expect(adminUsers[0].password).not.toEqual('admin123'); // Should be hashed
    expect(adminUsers[0].created_at).toBeInstanceOf(Date);
  });

  it('should not create duplicate admin user', async () => {
    // First seeding
    const firstResult = await seedAdminUser();
    expect(firstResult).toBeDefined();

    // Second seeding
    const secondResult = await seedAdminUser();
    expect(secondResult).toBeNull(); // Should return null when skipping

    // Should still have only one admin user
    const adminUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
      .execute();

    expect(adminUsers).toHaveLength(1);
  });

  it('should verify password is properly hashed', async () => {
    await seedAdminUser();

    const adminUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, 'admin@demo.com'))
      .execute();

    expect(adminUser).toHaveLength(1);
    
    // Verify password is hashed (should not be plain text)
    expect(adminUser[0].password).not.toEqual('admin123');
    expect(adminUser[0].password.length).toBeGreaterThan(20); // Hashed passwords are longer
    
    // Verify the hashed password can be verified with Bun
    const isValidPassword = await Bun.password.verify('admin123', adminUser[0].password);
    expect(isValidPassword).toBe(true);
  });

  it('should skip seeding when admin already exists', async () => {
    // Create an admin user manually first
    const hashedPassword = await Bun.password.hash('different_password');
    await db.insert(usersTable)
      .values({
        email: 'existing@admin.com',
        password: hashedPassword,
        name: 'Existing Admin',
        phone: null,
        role: 'admin'
      })
      .execute();

    // Now run seeding
    const result = await seedAdminUser();
    expect(result).toBeNull(); // Should return null when skipping

    // Should still have only the original admin
    const adminUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
      .execute();

    expect(adminUsers).toHaveLength(1);
    expect(adminUsers[0].email).toEqual('existing@admin.com');
    expect(adminUsers[0].name).toEqual('Existing Admin');
  });
});