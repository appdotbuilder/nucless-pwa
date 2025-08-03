
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterUserInput, type AuthResponse } from '../schema';
import { eq } from 'drizzle-orm';

export const registerUser = async (input: RegisterUserInput): Promise<AuthResponse> => {
  try {
    // Check if user with this email already exists
    const existingUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash the password (using a simple hash for demonstration - in production use bcrypt)
    const hashedPassword = await Bun.password.hash(input.password);

    // Insert new user
    const result = await db.insert(usersTable)
      .values({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        phone: input.phone,
        role: input.role
      })
      .returning()
      .execute();

    const user = result[0];

    // Generate JWT token (simple implementation - in production use proper JWT library)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    return {
      user: {
        ...user,
        password: '' // Never return actual password
      },
      token
    };
  } catch (error) {
    console.error('User registration failed:', error);
    throw error;
  }
};
