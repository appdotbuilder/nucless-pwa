
import { db } from '../db';
import { productsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    // Soft delete by setting is_active to false
    await db.update(productsTable)
      .set({ 
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(productsTable.id, id))
      .execute();
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
