
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginUserInput, type AuthResponse } from '../schema';
import { eq } from 'drizzle-orm';

export const loginUser = async (input: LoginUserInput): Promise<AuthResponse> => {
  try {
    // Find user by email
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password using Bun.password.verify
    const isPasswordValid = await Bun.password.verify(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token (simple implementation - in production use proper JWT library)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    return {
      user: {
        id: user.id,
        email: user.email,
        password: '', // Never return actual password
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    };
  } catch (error) {
    console.error('User login failed:', error);
    throw error;
  }
};
