
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

    // Verify password (in a real app, you'd use bcrypt.compare)
    if (user.password !== input.password) {
      throw new Error('Invalid email or password');
    }

    // Generate a simple JWT token (in a real app, you'd use proper JWT library)
    const token = `jwt-${user.id}-${Date.now()}`;

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
