
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type OrderWithItems } from '../schema';
import { eq } from 'drizzle-orm';

export const getOrders = async (): Promise<OrderWithItems[]> => {
  try {
    // First, get all orders
    const orders = await db.select()
      .from(ordersTable)
      .execute();

    // Then get all order items for all orders
    const orderItems = await db.select()
      .from(orderItemsTable)
      .execute();

    // Group order items by order_id for efficient lookup
    const itemsByOrderId = orderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push({
        ...item,
        price: parseFloat(item.price) // Convert numeric field to number
      });
      return acc;
    }, {} as { [key: number]: any[] });

    // Combine orders with their items
    return orders.map(order => ({
      ...order,
      total_amount: parseFloat(order.total_amount), // Convert numeric field to number
      items: itemsByOrderId[order.id] || []
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};
