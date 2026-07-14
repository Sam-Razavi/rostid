import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9-]+$/),
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
    trackingNumber: z.string().trim().min(1).max(120).optional().nullable(),
    carrier: z.string().trim().min(1).max(80).optional().nullable(),
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

export const updateReturnStatusSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected', 'refunded']),
    refundOre: z.number().int().positive().optional(),
  }),
});

export const createGiftCardSchema = z.object({
  body: z.object({
    balanceOre: z.number().int().positive(),
    expiresAt: z.string().datetime().optional().nullable(),
  }),
});

export const createDiscountSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(64).toUpperCase(),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive(),
    minOrderOre: z.number().int().min(0).optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
  }),
});

export const updateCustomerNoteSchema = z.object({
  body: z.object({ adminNote: z.string().max(1000) }),
});

export const adjustLoyaltySchema = z.object({
  body: z.object({
    delta: z
      .number()
      .int()
      .refine((n) => n !== 0, { message: 'delta must be non-zero' }),
    reason: z.string().min(1).max(200),
  }),
});

export const bulkProductActionSchema = z.object({
  body: z.object({
    ids: z.array(z.string().cuid()).min(1).max(100),
    action: z.enum(['activate', 'deactivate']),
  }),
});

export type AdjustLoyaltyInput = z.infer<typeof adjustLoyaltySchema>['body'];
export type BulkProductActionInput = z.infer<typeof bulkProductActionSchema>['body'];
export type CreateGiftCardInput = z.infer<typeof createGiftCardSchema>['body'];
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>['body'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type CreateVariantInput = z.infer<typeof createVariantSchema>['body'];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body'];
