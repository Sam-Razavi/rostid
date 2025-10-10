-- Fix Return model: add foreign key constraint from order_id to orders
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
