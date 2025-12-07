-- CreateTable: shipping_addresses
CREATE TABLE "shipping_addresses" (
  "id"          TEXT NOT NULL,
  "user_id"     TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "line1"       TEXT NOT NULL,
  "line2"       TEXT,
  "city"        TEXT NOT NULL,
  "postal_code" TEXT NOT NULL,
  "country"     TEXT NOT NULL DEFAULT 'SE',
  "is_default"  BOOLEAN NOT NULL DEFAULT false,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shipping_addresses_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "shipping_addresses"
  ADD CONSTRAINT "shipping_addresses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: shipping_rates
CREATE TABLE "shipping_rates" (
  "id"                  TEXT NOT NULL,
  "name"                TEXT NOT NULL,
  "price_ore"           INTEGER NOT NULL,
  "free_threshold_ore"  INTEGER,
  "estimated_days"      TEXT,
  "is_active"           BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- Add shipping columns to orders
ALTER TABLE "orders"
  ADD COLUMN "shipping_address_id" TEXT,
  ADD COLUMN "shipping_ore"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shipping_rate_id"    TEXT;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_shipping_address_id_fkey"
  FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default shipping rates
INSERT INTO "shipping_rates" ("id", "name", "price_ore", "free_threshold_ore", "estimated_days", "is_active")
VALUES
  ('rate_standard', 'Standard', 4900, 50000, '3-5 days', true),
  ('rate_express',  'Express',  9900, NULL,  '1-2 days', true);
