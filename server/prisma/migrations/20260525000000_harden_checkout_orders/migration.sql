ALTER TABLE "orders" ADD COLUMN "subtotal_ore" INTEGER;
UPDATE "orders" SET "subtotal_ore" = "total_ore" WHERE "subtotal_ore" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "subtotal_ore" SET NOT NULL;

ALTER TABLE "orders" ADD COLUMN "discount_ore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "loyalty_discount_ore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "gift_card_ore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "tracking_number" TEXT;
ALTER TABLE "orders" ADD COLUMN "carrier" TEXT;
ALTER TABLE "orders" ADD COLUMN "fulfilled_at" TIMESTAMP(3);

CREATE INDEX "orders_stripe_session_id_idx" ON "orders"("stripe_session_id");
CREATE UNIQUE INDEX "orders_stripe_session_id_unique" ON "orders"("stripe_session_id") WHERE "stripe_session_id" IS NOT NULL;

CREATE TABLE "stripe_events" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);
