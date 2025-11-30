-- Products: category-filtered storefront queries and sorted product list
CREATE INDEX IF NOT EXISTS "products_category_active_idx" ON "products"("category_id", "is_active");
CREATE INDEX IF NOT EXISTS "products_active_created_idx" ON "products"("is_active", "created_at" DESC);

-- Returns: user return history and per-order lookup
CREATE INDEX IF NOT EXISTS "returns_user_id_idx" ON "returns"("user_id");
CREATE INDEX IF NOT EXISTS "returns_order_id_idx" ON "returns"("order_id");
