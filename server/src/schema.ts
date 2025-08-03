
import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['customer', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  role: userRoleSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// User input schemas
export const registerUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().nullable(),
  role: userRoleSchema.default('customer')
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

export const loginUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginUserInput = z.infer<typeof loginUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Product input schemas
export const createProductInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  image_url: z.string().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Order status enum
export const orderStatusSchema = z.enum(['pending', 'processing', 'delivered', 'completed']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  customer_name: z.string(),
  customer_phone: z.string(),
  customer_address: z.string(),
  notes: z.string().nullable(),
  total_amount: z.number(),
  status: orderStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Order item schema
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  product_name: z.string(),
  quantity: z.number().int(),
  price: z.number(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Order input schemas
export const createOrderInputSchema = z.object({
  user_id: z.number(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  customer_address: z.string().min(1),
  notes: z.string().nullable(),
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive()
  })).min(1)
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const updateOrderStatusInputSchema = z.object({
  id: z.number(),
  status: orderStatusSchema
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;

// Settings schema for WhatsApp admin number
export const settingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Setting = z.infer<typeof settingSchema>;

export const updateSettingInputSchema = z.object({
  key: z.string(),
  value: z.string()
});

export type UpdateSettingInput = z.infer<typeof updateSettingInputSchema>;

// Order with items schema for detailed order views
export const orderWithItemsSchema = orderSchema.extend({
  items: z.array(orderItemSchema)
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
