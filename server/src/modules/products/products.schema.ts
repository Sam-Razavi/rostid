import { z } from 'zod';

export const listProductsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    roast: z.enum(['light', 'medium', 'dark']).optional(),
    search: z.string().optional(),
    minPrice: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 50) : 12)),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional().default('newest'),
    exclude: z.string().optional(),
    inStock: z.string().optional().transform((v) => v === 'true' ? true : undefined),
  }),
});

export type ListProductsQuery = z.infer<typeof listProductsSchema>['query'];
