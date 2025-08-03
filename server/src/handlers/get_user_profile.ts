
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';
import { eq } from 'drizzle-orm';

export async function getUserProfile(userId: number): Promise<User> {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];
    
    // Return user profile without password for security
    return {
      ...user,
      password: '' // Never return actual password
    };
  } catch (error) {
    console.error('Get user profile failed:', error);
    throw error;
  }
}
