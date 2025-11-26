-- Product variants: fetch all variants for a product (admin + storefront)
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants"("product_id");
