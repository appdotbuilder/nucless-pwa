
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, productsTable, ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testProduct1Id: number;
  let testProduct2Id: number;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789',
        role: 'customer'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create test products
    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Nucless Galon 19L',
        description: 'Premium water gallon',
        price: '15000.00',
        is_active: true
      })
      .returning()
      .execute();
    testProduct1Id = product1Result[0].id;

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Nucless Botol 600ml',
        description: 'Bottled water',
        price: '5000.00',
        is_active: true
      })
      .returning()
      .execute();
    testProduct2Id = product2Result[0].id;
  });

  const testInput: CreateOrderInput = {
    user_id: 0, // Will be set in tests
    customer_name: 'John Doe',
    customer_phone: '08123456789',
    customer_address: 'Jl. Test No. 123, Jakarta',
    notes: 'Deliver in the morning',
    items: [
      {
        product_id: 0, // Will be set in tests
        quantity: 2
      },
      {
        product_id: 0, // Will be set in tests
        quantity: 3
      }
    ]
  };

  it('should create order with items successfully', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      items: [
        { product_id: testProduct1Id, quantity: 2 },
        { product_id: testProduct2Id, quantity: 3 }
      ]
    };

    const result = await createOrder(input);

    // Verify order fields
    expect(result.user_id).toEqual(testUserId);
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_phone).toEqual('08123456789');
    expect(result.customer_address).toEqual('Jl. Test No. 123, Jakarta');
    expect(result.notes).toEqual('Deliver in the morning');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify calculated total (2 * 15000 + 3 * 5000 = 45000)
    expect(result.total_amount).toEqual(45000);
    expect(typeof result.total_amount).toBe('number');

    // Verify order items
    expect(result.items).toHaveLength(2);
    
    const item1 = result.items.find(item => item.product_id === testProduct1Id);
    expect(item1).toBeDefined();
    expect(item1!.product_name).toEqual('Nucless Galon 19L');
    expect(item1!.quantity).toEqual(2);
    expect(item1!.price).toEqual(15000);
    expect(typeof item1!.price).toBe('number');

    const item2 = result.items.find(item => item.product_id === testProduct2Id);
    expect(item2).toBeDefined();
    expect(item2!.product_name).toEqual('Nucless Botol 600ml');
    expect(item2!.quantity).toEqual(3);
    expect(item2!.price).toEqual(5000);
    expect(typeof item2!.price).toBe('number');
  });

  it('should save order and items to database', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      items: [{ product_id: testProduct1Id, quantity: 1 }]
    };

    const result = await createOrder(input);

    // Verify order in database
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].customer_name).toEqual('John Doe');
    expect(parseFloat(orders[0].total_amount)).toEqual(15000);

    // Verify order items in database
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(1);
    expect(orderItems[0].product_name).toEqual('Nucless Galon 19L');
    expect(orderItems[0].quantity).toEqual(1);
  });

  it('should handle orders with null notes', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      notes: null,
      items: [{ product_id: testProduct1Id, quantity: 1 }]
    };

    const result = await createOrder(input);

    expect(result.notes).toBeNull();
    expect(result.total_amount).toEqual(15000);
  });

  it('should throw error for non-existent product', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      items: [{ product_id: 99999, quantity: 1 }]
    };

    expect(createOrder(input)).rejects.toThrow(/Product with ID 99999 not found/i);
  });

  it('should throw error for inactive product', async () => {
    // Create inactive product
    const inactiveProductResult = await db.insert(productsTable)
      .values({
        name: 'Inactive Product',
        description: 'This product is inactive',
        price: '10000.00',
        is_active: false
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      user_id: testUserId,
      items: [{ product_id: inactiveProductResult[0].id, quantity: 1 }]
    };

    expect(createOrder(input)).rejects.toThrow(/is not active/i);
  });

  it('should calculate total correctly for multiple items', async () => {
    const input = {
      ...testInput,
      user_id: testUserId,
      items: [
        { product_id: testProduct1Id, quantity: 5 }, // 5 * 15000 = 75000
        { product_id: testProduct2Id, quantity: 10 } // 10 * 5000 = 50000
      ]
    };

    const result = await createOrder(input);

    // Total should be 75000 + 50000 = 125000
    expect(result.total_amount).toEqual(125000);
    expect(result.items).toHaveLength(2);
  });
});
