import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testProductId } from '../../../test/setup';

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Cart API', () => {
  describe('GET /api/cart', () => {
    it('returns empty cart for new user', async () => {
      const token = await loginCustomer();
      const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.cart.items).toEqual([]);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('adds a product to the cart', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.data.cart.items[0].quantity).toBe(2);
    });

    it('increments quantity when same product added again', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 1 });
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 2 });
      const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
      expect(cart.body.data.cart.items[0].quantity).toBe(3);
    });

    it('rejects quantity of 0', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 0 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/cart/items/:id', () => {
    it('removes an item from the cart', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, quantity: 1 });
      const cartRes = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
      const itemId = cartRes.body.data.cart.items[0].id;

      const res = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.cart.items).toHaveLength(0);
    });
  });
});
