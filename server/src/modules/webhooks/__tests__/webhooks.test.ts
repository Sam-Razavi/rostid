import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

describe('Webhooks API', () => {
  describe('POST /api/webhooks/stripe', () => {
    it('returns 400 when Stripe is not configured', async () => {
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send('{}');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid or missing stripe-signature header', async () => {
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'invalid')
        .send('{}');
      expect(res.status).toBe(400);
    });

    it('returns JSON error body on failure', async () => {
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send('{}');
      expect(res.body).toHaveProperty('error');
    });
  });
});
