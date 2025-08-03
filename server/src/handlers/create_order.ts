
import { db } from '../db';
import { ordersTable, orderItemsTable, productsTable } from '../db/schema';
import { type CreateOrderInput, type OrderWithItems } from '../schema';
import { eq, inArray } from 'drizzle-orm';

export const createOrder = async (input: CreateOrderInput): Promise<OrderWithItems> => {
  try {
    // Step 1: Validate all products exist and are active
    const productIds = input.items.map(item => item.product_id);
    const products = await db.select()
      .from(productsTable)
      .where(inArray(productsTable.id, productIds))
      .execute();

    // Check if all products exist and are active
    const productMap = new Map(products.map(p => [p.id, p]));
    
    for (const item of input.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      if (!product.is_active) {
        throw new Error(`Product "${product.name}" is not active`);
      }
    }

    // Step 2: Calculate total amount
    let totalAmount = 0;
    for (const item of input.items) {
      const product = productMap.get(item.product_id)!;
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // Step 3: Create order record
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: input.user_id,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        customer_address: input.customer_address,
        notes: input.notes,
        total_amount: totalAmount.toString()
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Step 4: Create order items
    const orderItemsData = input.items.map(item => {
      const product = productMap.get(item.product_id)!;
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price
      };
    });

    const orderItemsResult = await db.insert(orderItemsTable)
      .values(orderItemsData)
      .returning()
      .execute();

    // Step 5: Return order with items (convert numeric fields)
    return {
      ...order,
      total_amount: parseFloat(order.total_amount),
      items: orderItemsResult.map(item => ({
        ...item,
        price: parseFloat(item.price)
      }))
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
