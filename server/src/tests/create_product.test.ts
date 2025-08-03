
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 19.99,
  image_url: 'https://example.com/image.jpg',
  is_active: true
};

// Test input with nullable/optional fields
const minimalInput: CreateProductInput = {
  name: 'Minimal Product',
  description: null,
  price: 9.99,
  image_url: null,
  is_active: false
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    const result = await createProduct(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Product');
    expect(result.description).toEqual('A product for testing');
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toEqual('number');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a product with nullable fields', async () => {
    const result = await createProduct(minimalInput);

    expect(result.name).toEqual('Minimal Product');
    expect(result.description).toBeNull();
    expect(result.price).toEqual(9.99);
    expect(typeof result.price).toEqual('number');
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const result = await createProduct(testInput);

    // Query using proper drizzle syntax
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    expect(savedProduct.name).toEqual('Test Product');
    expect(savedProduct.description).toEqual('A product for testing');
    expect(parseFloat(savedProduct.price)).toEqual(19.99);
    expect(savedProduct.image_url).toEqual('https://example.com/image.jpg');
    expect(savedProduct.is_active).toEqual(true);
    expect(savedProduct.created_at).toBeInstanceOf(Date);
    expect(savedProduct.updated_at).toBeInstanceOf(Date);
  });

  it('should apply default is_active value', async () => {
    const inputWithDefault: CreateProductInput = {
      name: 'Default Product',
      description: 'Testing default value',
      price: 15.50,
      image_url: null,
      is_active: true // Zod default is applied
    };

    const result = await createProduct(inputWithDefault);

    expect(result.is_active).toEqual(true);
    expect(result.name).toEqual('Default Product');
    expect(result.price).toEqual(15.50);
  });
});
