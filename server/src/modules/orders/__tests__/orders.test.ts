import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testProductId, prisma } from '../../../test/setup';

type VariantPrisma = {
  productVariant: {
    create: (a: unknown) => Promise<{ id: string; priceOre: number }>;
  };
};
const variantDb = prisma as unknown as VariantPrisma;

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

async function addToCartAndCheckout(token: string) {
  await request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: testProductId, quantity: 2 });
  return request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ shippingAddress: '123 Test St, Stockholm' });
}

describe('Orders API', () => {
  describe('POST /api/orders', () => {
    it('places an order from the cart', async () => {
      const token = await loginCustomer();
      const res = await addToCartAndCheckout(token);
      expect(res.status).toBe(201);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
    });

    it('decrements product stock', async () => {
      const token = await loginCustomer();
      const before = await prisma.product.findUniqueOrThrow({ where: { id: testProductId } });
      await addToCartAndCheckout(token);
      const after = await prisma.product.findUniqueOrThrow({ where: { id: testProductId } });
      expect(after.stock).toBe(before.stock - 2);
    });

    it('clears the cart after placing order', async () => {
      const token = await loginCustomer();
      await addToCartAndCheckout(token);
      const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
      expect(cart.body.data.items).toHaveLength(0);
    });

    it('returns 400 for empty cart', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ shippingAddress: '123 Test St' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('returns order history', async () => {
      const token = await loginCustomer();
      await addToCartAndCheckout(token);
      const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/orders (stock validation)', () => {
    it('rejects order when product stock is 0', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 1 });
      await prisma.product.update({ where: { id: testProductId }, data: { stock: 0 } });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ shippingAddress: '1 Out-of-Stock St' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/stock/i);
    });

    it('rejects order when product is inactive at checkout time', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 1 });
      await prisma.product.update({ where: { id: testProductId }, data: { isActive: false } });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ shippingAddress: '1 Inactive St' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/orders (variant pricing)', () => {
    it('uses variant priceOre instead of base product price', async () => {
      const token = await loginCustomer();
      const variant = await variantDb.productVariant.create({
        data: {
          productId: testProductId,
          name: '250g',
          priceOre: 9900,
          stock: 10,
          isActive: true,
        },
      });

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, variantId: variant.id, quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ shippingAddress: '1 Variant St, Stockholm' });

      expect(res.status).toBe(201);
      expect(res.body.data.totalOre).toBe(9900);
    });
  });

  describe('PATCH /api/orders/:id/cancel', () => {
    it('cancels a pending order', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.id;

      const res = await request(app)
        .patch(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('restores stock after cancellation', async () => {
      const token = await loginCustomer();
      const before = await prisma.product.findUniqueOrThrow({ where: { id: testProductId } });
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.id;

      await request(app)
        .patch(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      const after = await prisma.product.findUniqueOrThrow({ where: { id: testProductId } });
      expect(after.stock).toBe(before.stock);
    });

    it('returns 400 when trying to cancel a delivered order', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.id;
      await prisma.order.update({ where: { id: orderId }, data: { status: 'delivered' } });

      const res = await request(app)
        .patch(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders (pagination)', () => {
    it('returns pagination metadata', async () => {
      const token = await loginCustomer();
      await addToCartAndCheckout(token);
      const res = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('totalPages');
      expect(res.body.data.orders).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('returns order detail', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(orderId);
    });

    it('cannot access another user\'s order', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.id;

      // Login as admin
      const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'password123',
      });
      const adminToken = adminLogin.body.data.accessToken;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
