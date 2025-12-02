import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
    description: z.string().min(1),
    priceOre: z.number().int().positive(),
    categoryId: z.string().cuid(),
    roastLevel: z.enum(['light', 'medium', 'dark']).optional().nullable(),
    origin: z.string().optional().nullable(),
    tastingNotes: z.string().optional().nullable(),
    weightGrams: z.number().int().positive().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  }),
});

export const createVariantSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    grind: z.enum(['whole_bean', 'coarse', 'medium', 'fine']).optional().nullable(),
    priceOre: z.number().int().positive(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
  }),
});

export const updateVariantSchema = z.object({
  body: createVariantSchema.shape.body.partial(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type CreateVariantInput = z.infer<typeof createVariantSchema>['body'];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body'];
