import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testProductId, prisma } from '../../../test/setup';

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
      expect(res.body.data.order.items).toHaveLength(1);
      expect(res.body.data.order.items[0].quantity).toBe(2);
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
      expect(cart.body.data.cart.items).toHaveLength(0);
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

  describe('GET /api/orders/:id', () => {
    it('returns order detail', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.order.id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.order.id).toBe(orderId);
    });

    it('cannot access another user\'s order', async () => {
      const token = await loginCustomer();
      const orderRes = await addToCartAndCheckout(token);
      const orderId = orderRes.body.data.order.id;

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
