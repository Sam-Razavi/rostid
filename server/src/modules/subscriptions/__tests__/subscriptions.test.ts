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

describe('Subscriptions API', () => {
  describe('GET /api/subscriptions', () => {
    it('returns empty list for new user', async () => {
      const token = await loginCustomer();
      const res = await request(app).get('/api/subscriptions').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.subscriptions).toEqual([]);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/subscriptions');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/subscriptions', () => {
    it('creates a subscription for valid product and interval', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, intervalDays: 30 });
      expect(res.status).toBe(201);
      expect(res.body.data.subscription.intervalDays).toBe(30);
      expect(res.body.data.subscription.status).toBe('active');
    });

    it('rejects invalid intervalDays', async () => {
      const token = await loginCustomer();
      const res = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, intervalDays: 7 });
      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/subscriptions')
        .send({ productId: testProductId, intervalDays: 30 });
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/subscriptions/:id', () => {
    it('pauses an active subscription', async () => {
      const token = await loginCustomer();
      const createRes = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, intervalDays: 14 });
      const subId = createRes.body.data.subscription.id;

      const res = await request(app)
        .patch(`/api/subscriptions/${subId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'paused' });
      expect(res.status).toBe(200);
      expect(res.body.data.subscription.status).toBe('paused');
    });

    it('cancels a subscription', async () => {
      const token = await loginCustomer();
      const createRes = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, intervalDays: 60 });
      const subId = createRes.body.data.subscription.id;

      const res = await request(app)
        .patch(`/api/subscriptions/${subId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'cancelled' });
      expect(res.status).toBe(200);
      expect(res.body.data.subscription.status).toBe('cancelled');
    });

    it('updates intervalDays', async () => {
      const token = await loginCustomer();
      const createRes = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: testProductId, intervalDays: 30 });
      const subId = createRes.body.data.subscription.id;

      const res = await request(app)
        .patch(`/api/subscriptions/${subId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ intervalDays: 60 });
      expect(res.status).toBe(200);
      expect(res.body.data.subscription.intervalDays).toBe(60);
    });
  });

  describe('GET /api/subscriptions/process-due (cron)', () => {
    it('returns 200 when CRON_SECRET is not configured', async () => {
      const res = await request(app).get('/api/subscriptions/process-due');
      expect(res.status).toBe(200);
    });
  });
});
