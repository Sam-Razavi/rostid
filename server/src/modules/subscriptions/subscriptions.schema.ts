import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    productId: z.string().cuid(),
    intervalDays: z.union([z.literal(14), z.literal(30), z.literal(60)]),
    variantId: z.string().cuid().nullable().optional(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'paused', 'cancelled']).optional(),
    intervalDays: z.union([z.literal(14), z.literal(30), z.literal(60)]).optional(),
  }),
});
