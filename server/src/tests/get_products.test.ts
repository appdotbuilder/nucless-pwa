
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return active products only', async () => {
    // Create test products - one active, one inactive
    await db.insert(productsTable).values([
      {
        name: 'Active Product',
        description: 'This product is active',
        price: '29.99',
        image_url: null,
        is_active: true
      },
      {
        name: 'Inactive Product',
        description: 'This product is inactive',
        price: '19.99',
        image_url: null,
        is_active: false
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Active Product');
    expect(result[0].is_active).toBe(true);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(29.99);
  });

  it('should return all product fields correctly', async () => {
    await db.insert(productsTable).values({
      name: 'Test Product',
      description: 'Test description',
      price: '15.50',
      image_url: 'https://example.com/image.jpg',
      is_active: true
    }).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    const product = result[0];
    
    expect(product.id).toBeDefined();
    expect(product.name).toEqual('Test Product');
    expect(product.description).toEqual('Test description');
    expect(product.price).toEqual(15.50);
    expect(typeof product.price).toBe('number');
    expect(product.image_url).toEqual('https://example.com/image.jpg');
    expect(product.is_active).toBe(true);
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple active products', async () => {
    await db.insert(productsTable).values([
      {
        name: 'Product 1',
        description: 'First product',
        price: '10.00',
        image_url: null,
        is_active: true
      },
      {
        name: 'Product 2', 
        description: 'Second product',
        price: '20.00',
        image_url: null,
        is_active: true
      },
      {
        name: 'Product 3',
        description: 'Third product',
        price: '30.00',
        image_url: null,
        is_active: false
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    expect(result.every(product => product.is_active)).toBe(true);
    expect(result.every(product => typeof product.price === 'number')).toBe(true);
  });
});
