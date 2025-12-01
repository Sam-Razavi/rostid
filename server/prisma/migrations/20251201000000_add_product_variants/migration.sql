-- CreateTable: product_variants
CREATE TABLE "product_variants" (
  "id"         TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "grind"      TEXT,
  "price_ore"  INTEGER NOT NULL,
  "stock"      INTEGER NOT NULL DEFAULT 0,
  "sku"        TEXT,
  "is_active"  BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add variantId to cart_items (nullable)
ALTER TABLE "cart_items" ADD COLUMN "variant_id" TEXT;

-- Drop old unique constraint and add variant-aware one
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_product_id_key";
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key"
  ON "cart_items"("cart_id", "product_id", "variant_id");

ALTER TABLE "cart_items"
  ADD CONSTRAINT "cart_items_variant_id_fkey"
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add variantId to order_items (nullable)
ALTER TABLE "order_items" ADD COLUMN "variant_id" TEXT;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_variant_id_fkey"
  FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
