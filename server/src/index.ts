
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  registerUserInputSchema,
  loginUserInputSchema,
  updateUserInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  createOrderInputSchema,
  updateOrderStatusInputSchema,
  updateSettingInputSchema
} from './schema';

// Import handlers
import { registerUser } from './handlers/register_user';
import { loginUser } from './handlers/login_user';
import { getUserProfile } from './handlers/get_user_profile';
import { updateUserProfile } from './handlers/update_user_profile';
import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { getProductById } from './handlers/get_product_by_id';
import { updateProduct } from './handlers/update_product';
import { deleteProduct } from './handlers/delete_product';
import { createOrder } from './handlers/create_order';
import { getOrders } from './handlers/get_orders';
import { getUserOrders } from './handlers/get_user_orders';
import { updateOrderStatus } from './handlers/update_order_status';
import { getSetting } from './handlers/get_setting';
import { updateSetting } from './handlers/update_setting';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Auth routes
  register: publicProcedure
    .input(registerUserInputSchema)
    .mutation(({ input }) => registerUser(input)),

  login: publicProcedure
    .input(loginUserInputSchema)
    .mutation(({ input }) => loginUser(input)),

  // User routes
  getUserProfile: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserProfile(input)),

  updateUserProfile: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUserProfile(input)),

  // Product routes
  getProducts: publicProcedure
    .query(() => getProducts()),

  getProductById: publicProcedure
    .input(z.number())
    .query(({ input }) => getProductById(input)),

  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),

  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),

  deleteProduct: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteProduct(input)),

  // Order routes
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),

  getOrders: publicProcedure
    .query(() => getOrders()),

  getUserOrders: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserOrders(input)),

  updateOrderStatus: publicProcedure
    .input(updateOrderStatusInputSchema)
    .mutation(({ input }) => updateOrderStatus(input)),

  // Settings routes
  getSetting: publicProcedure
    .input(z.string())
    .query(({ input }) => getSetting(input)),

  updateSetting: publicProcedure
    .input(updateSettingInputSchema)
    .mutation(({ input }) => updateSetting(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
