
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput, type UpdateProductInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

// Test product for setup
const testProductInput: CreateProductInput = {
  name: 'Original Product',
  description: 'Original description',
  price: 29.99,
  image_url: 'https://example.com/original.jpg',
  is_active: true
};

// Helper function to create a test product
const createTestProduct = async (input: CreateProductInput) => {
  const result = await db.insert(productsTable)
    .values({
      name: input.name,
      description: input.description,
      price: input.price.toString(),
      image_url: input.image_url,
      is_active: input.is_active
    })
    .returning()
    .execute();

  const product = result[0];
  return {
    ...product,
    price: parseFloat(product.price)
  };
};

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update product name', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: created.id,
      name: 'Updated Product Name'
    };

    const result = await updateProduct(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.description).toEqual(testProductInput.description);
    expect(result.price).toEqual(testProductInput.price);
    expect(result.image_url).toEqual(testProductInput.image_url);
    expect(result.is_active).toEqual(testProductInput.is_active);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > created.updated_at).toBe(true);
  });

  it('should update multiple fields', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: created.id,
      name: 'New Name',
      description: 'New description',
      price: 39.99,
      is_active: false
    };

    const result = await updateProduct(updateInput);

    expect(result.name).toEqual('New Name');
    expect(result.description).toEqual('New description');
    expect(result.price).toEqual(39.99);
    expect(typeof result.price).toEqual('number');
    expect(result.is_active).toEqual(false);
    expect(result.image_url).toEqual(testProductInput.image_url); // Unchanged
  });

  it('should update product in database', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: created.id,
      name: 'Database Updated Name',
      price: 49.99
    };

    await updateProduct(updateInput);

    // Verify database was updated
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, created.id))
      .execute();

    expect(products).toHaveLength(1);
    const dbProduct = products[0];
    expect(dbProduct.name).toEqual('Database Updated Name');
    expect(parseFloat(dbProduct.price)).toEqual(49.99);
    expect(dbProduct.description).toEqual(testProductInput.description); // Unchanged
    expect(dbProduct.updated_at).toBeInstanceOf(Date);
    expect(dbProduct.updated_at > created.updated_at).toBe(true);
  });

  it('should handle nullable fields correctly', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: created.id,
      description: null,
      image_url: null
    };

    const result = await updateProduct(updateInput);

    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.name).toEqual(testProductInput.name); // Unchanged
    expect(result.price).toEqual(testProductInput.price); // Unchanged
  });

  it('should throw error for non-existent product', async () => {
    const updateInput: UpdateProductInput = {
      id: 99999,
      name: 'Non-existent Product'
    };

    expect(updateProduct(updateInput)).rejects.toThrow(/Product with id 99999 not found/i);
  });

  it('should update only specified fields', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: created.id,
      price: 19.99
    };

    const result = await updateProduct(updateInput);

    // Only price should change
    expect(result.price).toEqual(19.99);
    expect(result.name).toEqual(testProductInput.name);
    expect(result.description).toEqual(testProductInput.description);
    expect(result.image_url).toEqual(testProductInput.image_url);
    expect(result.is_active).toEqual(testProductInput.is_active);
  });

  it('should preserve created_at but update updated_at', async () => {
    // Create test product
    const created = await createTestProduct(testProductInput);
    const originalCreatedAt = created.created_at;
    const originalUpdatedAt = created.updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProductInput = {
      id: created.id,
      name: 'Time Test Product'
    };

    const result = await updateProduct(updateInput);

    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > originalUpdatedAt).toBe(true);
  });
});
