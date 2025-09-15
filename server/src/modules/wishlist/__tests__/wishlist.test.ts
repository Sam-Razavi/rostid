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

describe('Wishlist API', () => {
  describe('GET /api/wishlist', () => {
    it('returns empty wishlist for new user', async () => {
      const token = await loginCustomer();
      const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/wishlist', () => {
    it('adds a product to the wishlist', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId });
      expect(res.status).toBe(201);

      const getRes = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
      expect(getRes.body.data.items).toHaveLength(1);
      expect(getRes.body.data.items[0].product.id).toBe(testProductId);
    });

    it('is idempotent — adding same product twice yields one entry', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId });
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId });

      const getRes = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
      expect(getRes.body.data.items).toHaveLength(1);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .send({ productId: testProductId });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/wishlist/:productId', () => {
    it('removes a product from the wishlist', async () => {
      const token = await loginCustomer();
      await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId });

      const res = await request(app)
        .delete(`/api/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      const getRes = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`);
      expect(getRes.body.data.items).toHaveLength(0);
    });

    it('returns 200 even when removing a product not in the wishlist', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .delete(`/api/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
