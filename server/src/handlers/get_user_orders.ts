
import { db } from '../db';
import { ordersTable, orderItemsTable } from '../db/schema';
import { type OrderWithItems } from '../schema';
import { eq } from 'drizzle-orm';

export async function getUserOrders(userId: number): Promise<OrderWithItems[]> {
  try {
    // Query orders with their items for the specific user
    const results = await db.select()
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.order_id))
      .where(eq(ordersTable.user_id, userId))
      .execute();

    // Group order items by order ID
    const ordersMap = new Map<number, OrderWithItems>();

    for (const result of results) {
      const order = result.orders;
      const orderItem = result.order_items;

      // Convert numeric fields back to numbers
      const orderData = {
        ...order,
        total_amount: parseFloat(order.total_amount)
      };

      // Initialize order in map if not exists
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          ...orderData,
          items: []
        });
      }

      // Add order item if it exists (leftJoin might return null for orders without items)
      if (orderItem) {
        const existingOrder = ordersMap.get(order.id)!;
        existingOrder.items.push({
          ...orderItem,
          price: parseFloat(orderItem.price)
        });
      }
    }

    // Convert map to array and sort by created_at descending (newest first)
    return Array.from(ordersMap.values()).sort((a, b) => 
      b.created_at.getTime() - a.created_at.getTime()
    );
  } catch (error) {
    console.error('Failed to get user orders:', error);
    throw error;
  }
}
