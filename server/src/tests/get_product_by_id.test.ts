
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getProductById } from '../handlers/get_product_by_id';

describe('getProductById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product when product exists', async () => {
    // Create test product
    const insertResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        price: '29.99',
        image_url: 'https://example.com/image.jpg',
        is_active: true
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];

    // Get product by ID
    const result = await getProductById(createdProduct.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdProduct.id);
    expect(result!.name).toEqual('Test Product');
    expect(result!.description).toEqual('A test product');
    expect(result!.price).toEqual(29.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toEqual('https://example.com/image.jpg');
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when product does not exist', async () => {
    const result = await getProductById(999);
    expect(result).toBeNull();
  });

  it('should handle inactive products', async () => {
    // Create inactive product
    const insertResult = await db.insert(productsTable)
      .values({
        name: 'Inactive Product',
        description: 'An inactive product',
        price: '15.50',
        image_url: null,
        is_active: false
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];

    // Should still return inactive products
    const result = await getProductById(createdProduct.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdProduct.id);
    expect(result!.name).toEqual('Inactive Product');
    expect(result!.is_active).toEqual(false);
    expect(result!.price).toEqual(15.50);
    expect(typeof result!.price).toEqual('number');
  });
});
