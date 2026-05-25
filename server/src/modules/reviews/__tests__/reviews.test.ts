import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { testProductSlug } from '../../../test/setup';

async function loginCustomer() {
  const res = await request(app).post('/api/auth/login').send({
    email: 'customer@test.com',
    password: 'password123',
  });
  return res.body.data.accessToken as string;
}

describe('Reviews API', () => {
  describe('GET /api/products/:slug/reviews', () => {
    it('returns empty reviews for new product', async () => {
      const res = await request(app).get(`/api/products/${testProductSlug}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body.data.reviews).toEqual([]);
      expect(res.body.data.count).toBe(0);
      expect(res.body.data.avgRating).toBeNull();
    });
  });

  describe('POST /api/products/:slug/reviews', () => {
    it('creates a review when authenticated', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, body: 'Excellent coffee!' });
      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });

    it('rejects unauthenticated review', async () => {
      const res = await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .send({ rating: 4 });
      expect(res.status).toBe(401);
    });

    it('rejects duplicate review from same user', async () => {
      const token = await loginCustomer();
      await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });
      const res = await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 3, body: 'Changed my mind' });
      expect(res.status).toBe(409);
    });

    it('rejects rating outside 1-5', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 6 });
      expect(res.status).toBe(400);
    });

    it('avg rating updates after review', async () => {
      const token = await loginCustomer();
      await request(app)
        .post(`/api/products/${testProductSlug}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });
      const res = await request(app).get(`/api/products/${testProductSlug}/reviews`);
      expect(res.body.data.avgRating).toBe(4);
      expect(res.body.data.count).toBe(1);
    });
  });
});
