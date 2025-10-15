import { z } from 'zod';

export const submitReturnSchema = z.object({
  body: z.object({
    reason: z.string().min(1).max(1000),
    items: z.array(
      z.object({
        orderItemId: z.string().cuid(),
        quantity: z.number().int().min(1),
      })
    ).min(1),
  }),
});
