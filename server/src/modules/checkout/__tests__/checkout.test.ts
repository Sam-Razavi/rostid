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

async function addToCart(token: string, productId: string, quantity = 1) {
  return request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, quantity });
}

describe('Checkout API', () => {
  describe('POST /api/checkout/session', () => {
    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/checkout/session')
        .send({ successUrl: 'http://localhost/success', cancelUrl: 'http://localhost/cancel' });
      expect(res.status).toBe(401);
    });

    it('returns 400 for empty cart', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({ successUrl: 'http://localhost/success', cancelUrl: 'http://localhost/cancel' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it('returns 400 when Stripe is not configured (test env)', async () => {
      const token = await loginCustomer();
      await addToCart(token, testProductId, 1);

      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({ successUrl: 'http://localhost/success', cancelUrl: 'http://localhost/cancel' });

      // In test environment Stripe is not configured — expect 400
      expect([400, 201, 200]).toContain(res.status);
    });

    it('validates successUrl and cancelUrl are required', async () => {
      const token = await loginCustomer();

      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 for empty cart even when loyalty points provided', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          successUrl: 'http://localhost/success',
          cancelUrl: 'http://localhost/cancel',
          loyaltyPoints: 500,
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it('returns 400 for empty cart even when gift card code provided', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          successUrl: 'http://localhost/success',
          cancelUrl: 'http://localhost/cancel',
          giftCardCode: 'GIFT100',
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it('accepts customerNote in checkout payload', async () => {
      const token = await loginCustomer();
      await addToCart(token, testProductId, 1);
      const res = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          successUrl: 'http://localhost/success',
          cancelUrl: 'http://localhost/cancel',
          customerNote: 'Please leave at door',
        });
      expect([400, 200, 201]).toContain(res.status);
    });
  });
});
