
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable } from '../db/schema';
import { type UpdateOrderStatusInput } from '../schema';
import { updateOrderStatus } from '../handlers/update_order_status';
import { eq } from 'drizzle-orm';

describe('updateOrderStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;
  let testOrderId: number;

  beforeEach(async () => {
    // Create a test user directly in database
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '08123456789',
        role: 'customer'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create a test order directly in database
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: testUserId,
        customer_name: 'John Doe',
        customer_phone: '08123456789',
        customer_address: '123 Test Street',
        notes: 'Test notes',
        total_amount: '100.00',
        status: 'pending'
      })
      .returning()
      .execute();
    testOrderId = orderResult[0].id;
  });

  it('should update order status successfully', async () => {
    const input: UpdateOrderStatusInput = {
      id: testOrderId,
      status: 'processing'
    };

    const result = await updateOrderStatus(input);

    expect(result.id).toEqual(testOrderId);
    expect(result.status).toEqual('processing');
    expect(result.user_id).toEqual(testUserId);
    expect(result.customer_name).toEqual('John Doe');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(typeof result.total_amount).toBe('number');
    expect(result.total_amount).toEqual(100);
  });

  it('should save updated status to database', async () => {
    const input: UpdateOrderStatusInput = {
      id: testOrderId,
      status: 'completed'
    };

    await updateOrderStatus(input);

    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, testOrderId))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].status).toEqual('completed');
    expect(orders[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update order status from pending to delivered', async () => {
    const input: UpdateOrderStatusInput = {
      id: testOrderId,
      status: 'delivered'
    };

    const result = await updateOrderStatus(input);

    expect(result.status).toEqual('delivered');
    expect(result.id).toEqual(testOrderId);
  });

  it('should throw error for non-existent order', async () => {
    const input: UpdateOrderStatusInput = {
      id: 99999,
      status: 'processing'
    };

    expect(async () => {
      await updateOrderStatus(input);
    }).toThrow(/Order with id 99999 not found/);
  });

  it('should handle all valid order statuses', async () => {
    const statuses = ['pending', 'processing', 'delivered', 'completed'] as const;

    for (const status of statuses) {
      const input: UpdateOrderStatusInput = {
        id: testOrderId,
        status: status
      };

      const result = await updateOrderStatus(input);
      expect(result.status).toEqual(status);
    }
  });
});
