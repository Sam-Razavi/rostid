-- Add indexes for high-traffic query paths

-- Orders: user order history and admin status filters
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at" DESC);

-- Cart items: fetch all items for a cart
CREATE INDEX IF NOT EXISTS "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- Subscriptions: user list and due-subscription cron
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "subscriptions_next_billing_status_idx" ON "subscriptions"("next_billing_date", "status");

-- Reviews: product review listing
CREATE INDEX IF NOT EXISTS "reviews_product_id_idx" ON "reviews"("product_id");

-- Loyalty transactions: account history
CREATE INDEX IF NOT EXISTS "loyalty_transactions_account_id_idx" ON "loyalty_transactions"("account_id");
