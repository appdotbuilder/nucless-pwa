
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { deleteProduct } from '../handlers/delete_product';
import { eq } from 'drizzle-orm';

// Test product input
const testProductInput: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 19.99,
  image_url: 'https://example.com/image.jpg',
  is_active: true
};

describe('deleteProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should soft delete a product by setting is_active to false', async () => {
    // Create test product first
    const insertResult = await db.insert(productsTable)
      .values({
        name: testProductInput.name,
        description: testProductInput.description,
        price: testProductInput.price.toString(),
        image_url: testProductInput.image_url,
        is_active: testProductInput.is_active
      })
      .returning()
      .execute();

    const productId = insertResult[0].id;

    // Verify product is initially active
    const beforeDelete = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(beforeDelete).toHaveLength(1);
    expect(beforeDelete[0].is_active).toBe(true);

    // Delete the product
    await deleteProduct(productId);

    // Verify product is now inactive
    const afterDelete = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].is_active).toBe(false);
    expect(afterDelete[0].updated_at).toBeInstanceOf(Date);
    expect(afterDelete[0].updated_at > beforeDelete[0].updated_at).toBe(true);
  });

  it('should not affect other products when deleting one', async () => {
    // Create two test products
    const product1 = await db.insert(productsTable)
      .values({
        name: 'Product 1',
        description: 'First product',
        price: '10.00',
        image_url: null,
        is_active: true
      })
      .returning()
      .execute();

    const product2 = await db.insert(productsTable)
      .values({
        name: 'Product 2',
        description: 'Second product',
        price: '20.00',
        image_url: null,
        is_active: true
      })
      .returning()
      .execute();

    // Delete first product
    await deleteProduct(product1[0].id);

    // Verify first product is inactive
    const deletedProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product1[0].id))
      .execute();

    expect(deletedProduct[0].is_active).toBe(false);

    // Verify second product is still active
    const activeProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product2[0].id))
      .execute();

    expect(activeProduct[0].is_active).toBe(true);
  });

  it('should handle deleting non-existent product gracefully', async () => {
    // Try to delete a product that doesn't exist
    const nonExistentId = 99999;
    
    // Should not throw an error
    await expect(deleteProduct(nonExistentId)).resolves.toBeUndefined();
  });

  it('should handle deleting already inactive product', async () => {
    // Create inactive product
    const insertResult = await db.insert(productsTable)
      .values({
        name: 'Inactive Product',
        description: 'Already inactive',
        price: '15.00',
        image_url: null,
        is_active: false
      })
      .returning()
      .execute();

    const productId = insertResult[0].id;

    // Delete already inactive product
    await deleteProduct(productId);

    // Verify it's still inactive and updated_at changed
    const result = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(result[0].is_active).toBe(false);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].updated_at > insertResult[0].updated_at).toBe(true);
  });
});
