import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '../schema';

export const seedAdminUser = async (): Promise<User | null> => {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if any admin user already exists
    const existingAdmins = await db.select()
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
      .limit(1)
      .execute();

    if (existingAdmins.length > 0) {
      console.log('✅ Admin user already exists, skipping seed');
      console.log(`   Existing admin: ${existingAdmins[0].email}`);
      return null;
    }

    console.log('📝 Creating default admin user...');

    // Hash the password using Bun's password hashing
    const hashedPassword = await Bun.password.hash('admin123');

    // Create the default admin user
    const result = await db.insert(usersTable)
      .values({
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Admin User',
        phone: null,
        role: 'admin'
      })
      .returning()
      .execute();

    const adminUser = result[0];

    console.log('✅ Default admin user created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Password: admin123 (change this in production!)`);

    // Return user without password for security
    return {
      ...adminUser,
      password: '' // Never return actual password
    };
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    throw error;
  }
};

// Allow direct execution of this script
if (import.meta.main) {
  console.log('🚀 Nucless Admin Seeder');
  console.log('========================');
  
  seedAdminUser()
    .then((result) => {
      if (result) {
        console.log('🎉 Admin user seeding completed successfully!');
        console.log('   You can now login with:');
        console.log('   - Email: admin@demo.com');
        console.log('   - Password: admin123');
      } else {
        console.log('ℹ️  Admin user seeding skipped (admin already exists)');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin user seeding failed:', error);
      process.exit(1);
    });
}