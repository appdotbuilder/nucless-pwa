
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable, orderItemsTable, productsTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { getOrders } from '../handlers/get_orders';

describe('getOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no orders exist', async () => {
    const result = await getOrders();
    expect(result).toEqual([]);
  });

  it('should return orders with their items', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        role: 'customer'
      })
      .returning()
      .execute();

    const [product] = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        description: 'A test product',
        price: '29.99',
        is_active: true
      })
      .returning()
      .execute();

    // Create order
    const [order] = await db.insert(ordersTable)
      .values({
        user_id: user.id,
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        customer_address: '123 Main St',
        notes: 'Test order',
        total_amount: '59.98',
        status: 'pending'
      })
      .returning()
      .execute();

    // Create order items
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          quantity: 2,
          price: '29.99'
        }
      ])
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(order.id);
    expect(result[0].customer_name).toEqual('John Doe');
    expect(result[0].customer_phone).toEqual('9876543210');
    expect(result[0].customer_address).toEqual('123 Main St');
    expect(result[0].notes).toEqual('Test order');
    expect(result[0].total_amount).toEqual(59.98);
    expect(typeof result[0].total_amount).toEqual('number');
    expect(result[0].status).toEqual('pending');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check order items
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].product_id).toEqual(product.id);
    expect(result[0].items[0].product_name).toEqual('Test Product');
    expect(result[0].items[0].quantity).toEqual(2);
    expect(result[0].items[0].price).toEqual(29.99);
    expect(typeof result[0].items[0].price).toEqual('number');
    expect(result[0].items[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple orders with their respective items', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        role: 'customer'
      })
      .returning()
      .execute();

    const products = await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          description: 'First product',
          price: '19.99',
          is_active: true
        },
        {
          name: 'Product 2',
          description: 'Second product',
          price: '39.99',
          is_active: true
        }
      ])
      .returning()
      .execute();

    // Create two orders
    const orders = await db.insert(ordersTable)
      .values([
        {
          user_id: user.id,
          customer_name: 'John Doe',
          customer_phone: '9876543210',
          customer_address: '123 Main St',
          notes: 'First order',
          total_amount: '19.99',
          status: 'pending'
        },
        {
          user_id: user.id,
          customer_name: 'Jane Smith',
          customer_phone: '5555555555',
          customer_address: '456 Oak Ave',
          notes: 'Second order',
          total_amount: '79.98',
          status: 'processing'
        }
      ])
      .returning()
      .execute();

    // Create order items for both orders
    await db.insert(orderItemsTable)
      .values([
        {
          order_id: orders[0].id,
          product_id: products[0].id,
          product_name: products[0].name,
          quantity: 1,
          price: '19.99'
        },
        {
          order_id: orders[1].id,
          product_id: products[1].id,
          product_name: products[1].name,
          quantity: 2,
          price: '39.99'
        }
      ])
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);

    // Find orders by customer name for verification
    const johnOrder = result.find(o => o.customer_name === 'John Doe');
    const janeOrder = result.find(o => o.customer_name === 'Jane Smith');

    expect(johnOrder).toBeDefined();
    expect(johnOrder!.items).toHaveLength(1);
    expect(johnOrder!.items[0].product_name).toEqual('Product 1');
    expect(johnOrder!.items[0].quantity).toEqual(1);
    expect(johnOrder!.total_amount).toEqual(19.99);

    expect(janeOrder).toBeDefined();
    expect(janeOrder!.items).toHaveLength(1);
    expect(janeOrder!.items[0].product_name).toEqual('Product 2');
    expect(janeOrder!.items[0].quantity).toEqual(2);
    expect(janeOrder!.total_amount).toEqual(79.98);
  });

  it('should return orders without items when no items exist', async () => {
    // Create prerequisite data
    const [user] = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '1234567890',
        role: 'customer'
      })
      .returning()
      .execute();

    // Create order without items
    await db.insert(ordersTable)
      .values({
        user_id: user.id,
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        customer_address: '123 Main St',
        notes: 'Order without items',
        total_amount: '0.00',
        status: 'pending'
      })
      .execute();

    const result = await getOrders();

    expect(result).toHaveLength(1);
    expect(result[0].customer_name).toEqual('John Doe');
    expect(result[0].items).toEqual([]);
  });
});
