
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, productsTable, ordersTable, orderItemsTable } from '../db/schema';
import { getUserOrders } from '../handlers/get_user_orders';

describe('getUserOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for user with no orders', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        phone: null,
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(0);
  });

  it('should return user orders with items', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        phone: null,
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create products
    const productResults = await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          description: 'Test product 1',
          price: '19.99',
          image_url: null,
          is_active: true
        },
        {
          name: 'Product 2',
          description: 'Test product 2',
          price: '29.99',
          image_url: null,
          is_active: true
        }
      ])
      .returning()
      .execute();

    const product1Id = productResults[0].id;
    const product2Id = productResults[1].id;

    // Create an order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        customer_address: '123 Test St',
        notes: 'Test order',
        total_amount: '49.98',
        status: 'pending'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Create order items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: orderId,
          product_id: product1Id,
          product_name: 'Product 1',
          quantity: 1,
          price: '19.99'
        },
        {
          order_id: orderId,
          product_id: product2Id,
          product_name: 'Product 2',
          quantity: 1,
          price: '29.99'
        }
      ])
      .execute();

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(1);
    
    const order = orders[0];
    expect(order.id).toEqual(orderId);
    expect(order.user_id).toEqual(userId);
    expect(order.customer_name).toEqual('John Doe');
    expect(order.customer_phone).toEqual('+1234567890');
    expect(order.customer_address).toEqual('123 Test St');
    expect(order.notes).toEqual('Test order');
    expect(order.total_amount).toEqual(49.98);
    expect(typeof order.total_amount).toBe('number');
    expect(order.status).toEqual('pending');
    expect(order.created_at).toBeInstanceOf(Date);

    expect(order.items).toHaveLength(2);
    
    const item1 = order.items.find(item => item.product_name === 'Product 1');
    const item2 = order.items.find(item => item.product_name === 'Product 2');
    
    expect(item1).toBeDefined();
    expect(item1!.quantity).toEqual(1);
    expect(item1!.price).toEqual(19.99);
    expect(typeof item1!.price).toBe('number');
    
    expect(item2).toBeDefined();
    expect(item2!.quantity).toEqual(1);
    expect(item2!.price).toEqual(29.99);
    expect(typeof item2!.price).toBe('number');
  });

  it('should return multiple orders sorted by newest first', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        phone: null,
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create orders with slight delay to ensure different timestamps
    const order1Result = await db.insert(ordersTable)
      .values({
        user_id: userId,
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        customer_address: '123 Test St',
        notes: 'First order',
        total_amount: '10.00',
        status: 'pending'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const order2Result = await db.insert(ordersTable)
      .values({
        user_id: userId,
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        customer_address: '123 Test St',
        notes: 'Second order',
        total_amount: '20.00',
        status: 'completed'
      })
      .returning()
      .execute();

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(2);
    
    // Should be sorted by newest first (second order first)
    expect(orders[0].notes).toEqual('Second order');
    expect(orders[0].total_amount).toEqual(20.00);
    expect(orders[1].notes).toEqual('First order');
    expect(orders[1].total_amount).toEqual(10.00);
  });

  it('should not return orders from other users', async () => {
    // Create two users
    const userResults = await db.insert(usersTable)
      .values([
        {
          email: 'user1@test.com',
          password: 'password123',
          name: 'User 1',
          phone: null,
          role: 'customer'
        },
        {
          email: 'user2@test.com',
          password: 'password123',
          name: 'User 2',
          phone: null,
          role: 'customer'
        }
      ])
      .returning()
      .execute();

    const user1Id = userResults[0].id;
    const user2Id = userResults[1].id;

    // Create orders for both users
    await db.insert(ordersTable)
      .values([
        {
          user_id: user1Id,
          customer_name: 'User 1 Order',
          customer_phone: '+1111111111',
          customer_address: '111 Test St',
          notes: null,
          total_amount: '10.00',
          status: 'pending'
        },
        {
          user_id: user2Id,
          customer_name: 'User 2 Order',
          customer_phone: '+2222222222',
          customer_address: '222 Test St',
          notes: null,
          total_amount: '20.00',
          status: 'pending'
        }
      ])
      .execute();

    const user1Orders = await getUserOrders(user1Id);
    const user2Orders = await getUserOrders(user2Id);

    expect(user1Orders).toHaveLength(1);
    expect(user1Orders[0].customer_name).toEqual('User 1 Order');
    expect(user1Orders[0].total_amount).toEqual(10.00);

    expect(user2Orders).toHaveLength(1);
    expect(user2Orders[0].customer_name).toEqual('User 2 Order');
    expect(user2Orders[0].total_amount).toEqual(20.00);
  });

  it('should handle orders without items', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        phone: null,
        role: 'customer'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create an order without items
    await db.insert(ordersTable)
      .values({
        user_id: userId,
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        customer_address: '123 Test St',
        notes: null,
        total_amount: '0.00',
        status: 'pending'
      })
      .execute();

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(1);
    expect(orders[0].items).toHaveLength(0);
    expect(orders[0].total_amount).toEqual(0.00);
  });
});
