import { z } from 'zod';

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(99).default(1),
  }),
});

export type AddItemInput = z.infer<typeof addItemSchema>['body'];

export const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).max(99),
  }),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>['body'];
